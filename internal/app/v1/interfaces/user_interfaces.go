package interfaces

import (
	"context"

	"leave_management_system/internal/app/v1/models"

	"github.com/gin-gonic/gin"
)

// UserRepository handles database operations for Users.
type UserRepository interface {
	Create(ctx context.Context, user *models.User) error
	GetByID(ctx context.Context, id string) (*models.User, error)
	GetByEmail(ctx context.Context, email string) (*models.User, error)
	GetAll(ctx context.Context) ([]*models.User, error)
	Update(ctx context.Context, user *models.User) error
	Delete(ctx context.Context, id string) error
}

// UserService enforces business logic and RBAC.
type UserService interface {
	CreateUser(ctx context.Context, req models.CreateUserRequest, requesterRole models.UserRole) (*models.User, error)
	GetUser(ctx context.Context, targetID string, requesterID string, requesterRole models.UserRole) (*models.User, error)
	GetAllUsers(ctx context.Context, requesterRole models.UserRole) ([]*models.User, error)
	UpdateUser(ctx context.Context, targetID string, req models.UpdateUserRequest, requesterID string, requesterRole models.UserRole) (*models.User, error)
	DeleteUser(ctx context.Context, targetID string, requesterRole models.UserRole) error
}

// UserController exposes routes over HTTP.
type UserController interface {
	CreateUser(c *gin.Context)
	GetUser(c *gin.Context)
	GetAllUsers(c *gin.Context)
	UpdateUser(c *gin.Context)
	DeleteUser(c *gin.Context)
}
