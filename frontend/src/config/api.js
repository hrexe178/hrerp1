// API Configuration
// This file centralizes all API-related configuration

// Get API URL from environment variable or use default
export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// API endpoints
export const API_ENDPOINTS = {
    // Auth
    LOGIN: `${API_URL}/api/auth/login`,
    REGISTER: `${API_URL}/api/auth/register`,
    ME: `${API_URL}/api/auth/me`,

    // Employees
    EMPLOYEES: `${API_URL}/api/employees`,
    EMPLOYEE_BY_ID: (id) => `${API_URL}/api/employees/${id}`,

    // Attendance
    ATTENDANCE: `${API_URL}/api/attendance`,
    ATTENDANCE_BY_ID: (id) => `${API_URL}/api/attendance/${id}`,
    ATTENDANCE_BY_EMPLOYEE: (employeeId) => `${API_URL}/api/attendance/employee/${employeeId}`,
    ATTENDANCE_REPORT: (month, year) => `${API_URL}/api/attendance/report/${month}/${year}`,

    // Projects
    PROJECTS: `${API_URL}/api/projects`,
    PROJECT_BY_ID: (id) => `${API_URL}/api/projects/${id}`,
    PROJECT_ASSIGN_EMPLOYEE: (id) => `${API_URL}/api/projects/${id}/assign-employee`,
    PROJECT_REMOVE_EMPLOYEE: (id, employeeId) => `${API_URL}/api/projects/${id}/remove-employee/${employeeId}`,

    // Documents
    DOCUMENTS: `${API_URL}/api/documents`,
    DOCUMENT_BY_ID: (id) => `${API_URL}/api/documents/${id}`,
    DOCUMENTS_BY_PROJECT: (projectId) => `${API_URL}/api/documents/project/${projectId}`,
    DOCUMENTS_BY_EMPLOYEE: (employeeId) => `${API_URL}/api/documents/employee/${employeeId}`,

    // Health
    HEALTH: `${API_URL}/api/health`,
};

// Helper function to get auth headers
export const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
    };
};

// Helper function to handle API errors
export const handleApiError = (error) => {
    if (error.response) {
        // Server responded with error
        const errorMsg = error.response?.data?.errors
            ? error.response.data.errors.map((e) => e.msg).join(', ')
            : error.response?.data?.message || error.message;
        return errorMsg;
    } else if (error.request) {
        // Request made but no response
        return 'No response from server. Please check your connection.';
    } else {
        // Error setting up request
        return error.message;
    }
};

export default API_URL;
