import Chat from "../models/chatModel.js";

export const saveChat = async (req, res) => {
  try {
    const { userId, messages, preview, sessionId } = req.body;
    
    let chat;
    if (sessionId) {
      chat = await Chat.findOneAndUpdate(
        { userId, sessionId },
        { $push: { messages: { $each: messages } }, updatedAt: Date.now() },
        { new: true }
      );
    } else {
      chat = new Chat({
        userId,
        sessionId: Date.now().toString(),
        messages,
        preview
      });
      await chat.save();
    }

    res.status(200).json({ success: true, chat });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


export const deleteChat = async (req, res) => {
  try {
    await Chat.deleteOne({ userId: req.body.userId, sessionId: req.body.sessionId });
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


export const getChatHistory = async (req, res) => {
  try {
    const chats = await Chat.find({ userId: req.body.userId })
                          .sort({ updatedAt: -1 })
                          .lean(); // Convert to plain JS objects
    
    // Transform data to include required fields
    const transformedChats = chats.map(chat => ({
      sessionId: chat.sessionId,
      preview: chat.preview,
      createdAt: chat.createdAt,
      messages: chat.messages.map(msg => ({
        _id: msg._id, // Include MongoDB ID
        text: msg.text,
        response: msg.response,
        rawText: msg.rawText,
        timestamp: msg.timestamp
      }))
    }));

    res.status(200).json({ success: true, chats: transformedChats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

