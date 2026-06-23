import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../api/client';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleUpdate(e) {
    e.preventDefault();
    setError(''); setSuccess('');
    setLoading(true);
    try {
      const payload = { name: form.name, email: form.email };
      if (form.password) payload.password = form.password;
      await api.put('/api/users/me', payload);
      setSuccess('Profile updated successfully');
      setForm(f => ({ ...f, password: '' }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Delete your account? This cannot be undone.')) return;
    await api.delete('/api/users/me');
    logout();
    navigate('/login');
  }

  return (
    <div style={{ maxWidth: 480, margin: '32px auto', padding: '0 16px' }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>Profile</h1>
      <div className="card">
        <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label className="label">Name</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
          </div>
          <div>
            <label className="label">New password (leave blank to keep current)</label>
            <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} minLength={6} />
          </div>
          {error && <p className="error-msg">{error}</p>}
          {success && <p style={{ color: 'var(--success)', fontSize: 13 }}>{success}</p>}
          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? 'Saving…' : 'Save changes'}
          </button>
        </form>

        <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '24px 0' }} />
        <div>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 12 }}>
            Danger zone — this action is irreversible.
          </p>
          <button className="btn-danger" onClick={handleDelete}>Delete my account</button>
        </div>
      </div>
    </div>
  );
}
