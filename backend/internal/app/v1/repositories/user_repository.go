package repositories

import (
	"Server/internal/app/v1/interfaces"
	"Server/internal/app/v1/models"
	"context"
	"database/sql"
	"errors"
)

type userRepository struct {
	db *sql.DB
}

func NewUserRepository(db *sql.DB) interfaces.UserRepository {
	return &userRepository{db: db}
}

func (r *userRepository) Create(ctx context.Context, user *models.User) error {
	query := `
		INSERT INTO users (id, full_name, email, password_hash, role)
		VALUES ($1, $2, $3, $4, $5) RETURNING created_at, updated_at
	`
	return r.db.QueryRowContext(ctx, query, user.ID, user.FullName, user.Email, user.PasswordHash, user.Role).
		Scan(&user.CreatedAt, &user.UpdatedAt)
}

func (r *userRepository) GetByID(ctx context.Context, id string) (*models.User, error) {
	query := `SELECT id, full_name, email, password_hash, role, manager_id, annual_leave_balance, sick_leave_balance, created_at, updated_at FROM users WHERE id = $1`
	row := r.db.QueryRowContext(ctx, query, id)

	u := &models.User{}
	err := row.Scan(&u.ID, &u.FullName, &u.Email, &u.PasswordHash, &u.Role, &u.ManagerID, &u.AnnualLeaveBalance, &u.SickLeaveBalance, &u.CreatedAt, &u.UpdatedAt)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, errors.New("user not found")
		}
		return nil, err
	}
	return u, nil
}

func (r *userRepository) GetByEmail(ctx context.Context, email string) (*models.User, error) {
	query := `SELECT id, full_name, email, password_hash, role, manager_id, annual_leave_balance, sick_leave_balance, created_at, updated_at FROM users WHERE email = $1`
	row := r.db.QueryRowContext(ctx, query, email)

	u := &models.User{}
	err := row.Scan(&u.ID, &u.FullName, &u.Email, &u.PasswordHash, &u.Role, &u.ManagerID, &u.AnnualLeaveBalance, &u.SickLeaveBalance, &u.CreatedAt, &u.UpdatedAt)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, errors.New("user not found")
		}
		return nil, err
	}
	return u, nil
}

func (r *userRepository) GetAll(ctx context.Context) ([]*models.User, error) {
	query := `SELECT id, full_name, email, role, manager_id, annual_leave_balance, sick_leave_balance, created_at, updated_at FROM users`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []*models.User
	for rows.Next() {
		u := &models.User{}
		if err := rows.Scan(&u.ID, &u.FullName, &u.Email, &u.Role, &u.ManagerID, &u.AnnualLeaveBalance, &u.SickLeaveBalance, &u.CreatedAt, &u.UpdatedAt); err != nil {
			return nil, err
		}
		users = append(users, u)
	}
	return users, nil
}

func (r *userRepository) Update(ctx context.Context, user *models.User) error {
	query := `UPDATE users SET full_name=$1, email=$2, role=$3, updated_at=CURRENT_TIMESTAMP WHERE id=$4`
	res, err := r.db.ExecContext(ctx, query, user.FullName, user.Email, user.Role, user.ID)
	if err != nil {
		return err
	}
	affected, err := res.RowsAffected()
	if err != nil {
		return err
	}
	if affected == 0 {
		return errors.New("user not found")
	}
	return nil
}

func (r *userRepository) UpdateLeaveBalance(ctx context.Context, id string, annual, sick int) error {
	query := `UPDATE users SET annual_leave_balance=$1, sick_leave_balance=$2, updated_at=CURRENT_TIMESTAMP WHERE id=$3`
	res, err := r.db.ExecContext(ctx, query, annual, sick, id)
	if err != nil {
		return err
	}
	affected, err := res.RowsAffected()
	if err != nil {
		return err
	}
	if affected == 0 {
		return errors.New("user not found")
	}
	return nil
}

func (r *userRepository) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM users WHERE id=$1`
	res, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return err
	}
	affected, err := res.RowsAffected()
	if err != nil {
		return err
	}
	if affected == 0 {
		return errors.New("user not found")
	}
	return nil
}
