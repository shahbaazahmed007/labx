import React, { useCallback, useState, useEffect } from 'react';
import { api } from '../services/api';
import { Navbar } from '../components/common/Navbar';
import { CheckCircle2, Lock, Trophy } from 'lucide-react';
import { soundManager } from '../components/auth/gamified/soundEffects';

export const AchievementsPage = () => {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAchievements = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getAchievements();
      setAchievements(res.data || []);
    } catch (err) {
      console.error('Error fetching achievements:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAchievements();
  }, [fetchAchievements]);

  const earnedCount = achievements.filter((a) => a.is_earned).length;
  const progressPct = achievements.length ? Math.round((earnedCount / achievements.length) * 100) : 0;

  return (
    <div className="founder-world founder-world--achievements" style={{ position: 'relative', minHeight: '100vh', paddingBottom: '100px' }}>
      <div className="founder-world__backdrop" aria-hidden="true" />
      <Navbar title="Achievements Gallery" />

      {/* Progress Showcase Banner */}
      <div
        className="glass-card"
        style={{
          padding: '28px 32px',
          marginBottom: '32px',
          background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.14) 0%, rgba(99, 102, 241, 0.14) 55%, rgba(168, 85, 247, 0.08) 100%)',
          border: '1.5px solid rgba(34, 211, 238, 0.32)',
          boxShadow: '0 16px 45px rgba(0, 0, 0, 0.7), 0 0 35px rgba(6, 182, 212, 0.13)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
        }}
      >
        <div style={{ maxWidth: '650px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', fontWeight: '850', letterSpacing: '0.14em', color: '#67e8f9', textTransform: 'uppercase', marginBottom: '6px' }}>
            <Trophy size={14} />
            <span>HONOR VAULT • TROPHY COLLECTION</span>
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#fff', marginBottom: '6px', letterSpacing: '-0.02em' }}>
            Founder Achievement Gallery
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.5' }}>
            Unlock prestigious medals and badges as you conquer venture milestones, collaborate in domain guilds, and publish transmissions to the network.
          </p>
        </div>

        <div style={{ background: 'rgba(15, 23, 42, 0.85)', padding: '16px 24px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.1)', textAlign: 'right', minWidth: '200px' }}>
          <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#67e8f9', textShadow: '0 0 15px rgba(34, 211, 238, 0.42)' }}>
            {earnedCount} / {achievements.length || 0}
          </div>
          <div style={{ fontSize: '0.72rem', fontWeight: '850', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '2px' }}>
            {progressPct}% Completed
          </div>
          <div style={{ width: '100%', height: '5px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '9999px', marginTop: '8px', overflow: 'hidden' }}>
            <div style={{ width: `${progressPct}%`, height: '100%', background: 'linear-gradient(90deg, #6366f1, #22d3ee)', borderRadius: '9999px', boxShadow: '0 0 10px rgba(34, 211, 238, 0.55)' }} />
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40vh', color: '#38bdf8' }}>
          <div className="spinner" style={{ width: 34, height: 34, margin: '0 auto 12px' }} />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(280px, 100%), 1fr))', gap: '22px' }}>
          {achievements.map((ach) => {
            const isEarned = ach.is_earned;

            return (
              <div
                key={ach.id}
                className="glass-card"
                onMouseEnter={soundManager.playHover}
                style={{
                  padding: '24px',
                  borderRadius: '18px',
                  opacity: isEarned ? 1 : 0.55,
                  border: isEarned ? '1.5px solid rgba(34, 211, 238, 0.42)' : '1px solid rgba(255, 255, 255, 0.06)',
                  background: isEarned
                    ? 'linear-gradient(135deg, rgba(8, 47, 73, 0.72) 0%, rgba(30, 27, 75, 0.72) 100%)'
                    : 'rgba(15, 23, 42, 0.6)',
                  boxShadow: isEarned ? '0 16px 40px rgba(0, 0, 0, 0.7), 0 0 25px rgba(6, 182, 212, 0.16)' : 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)',
                  cursor: isEarned ? 'pointer' : 'default',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div
                      style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '14px',
                        background: isEarned ? 'linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(99, 102, 241, 0.3))' : 'rgba(255, 255, 255, 0.04)',
                        border: isEarned ? '1.5px solid rgba(34, 211, 238, 0.45)' : '1px solid rgba(255, 255, 255, 0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '2rem',
                        boxShadow: isEarned ? '0 0 20px rgba(34, 211, 238, 0.25)' : 'none',
                      }}
                    >
                      {ach.icon || '🏆'}
                    </div>

                    {isEarned ? (
                      <span className="badge badge-cyan" style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '4px 10px', fontSize: '0.72rem' }}>
                        <CheckCircle2 size={13} /> CONQUERED
                      </span>
                    ) : (
                      <span className="badge" style={{ backgroundColor: 'rgba(51, 65, 85, 0.5)', color: '#64748b', display: 'flex', alignItems: 'center', gap: '5px', padding: '4px 10px', fontSize: '0.72rem' }}>
                        <Lock size={12} /> VAULT LOCKED
                      </span>
                    )}
                  </div>

                  <h3 style={{ fontSize: '1.15rem', fontWeight: '850', color: isEarned ? '#fff' : '#94a3b8', marginBottom: '6px' }}>
                    {ach.name}
                  </h3>

                  <p style={{ fontSize: '0.84rem', color: '#94a3b8', lineHeight: '1.45' }}>
                    {ach.description}
                  </p>
                </div>

                <div style={{ marginTop: '20px', paddingTop: '14px', borderTop: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', fontSize: '0.76rem', fontWeight: '800' }}>
                  <span style={{ color: isEarned ? '#10b981' : '#64748b' }}>
                    {isEarned ? 'UNLOCKED' : 'LOCKED'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
