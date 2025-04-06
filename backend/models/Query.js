const mongoose = require('mongoose');

const querySchema = new mongoose.Schema({
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  question: { type: String, required: true },
  images: [{ type: String }], // Now can store paths to any file type
  scientistId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  response: { type: String },
  responseImages: [{ type: String }], // Now can store paths to any file type
  notifications: [{ // New field for edit notifications
    message: { type: String, required: true },
    editorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    timestamp: { type: Date, default: Date.now }
  }]
});

module.exports = mongoose.model('Query', querySchema);
