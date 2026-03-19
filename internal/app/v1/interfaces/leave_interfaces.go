package interfaces

import (
	"context"

	"Server/internal/app/v1/models"

	"github.com/gin-gonic/gin"
)

// LeaveRepository handles database operations for Leave Requests.
type LeaveRepository interface {
	Create(ctx context.Context, leave *models.LeaveRequest) error
	GetByID(ctx context.Context, id string) (*models.LeaveRequest, error)
	GetByUserID(ctx context.Context, userID string) ([]*models.LeaveRequest, error)
	GetAll(ctx context.Context) ([]*models.LeaveRequest, error)
	Update(ctx context.Context, leave *models.LeaveRequest) error
	Delete(ctx context.Context, id string) error
}

// LeaveService enforces business logic and RBAC for leave requests.
type LeaveService interface {
	CreateLeave(ctx context.Context, req models.CreateLeaveRequest, requesterID string) (*models.LeaveRequest, error)
	GetLeave(ctx context.Context, leaveID string, requesterID string) (*models.LeaveRequest, error)
	GetMyLeaves(ctx context.Context, requesterID string) ([]*models.LeaveRequest, error)
	GetAllLeaves(ctx context.Context, requesterID string) ([]*models.LeaveRequest, error)
	UpdateLeave(ctx context.Context, leaveID string, req models.UpdateLeaveRequest, requesterID string) (*models.LeaveRequest, error)
	CancelLeave(ctx context.Context, leaveID string, requesterID string) (*models.LeaveRequest, error)
	DeleteLeave(ctx context.Context, leaveID string, requesterID string) error
}

// LeaveController exposes leave request routes over HTTP.
type LeaveController interface {
	CreateLeave(c *gin.Context)
	GetLeave(c *gin.Context)
	GetMyLeaves(c *gin.Context)
	GetAllLeaves(c *gin.Context)
	UpdateLeave(c *gin.Context)
	CancelLeave(c *gin.Context)
	DeleteLeave(c *gin.Context)
}
