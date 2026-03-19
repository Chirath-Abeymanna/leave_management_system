package main

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"time"

	"Server/config"
	"Server/internal/pkg/logger"

	"github.com/google/uuid"
	_ "github.com/lib/pq"
	"golang.org/x/crypto/bcrypt"
)

func main() {
	// Initialize logger and config
	logger.Init()
	cfg := config.LoadConfig()

	db, err := sql.Open("postgres", cfg.DSN())
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	if err := db.Ping(); err != nil {
		log.Fatalf("Failed to ping database: %v", err)
	}

	fmt.Println("Seeding database with mock data...")

	// Create a shared password for all mock users
	pwHash, err := bcrypt.GenerateFromPassword([]byte("password123"), bcrypt.DefaultCost)
	if err != nil {
		log.Fatalf("Failed to hash password: %v", err)
	}
	passwordStr := string(pwHash)

	// User IDs to be associated with leave requests
	var userIDs []string

	// 1. Create 10 Employees
	for i := 1; i <= 10; i++ {
		email := fmt.Sprintf("employee%d@test.com", i)
		fullName := fmt.Sprintf("Mock Employee %d", i)
		// Generate ID matching user repo pattern
		userID := "USER-" + uuid.New().String()[:31]

		// Using raw SQL so we don't have to import/wire the entire repository and depend on external state
		query := `
			INSERT INTO users (id, full_name, email, password_hash, role, manager_id, annual_leave_balance, sick_leave_balance, created_at, updated_at) 
			VALUES ($1, $2, $3, $4, 'Employee', NULL, 20, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
			ON CONFLICT (email) DO UPDATE SET updated_at=CURRENT_TIMESTAMP
			RETURNING id
		`
		var insertedID string
		err = db.QueryRowContext(context.Background(), query, userID, fullName, email, passwordStr).Scan(&insertedID)
		if err != nil {
			log.Printf("Failed to insert user %s: %v", email, err)
			continue
		}
		userIDs = append(userIDs, insertedID)
	}
	fmt.Printf("Inserted %d employees.\n", len(userIDs))

	// 2. Create 1 Manager
	var managerID string
	managerUUID := "USER-" + uuid.New().String()[:31]
	err = db.QueryRowContext(context.Background(), `
		INSERT INTO users (id, full_name, email, password_hash, role, manager_id, annual_leave_balance, sick_leave_balance, created_at, updated_at) 
		VALUES ($1, 'Mock Manager', 'manager@test.com', $2, 'Manager', NULL, 20, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
		ON CONFLICT (email) DO UPDATE SET updated_at=CURRENT_TIMESTAMP
		RETURNING id
	`, managerUUID, passwordStr).Scan(&managerID)
	
	if err != nil {
		log.Printf("Failed to insert manager: %v", err)
	} else {
		fmt.Println("Inserted 1 manager.")
	}

	// 3. Create 10 Leave Requests
	if len(userIDs) > 0 {
		count := 0
		for i := 1; i <= 10; i++ {
			userID := userIDs[i%len(userIDs)]
			leaveID := "LEAVE-" + uuid.New().String()[:29]

			// Alternating leave types and statuses
			leaveType := "Annual"
			if i%3 == 0 {
				leaveType = "Sick"
			}
			
			status := "Pending"
			if i%2 == 0 {
				status = "Approved"
			} else if i%5 == 0 {
				status = "Rejected"
			}

			startDate := time.Now().AddDate(0, 0, i)
			endDate := startDate.AddDate(0, 0, i+2)
			
			_, err = db.ExecContext(context.Background(), `
			INSERT INTO leave_requests (id, user_id, leave_type, start_date, end_date, total_days, reason, status, manager_note, created_at, updated_at)
			VALUES ($1, $2, $3, $4, $5, 2, 'Mock request reason', $6, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
			ON CONFLICT (id) DO NOTHING
			`, leaveID, userID, leaveType, startDate, endDate, status)
			if err != nil {
				log.Printf("Failed to insert leave request %d: %v", i, err)
			} else {
				count++
			}
		}
		fmt.Printf("Inserted %d leave requests.\n", count)
	}

	fmt.Println("Seeding complete. You can login with 'employee1@test.com' and password 'password123'")
}
