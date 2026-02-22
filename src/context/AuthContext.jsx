import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, setToken, removeToken, getToken } from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(() => {
        const saved = localStorage.getItem('gig_current_user');
        return saved ? JSON.parse(saved) : null;
    });

    const [loading, setLoading] = useState(true);

    function addUserToLocalStorage(user) {
        const users = JSON.parse(localStorage.getItem('gig_users') || '[]');
        const existingIndex = users.findIndex(u => u.id === user.id || u.email === user.email);
        if (existingIndex >= 0) {
            // Update existing user
            users[existingIndex] = user;
        } else {
            // Add new user
            users.push(user);
        }
        localStorage.setItem('gig_users', JSON.stringify(users));
    }

    useEffect(() => {
        // Check if user is still logged in on mount
        async function checkAuth() {
            const token = getToken();
            if (token && !currentUser) {
                try {
                    const data = await api.getMe();
                    const user = { ...data, id: data._id || data.id };
                    localStorage.setItem('gig_current_user', JSON.stringify(user));
                    setCurrentUser(user);
                    addUserToLocalStorage(user);
                } catch (error) {
                    removeToken();
                    localStorage.removeItem('gig_current_user');
                }
            } else if (currentUser) {
                // Ensure current user is in localStorage users array
                addUserToLocalStorage(currentUser);
            }
            setLoading(false);
        }
        checkAuth();
    }, []);

    async function login(email, password) {
        const data = await api.login({ email, password });
        const user = { ...data.user, id: data.user._id || data.user.id };
        setToken(data.token);
        localStorage.setItem('gig_current_user', JSON.stringify(user));
        setCurrentUser(user);
        
        // Add user to local users list for task applicant display
        addUserToLocalStorage(user);
        
        return user;
    }

    async function register({ name, email, password, university, bio, skills }) {
        const data = await api.register({ name, email, password, university, bio, skills });
        const user = { ...data.user, id: data.user._id || data.user.id };
        setToken(data.token);
        localStorage.setItem('gig_current_user', JSON.stringify(user));
        setCurrentUser(user);
        
        // Add user to local users list for task applicant display
        addUserToLocalStorage(user);
        
        return user;
    }

    function logout() {
        removeToken();
        localStorage.removeItem('gig_current_user');
        setCurrentUser(null);
    }

    async function updateCurrentUser(updates) {
        // For now, update locally and refresh from server
        // In production, you'd want an update API endpoint
        const updated = { ...currentUser, ...updates };
        localStorage.setItem('gig_current_user', JSON.stringify(updated));
        setCurrentUser(updated);
        addUserToLocalStorage(updated);
        return updated;
    }

    async function refreshCurrentUser() {
        if (!currentUser) return;
        try {
            const data = await api.getMe();
            const user = { ...data, id: data._id || data.id };
            localStorage.setItem('gig_current_user', JSON.stringify(user));
            setCurrentUser(user);
            addUserToLocalStorage(user);
        } catch (error) {
            console.error('Failed to refresh user:', error);
        }
    }

    function getUsers() {
        // Return users from localStorage for backward compatibility
        return JSON.parse(localStorage.getItem('gig_users') || '[]');
    }

    if (loading) {
        return null; // or a loading spinner
    }

    return (
        <AuthContext.Provider value={{ currentUser, login, register, logout, updateCurrentUser, refreshCurrentUser, getUsers }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
