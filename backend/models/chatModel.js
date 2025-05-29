 import mongoose from "mongoose";


const chatSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  sessionId: { type: String, required: true },
  messages: [{
    text: { type: String, required: true },       // User query
    response: { type: String, required: true },  // Formatted HTML response
    rawText: { type: String },                   // Raw AI response
    timestamp: { type: Date, default: Date.now }
  }],
  preview: { type: String },                     // First message preview
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Add compound index for faster queries
chatSchema.index({ userId: 1, sessionId: 1 });

const Chat = mongoose.models.Chat || mongoose.model("Chat", chatSchema);
export default Chat;

