package repositories

import (
	"context"
	"database/sql"
	"errors"

	"Server/internal/app/v1/interfaces"
	"Server/internal/app/v1/models"
)

type leaveRepository struct {
	db *sql.DB
}

func NewLeaveRepository(db *sql.DB) interfaces.LeaveRepository {
	return &leaveRepository{db: db}
}

func (r *leaveRepository) Create(ctx context.Context, leave *models.LeaveRequest) error {
	query := `
		INSERT INTO leave_requests (id, user_id, leave_type, start_date, end_date, total_days, reason)
		VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING status, created_at, updated_at
	`
	return r.db.QueryRowContext(ctx, query,
		leave.ID, leave.UserID, leave.LeaveType, leave.StartDate, leave.EndDate, leave.TotalDays, leave.Reason,
	).Scan(&leave.Status, &leave.CreatedAt, &leave.UpdatedAt)
}

func (r *leaveRepository) GetByID(ctx context.Context, id string) (*models.LeaveRequest, error) {
	query := `SELECT id, user_id, leave_type, start_date, end_date, total_days, reason, status, manager_note, created_at, updated_at
		FROM leave_requests WHERE id = $1`
	row := r.db.QueryRowContext(ctx, query, id)

	l := &models.LeaveRequest{}
	err := row.Scan(&l.ID, &l.UserID, &l.LeaveType, &l.StartDate, &l.EndDate, &l.TotalDays, &l.Reason, &l.Status, &l.ManagerNote, &l.CreatedAt, &l.UpdatedAt)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, errors.New("leave request not found")
		}
		return nil, err
	}
	return l, nil
}

func (r *leaveRepository) GetByUserID(ctx context.Context, userID string) ([]*models.LeaveRequest, error) {
	query := `SELECT id, user_id, leave_type, start_date, end_date, total_days, reason, status, manager_note, created_at, updated_at
		FROM leave_requests WHERE user_id = $1 ORDER BY created_at DESC`
	rows, err := r.db.QueryContext(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var leaves []*models.LeaveRequest
	for rows.Next() {
		l := &models.LeaveRequest{}
		if err := rows.Scan(&l.ID, &l.UserID, &l.LeaveType, &l.StartDate, &l.EndDate, &l.TotalDays, &l.Reason, &l.Status, &l.ManagerNote, &l.CreatedAt, &l.UpdatedAt); err != nil {
			return nil, err
		}
		leaves = append(leaves, l)
	}
	return leaves, nil
}

func (r *leaveRepository) GetAll(ctx context.Context) ([]*models.LeaveRequest, error) {
	query := `SELECT id, user_id, leave_type, start_date, end_date, total_days, reason, status, manager_note, created_at, updated_at
		FROM leave_requests ORDER BY created_at DESC`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var leaves []*models.LeaveRequest
	for rows.Next() {
		l := &models.LeaveRequest{}
		if err := rows.Scan(&l.ID, &l.UserID, &l.LeaveType, &l.StartDate, &l.EndDate, &l.TotalDays, &l.Reason, &l.Status, &l.ManagerNote, &l.CreatedAt, &l.UpdatedAt); err != nil {
			return nil, err
		}
		leaves = append(leaves, l)
	}
	return leaves, nil
}

func (r *leaveRepository) Update(ctx context.Context, leave *models.LeaveRequest) error {
	query := `UPDATE leave_requests SET status=$1, manager_note=$2, updated_at=CURRENT_TIMESTAMP WHERE id=$3`
	res, err := r.db.ExecContext(ctx, query, leave.Status, leave.ManagerNote, leave.ID)
	if err != nil {
		return err
	}
	affected, err := res.RowsAffected()
	if err != nil {
		return err
	}
	if affected == 0 {
		return errors.New("leave request not found")
	}
	return nil
}

func (r *leaveRepository) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM leave_requests WHERE id=$1`
	res, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return err
	}
	affected, err := res.RowsAffected()
	if err != nil {
		return err
	}
	if affected == 0 {
		return errors.New("leave request not found")
	}
	return nil
}
