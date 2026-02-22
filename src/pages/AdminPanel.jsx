import React, { useState } from 'react';
import { Shield, XCircle, CheckCircle, User } from 'lucide-react';
import { useData } from '../context/DataContext';
import Sidebar from '../components/Sidebar';
import { CATEGORIES } from '../data/categories';

export default function AdminPanel() {
    const { getTasks, getUsers, selectCandidate } = useData();
    const [activeTab, setActiveTab] = useState('disputes');

    const tasks = getTasks();
    const users = getUsers();

    const disputes = tasks.filter(t => t.cancelled && t.cancelledBy === 'worker' ||
        (t.cancelled && !t.approved));
    const incomplete = tasks.filter(t => !t.approved && !t.cancelled && t.deadline < Date.now() && t.status === 'in_progress');
    const allUsers = users.sort((a, b) => (b.redMarks || 0) - (a.redMarks || 0));

    function getUser(id) { return users.find(u => u.id === id); }

    const tabs = [
        { id: 'disputes', label: 'Disputes', count: disputes.length },
        { id: 'overdue', label: 'Overdue Tasks', count: incomplete.length },
        { id: 'users', label: 'Users & Penalties', count: allUsers.filter(u => u.redMarks > 0).length },
    ];

    return (
        <div className="page-container">
            <Sidebar />
            <main className="main-content">
                <div className="content-wrapper">
                    <div className="page-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <Shield size={28} color="var(--accent-violet)" />
                            <div>
                                <h1 style={{ fontSize: 26 }}>Admin Panel</h1>
                                <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Domain-specific conflict resolution & user management</p>
                            </div>
                        </div>
                    </div>

                    {/* Warning banner */}
                    <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 'var(--radius-md)', padding: '12px 16px', marginBottom: 24, fontSize: 13, color: '#fcd34d' }}>
                        ⚠ Admin actions are permanent. Review all cases carefully before making decisions.
                    </div>

                    <div className="tabs" style={{ marginBottom: 24 }}>
                        {tabs.map(t => (
                            <button key={t.id} className={`tab-btn ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)}>
                                {t.label}{t.count > 0 && <span style={{ marginLeft: 6, background: t.count > 0 ? 'rgba(239,68,68,0.3)' : 'var(--bg-glass)', borderRadius: 10, padding: '1px 6px', fontSize: 11 }}>{t.count}</span>}
                            </button>
                        ))}
                    </div>

                    {/* Disputes */}
                    {activeTab === 'disputes' && (
                        disputes.length === 0 ? (
                            <div className="empty-state"><div className="empty-icon">✅</div><div className="empty-title">No active disputes</div></div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                {disputes.map(task => {
                                    const creator = getUser(task.creatorId);
                                    const worker = task.selectedApplicantId ? getUser(task.selectedApplicantId) : null;
                                    const cat = CATEGORIES.find(c => c.id === task.category);
                                    return (
                                        <div key={task.id} className="glass-card" style={{ padding: '24px', borderLeft: '4px solid var(--danger)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                                                <div>
                                                    <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{task.title}</div>
                                                    <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{cat?.icon} {cat?.label} · Budget: ₹{task.budget}</div>
                                                </div>
                                                <span className="badge badge-cancelled">Cancelled</span>
                                            </div>
                                            <div style={{ display: 'flex', gap: 20, fontSize: 13, marginBottom: 16, flexWrap: 'wrap' }}>
                                                <div>
                                                    <div style={{ color: 'var(--text-muted)', marginBottom: 4 }}>Task Poster</div>
                                                    <div style={{ fontWeight: 600 }}>{creator?.name || 'Unknown'}</div>
                                                </div>
                                                {worker && (
                                                    <div>
                                                        <div style={{ color: 'var(--text-muted)', marginBottom: 4 }}>Assigned Worker</div>
                                                        <div style={{ fontWeight: 600 }}>{worker.name}</div>
                                                    </div>
                                                )}
                                                {task.cancellationReason && (
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ color: 'var(--text-muted)', marginBottom: 4 }}>Reason</div>
                                                        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{task.cancellationReason}</div>
                                                    </div>
                                                )}
                                            </div>
                                            <div style={{ background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)', padding: '12px 16px', fontSize: 13, color: 'var(--text-secondary)', border: '1px solid var(--bg-glass-border)' }}>
                                                💡 Admin decision needed: Review contributions based on updates provided and determine payment split. Consider midway cancellation policy.
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )
                    )}

                    {/* Overdue tasks */}
                    {activeTab === 'overdue' && (
                        incomplete.length === 0 ? (
                            <div className="empty-state"><div className="empty-icon">✅</div><div className="empty-title">No overdue tasks</div></div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                {incomplete.map(task => {
                                    const creator = getUser(task.creatorId);
                                    const worker = getUser(task.selectedApplicantId);
                                    return (
                                        <div key={task.id} className="glass-card" style={{ padding: '24px', borderLeft: '4px solid var(--warning)' }}>
                                            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>{task.title}</div>
                                            <div style={{ display: 'flex', gap: 16, fontSize: 13, flexWrap: 'wrap', marginBottom: 12 }}>
                                                <span style={{ color: 'var(--text-muted)' }}>Poster: <strong style={{ color: 'var(--text-primary)' }}>{creator?.name}</strong></span>
                                                <span style={{ color: 'var(--text-muted)' }}>Worker: <strong style={{ color: 'var(--text-primary)' }}>{worker?.name || 'Unassigned'}</strong></span>
                                                <span style={{ color: 'var(--danger)' }}>Deadline: {new Date(task.deadline).toLocaleString()}</span>
                                                <span style={{ color: 'var(--text-muted)' }}>Budget: ₹{task.budget}</span>
                                            </div>
                                            <div style={{ background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)', padding: '12px 16px', fontSize: 13, color: '#fcd34d', border: '1px solid rgba(245,158,11,0.3)' }}>
                                                ⚠ This task has passed its deadline without completion. Admin should contact parties and issue resolution.
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )
                    )}

                    {/* Users */}
                    {activeTab === 'users' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {allUsers.map(user => (
                                <div key={user.id} className="glass-card" style={{ padding: '18px', display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap', borderLeft: user.redMarks > 0 ? '3px solid var(--danger)' : '3px solid var(--bg-glass-border)' }}>
                                    <div className="avatar avatar-md" style={{ background: user.avatarColor, color: 'white' }}>{user.avatar}</div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 700, marginBottom: 2 }}>{user.name}</div>
                                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{user.email} · {user.university}</div>
                                        <div style={{ fontSize: 12, marginTop: 4, display: 'flex', gap: 12 }}>
                                            <span>Tasks: {user.completedTasks}/{user.totalTasks}</span>
                                            <span style={{ color: user.redMarks > 0 ? 'var(--danger)' : 'var(--text-muted)' }}>
                                                Red marks: {user.redMarks || 0}
                                            </span>
                                            <span>Penalties: {user.penalties || 0}</span>
                                            <span>Trust: {user.trustScore}</span>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right', fontSize: 12 }}>
                                        {user.bannedUntil && user.bannedUntil > Date.now() ? (
                                            <span style={{ color: 'var(--danger)', fontWeight: 700 }}>
                                                🚫 Banned until {new Date(user.bannedUntil).toLocaleDateString()}
                                            </span>
                                        ) : (
                                            <span style={{ color: user.redMarks > 0 ? 'var(--warning)' : 'var(--accent-green)' }}>
                                                {user.redMarks > 0 ? '⚠ Flagged' : '✓ Clean'}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
