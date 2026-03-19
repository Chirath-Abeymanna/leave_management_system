package main

import (
	"context"
	"database/sql"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"leave_management_system/config"
	v1 "leave_management_system/internal/app/v1"
	"leave_management_system/internal/pkg/database"
	"leave_management_system/internal/pkg/logger"

	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
	"go.uber.org/zap"
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

	logger.Info("Starting server...")

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
