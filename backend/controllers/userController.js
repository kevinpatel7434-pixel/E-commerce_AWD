import bcrypt from 'bcryptjs';
import User from '../models/User.js';

function safeUser(user) {
    return { id: user._id, name: user.name, email: user.email, role: user.role, active: user.active !== false, createdAt: user.createdAt };
}

export async function listUsers(req, res) {
    res.json((await User.find().select('-password').sort({ createdAt: -1 })).map(safeUser));
}

export async function updateUser(req, res) {
    try {
        const { name, email, password, role } = req.body;
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        if (!name || !email) return res.status(400).json({ message: 'Name and email are required' });

        const normalizedEmail = email.toLowerCase().trim();
        const primaryAdminEmail = 'admin@electromart.com';
        const isPrimaryAdmin = user.email.toLowerCase() === primaryAdminEmail;
        if (isPrimaryAdmin && normalizedEmail !== primaryAdminEmail) {
            return res.status(400).json({ message: 'The primary admin email cannot be changed' });
        }
        if (!isPrimaryAdmin && normalizedEmail === primaryAdminEmail) {
            return res.status(409).json({ message: 'This email is reserved for the primary admin account' });
        }
        if (isPrimaryAdmin && role === 'user') {
            return res.status(403).json({ message: 'The primary admin role cannot be changed' });
        }
        const duplicate = await User.findOne({ email: normalizedEmail, _id: { $ne: user._id } });
        if (duplicate) return res.status(409).json({ message: 'Email already registered' });
        if (password !== undefined && password !== '' && password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        user.name = name.trim();
        user.email = normalizedEmail;
        if (isPrimaryAdmin) user.role = 'admin';
        else if (role === 'user' || role === 'admin') user.role = role;
        if (password) user.password = await bcrypt.hash(password, 10);
        await user.save();
        res.json(safeUser(user));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export async function setUserActive(req, res) {
    const { active } = req.body;
    if (typeof active !== 'boolean') return res.status(400).json({ message: 'Active status must be true or false' });

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.email.toLowerCase() === 'admin@electromart.com' && !active) {
        return res.status(403).json({ message: 'The primary admin account cannot be deactivated' });
    }

    user.active = active;
    await user.save();
    res.json(safeUser(user));
}
