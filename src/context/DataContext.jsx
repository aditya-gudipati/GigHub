import React, { createContext, useContext, useState, useCallback } from 'react';
import { scoreAndRankApplicants } from '../utils/recommender';
import { handleTaskFailure, computeNewRating } from '../utils/trustEngine';

const DataContext = createContext(null);

function getTasks() { return JSON.parse(localStorage.getItem('gig_tasks') || '[]'); }
function saveTasks(tasks) { localStorage.setItem('gig_tasks', JSON.stringify(tasks)); }
function getUsers() { return JSON.parse(localStorage.getItem('gig_users') || '[]'); }
function saveUsers(users) { localStorage.setItem('gig_users', JSON.stringify(users)); }
function getReviews() { return JSON.parse(localStorage.getItem('gig_reviews') || '[]'); }
function saveReviews(reviews) { localStorage.setItem('gig_reviews', JSON.stringify(reviews)); }

export function DataProvider({ children }) {
    const [tasksTick, setTasksTick] = useState(0);
    const refresh = useCallback(() => setTasksTick(t => t + 1), []);

    function createTask(taskData, creatorId) {
        const tasks = getTasks();
        const newTask = {
            id: 't' + Date.now(),
            ...taskData,
            creatorId,
            selectedApplicantId: null,
            applicants: [],
            updates: [],
            createdAt: Date.now(),
            completedAt: null,
            approved: false,
            cancelled: false,
            status: 'open',
        };
        tasks.push(newTask);
        saveTasks(tasks);
        refresh();
        return newTask;
    }

    function applyToTask(taskId, applicantData) {
        const tasks = getTasks();
        const taskIdx = tasks.findIndex(t => t.id === taskId);
        if (taskIdx === -1) return;
        const task = tasks[taskIdx];
        // prevent duplicate applications
        if (task.applicants.some(a => a.userId === applicantData.userId)) return;
        
        // Get user data to store with application
        const users = getUsers();
        const user = users.find(u => u.id === applicantData.userId);
        
        // Store application with user snapshot for display
        const application = {
            ...applicantData,
            score: 0,
            appliedAt: Date.now(),
            // Store user snapshot to avoid lookup issues
            userSnapshot: user ? {
                name: user.name,
                avatar: user.avatar,
                avatarColor: user.avatarColor,
                university: user.university,
                rating: user.rating,
                completedTasks: user.completedTasks,
                trustScore: user.trustScore,
            } : null,
        };
        
        task.applicants.push(application);
        tasks[taskIdx] = task;
        saveTasks(tasks);
        refresh();
        addNotification(task.creatorId, {
            type: 'application',
            message: `New applicant for "${task.title}"`,
            taskId,
        });
    }

    function selectCandidate(taskId, userId) {
        const tasks = getTasks();
        const idx = tasks.findIndex(t => t.id === taskId);
        if (idx === -1) return;
        tasks[idx].selectedApplicantId = userId;
        tasks[idx].status = userId ? 'in_progress' : 'open'; // Reopen if deselecting
        saveTasks(tasks);
        refresh();
        if (userId) {
            addNotification(userId, {
                type: 'selected',
                message: `You have been selected for "${tasks[idx].title}"!`,
                taskId,
            });
        }
    }

    function submitUpdate(taskId, userId, message, images = []) {
        const tasks = getTasks();
        const idx = tasks.findIndex(t => t.id === taskId);
        if (idx === -1) return;
        tasks[idx].updates.push({ userId, message, images, createdAt: Date.now() });
        saveTasks(tasks);
        refresh();
        addNotification(tasks[idx].creatorId, {
            type: 'update',
            message: `New progress update on "${tasks[idx].title}"`,
            taskId,
        });
    }

    function approveTask(taskId, workerBid) {
        const tasks = getTasks();
        const idx = tasks.findIndex(t => t.id === taskId);
        if (idx === -1) return;

        tasks[idx].completedAt = Date.now();
        tasks[idx].approved = true;
        tasks[idx].status = 'completed';
        saveTasks(tasks);

        // Update worker earnings
        const workerId = tasks[idx].selectedApplicantId;
        const applicant = tasks[idx].applicants.find(a => a.userId === workerId);
        const earning = applicant ? Math.round(applicant.bid * 0.9) : 0; // 10% platform fee

        const users = getUsers();
        const wIdx = users.findIndex(u => u.id === workerId);
        if (wIdx !== -1) {
            users[wIdx].completedTasks += 1;
            users[wIdx].totalTasks += 1;
            users[wIdx].totalEarned = (users[wIdx].totalEarned || 0) + earning;
            saveUsers(users);
        }
        refresh();
    }

    function submitRating(taskId, fromUserId, toUserId, rating, feedback) {
        const reviews = getReviews();
        reviews.push({
            id: 'r' + Date.now(),
            taskId, fromUserId, toUserId, rating, feedback,
            createdAt: Date.now(),
        });
        saveReviews(reviews);

        const users = getUsers();
        const idx = users.findIndex(u => u.id === toUserId);
        if (idx !== -1) {
            const user = users[idx];
            const reviewsForUser = reviews.filter(r => r.toUserId === toUserId);
            const avgRating = reviewsForUser.reduce((sum, r) => sum + r.rating, 0) / reviewsForUser.length;
            users[idx].rating = Math.round(avgRating * 10) / 10;
            saveUsers(users);
        }
        refresh();
    }

    function cancelTask(taskId, cancelledBy, reason = '') {
        const tasks = getTasks();
        const idx = tasks.findIndex(t => t.id === taskId);
        if (idx === -1) return;
        tasks[idx].cancelled = true;
        tasks[idx].status = 'cancelled';
        tasks[idx].cancellationReason = reason;
        tasks[idx].cancelledBy = cancelledBy;
        saveTasks(tasks);

        if (cancelledBy === 'worker') {
            const users = getUsers();
            const workerId = tasks[idx].selectedApplicantId;
            const wIdx = users.findIndex(u => u.id === workerId);
            if (wIdx !== -1) {
                users[wIdx] = handleTaskFailure(users[wIdx]);
                saveUsers(users);
            }
        }
        refresh();
    }

    function getRankedApplicants(taskId, mode = 'quality') {
        const tasks = getTasks();
        const task = tasks.find(t => t.id === taskId);
        if (!task) return [];
        const users = getUsers();
        return scoreAndRankApplicants(task.applicants, users, task, mode);
    }

    function getUserTasks(userId) {
        const tasks = getTasks();
        return {
            created: tasks.filter(t => t.creatorId === userId),
            applied: tasks.filter(t => t.applicants.some(a => a.userId === userId) && t.creatorId !== userId),
            inProgress: tasks.filter(t => t.selectedApplicantId === userId && !t.approved && !t.cancelled),
            completed: tasks.filter(t => t.selectedApplicantId === userId && t.approved),
        };
    }

    function getUserReviews(userId) {
        return getReviews().filter(r => r.toUserId === userId);
    }

    function addNotification(userId, notification) {
        const key = `gig_notifications_${userId}`;
        const existing = JSON.parse(localStorage.getItem(key) || '[]');
        existing.unshift({ ...notification, id: 'n' + Date.now(), read: false, createdAt: Date.now() });
        localStorage.setItem(key, JSON.stringify(existing.slice(0, 50)));
    }

    return (
        <DataContext.Provider value={{
            tasksTick,
            getTasks,
            getUsers,
            getReviews,
            createTask,
            applyToTask,
            selectCandidate,
            submitUpdate,
            approveTask,
            submitRating,
            cancelTask,
            getRankedApplicants,
            getUserTasks,
            getUserReviews,
            addNotification,
            refresh,
        }}>
            {children}
        </DataContext.Provider>
    );
}

export function useData() {
    return useContext(DataContext);
}
