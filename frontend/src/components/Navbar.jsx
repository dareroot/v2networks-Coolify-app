import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <nav style={{
      background: 'var(--surface)',
      borderBottom: '1px solid var(--border)',
      padding: '0 24px',
      height: 56,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        <span style={{ fontWeight: 700, fontSize: 18, color: 'var(--primary)' }}>TaskApp</span>
        <Link to="/tasks" style={{ color: 'var(--text-muted)', fontSize: 14 }}>Tasks</Link>
        <Link to="/profile" style={{ color: 'var(--text-muted)', fontSize: 14 }}>Profile</Link>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{user?.name}</span>
        <button className="btn-ghost" style={{ padding: '6px 14px' }} onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
}
