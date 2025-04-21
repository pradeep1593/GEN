import mongoose from 'mongoose';

const Prompt = new mongoose.Schema({
  prompt: String,
  username: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Prompt', Prompt);
