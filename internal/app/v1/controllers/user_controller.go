package controllers

import (
	"net/http"

	"leave_management_system/internal/app/v1/interfaces"
	"leave_management_system/internal/app/v1/models"

	"github.com/gin-gonic/gin"
)

type userController struct {
	service interfaces.UserService
}

func NewUserController(service interfaces.UserService) interfaces.UserController {
	return &userController{service: service}
}

// getRequesterInfo retrieves user identity mock from JWT context.
// TODO: Hook this to actual Auth Middleware later. For now, testing as Admin.
func getRequesterInfo(c *gin.Context) (string, models.UserRole) {
	return "mock-user-id", models.RoleAdmin
}

func (ctrl *userController) CreateUser(c *gin.Context) {
	var req models.CreateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return
	}

	_, role := getRequesterInfo(c)

	user, err := ctrl.service.CreateUser(c.Request.Context(), req, role)
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
