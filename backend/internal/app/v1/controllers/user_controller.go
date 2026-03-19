package controllers

import (
	"net/http"

	"Server/internal/app/v1/interfaces"
	"Server/internal/app/v1/models"
	"Server/internal/middleware"

	"github.com/gin-gonic/gin"
)

type userController struct {
	service interfaces.UserService
}

func NewUserController(service interfaces.UserService) interfaces.UserController {
	return &userController{service: service}
}

// getRequesterInfo pulls the authenticated user's ID and role from the JWT context.
func getRequesterInfo(c *gin.Context) (string, models.UserRole) {
	userID, _ := middleware.GetUserIDFromContext(c)
	role, _ := middleware.GetUserRoleFromContext(c)
	return userID, role
}

func (ctrl *userController) Login(c *gin.Context) {
	var req models.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return
	}

	resp, err := ctrl.service.Login(c.Request.Context(), req)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, resp)
}

func (ctrl *userController) CreateUser(c *gin.Context) {
	var req models.CreateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return
	}

	// Role is passed in the request; API key already validated by middleware.
	// Use the role from the request itself to enforce who can create what.
	// The service layer enforces RBAC, so we pass the role from the request header
	// which must be set by the caller (Admin or Manager) when using the API key flow.
	requesterRole := models.UserRole(c.GetHeader("X-Requester-Role"))
	if requesterRole == "" {
		requesterRole = models.RoleAdmin // default to Admin for API key access
	}

	user, err := ctrl.service.CreateUser(c.Request.Context(), req, requesterRole)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, user)
}

func (ctrl *userController) GetUser(c *gin.Context) {
	idStr := c.Param("id")
	reqID, role := getRequesterInfo(c)

	user, err := ctrl.service.GetUser(c.Request.Context(), idStr, reqID, role)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, user)
}

func (ctrl *userController) GetAllUsers(c *gin.Context) {
	_, role := getRequesterInfo(c)

	users, err := ctrl.service.GetAllUsers(c.Request.Context(), role)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, users)
}

func (ctrl *userController) UpdateUser(c *gin.Context) {
	idStr := c.Param("id")

	var req models.UpdateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return
	}

	reqID, role := getRequesterInfo(c)
	user, err := ctrl.service.UpdateUser(c.Request.Context(), idStr, req, reqID, role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, user)
}

func (ctrl *userController) DeleteUser(c *gin.Context) {
	idStr := c.Param("id")
	_, role := getRequesterInfo(c)

	if err := ctrl.service.DeleteUser(c.Request.Context(), idStr, role); err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"result": "success"})
}

func (ctrl *userController) AssignLeaveBalance(c *gin.Context) {
	idStr := c.Param("id")

	var req models.AssignLeaveBalanceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return
	}

	reqID, role := getRequesterInfo(c)
	user, err := ctrl.service.AssignLeaveBalance(c.Request.Context(), idStr, req, reqID, role)
	if err != nil {
		if err.Error() == "user not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		if err.Error() == "annual leave balance cannot be negative" ||
			err.Error() == "sick leave balance cannot be negative" ||
			err.Error() == "at least one leave balance field must be provided" {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, user)
}
