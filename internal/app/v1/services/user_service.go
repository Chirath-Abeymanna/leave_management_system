package services

import (
	"context"
	"errors"
	"fmt"
	"os"
	"time"

	"Server/internal/app/v1/interfaces"
	"Server/internal/app/v1/models"
	"Server/internal/pkg/logger"

	"github.com/golang-jwt/jwt/v5"
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

func (s *userService) Login(ctx context.Context, req models.LoginRequest) (*models.LoginResponse, error) {
	user, err := s.repo.GetByEmail(ctx, req.Email)
	logger.Info("User found", zap.String("user_id", user.ID), zap.String("role", string(user.Role)))
	if err != nil {
		return nil, errors.New("invalid email or password")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		return nil, errors.New("invalid  password")
	}

	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		return nil, errors.New("server configuration error")
	}

	claims := jwt.MapClaims{
		"user_id": user.ID,
		"role":    string(user.Role),
		"exp":     time.Now().Add(24 * time.Hour).Unix(),
		"iat":     time.Now().Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signed, err := token.SignedString([]byte(jwtSecret))
	if err != nil {
		logger.Error("Failed to sign JWT", zap.Error(err))
		return nil, fmt.Errorf("failed to generate token: %w", err)
	}

	strippedUser := models.User{
		FullName:           user.FullName,
		Email:              user.Email,
		Role:               user.Role,
		AnnualLeaveBalance: user.AnnualLeaveBalance,
		SickLeaveBalance:   user.SickLeaveBalance,
	}

	return &models.LoginResponse{Token: signed, User: &strippedUser}, nil
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

	user := &models.User{
		ID:           "USER-" + uuid.New().String()[:31],
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

func (s *userService) AssignLeaveBalance(ctx context.Context, targetID string, req models.AssignLeaveBalanceRequest, requesterID string, requesterRole models.UserRole) (*models.User, error) {
	// RBAC: only admins and managers can assign leave balances
	if requesterRole == models.RoleEmployee {
		return nil, errors.New("unauthorized: employees cannot assign leave balances")
	}

	targetUser, err := s.repo.GetByID(ctx, targetID)
	if err != nil {
		return nil, err
	}

	// Managers can only assign leave balances to employees
	if requesterRole == models.RoleManager && targetUser.Role != models.RoleEmployee {
		return nil, errors.New("unauthorized: managers can only assign leave balances to employees")
	}

	// Merge: use existing values if not provided
	annual := targetUser.AnnualLeaveBalance
	sick := targetUser.SickLeaveBalance

	if req.AnnualLeaveBalance != nil {
		if *req.AnnualLeaveBalance < 0 {
			return nil, errors.New("annual leave balance cannot be negative")
		}
		annual = *req.AnnualLeaveBalance
	}
	if req.SickLeaveBalance != nil {
		if *req.SickLeaveBalance < 0 {
			return nil, errors.New("sick leave balance cannot be negative")
		}
		sick = *req.SickLeaveBalance
	}

	if req.AnnualLeaveBalance == nil && req.SickLeaveBalance == nil {
		return nil, errors.New("at least one leave balance field must be provided")
	}

	if err := s.repo.UpdateLeaveBalance(ctx, targetID, annual, sick); err != nil {
		return nil, err
	}

	// Return updated user
	return s.repo.GetByID(ctx, targetID)
}
