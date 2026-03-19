package models

import "time"

type LeaveStatus string

const (
	LeaveStatusPending   LeaveStatus = "Pending"
	LeaveStatusApproved  LeaveStatus = "Approved"
	LeaveStatusRejected  LeaveStatus = "Rejected"
	LeaveStatusCancelled LeaveStatus = "Cancelled"
)

type LeaveRequest struct {
	ID         string      `json:"id"`
	UserID     string      `json:"user_id"`
	LeaveType  string      `json:"leave_type"`
	StartDate  time.Time   `json:"start_date"`
	EndDate    time.Time   `json:"end_date"`
	TotalDays  int         `json:"total_days"`
	Reason     string      `json:"reason"`
	Status     LeaveStatus `json:"status"`
	ManagerNote *string    `json:"manager_note,omitempty"`
	CreatedAt  time.Time   `json:"created_at"`
	UpdatedAt  time.Time   `json:"updated_at"`
}

type CreateLeaveRequest struct {
	LeaveType string `json:"leave_type"`
	StartDate string `json:"start_date"` // YYYY-MM-DD
	EndDate   string `json:"end_date"`   // YYYY-MM-DD
	TotalDays int    `json:"total_days"`
	Reason    string `json:"reason"`
}

type UpdateLeaveRequest struct {
	Status      LeaveStatus `json:"status,omitempty"`
	ManagerNote *string     `json:"manager_note,omitempty"`
}
