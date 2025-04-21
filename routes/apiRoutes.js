import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import Prompt from '../models/prompt.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// Signup API
router.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Login API
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'Invalid username or password.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid username or password.' });
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });

    res.json({
      message: 'Login successful',
      token,
      user: { username: user.username, email: user.email },
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Profile route to get user info
router.get('/profile', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ username: user.username, email: user.email });
  } catch (err) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
});

// Save Prompt
router.post('/save-prompt', async (req, res) => {
  const { prompt, username } = req.body;
  try {
    const newPrompt = new Prompt({ prompt, username });
    await newPrompt.save();
    res.status(201).json({ message: 'Prompt saved successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save prompt' });
  }
});

// Get Prompts
router.get('/get-prompts', async (req, res) => {
  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ message: 'Username is required' });
  }

  try {
    const prompts = await Prompt.find({ username });

    res.status(200).json({ prompts }); // Return the full prompt objects
  } catch (error) {
    console.error('Error fetching prompts:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete prompts for a specific user by username
router.post('/delete-prompt', async (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ message: 'Username is required' });
  }

  try {
    // Delete all prompts associated with the username
    const result = await Prompt.deleteMany({ username });

    if (result.deletedCount > 0) {
      return res.status(200).json({ message: `${result.deletedCount} prompt(s) deleted successfully` });
    } else {
      return res.status(404).json({ message: 'No prompts found for this user' });
    }
  } catch (error) {
    console.error('Error deleting prompts:', error);
    return res.status(500).json({ message: 'Error deleting prompts' });
  }
});


export default router;
