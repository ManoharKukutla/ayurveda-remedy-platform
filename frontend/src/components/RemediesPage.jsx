import React, { useState, useRef, useEffect } from "react";
import { FaEllipsisV, FaCopy, FaRegCopy, FaRegThumbsUp, FaRegThumbsDown } from "react-icons/fa";
import axios from "axios";
import { marked } from "marked";
import { openDB } from 'idb';
import { loadUserChats } from "../utils/storage";

const GROQ_API_KEY = "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";

// Initialize IndexedDB
const initDB = async () => {
  return openDB('AyurvedaDB', 3, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('chats')) {
        const store = db.createObjectStore('chats', { keyPath: 'id' });
        store.createIndex('userId', 'userId', { unique: false });
      }
      db.createObjectStore('appointments', { keyPath: 'id' });
      db.createObjectStore('feedback', { keyPath: 'id' });
    }
  });
};

// Chat API Service
const chatApi = {
  saveChat: async (userId, chatData, sessionId = null) => {
    try {
      const response = await axios.post("/api/chat/save", {
        userId,
        messages: chatData.chats,
        preview: chatData.preview,
        sessionId
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      return response.data;
    } catch (error) {
      console.error("API save failed, using fallback:", error);
      const db = await initDB();
      await db.put('chats', { 
        id: sessionId || Date.now(), 
        userId, 
        data: chatData 
      });
      return { success: true, chat: { sessionId: sessionId || Date.now() } };
    }
  },

  


  loadHistory: async (userId) => {
    try {
      const response = await axios.post("/api/chat/history", { userId }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      
      // Transform backend data to frontend format
      const apiChats = response.data.chats.map(chat => ({
        sessionId: chat.sessionId,
        preview: chat.preview,
        createdAt: chat.createdAt,
        messages: chat.messages.map(msg => ({
          text: msg.text,
          response: msg.response,
          id: msg._id || Date.now(),
          rawText: msg.rawText || msg.response
        }))
      }));
  
      // Also save to IndexedDB for offline use
      const db = await initDB();
      await Promise.all(
        apiChats.map(chat => 
          db.put('chats', {
            id: chat.sessionId,
            userId,
            data: {
              chats: chat.messages,
              preview: chat.preview,
              createdAt: chat.createdAt
            }
          })
        )
      );
  
      return apiChats;
    } catch (error) {
      console.error("API load failed, using fallback:", error);
      const db = await initDB();
      const chats = await db.getAll('chats');
      return chats
        .filter(chat => chat.userId === userId)
        .map(chat => ({
          sessionId: chat.id,
          preview: chat.data.preview,
          createdAt: chat.data.createdAt,
          messages: chat.data.chats.map(msg => ({
            text: msg.text,
            response: msg.response,
            id: msg.id || Date.now(),
            rawText: msg.rawText || msg.response
          }))
        }));
    }
  },

  deleteChat: async (userId, sessionId) => {
    try {
      await axios.post("/api/chat/delete", { userId, sessionId }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
    } catch (error) {
      console.error("API delete failed, cleaning local:", error);
      const db = await initDB();
      await db.delete('chats', sessionId);
    }
  },

  getUserId: async () => {
    try {
      const response = await axios.get("/api/user/verify-token", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      return response.data.userId;
    } catch (error) {
      console.error("Error verifying token:", error);
      return null;
    }
  }
};

// Input analysis function
const analyzeInput = (input) => {
  const lowerInput = input.toLowerCase();
  
  // Check for negations
  if (/(no |not |don'?t |doesn'?t )/i.test(lowerInput)) {
    const condition = input.match(/(no |not |don'?t |doesn'?t )(.+)/i)?.[2]?.trim() || "that condition";
    return `The user indicates they do not have ${condition}. Respond appropriately without providing remedies.`;
  }
  
  // Check if it's clearly a request for remedies
  if (/(remedy|treatment|solution|help|advice|for)\b/i.test(lowerInput)) {
    return `Provide complete Ayurvedic remedies for: ${input}`;
  }
  
  // Check if it's just a symptom/condition mention
  if (/(pain|ache|problem|issue|symptom|condition|disease)/i.test(lowerInput)) {
    return `The user mentions "${input}". Provide Ayurvedic analysis and remedies if appropriate.`;
  }
  
  // Default case - ask for clarification
  return `The user said: "${input}". This doesn't clearly request Ayurvedic remedies. Ask for clarification if needed.`;
};

const RemediesPage = () => {
  const [input, setInput] = useState("");
  const [chat, setChat] = useState([]);
  const [history, setHistory] = useState([]);
  const [showMenu, setShowMenu] = useState(false);
  const [selectedHistoryMenu, setSelectedHistoryMenu] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [activeChatId, setActiveChatId] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [error, setError] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState('You are a helpful AI assistant.');

  const inputRef = useRef(null);
  const chatBoxRef = useRef(null);


  useEffect(() => {
    const loadHistory = async () => {
      setIsHistoryLoading(true);
      setError(null);
      try {
        const userId = await chatApi.getUserId();
        if (userId) {
          // First try to load from API
          const apiHistory = await chatApi.loadHistory(userId);
          setHistory(apiHistory);
          
          // Then load from IndexedDB as fallback
          const savedHistory = await loadUserChats(userId);
          if (savedHistory.length > 0 && apiHistory.length === 0) {
            setHistory(savedHistory);
          }
        }
      } catch (err) {
        console.error("Failed to load history:", err);
        setError("Failed to load chat history");
      } finally {
        setIsHistoryLoading(false);
      }
    };
    loadHistory();
  }, []);



  // Auto-scroll to bottom when chat updates
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTo({
        top: chatBoxRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [chat, isLoading]);



  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const formatAyurvedicResponse = (text) => {
    // Check for non-remedy responses
    if (text.includes("not clear") || 
        text.includes("please clarify") || 
        text.includes("no specific condition") ||
        text.includes("do not have")) {
      return `<div class="whitespace-pre-wrap leading-relaxed">${text}</div>`;
    }
    
    let cleanedText = text.replace(/\*\*/g, '').replace(/\*/g, '').trim();
    let formatted = "";
    let currentSection = "";
    let diseaseName = "";
    
    const lines = cleanedText.split('\n').filter(line => line.trim());
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line.endsWith(':')) {
        const sectionName = line.replace(':', '').trim();
        
        if (currentSection === "list") {
          formatted += "</ul>";
        }
        else if (currentSection === "paragraph") {
          formatted += "</p>";
        }
        
        if (/disease|problem|issue|condition/i.test(sectionName)) {
          diseaseName = lines[i+1]?.trim() || sectionName;
          formatted += `<h2 class="text-[#668400] text-xl mt-0 mb-4"><strong>Ayurvedic Remedies for ${diseaseName}</strong></h2>`;
          i++;
          currentSection = "title";
        } 
        else if (/cause|reason/i.test(sectionName)) {
          formatted += `<h3 class="text-[#668400] text-lg mt-5 mb-3">Causes</h3><ul class="pl-6 mb-4">`;
          currentSection = "list";
        }
        else if (/remedy|treatment|solution/i.test(sectionName)) {
          formatted += `<h3 class="text-[#668400] text-lg mt-5 mb-3">Ayurvedic Remedies</h3><ul class="pl-6 mb-4">`;
          currentSection = "list";
        }
        else if (/exercise|yoga|physical/i.test(sectionName)) {
          formatted += `<h3 class="text-[#668400] text-lg mt-5 mb-3">Recommended Exercises</h3><ul class="pl-6 mb-4">`;
          currentSection = "list";
        }
        else if (/diet|food|nutrition/i.test(sectionName)) {
          formatted += `<h3 class="text-[#668400] text-lg mt-5 mb-3">Diet Recommendations</h3><ul class="pl-6 mb-4">`;
          currentSection = "list";
        }
        else if (/note|additional|advice/i.test(sectionName)) {
          formatted += `<h3 class="text-[#668400] text-lg mt-5 mb-3">Additional Notes</h3><div class="bg-[#292929] p-4 rounded-md my-4">`;
          currentSection = "paragraph";
        }
        else {
          formatted += `<h3 class="text-[#668400] text-lg mt-5 mb-3">${sectionName}</h3><div>`;
          currentSection = "paragraph";
        }
      }
      else {
        if (currentSection === "list") {
          if (line && !line.endsWith(':') && !/^[A-Z][a-z]+$/.test(line)) {
            formatted += `<li class="mb-2 leading-relaxed">${line.replace(/^- /, '').replace(/^• /, '').trim()}</li>`;
          }
        } 
        else if (currentSection === "paragraph") {
          formatted += `${line}<br/>`;
        }
        else {
          if (!diseaseName && line) {
            diseaseName = line;
            formatted += `<h2 class="text-[#668400] text-xl mt-0 mb-4"><strong>Ayurvedic Remedies for ${diseaseName}</strong></h2>`;
          }
        }
      }
    }
    
    if (currentSection === "list") {
      formatted += "</ul>";
    }
    else if (currentSection === "paragraph") {
      formatted += "</div>";
    }
    
    return formatted || `<div class="whitespace-pre-wrap leading-relaxed">${cleanedText}</div>`;
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    // Simple validation - don't send very short inputs that are likely not real queries
    if (input.trim().split(/\s+/).length < 2 && !input.match(/remedy|treatment|help/i)) {
      setChat([...chat, {
        text: input,
        response: "Please provide more details about your health concern for accurate Ayurvedic advice.",
        id: Date.now(),
        rawText: ""
      }]);
      setInput("");
      return;
    }

    const userMessage = {
      text: input,
      response: "⏳ Waiting for AI response...",
      id: Date.now(),
      rawText: ""
    };

    const updatedChat = [...chat, userMessage];
    setChat(updatedChat);
    setInput("");
    inputRef.current?.focus();
    setIsLoading(true);

    try {
      const response = await axios.post(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          model: "llama3-70b-8192",
          messages: [
            {
              role: "system",
              content: `You are an expert Ayurvedic doctor. Analyze the user's input carefully and:
              
              1. If the user describes symptoms or asks for remedies, provide detailed Ayurvedic solutions
              2. If the user mentions NOT having a condition (e.g., "I don't have headache"), respond appropriately
              3. If the input is unclear, ask for clarification and Do not provide remedies
              4. If the user asks general questions about Ayurveda, provide educational answers

              When providing remedies, use this format:

              Disease Name: [Condition]
              Causes: [List]
              Ayurvedic Remedies: [List]
              Recommended Exercises: [List]
              Diet Recommendations: [List]
              Additional Notes: [Text]

              Formatting Rules:
              1. Always use these exact section headings ending with colons
              2. Each section must start on a new line
              3. List items must start with "- " and be on separate lines
              4. Never mix content between sections
              5. Include practical, actionable advice
              6. Keep remedies traditional and authentic`
            },
            {
              role: "user",
              content: analyzeInput(input)
            }
          ],
          temperature: 0.7,
          max_tokens: 2000,
          top_p: 0.9,
        },
        {
          headers: {
            Authorization: `Bearer ${GROQ_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      const aiText = response?.data?.choices?.[0]?.message?.content || "No response from AI.";
      const formattedResponse = formatAyurvedicResponse(aiText);

      const finalChat = updatedChat.map(msg => 
        msg.id === userMessage.id 
          ? { ...msg, response: formattedResponse, rawText: aiText } 
          : msg
      );

      setChat(finalChat);
      
      // Save to backend
      const userId = await chatApi.getUserId();
      if (userId) {
        const sessionId = activeChatId || Date.now().toString();
        await chatApi.saveChat(userId, {
          chats: finalChat,
          preview: finalChat[0].text
        }, sessionId);

        if (!activeChatId) {
          setActiveChatId(sessionId);
          // Update history state optimistically
          setHistory(prev => [{
            sessionId,
            preview: finalChat[0].text.substring(0, 40),
            createdAt: new Date().toISOString(),
            messages: finalChat
          }, ...prev]);
        }
      }
    } catch (error) {
      console.error("Error:", error);
      setChat(prevChat =>
        prevChat.map(msg =>
          msg.id === userMessage.id
            ? {
                ...msg,
                response: "⚠ Failed to fetch response. Please check your connection or try again later.",
                rawText: "Error occurred while fetching response"
              }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };
  

const handleNewChat = async () => {
  try {
    setIsHistoryLoading(true);
    
    // Save current chat if it exists
    if (chat.length > 0) {
      const userId = await chatApi.getUserId();
      if (userId) {
        const sessionId = activeChatId || Date.now().toString();
        await chatApi.saveChat(userId, {
          chats: chat,
          preview: chat[0]?.text || "New Chat",
          createdAt: new Date().toISOString()
        }, sessionId);
      }
    }

    // Reset chat state
    setChat([]);
    setInput("");
    setActiveChatId(null);
    
    // Create a new chat entry in history
    const newSessionId = Date.now().toString();
    setActiveChatId(newSessionId);
    setHistory(prev => [{
      sessionId: newSessionId,
      preview: "New Chat",
      createdAt: new Date().toISOString(),
      messages: []
    }, ...prev]);

    inputRef.current?.focus();
  } catch (error) {
    console.error("Error creating new chat:", error);
    setError("Failed to create new chat");
  } finally {
    setIsHistoryLoading(false);
  }
};

// Also ensure these other handler functions are defined:
const handleClearHistory = async () => {
  try {
    const userId = await chatApi.getUserId();
    if (userId) {
      const allChats = await loadUserChats(userId);
      await Promise.all(
        allChats.map(chat => chatApi.deleteChat(userId, chat.sessionId))
      );
    }
    setHistory([]);
    setActiveChatId(null);
    setChat([]);
    setShowMenu(false);
  } catch (error) {
    console.error("Error clearing history:", error);
    setError("Failed to clear history");
  }
};

const handleClearSingleChat = async (sessionId) => {
  try {
    const userId = await chatApi.getUserId();
    if (userId) {
      await chatApi.deleteChat(userId, sessionId);
    }
    setHistory(prev => prev.filter(item => item.sessionId !== sessionId));
    if (activeChatId === sessionId) {
      setActiveChatId(null);
      setChat([]);
    }
    setSelectedHistoryMenu(null);
  } catch (error) {
    console.error("Error deleting chat:", error);
    setError("Failed to delete chat");
  }
};

const handleLoadChatFromHistory = async (historyItem) => {
  try {
    setIsLoading(true);
    
    // Ensure we have messages to load
    if (!historyItem?.messages?.length) {
      throw new Error("No messages in this chat");
    }

    // Transform messages with proper fallbacks
    const formattedMessages = historyItem.messages.map(msg => ({
      text: msg.text || 'No text',
      response: msg.response || '<div>No response content</div>',
      id: msg.id || msg._id || `msg-${Date.now()}`,
      rawText: msg.rawText || msg.response || ''
    }));

    // Reset and set chat in separate operations
    setChat([]);
    await new Promise(resolve => setTimeout(resolve, 50));
    setChat(formattedMessages);
    
    setActiveChatId(historyItem.sessionId);
    
    // Double ensure scroll works
    setTimeout(() => {
      if (chatBoxRef.current) {
        chatBoxRef.current.scrollTo({
          top: chatBoxRef.current.scrollHeight,
          behavior: 'smooth'
        });
      }
      inputRef.current?.focus();
    }, 300);
    
  } catch (error) {
    console.error("Error loading chat:", error);
    setChat([{
      text: "Error loading chat",
      response: "Could not load the selected conversation",
      id: Date.now(),
      rawText: "Error loading chat history"
    }]);
  } finally {
    setIsLoading(false);
  }
};



const exportChatHistory = () => {
  const dataStr = JSON.stringify(history, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `ayurveda-chat-history-${new Date().toISOString()}.json`;
  link.click();
};

const importChatHistory = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const importedHistory = JSON.parse(e.target.result);
      setHistory(importedHistory);
      const userId = await chatApi.getUserId();
      if (userId) {
        await Promise.all(
          importedHistory.map(chat => 
            chatApi.saveChat(userId, {
              chats: chat.messages,
              preview: chat.preview,
              createdAt: chat.createdAt
            }, chat.sessionId)
          )
        );
      }
    } catch (error) {
      console.error("Error importing chat history:", error);
    }
  };
  reader.readAsText(file);
};


  return (
    <>
      <div className="flex h-full bg-[#121212] font-['Lato','Segoe_UI'] text-black"
        onClick={() => {
          setSelectedHistoryMenu(null);
          setShowMenu(false);
        }}
      >

        {/* Main Chat Area */}
        <div className="flex-grow w-4/5 flex items-center flex-col h-[87vh] bg-[url('/src/assets/chat-background.png')] bg-cover bg-center bg-no-repeat" 
          onClick={(e) => e.stopPropagation()}>
          
          <div className="flex-1 p-5 w-[750px] overflow-y-auto scroll-smooth flex items-center flex-col" ref={chatBoxRef}>
            {chat.length === 0 && !isLoading && (
              <div className="p-[30px_20px] text-center max-w-[600px] mx-auto">
                <h2 className="text-[#668400] mb-4">Welcome to Ayurvedic Remedies</h2>
                <p className="mb-0 pb-0 leading-relaxed text-[#ececec]">Ask for Ayurvedic treatments for any health condition.</p>
                <p className="mb-0 pb-0 leading-relaxed text-[#ececec]">Example queries:</p>
                <ul className="text-left inline-block my-4 mx-auto pl-5">
                  <li className="mb-2 leading-relaxed text-[#aeaeae]">"Ayurvedic remedies for migraine"</li>
                  <li className="mb-2 leading-relaxed text-[#aeaeae]">"How to treat arthritis with Ayurveda"</li>
                  <li className="mb-2 leading-relaxed text-[#aeaeae]">"Natural solutions for digestion problems"</li>
                  <li className="mb-2 leading-relaxed text-[#aeaeae]">"Home remedies for common cold in Ayurveda"</li>
                  <li className="mb-2 leading-relaxed text-[#aeaeae]">"I don't have headache but feel dizzy"</li>
                </ul>
              </div>
            )}

            {chat.map((entry, index) => (
              <div key={index} className="mb-5 flex items-center flex-col animate-fadeIn">
                <div className="font-semibold mb-7 mt-5 w-fit max-w-[350px] p-[15px_25px] rounded-full bg-[rgba(101,132,0,0.50)] text-white text-[15px] ml-auto">
                  {entry.text}
                </div>
                <div className="relative text-white p-4 text-[15px] leading-relaxed w-[700px] ml-auto mb-5">
                  <div
                    className="ai-response"
                    dangerouslySetInnerHTML={{ __html: marked(entry.response) }}
                  />
                  <div className="absolute top-2 right-2 flex gap-2">
                    <button 
                      onClick={() => copyToClipboard(entry.rawText, index)}
                      className="bg-transparent text-white rounded-full w-7 h-7 flex items-center justify-center cursor-pointer transition-all duration-200 hover:bg-[#3d3d3d] hover:scale-110"
                      title="Copy to clipboard">
                      {copiedIndex === index ? <FaCopy color="#E78D00" /> : <FaRegCopy />}
                    </button>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleFeedback(index, true)} 
                        className="bg-transparent text-white rounded-full w-7 h-7 flex items-center justify-center cursor-pointer transition-all duration-200 hover:bg-[#3d3d3d] hover:scale-110"
                        title="Helpful">
                        <FaRegThumbsUp />
                      </button>
                      <button 
                        onClick={() => handleFeedback(index, false)} 
                        className="bg-transparent text-white rounded-full w-7 h-7 flex items-center justify-center cursor-pointer transition-all duration-200 hover:bg-[#3d3d3d] hover:scale-110"
                        title="Not helpful">
                        <FaRegThumbsDown />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="p-5">
                <div className="flex justify-center gap-2 py-5">
                  <div className="w-2 h-2 rounded-full bg-[#668400] animate-bounce [animation-delay:-0.32s]"></div>
                  <div className="w-2 h-2 rounded-full bg-[#668400] animate-bounce [animation-delay:-0.16s]"></div>
                  <div className="w-2 h-2 rounded-full bg-[#668400] animate-bounce"></div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 border-none flex justify-center items-center gap-8 w-[700px] mb-8">
            <button 
              className="bg-[#E78D00] text-white border-none py-1 px-4 rounded-md cursor-pointer font-medium transition-all duration-200 w-fit h-10 min-w-[80px] hover:bg-[#ffb640]" 
              onClick={handleNewChat}>
              + New Chat
            </button>
            <div className="bg-[#3d3d3d] rounded-full flex items-center justify-center gap-0 p-2">
              <input
                ref={inputRef}
                type="text"
                placeholder="Ask for Ayurvedic remedies (e.g., 'remedies for back pain')"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                disabled={isLoading}
                autoFocus
                className="flex-grow p-3 bg-transparent text-white text-[15px] w-[400px] focus:outline-none"
              />
              <button 
                className="bg-[#E78D00] text-white border-none py-auto px-5 rounded-full cursor-pointer font-medium transition-all duration-200 min-w-[80px] h-10 disabled:bg-[rgba(101,132,0,0.30)] disabled:cursor-not-allowed" 
                onClick={handleSend} 
                disabled={isLoading || !input.trim()}>
                {isLoading ? "..." : "Send"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RemediesPage;


