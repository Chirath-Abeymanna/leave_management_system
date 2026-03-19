package interfaces

import (
	"context"

	"Server/internal/app/v1/models"

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
	UpdateLeaveBalance(ctx context.Context, id string, annual, sick int) error
}

// UserService enforces business logic and RBAC.
type UserService interface {
	Login(ctx context.Context, req models.LoginRequest) (*models.LoginResponse, error)
	CreateUser(ctx context.Context, req models.CreateUserRequest, requesterRole models.UserRole) (*models.User, error)
	GetUser(ctx context.Context, targetID string, requesterID string, requesterRole models.UserRole) (*models.User, error)
	GetAllUsers(ctx context.Context, requesterRole models.UserRole) ([]*models.User, error)
	UpdateUser(ctx context.Context, targetID string, req models.UpdateUserRequest, requesterID string, requesterRole models.UserRole) (*models.User, error)
	DeleteUser(ctx context.Context, targetID string, requesterRole models.UserRole) error
	AssignLeaveBalance(ctx context.Context, targetID string, req models.AssignLeaveBalanceRequest, requesterID string, requesterRole models.UserRole) (*models.User, error)
}

// UserController exposes routes over HTTP.
type UserController interface {
	Login(c *gin.Context)
	CreateUser(c *gin.Context)
	GetUser(c *gin.Context)
	GetAllUsers(c *gin.Context)
	UpdateUser(c *gin.Context)
	DeleteUser(c *gin.Context)
	AssignLeaveBalance(c *gin.Context)
}
