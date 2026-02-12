import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import DB from '../utils/db.js';
import { COURSES } from '../utils/constants';

export default function ParentDashboard({ onBack }) {
  const { isLoggedIn, isDemoMode, currentUser, openAuthModal, session } = useAuth();
  const [children, setChildren] = useState([]);
  const [childProgress, setChildProgress] = useState({});
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [editingChild, setEditingChild] = useState(null);
  const [addingChild, setAddingChild] = useState(false);
  const [newChild, setNewChild] = useState({ name: '', age: '', pin: '' });
  const [error, setError] = useState('');

  const isParentLoggedIn = isLoggedIn && !isDemoMode && currentUser?.role === 'parent';

  useEffect(() => {
    if (!isParentLoggedIn || !session?.id) { setLoading(false); return; }
    let cancelled = false;

    async function loadData() {
      try {
        const kids = await DB.getChildrenByParent(session.id);
        if (cancelled) return;
        setChildren(kids);

        // Load progress for each child
        const progressMap = {};
        for (const kid of kids) {
          const prog = await DB.getProgressByChild(kid.id);
          progressMap[kid.id] = {};
          prog.forEach(p => { progressMap[kid.id][`${p.course_id}_${p.chapter_index}`] = true; });
        }
        if (!cancelled) setChildProgress(progressMap);

        // Load purchases
        const allPurchases = await DB.getPurchases();
        const myPurchases = allPurchases.filter(p => p.user_id === session.id);
        if (!cancelled) setPurchases(myPurchases);
      } catch (err) {
        console.error('Error loading parent data:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadData();
    return () => { cancelled = true; };
  }, [isParentLoggedIn, session?.id]);

  const handleBack = () => {
    if (onBack) onBack();
    else window.location.hash = '#home';
  };

  const handleSendReport = () => {
    setSending(true);
    setTimeout(() => {
      alert('📧 Progress report feature coming soon! EmailJS integration pending.');
      setSending(false);
    }, 500);
  };

  const handleAddChild = async () => {
    setError('');
    if (!newChild.name || !newChild.pin || newChild.pin.length !== 4) {
      setError('Name and 4-digit PIN are required');
      return;
    }
    try {
      const child = await DB.addChild({ name: newChild.name, age: newChild.age || 10, pin: newChild.pin, parentId: session.id });
      if (child) {
        setChildren(prev => [...prev, child]);
        setChildProgress(prev => ({ ...prev, [child.id]: {} }));
        setAddingChild(false);
        setNewChild({ name: '', age: '', pin: '' });
      } else {
        setError('Failed to add child. PIN may already be in use.');
      }
    } catch (e) {
      setError(e.message || 'Failed to add child');
    }
  };

  const handleDeleteChild = async (childId) => {
    if (!confirm('Remove this child? Their progress will be deleted.')) return;
    const ok = await DB.deleteChild(childId);
    if (ok) {
      setChildren(prev => prev.filter(c => c.id !== childId));
      setChildProgress(prev => { const n = { ...prev }; delete n[childId]; return n; });
    }
  };

  const handleUpdateChild = async (childId, updates) => {
    const updated = await DB.updateChild(childId, updates);
    if (updated) {
      setChildren(prev => prev.map(c => c.id === childId ? { ...c, ...updated } : c));
      setEditingChild(null);
    }
  };

  // Not logged in
  if (!isParentLoggedIn) {
    return (
      <div id="parent-dashboard">
        <div className="container">
          <div className="pd-header">
            <button className="btn btn-back" onClick={handleBack}>← Back Home</button>
            <h2 style={{ flex: 1, fontSize: '1.4rem' }}>👨‍👩‍👧 Parent Dashboard</h2>
          </div>
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <span style={{ fontSize: '4rem', display: 'block', marginBottom: 16 }}>🔐</span>
            <h3 style={{ marginBottom: 12 }}>Parent Portal</h3>
            <p style={{ color: 'var(--text2)', marginBottom: 20 }}>Log in to access your family dashboard</p>
            <button className="btn btn-primary" onClick={() => openAuthModal('login')}>Log In →</button>
            <div style={{ marginTop: 12 }}>
              <span style={{ color: 'var(--text3)', fontSize: '.9rem' }}>Don't have an account? </span>
              <a onClick={() => openAuthModal('signup')} style={{ color: 'var(--cyan)', cursor: 'pointer', fontSize: '.9rem' }}>Sign up</a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div id="parent-dashboard">
        <div className="container">
          <div className="pd-header">
            <button className="btn btn-back" onClick={handleBack}>← Back Home</button>
            <h2 style={{ flex: 1, fontSize: '1.4rem' }}>👨‍👩‍👧 Parent Dashboard</h2>
          </div>
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <span className="auth-spinner" style={{ width: 40, height: 40 }} />
            <p style={{ color: 'var(--text2)', marginTop: 16 }}>Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  // Compute aggregate stats
  const totalCompleted = Object.values(childProgress).reduce((sum, p) => sum + Object.keys(p).length, 0);
  const totalPoints = totalCompleted * 25;

  return (
    <div id="parent-dashboard">
      <div className="container">
        <div className="pd-header">
          <button className="btn btn-back" onClick={handleBack}>← Back Home</button>
          <h2 style={{ flex: 1, fontSize: '1.4rem' }}>👨‍👩‍👧 Parent Dashboard</h2>
        </div>

        <div id="pd-content">
          {/* Stats */}
          <div className="pd-stats">
            <div className="pd-stat"><div className="stat-value">{currentUser?.name || 'Parent'}</div><div className="stat-label">Account</div></div>
            <div className="pd-stat"><div className="stat-value">{children.length}</div><div className="stat-label">Children</div></div>
            <div className="pd-stat"><div className="stat-value">{totalCompleted}/24</div><div className="stat-label">Chapters Done</div></div>
            <div className="pd-stat"><div className="stat-value">{totalPoints}⭐</div><div className="stat-label">Total XP</div></div>
          </div>

          {/* Children */}
          <div style={{ margin: '30px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3>👧 Your Children</h3>
              <button className="btn btn-primary" onClick={() => setAddingChild(true)} style={{ fontSize: '.85rem', padding: '8px 16px' }}>
                + Add Child
              </button>
            </div>

            {addingChild && (
              <div className="glass" style={{ padding: 20, marginBottom: 16, borderRadius: 12 }}>
                <h4 style={{ marginBottom: 12 }}>Add a Child</h4>
                {error && <p style={{ color: 'var(--red)', fontSize: '.85rem', marginBottom: 8 }}>{error}</p>}
                <input className="auth-input" placeholder="Child's name" value={newChild.name}
                  onChange={e => setNewChild(p => ({ ...p, name: e.target.value }))} />
                <input className="auth-input" placeholder="Age (9-13)" type="number" min={9} max={13}
                  value={newChild.age} onChange={e => setNewChild(p => ({ ...p, age: e.target.value }))} />
                <input className="auth-input" placeholder="4-digit PIN" type="password" maxLength={4}
                  value={newChild.pin} onChange={e => setNewChild(p => ({ ...p, pin: e.target.value.replace(/\D/g, '') }))} />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-primary" onClick={handleAddChild} style={{ fontSize: '.85rem' }}>Save</button>
                  <button className="btn btn-back" onClick={() => { setAddingChild(false); setError(''); }} style={{ fontSize: '.85rem' }}>Cancel</button>
                </div>
              </div>
            )}

            {children.length === 0 ? (
              <div className="glass" style={{ padding: 30, textAlign: 'center', borderRadius: 12 }}>
                <span style={{ fontSize: '2rem' }}>👶</span>
                <p style={{ color: 'var(--text2)', marginTop: 8 }}>No children added yet. Add one to get started!</p>
              </div>
            ) : (
              children.map(child => {
                const progress = childProgress[child.id] || {};
                const completedCount = Object.keys(progress).length;

                return (
                  <div className="glass" key={child.id} style={{ padding: 20, marginBottom: 12, borderRadius: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <div>
                        <h4 style={{ margin: 0 }}>🧒 {child.name}</h4>
                        <span style={{ color: 'var(--text3)', fontSize: '.8rem' }}>Age: {child.age} • PIN: ****</span>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => handleDeleteChild(child.id)}
                          style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer', fontSize: '.8rem' }}>
                          Remove
                        </button>
                      </div>
                    </div>

                    <div style={{ fontSize: '.85rem', color: 'var(--text2)', marginBottom: 8 }}>
                      {completedCount} chapters completed • {completedCount * 25} XP
                    </div>

                    {/* Per-course progress */}
                    {['ai', 'space', 'robotics'].map(c => {
                      const course = COURSES[c];
                      let done = 0;
                      for (let i = 0; i < 8; i++) { if (progress[`${c}_${i}`]) done++; }
                      const pct = Math.round(done / 8 * 100);
                      return (
                        <div key={c} style={{ marginBottom: 8 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.8rem', color: 'var(--text2)' }}>
                            <span>{course?.title}</span><span>{done}/8 ({pct}%)</span>
                          </div>
                          <div className="progress-bar" style={{ maxWidth: '100%', margin: '4px 0' }}>
                            <div className="progress-fill" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })
            )}
          </div>

          {/* Purchase History */}
          <div style={{ margin: '30px 0' }}>
            <h3 style={{ marginBottom: 16 }}>💳 Purchase History</h3>
            {purchases.length === 0 ? (
              <div className="glass" style={{ padding: 20, textAlign: 'center', borderRadius: 12 }}>
                <p style={{ color: 'var(--text2)' }}>No purchases yet.</p>
              </div>
            ) : (
              purchases.map(p => (
                <div className="glass" key={p.id} style={{ padding: 16, marginBottom: 8, borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{p.plan}</div>
                    <div style={{ fontSize: '.8rem', color: 'var(--text3)' }}>{new Date(p.created_at).toLocaleDateString()}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 600, color: 'var(--green)' }}>${p.amount}</div>
                    <div style={{ fontSize: '.75rem', color: p.status === 'completed' ? 'var(--green)' : 'var(--yellow)' }}>{p.status}</div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Send report */}
          <div style={{ textAlign: 'center', margin: '20px 0' }}>
            <button className="btn btn-primary" onClick={handleSendReport} disabled={sending}>
              {sending ? 'Sending...' : '📧 Send Progress Report'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
