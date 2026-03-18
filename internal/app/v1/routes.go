package v1

import (
	"database/sql"
	"encoding/json"
	"net/http"
)

// SetupRoutes configures the API routes for v1
func SetupRoutes(mux *http.ServeMux, db *sql.DB) {
	mux.HandleFunc("/api/v1/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"status": "UP"})
	})
	
	// Add user routes, product routes, etc.
}
