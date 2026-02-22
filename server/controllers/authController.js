import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const register = async (req, res) => {
  try {
    const { name, email, password, university, bio, skills } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcryptjs.hash(password, 10);

    // Generate avatar initials and color
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    const colors = ['#ff6b35', '#dc2626', '#ff8c61', '#ef4444', '#ff5722', '#b91c1c', '#ff9470'];
    const avatarColor = colors[Math.floor(Math.random() * colors.length)];

    const user = new User({
      name,
      email,
      password: hashedPassword,
      university: university || '',
      bio: bio || '',
      avatar: initials,
      avatarColor,
      skills: skills || [],
      links: [],
      rating: 0,
      totalTasks: 0,
      completedTasks: 0,
      failedTasks: 0,
      totalEarned: 0,
      trustScore: 70,
      penalties: 0,
      redMarks: 0,
      bannedUntil: null,
    });

    await user.save();

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      message: 'User registered successfully',
      user: { ...userResponse, id: user._id },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      message: 'Login successful',
      user: { ...userResponse, id: user._id },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch user', error: error.message });
  }
};
