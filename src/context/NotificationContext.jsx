import React, { createContext, useContext, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
    const { currentUser } = useAuth();
    const [tick, setTick] = useState(0);

    function getKey() {
        return currentUser ? `gig_notifications_${currentUser.id}` : null;
    }

    function getNotifications() {
        const key = getKey();
        if (!key) return [];
        return JSON.parse(localStorage.getItem(key) || '[]');
    }

    function markAllRead() {
        const key = getKey();
        if (!key) return;
        const notifications = getNotifications().map(n => ({ ...n, read: true }));
        localStorage.setItem(key, JSON.stringify(notifications));
        setTick(t => t + 1);
    }

    function markRead(notificationId) {
        const key = getKey();
        if (!key) return;
        const notifications = getNotifications().map(n =>
            n.id === notificationId ? { ...n, read: true } : n
        );
        localStorage.setItem(key, JSON.stringify(notifications));
        setTick(t => t + 1);
    }

    function clearAll() {
        const key = getKey();
        if (!key) return;
        localStorage.setItem(key, '[]');
        setTick(t => t + 1);
    }

    function addNotification(notification) {
        const key = getKey();
        if (!key) return;
        const existing = getNotifications();
        existing.unshift({ ...notification, id: 'n' + Date.now(), read: false, createdAt: Date.now() });
        localStorage.setItem(key, JSON.stringify(existing.slice(0, 50)));
        setTick(t => t + 1);
    }

    const unreadCount = getNotifications().filter(n => !n.read).length;

    return (
        <NotificationContext.Provider value={{
            getNotifications,
            markAllRead,
            markRead,
            clearAll,
            addNotification,
            unreadCount,
            tick,
        }}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    return useContext(NotificationContext);
}
