package main

import (
	"context"
	"database/sql"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"Server/config"
	v1 "Server/internal/app/v1"
	"Server/internal/pkg/database"
	"Server/internal/pkg/logger"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	_ "github.com/lib/pq"
	"go.uber.org/zap"
	"golang.org/x/crypto/bcrypt"
)

func main() {
	// Initialize logger
	logger.Init()
	defer logger.Logger.Sync()

	logger.Info("Loading configuration...")
	cfg := config.LoadConfig()

	// Run global migrations
	migrationsPath := "migrations"
	logger.Info("Running database migrations...", zap.String("path", migrationsPath))
	if err := database.RunMigrations(cfg.DSN(), migrationsPath); err != nil {
		logger.Fatal("Failed to run migrations check the docker Container: ", zap.Error(err))
	}

	// Connect to database
	logger.Info("Connecting to database...")
	db, err := sql.Open("postgres", cfg.DSN())
	if err != nil {
		logger.Fatal("Failed to connect to database", zap.Error(err))
	}
	defer db.Close()

	if err := db.Ping(); err != nil {
		logger.Fatal("Failed to ping database", zap.Error(err))
	}
	logger.Info("Database connection established")

	if err := ensureAdminUser(db, cfg); err != nil {
		logger.Fatal("Failed to ensure admin account", zap.Error(err))
	}

	logger.Info("Starting server...")

	// Switch between gin debug mode and release mode
	gin.SetMode(gin.ReleaseMode)

	// Setup routes
	router := gin.Default()
	v1.SetupRoutes(router, db, cfg)

	port := getEnv("PORT", "8080")
	server := &http.Server{
		Addr:    ":" + port,
		Handler: router,
	}

	// Channel to listen for interrupt signals
	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt, syscall.SIGTERM)

	// Start server in a goroutine
	go func() {
		logger.Info("Server listening", zap.String("port", port))
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			logger.Fatal("Server failed", zap.Error(err))
		}
	}()

	// Wait for interrupt signal
	<-stop
	logger.Info("Shutting down server...")

	// Create a deadline for shutdown
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Attempt graceful shutdown
	if err := server.Shutdown(ctx); err != nil {
		logger.Error("Server forced to shutdown", zap.Error(err))
	} else {
		logger.Info("Server stopped")
	}
}

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
}

func ensureAdminUser(db *sql.DB, cfg *config.Config) error {
	if cfg.AdminEmail == "" || cfg.AdminPassword == "" {
		return fmt.Errorf("ADMIN_EMAIL and ADMIN_PASSWORD must be set")
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(cfg.AdminPassword), 12)
	if err != nil {
		return fmt.Errorf("hash admin password: %w", err)
	}

	adminID := "USER-" + uuid.New().String()[:31]
	query := `
		INSERT INTO users (id, full_name, email, password_hash, role)
		VALUES ($1, $2, $3, $4, 'Admin')
		ON CONFLICT (email) DO UPDATE SET
			full_name = EXCLUDED.full_name,
			password_hash = EXCLUDED.password_hash,
			role = 'Admin',
			updated_at = CURRENT_TIMESTAMP
	`

	if _, err := db.Exec(query, adminID, cfg.AdminName, cfg.AdminEmail, string(hashedPassword)); err != nil {
		return fmt.Errorf("upsert admin user: %w", err)
	}

	logger.Info("Admin account ensured", zap.String("email", cfg.AdminEmail))
	return nil
}
