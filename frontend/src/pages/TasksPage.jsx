import { useState, useEffect } from 'react';
import { api } from '../api/client';

const STATUSES = ['pending', 'in_progress', 'done'];

function TaskForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial || { title: '', description: '', status: 'pending' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await onSave(form);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div>
        <label className="label">Title *</label>
        <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
      </div>
      <div>
        <label className="label">Description</label>
        <textarea rows={3} value={form.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
      </div>
      <div>
        <label className="label">Status</label>
        <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
          {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
        </select>
      </div>
      {error && <p className="error-msg">{error}</p>}
      <div style={{ display: 'flex', gap: 8 }}>
        <button className="btn-primary" type="submit" disabled={loading}>
          {loading ? 'Saving…' : 'Save'}
        </button>
        {onCancel && <button className="btn-ghost" type="button" onClick={onCancel}>Cancel</button>}
      </div>
    </form>
  );
}

function TaskCard({ task, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);

  async function handleSave(form) {
    await onUpdate(task.id, form);
    setEditing(false);
  }

  if (editing) {
    return (
      <div className="card" style={{ marginBottom: 12 }}>
        <TaskForm initial={task} onSave={handleSave} onCancel={() => setEditing(false)} />
      </div>
    );
  }

  return (
    <div className="card" style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <span style={{ fontWeight: 600 }}>{task.title}</span>
            <span className={`badge badge-${task.status}`}>{task.status.replace('_', ' ')}</span>
          </div>
          {task.description && (
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 4 }}>{task.description}</p>
          )}
          <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>
            {new Date(task.created_at).toLocaleDateString()}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="btn-ghost" style={{ padding: '6px 12px' }} onClick={() => setEditing(true)}>Edit</button>
          <button className="btn-danger" style={{ padding: '6px 12px' }} onClick={() => onDelete(task.id)}>Delete</button>
        </div>
      </div>
    </div>
  );
}

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    api.get('/api/tasks').then(setTasks).finally(() => setLoading(false));
  }, []);

  async function handleCreate(form) {
    const task = await api.post('/api/tasks', form);
    setTasks(prev => [task, ...prev]);
    setShowForm(false);
  }

  async function handleUpdate(id, form) {
    const updated = await api.put(`/api/tasks/${id}`, form);
    setTasks(prev => prev.map(t => t.id === id ? updated : t));
  }

  async function handleDelete(id) {
    if (!confirm('Delete this task?')) return;
    await api.delete(`/api/tasks/${id}`);
    setTasks(prev => prev.filter(t => t.id !== id));
  }

  const filtered = filter === 'all' ? tasks : tasks.filter(t => t.status === filter);

  return (
    <div style={{ maxWidth: 720, margin: '32px auto', padding: '0 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>My Tasks</h1>
        <button className="btn-primary" onClick={() => setShowForm(v => !v)}>
          {showForm ? 'Cancel' : '+ New Task'}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>New Task</h2>
          <TaskForm onSave={handleCreate} onCancel={() => setShowForm(false)} />
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['all', ...STATUSES].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            style={{
              padding: '6px 14px',
              borderRadius: 999,
              border: '1px solid var(--border)',
              background: filter === s ? 'var(--primary)' : 'transparent',
              color: filter === s ? '#fff' : 'var(--text-muted)',
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            {s.replace('_', ' ')}
          </button>
        ))}
      </div>

      {loading && <p style={{ color: 'var(--text-muted)' }}>Loading tasks…</p>}
      {!loading && filtered.length === 0 && (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: 48 }}>
          No tasks yet. Create your first one!
        </p>
      )}
      {filtered.map(task => (
        <TaskCard key={task.id} task={task} onUpdate={handleUpdate} onDelete={handleDelete} />
      ))}
    </div>
  );
}
