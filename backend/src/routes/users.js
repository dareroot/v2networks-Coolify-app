const router = require('express').Router();
const bcrypt = require('bcryptjs');
const pool = require('../db/pool');
const auth = require('../middleware/auth');

// GET /users (admin-style list, same token user can access own data)
router.get('/', auth, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT id, name, email, created_at FROM users ORDER BY id');
    res.json(rows);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/me', auth, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT id, name, email, created_at FROM users WHERE id = $1', [req.user.id]);
    if (!rows.length) return res.status(404).json({ error: 'User not found' });
    res.json(rows[0]);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/me', auth, async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const fields = [];
    const values = [];
    let i = 1;
    if (name) { fields.push(`name = $${i++}`); values.push(name); }
    if (email) { fields.push(`email = $${i++}`); values.push(email); }
    if (password) { fields.push(`password = $${i++}`); values.push(await bcrypt.hash(password, 10)); }
    if (!fields.length) return res.status(400).json({ error: 'Nothing to update' });
    values.push(req.user.id);
    const { rows } = await pool.query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${i} RETURNING id, name, email, created_at`,
      values
    );
    res.json(rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Email already in use' });
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/me', auth, async (req, res) => {
  try {
    await pool.query('DELETE FROM users WHERE id = $1', [req.user.id]);
    res.json({ message: 'Account deleted' });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
