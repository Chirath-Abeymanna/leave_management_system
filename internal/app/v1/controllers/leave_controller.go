package controllers

import (
	"net/http"

	"Server/internal/app/v1/interfaces"
	"Server/internal/app/v1/models"
	"Server/internal/middleware"

	"github.com/gin-gonic/gin"
)

type leaveController struct {
	service interfaces.LeaveService
}

func NewLeaveController(service interfaces.LeaveService) interfaces.LeaveController {
	return &leaveController{service: service}
}

func (ctrl *leaveController) CreateLeave(c *gin.Context) {
	var req models.CreateLeaveRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return
	}

	requesterID, _ := middleware.GetUserIDFromContext(c)

	leave, err := ctrl.service.CreateLeave(c.Request.Context(), req, requesterID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, leave)
}

func (ctrl *leaveController) GetLeave(c *gin.Context) {
	idStr := c.Param("id")
	requesterID, _ := middleware.GetUserIDFromContext(c)

	leave, err := ctrl.service.GetLeave(c.Request.Context(), idStr, requesterID)
	if err != nil {
		if err.Error() == "leave request not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, leave)
}

func (ctrl *leaveController) GetMyLeaves(c *gin.Context) {
	requesterID, _ := middleware.GetUserIDFromContext(c)

	leaves, err := ctrl.service.GetMyLeaves(c.Request.Context(), requesterID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, leaves)
}

func (ctrl *leaveController) GetAllLeaves(c *gin.Context) {
	requesterID, _ := middleware.GetUserIDFromContext(c)

	leaves, err := ctrl.service.GetAllLeaves(c.Request.Context(), requesterID)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, leaves)
}

func (ctrl *leaveController) UpdateLeave(c *gin.Context) {
	idStr := c.Param("id")

	var req models.UpdateLeaveRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return
	}

	requesterID, _ := middleware.GetUserIDFromContext(c)

	leave, err := ctrl.service.UpdateLeave(c.Request.Context(), idStr, req, requesterID)
	if err != nil {
		if err.Error() == "leave request not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		if err.Error() == "unauthorized: employees cannot update leave requests" {
			c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, leave)
}

func (ctrl *leaveController) CancelLeave(c *gin.Context) {
	idStr := c.Param("id")
	requesterID, _ := middleware.GetUserIDFromContext(c)

	leave, err := ctrl.service.CancelLeave(c.Request.Context(), idStr, requesterID)
	if err != nil {
		if err.Error() == "leave request not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		if err.Error() == "unauthorized: you can only cancel your own leave requests" {
			c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, leave)
}

func (ctrl *leaveController) DeleteLeave(c *gin.Context) {
	idStr := c.Param("id")
	requesterID, _ := middleware.GetUserIDFromContext(c)

	if err := ctrl.service.DeleteLeave(c.Request.Context(), idStr, requesterID); err != nil {
		if err.Error() == "leave request not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"result": "success"})
}
