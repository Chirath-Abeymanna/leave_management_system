package services

import (
	"context"
	"errors"
	"fmt"
	"leave_management_system/internal/app/v1/interfaces"
	"leave_management_system/internal/app/v1/models"
	"leave_management_system/internal/pkg/logger"

	"github.com/google/uuid"
	"go.uber.org/zap"
	"golang.org/x/crypto/bcrypt"
)

type userService struct {
	repo interfaces.UserRepository
}

func NewUserService(repo interfaces.UserRepository) interfaces.UserService {
	return &userService{repo: repo}
}

func (s *userService) CreateUser(ctx context.Context, req models.CreateUserRequest, requesterRole models.UserRole) (*models.User, error) {
	if requesterRole != models.RoleAdmin && requesterRole != models.RoleManager {
		return nil, errors.New("unauthorized: only admins and managers can create users")
	}

	if requesterRole == models.RoleManager && (req.Role == models.RoleAdmin || req.Role == models.RoleManager) {
		return nil, errors.New("unauthorized: managers can only create employees")
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), 12)
	if err != nil {
		logger.Error("Failed to hash password", zap.Error(err))
		return nil, fmt.Errorf("failed to process password: %w", err)
	}

	userID := "USER-" + uuid.New().String()[:31]

	user := &models.User{
		ID:           userID,
		FullName:     req.FullName,
		Email:        req.Email,
		PasswordHash: string(hashedPassword),
		Role:         req.Role,
	}

	if err := s.repo.Create(ctx, user); err != nil {
		return nil, err
	}

	return user, nil
}

func (s *userService) GetUser(ctx context.Context, targetID string, requesterID string, requesterRole models.UserRole) (*models.User, error) {
	if requesterRole == models.RoleEmployee && targetID != requesterID {
		return nil, errors.New("unauthorized: employees can only view their own profile")
	}

	return s.repo.GetByID(ctx, targetID)
}

func (s *userService) GetAllUsers(ctx context.Context, requesterRole models.UserRole) ([]*models.User, error) {
	if requesterRole == models.RoleEmployee {
		return nil, errors.New("unauthorized: employees cannot view all users")
	}
	return s.repo.GetAll(ctx)
}

func (s *userService) UpdateUser(ctx context.Context, targetID string, req models.UpdateUserRequest, requesterID string, requesterRole models.UserRole) (*models.User, error) {
	targetUser, err := s.repo.GetByID(ctx, targetID)
	if err != nil {
		return nil, err
	}

	if requesterRole == models.RoleEmployee && targetID != requesterID {
		return nil, errors.New("unauthorized: cannot modify other users' profiles")
	}

	if requesterRole == models.RoleManager && targetUser.Role == models.RoleAdmin {
		return nil, errors.New("unauthorized: managers cannot modify admins")
	}

	if requesterRole == models.RoleEmployee && req.Role != "" && req.Role != targetUser.Role {
		return nil, errors.New("unauthorized: employees cannot change their own roles")
	}

	if req.FullName != "" {
		targetUser.FullName = req.FullName
	}
	if req.Email != "" {
		targetUser.Email = req.Email
	}
	if req.Role != "" {
		if requesterRole == models.RoleAdmin || (requesterRole == models.RoleManager && req.Role == models.RoleEmployee) {
			targetUser.Role = req.Role
		}
	}

	if err := s.repo.Update(ctx, targetUser); err != nil {
		return nil, err
	}
	return targetUser, nil
}

func (s *userService) DeleteUser(ctx context.Context, targetID string, requesterRole models.UserRole) error {
	if requesterRole == models.RoleEmployee {
		return errors.New("unauthorized: employees cannot delete users")
	}

	targetUser, err := s.repo.GetByID(ctx, targetID)
	if err != nil {
		return err
	}

	if requesterRole == models.RoleManager && targetUser.Role == models.RoleAdmin {
		return errors.New("unauthorized: managers cannot delete admins")
	}

	return s.repo.Delete(ctx, targetID)
}
