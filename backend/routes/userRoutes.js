const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Query = require('../models/Query');
const multer = require('multer');
const path = require('path');

// Multer setup for file uploads (allow all file types)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// Register user
router.post('/register', async (req, res) => {
  const { name, mobile, email, password, role, district, qualification } = req.body;
  try {
    const user = new User({ name, mobile, email, password, role, ...(role === 'farmer' ? { district } : { qualification }) });
    await user.save();
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Login user
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email, password });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Create query
router.post('/queries', upload.array('images'), async (req, res) => {
  const { farmerId, question } = req.body;
  const images = req.files.map(file => file.path);
  try {
    const query = new Query({ farmerId, question, images });
    await query.save();
    res.status(201).json(query);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update query
router.put('/queries/:id', upload.array('images'), async (req, res) => {
  const { question } = req.body;
  const images = req.files.length ? req.files.map(file => file.path) : undefined;
  try {
    const updateData = {};
    if (question) updateData.question = question;
    if (images) updateData.images = images;
    const query = await Query.findByIdAndUpdate(req.params.id, updateData, { new: true }).populate('farmerId scientistId');
    if (!query) return res.status(404).json({ error: 'Query not found' });
    res.json(query);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete query
router.delete('/queries/:id', async (req, res) => {
  try {
    const query = await Query.findByIdAndDelete(req.params.id);
    if (!query) return res.status(404).json({ error: 'Query not found' });
    res.json({ message: 'Query deleted' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all queries
router.get('/queries', async (req, res) => {
  try {
    const queries = await Query.find().populate('farmerId scientistId');
    res.json(queries);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Respond to query (update response)
router.put('/queries/:id/respond', upload.array('responseImages'), async (req, res) => {
  const { scientistId, response } = req.body;
  const responseImages = req.files.length ? req.files.map(file => file.path) : undefined;
  try {
    const query = await Query.findById(req.params.id).populate('scientistId');
    if (!query) return res.status(404).json({ error: 'Query not found' });

    // If there's an existing response and the editor is not the original scientist, add a notification
    if (query.scientistId && query.scientistId._id.toString() !== scientistId) {
      const editor = await User.findById(scientistId);
      const notificationMessage = `Your response was edited by Name: ${editor.name}, Mobile: ${editor.mobile}, Qualification: ${editor.qualification}`;
      query.notifications = query.notifications || [];
      query.notifications.push({
        message: notificationMessage,
        editorId: scientistId,
        timestamp: new Date()
      });
    }

    const updateData = { scientistId };
    if (response) updateData.response = response;
    if (responseImages) updateData.responseImages = responseImages;
    const updatedQuery = await Query.findByIdAndUpdate(req.params.id, updateData, { new: true }).populate('farmerId scientistId');
    res.json(updatedQuery);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete response
router.delete('/queries/:id/respond', async (req, res) => {
  const { scientistId } = req.query;
  try {
    const query = await Query.findById(req.params.id).populate('scientistId');
    if (!query) return res.status(404).json({ error: 'Query not found' });
    if (!query.scientistId) return res.status(400).json({ error: 'No response to delete' });

    if (query.scientistId._id.toString() !== scientistId) {
      return res.status(403).json({ error: 'You are not authorized to delete this response' });
    }

    const updatedQuery = await Query.findByIdAndUpdate(
      req.params.id,
      { $unset: { response: '', responseImages: '', scientistId: '', notifications: '' } },
      { new: true }
    ).populate('farmerId scientistId');
    res.json(updatedQuery);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// New endpoint to get all registered users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
