package v1

import (
	"database/sql"
	"net/http"

	"Server/config"
	"Server/internal/app/v1/controllers"
	"Server/internal/app/v1/repositories"
	"Server/internal/app/v1/services"
	"Server/internal/middleware"

	"github.com/gin-gonic/gin"
)

func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-API-Key, X-Requester-Role")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	}
}

func SetupRoutes(router *gin.Engine, db *sql.DB, cfg *config.Config) {
	router.Use(CORSMiddleware())

	userRepo := repositories.NewUserRepository(db)
	userService := services.NewUserService(userRepo)
	userController := controllers.NewUserController(userService)

	leaveRepo := repositories.NewLeaveRepository(db)
	leaveService := services.NewLeaveService(leaveRepo, userRepo)
	leaveController := controllers.NewLeaveController(leaveService)

	v1 := router.Group("/api/v1")
	{
		v1.GET("/health", func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{"status": "ok", "message": "Leave Management System Server is running"})
		})

		users := v1.Group("/users")
		{
			// API key protected — no JWT issued yet
			users.POST("/login", middleware.APIKeyMiddleware(), userController.Login)
			users.POST("", middleware.APIKeyMiddleware(), userController.CreateUser)

			// JWT protected — role extracted from token
			users.GET("", middleware.JWTMiddleware(), userController.GetAllUsers)
			users.GET("/:id", middleware.JWTMiddleware(), userController.GetUser)
			users.PUT("/:id", middleware.JWTMiddleware(), userController.UpdateUser)
			users.PUT("/:id/leave-balance", middleware.JWTMiddleware(), userController.AssignLeaveBalance)
			users.DELETE("/:id", middleware.JWTMiddleware(), userController.DeleteUser)
		}

		leaves := v1.Group("/leaves")
		leaves.Use(middleware.JWTMiddleware())
		{
			leaves.POST("", leaveController.CreateLeave)
			leaves.GET("/my", leaveController.GetMyLeaves)
			leaves.GET("", leaveController.GetAllLeaves)
			leaves.GET("/:id", leaveController.GetLeave)
			leaves.PUT("/:id", leaveController.UpdateLeave)
			leaves.PUT("/:id/cancel", leaveController.CancelLeave)
			leaves.DELETE("/:id", leaveController.DeleteLeave)
		}
	}
}
