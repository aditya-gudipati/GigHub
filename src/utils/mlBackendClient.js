"""
Frontend Integration Helper
Provides same API as JavaScript recommender but calls Python ML backend
"""

const BACKEND_URL = 'http://localhost:8000';

export async function scoreApplicant(user, task, bid, mode = 'quality') {
    try {
        const response = await fetch(`${BACKEND_URL}/api/recommender/score-applicant`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user, task, bid, mode })
        });
        
        if (!response.ok) {
            throw new Error(`Backend error: ${response.statusText}`);
        }
        
        const data = await response.json();
        return data.score;
    } catch (error) {
        console.error('Error calling ML backend:', error);
        // Fallback to local calculation if backend is unavailable
        return fallbackScoreApplicant(user, task, bid, mode);
    }
}

export async function scoreAndRankApplicants(applicants, users, task, mode = 'quality') {
    try {
        const response = await fetch(`${BACKEND_URL}/api/recommender/rank-applicants`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ applicants, users, task, mode })
        });
        
        if (!response.ok) {
            throw new Error(`Backend error: ${response.statusText}`);
        }
        
        const data = await response.json();
        return data.applicants;
    } catch (error) {
        console.error('Error calling ML backend:', error);
        // Fallback to local calculation if backend is unavailable
        return fallbackScoreAndRank(applicants, users, task, mode);
    }
}

export async function recommendTasksForUser(user, tasks) {
    try {
        const response = await fetch(`${BACKEND_URL}/api/recommender/recommend-tasks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user, tasks })
        });
        
        if (!response.ok) {
            throw new Error(`Backend error: ${response.statusText}`);
        }
        
        const data = await response.json();
        return data.tasks;
    } catch (error) {
        console.error('Error calling ML backend:', error);
        // Fallback to local calculation if backend is unavailable
        return fallbackRecommendTasks(user, tasks);
    }
}

// Trust Engine Functions
export async function computeTrustScore(user) {
    try {
        const response = await fetch(`${BACKEND_URL}/api/trust/compute-score`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user })
        });
        
        if (!response.ok) {
            throw new Error(`Backend error: ${response.statusText}`);
        }
        
        const data = await response.json();
        return data.score;
    } catch (error) {
        console.error('Error calling ML backend:', error);
        return fallbackComputeTrustScore(user);
    }
}

export async function handleTaskFailure(user) {
    try {
        const response = await fetch(`${BACKEND_URL}/api/trust/handle-failure`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user })
        });
        
        if (!response.ok) {
            throw new Error(`Backend error: ${response.statusText}`);
        }
        
        const data = await response.json();
        return data.user;
    } catch (error) {
        console.error('Error calling ML backend:', error);
        return fallbackHandleFailure(user);
    }
}

export async function isUserBanned(user) {
    try {
        const response = await fetch(`${BACKEND_URL}/api/trust/check-ban`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user })
        });
        
        if (!response.ok) {
            throw new Error(`Backend error: ${response.statusText}`);
        }
        
        const data = await response.json();
        return data.isBanned;
    } catch (error) {
        console.error('Error calling ML backend:', error);
        return user.bannedUntil ? user.bannedUntil > Date.now() : false;
    }
}

// Fallback functions (use existing JavaScript implementations)
function fallbackScoreApplicant(user, task, bid, mode) {
    // Import and use existing recommender.js logic
    const { scoreApplicant: jsScoreApplicant } = require('./recommender.js');
    return jsScoreApplicant(user, task, bid, mode);
}

function fallbackScoreAndRank(applicants, users, task, mode) {
    const { scoreAndRankApplicants: jsScoreAndRank } = require('./recommender.js');
    return jsScoreAndRank(applicants, users, task, mode);
}

function fallbackRecommendTasks(user, tasks) {
    const { recommendTasksForUser: jsRecommend } = require('./recommender.js');
    return jsRecommend(user, tasks);
}

function fallbackComputeTrustScore(user) {
    const { computeTrustScore: jsComputeTrust } = require('./trustEngine.js');
    return jsComputeTrust(user);
}

function fallbackHandleFailure(user) {
    const { handleTaskFailure: jsHandleFailure } = require('./trustEngine.js');
    return jsHandleFailure(user);
}
