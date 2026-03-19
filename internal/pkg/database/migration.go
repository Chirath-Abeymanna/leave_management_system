package database

import (
	"fmt"

	"Server/internal/pkg/logger"

	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	"go.uber.org/zap"
)

// RunMigrations runs all pending migrations from the given folder
func RunMigrations(databaseURL, migrationsPath string) error {
	m, err := migrate.New(
		"file://"+migrationsPath,
		databaseURL,
	)
	if err != nil {
		return fmt.Errorf("failed to create migrate instance: %w", err)
	}
	defer func() {
		srcErr, dbErr := m.Close()
		if srcErr != nil {
			logger.Error("source close error", zap.Error(srcErr))
		}
		if dbErr != nil {
			logger.Error("database close error", zap.Error(dbErr))
		}
	}()

	// Get current version
	version, dirty, err := m.Version()
	if err != nil {
		if err == migrate.ErrNilVersion {
			logger.Info("no migrations applied yet")
			version = 0
			dirty = false
		} else {
			return fmt.Errorf("failed to get migration version: %w", err)
		}
	} else {
		logger.Info("current migration version", zap.Uint32("version", uint32(version)), zap.Bool("dirty", dirty))
	}

	if dirty {
		logger.Warn("database is dirty, forcing clean", zap.Uint32("version", uint32(version)))
		if err := m.Force(int(version)); err != nil {
			return fmt.Errorf("failed to force clean migration: %w", err)
		}
	}

	// Apply migrations
	if err := m.Up(); err != nil {
		if err == migrate.ErrNoChange {
			logger.Info("no new migrations to apply")
			return nil
		}
		return fmt.Errorf("migration failed: %w", err)
	}

	logger.Info("database migrations applied successfully")
	return nil
}
