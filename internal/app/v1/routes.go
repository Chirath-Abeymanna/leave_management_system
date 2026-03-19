package v1

import (
	"database/sql"
	"net/http"

	"leave_management_system/config"
	"leave_management_system/internal/app/v1/controllers"
	"leave_management_system/internal/app/v1/repositories"
	"leave_management_system/internal/app/v1/services"

	"github.com/gin-gonic/gin"
)

// CORSMiddleware enables CORS for Gin router
func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With, X-Tenant-ID, X-API-Token")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}

// SetupRoutes initializes all v1 API routes
func SetupRoutes(router *gin.Engine, db *sql.DB, cfg *config.Config) {
	// Apply CORS middleware globally
	router.Use(CORSMiddleware())

	// Initialize repositories
	userRepo := repositories.NewUserRepository(db)

	// Initialize services
	userService := services.NewUserService(userRepo)

	// Initialize controllers
	userController := controllers.NewUserController(userService)

	// API v1 routes
	v1 := router.Group("/api/v1")
	{
		// Health check
		v1.GET("/health", func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{
				"status":  "ok",
				"message": "Leave Management System Server is running",
			})
		})

		// User routes
		users := v1.Group("/users")
		{
			users.GET("", userController.GetAllUsers)
			users.GET("/:id", userController.GetUser)
			users.POST("", userController.CreateUser)
			users.PUT("/:id", userController.UpdateUser)
			users.DELETE("/:id", userController.DeleteUser)
		}
	}
}
