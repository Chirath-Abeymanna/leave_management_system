package services

import (
	"context"
	"errors"
	"time"

	"Server/internal/app/v1/interfaces"
	"Server/internal/app/v1/models"

	"github.com/google/uuid"
)

type leaveService struct {
	leaveRepo interfaces.LeaveRepository
	userRepo  interfaces.UserRepository
}

func NewLeaveService(leaveRepo interfaces.LeaveRepository, userRepo interfaces.UserRepository) interfaces.LeaveService {
	return &leaveService{leaveRepo: leaveRepo, userRepo: userRepo}
}

// getRequesterRole fetches the requester's role from the database using their user ID.
func (s *leaveService) getRequesterRole(ctx context.Context, requesterID string) (models.UserRole, error) {
	user, err := s.userRepo.GetByID(ctx, requesterID)
	if err != nil {
		return "", errors.New("unauthorized: requester not found")
	}
	return user.Role, nil
}

func (s *leaveService) CreateLeave(ctx context.Context, req models.CreateLeaveRequest, requesterID string) (*models.LeaveRequest, error) {
	// Validate required fields
	if req.LeaveType == "" {
		return nil, errors.New("leave_type is required")
	}
	if req.Reason == "" {
		return nil, errors.New("reason is required")
	}
	if req.TotalDays <= 0 {
		return nil, errors.New("total_days must be greater than 0")
	}

	startDate, err := time.Parse("2006-01-02", req.StartDate)
	if err != nil {
		return nil, errors.New("invalid start_date format, expected YYYY-MM-DD")
	}
	endDate, err := time.Parse("2006-01-02", req.EndDate)
	if err != nil {
		return nil, errors.New("invalid end_date format, expected YYYY-MM-DD")
	}
	if endDate.Before(startDate) {
		return nil, errors.New("end_date cannot be before start_date")
	}

	leave := &models.LeaveRequest{
		ID:        "LEAVE-" + uuid.New().String()[:29],
		UserID:    requesterID,
		LeaveType: req.LeaveType,
		StartDate: startDate,
		EndDate:   endDate,
		TotalDays: req.TotalDays,
		Reason:    req.Reason,
	}

	if err := s.leaveRepo.Create(ctx, leave); err != nil {
		return nil, err
	}
	return leave, nil
}

func (s *leaveService) GetLeave(ctx context.Context, leaveID string, requesterID string) (*models.LeaveRequest, error) {
	role, err := s.getRequesterRole(ctx, requesterID)
	if err != nil {
		return nil, err
	}

	leave, err := s.leaveRepo.GetByID(ctx, leaveID)
	if err != nil {
		return nil, err
	}

	// Employees can only view their own requests
	if role == models.RoleEmployee && leave.UserID != requesterID {
		return nil, errors.New("unauthorized: employees can only view their own leave requests")
	}

	return leave, nil
}

func (s *leaveService) GetMyLeaves(ctx context.Context, requesterID string) ([]*models.LeaveRequest, error) {
	return s.leaveRepo.GetByUserID(ctx, requesterID)
}

func (s *leaveService) GetAllLeaves(ctx context.Context, requesterID string) ([]*models.LeaveRequest, error) {
	role, err := s.getRequesterRole(ctx, requesterID)
	if err != nil {
		return nil, err
	}

	if role == models.RoleEmployee {
		return nil, errors.New("unauthorized: employees cannot view all leave requests")
	}

	return s.leaveRepo.GetAll(ctx)
}

func (s *leaveService) UpdateLeave(ctx context.Context, leaveID string, req models.UpdateLeaveRequest, requesterID string) (*models.LeaveRequest, error) {
	role, err := s.getRequesterRole(ctx, requesterID)
	if err != nil {
		return nil, err
	}

	// Only managers and admins can update leave requests
	if role == models.RoleEmployee {
		return nil, errors.New("unauthorized: employees cannot update leave requests")
	}

	leave, err := s.leaveRepo.GetByID(ctx, leaveID)
	if err != nil {
		return nil, err
	}

	// Validate status transition
	if req.Status != "" {
		if req.Status != models.LeaveStatusApproved && req.Status != models.LeaveStatusRejected {
			return nil, errors.New("status can only be set to Approved or Rejected")
		}
		if leave.Status != models.LeaveStatusPending {
			return nil, errors.New("can only update requests that are in Pending status")
		}
		leave.Status = req.Status
	}

	if req.ManagerNote != nil {
		leave.ManagerNote = req.ManagerNote
	}

	if err := s.leaveRepo.Update(ctx, leave); err != nil {
		return nil, err
	}

	return s.leaveRepo.GetByID(ctx, leaveID)
}

func (s *leaveService) CancelLeave(ctx context.Context, leaveID string, requesterID string) (*models.LeaveRequest, error) {
	leave, err := s.leaveRepo.GetByID(ctx, leaveID)
	if err != nil {
		return nil, err
	}

	// Users can only cancel their own requests
	if leave.UserID != requesterID {
		return nil, errors.New("unauthorized: you can only cancel your own leave requests")
	}

	if leave.Status != models.LeaveStatusPending {
		return nil, errors.New("can only cancel requests that are in Pending status")
	}

	leave.Status = models.LeaveStatusCancelled
	if err := s.leaveRepo.Update(ctx, leave); err != nil {
		return nil, err
	}

	return s.leaveRepo.GetByID(ctx, leaveID)
}

func (s *leaveService) DeleteLeave(ctx context.Context, leaveID string, requesterID string) error {
	role, err := s.getRequesterRole(ctx, requesterID)
	if err != nil {
		return err
	}

	leave, err := s.leaveRepo.GetByID(ctx, leaveID)
	if err != nil {
		return err
	}

	// Employees can only delete their own requests
	if role == models.RoleEmployee && leave.UserID != requesterID {
		return errors.New("unauthorized: employees can only delete their own leave requests")
	}

	// Managers cannot delete leave requests
	if role == models.RoleManager {
		return errors.New("unauthorized: managers cannot delete leave requests")
	}

	return s.leaveRepo.Delete(ctx, leaveID)
}
