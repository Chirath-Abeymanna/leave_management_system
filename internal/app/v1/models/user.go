package models

import "time"

type UserRole string

const (
	RoleAdmin    UserRole = "Admin"
	RoleManager  UserRole = "Manager"
	RoleEmployee UserRole = "Employee"
)

type User struct {
	ID                 string    `json:"id"`
	FullName           string    `json:"full_name"`
	Email              string    `json:"email"`
	PasswordHash       string    `json:"-"` // Excluded from JSON responses
	Role               UserRole  `json:"role"`
	ManagerID          *string   `json:"manager_id,omitempty"`
	AnnualLeaveBalance int       `json:"annual_leave_balance"`
	SickLeaveBalance   int       `json:"sick_leave_balance"`
	CreatedAt          time.Time `json:"created_at"`
	UpdatedAt          time.Time `json:"updated_at"`
}

type CreateUserRequest struct {
	FullName string   `json:"full_name"`
	Email    string   `json:"email"`
	Password string   `json:"password"`
	Role     UserRole `json:"role"`
}

type UpdateUserRequest struct {
	FullName string   `json:"full_name"`
	Email    string   `json:"email"`
	Role     UserRole `json:"role"`
}
