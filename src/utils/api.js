// API utility for backend communication
const API_BASE = 'http://localhost:5000/api';

function getToken() {
    return localStorage.getItem('gig_auth_token');
}

function setToken(token) {
    localStorage.setItem('gig_auth_token', token);
}

function removeToken() {
    localStorage.removeItem('gig_auth_token');
}

async function apiCall(endpoint, options = {}) {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'API request failed');
    }

    return data;
}

export const api = {
    // Auth
    register: (userData) => apiCall('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
    }),
    
    login: (credentials) => apiCall('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
    }),
    
    getMe: () => apiCall('/auth/me'),
    
    // Users
    getUser: (userId) => apiCall(`/users/${userId}`),
    
    // Tasks
    getTasks: () => apiCall('/tasks'),
    
    createTask: (taskData) => apiCall('/tasks', {
        method: 'POST',
        body: JSON.stringify(taskData),
    }),
    
    getTask: (taskId) => apiCall(`/tasks/${taskId}`),
    
    updateTask: (taskId, updates) => apiCall(`/tasks/${taskId}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
    }),
    
    deleteTask: (taskId) => apiCall(`/tasks/${taskId}`, {
        method: 'DELETE',
    }),
};

export { getToken, setToken, removeToken };
