import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

function tokenFor(user) { return jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' }); }
function safeUser(user) { return { id: user._id, name: user.name, email: user.email, role: user.role }; }
async function ensurePrimaryAdmin(user) {
  if (user.email.toLowerCase() === 'admin@electromart.com' && user.role !== 'admin') {
    user.role = 'admin';
    await user.save();
  }
  return user;
}

export async function register(req, res) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Name, email and password are required' });
    if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });
    const normalizedEmail = email.toLowerCase().trim();
    if (normalizedEmail === 'admin@electromart.com') {
      return res.status(403).json({ message: 'This email is reserved for the administrator account' });
    }
    const exists = await User.findOne({ email: normalizedEmail });
    if (exists) return res.status(409).json({ message: 'Email already registered' });
    const user = await User.create({ name, email: normalizedEmail, password: await bcrypt.hash(password, 10) });
    res.status(201).json({ token: tokenFor(user), user: safeUser(user) });
  } catch (e) { res.status(500).json({ message: e.message }); }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase().trim() });
    if (!user || !(await bcrypt.compare(password || '', user.password))) return res.status(401).json({ message: 'Invalid email or password' });
    if (user.active === false) return res.status(403).json({ message: 'This account is inactive. Contact an administrator.' });
    await ensurePrimaryAdmin(user);
    res.json({ token: tokenFor(user), user: safeUser(user) });
  } catch (e) { res.status(500).json({ message: e.message }); }
}

export async function me(req, res) {
  const user = await ensurePrimaryAdmin(req.user);
  res.json({ user: safeUser(user) });
}
