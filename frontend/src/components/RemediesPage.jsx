import React, { useState, useRef, useEffect } from "react";
import { FaEllipsisV, FaCopy, FaRegCopy, FaRegThumbsUp, FaRegThumbsDown } from "react-icons/fa";
import axios from "axios";
import { marked } from "marked";
import { openDB } from 'idb';

const GROQ_API_KEY = "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";

// Storage constants
const STORAGE_KEYS = {
  CHAT_HISTORY: "ayurveda_chat_history",
};

// Initialize IndexedDB
const initDB = async () => {
  return openDB('AyurvedaDB', 1, {
    upgrade(db) {
      db.createObjectStore('chats', { keyPath: 'id' });
      db.createObjectStore('appointments', { keyPath: 'id' });
    }
  });
};

// Storage utilities with IndexedDB fallback
const saveChatData = async (data) => {
  try {
    // Try localStorage first
    saveToLocalStorage(STORAGE_KEYS.CHAT_HISTORY, data);
    
    // Also save to IndexedDB
    const db = await initDB();
    await db.put('chats', {
      id: 'current_chat_history',
      data: data,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error saving chat data:", error);
  }
};

const loadChatData = async () => {
  try {
    // Try localStorage first
    const localStorageData = loadFromLocalStorage(STORAGE_KEYS.CHAT_HISTORY);
    if (localStorageData) return localStorageData;
    
    // Fallback to IndexedDB
    const db = await initDB();
    const storedData = await db.get('chats', 'current_chat_history');
    return storedData?.data || [];
  } catch (error) {
    console.error("Error loading chat data:", error);
    return [];
  }
};

// Basic localStorage functions
const saveToLocalStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error("Error saving to localStorage:", error);
    throw error; // Throw to trigger IndexedDB fallback
  }
};

const loadFromLocalStorage = (key) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Error loading from localStorage:", error);
    return null;
  }
};

const clearLocalStorageKey = (key) => {
  localStorage.removeItem(key);
};

// Data expiration utilities
const saveWithExpiry = (key, data, expiryDays) => {
  const item = {
    data,
    expiry: Date.now() + expiryDays * 86400000
  };
  localStorage.setItem(key, JSON.stringify(item));
};

const loadWithExpiry = (key) => {
  const itemStr = localStorage.getItem(key);
  if (!itemStr) return null;
  
  const item = JSON.parse(itemStr);
  if (Date.now() > item.expiry) {
    localStorage.removeItem(key);
    return null;
  }
  return item.data;
};

const RemediesPage = () => {
  const [input, setInput] = useState("");
  const [chat, setChat] = useState([]);
  const [history, setHistory] = useState([]);
  const [showMenu, setShowMenu] = useState(false);
  const [selectedHistoryMenu, setSelectedHistoryMenu] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeChatId, setActiveChatId] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const inputRef = useRef(null);
  const chatBoxRef = useRef(null);

  // Load saved history when component mounts
  useEffect(() => {
    const loadHistory = async () => {
      const savedHistory = await loadChatData();
      if (savedHistory) {
        setHistory(savedHistory);
      }
    };
    loadHistory();

    // Setup tab sync
    const handleStorageChange = (e) => {
      if (e.key === STORAGE_KEYS.CHAT_HISTORY) {
        setHistory(JSON.parse(e.newValue || '[]'));
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Auto-scroll to bottom when chat or loading state changes
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

    const userMessage = {
      text: input,
      response: "⏳ Waiting for AI response...",
      id: Date.now(),
      suggestions: [],
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
              content: `You are an expert Ayurvedic doctor. Provide detailed Ayurvedic remedies with the following strict format:

Disease Name: 
[Exact name of the disease/condition]

Causes:
- Primary cause 1
- Secondary cause 2
- Underlying cause 3

Ayurvedic Remedies:
- Remedy 1 (with details)
- Remedy 2 (with details)
- Remedy 3 (with details)

Recommended Exercises:
- Exercise 1 (with frequency)
- Exercise 2 (with duration)

Diet Recommendations:
- Food to include
- Food to avoid
- Recommended eating habits

Additional Notes:
[Any important precautions or special considerations]

Formatting Rules:
1. Always use these exact section headings ending with colons
2. Each section must start on a new line
3. List items must start with "- " and be on separate lines
4. Never mix content between sections
5. The Disease Name should be just the name, not a sentence
6. Include practical, actionable advice
7. Keep remedies traditional and authentic`
            },
            {
              role: "user",
              content: `Provide complete Ayurvedic remedies for: ${input}`
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

      setChat((prevChat) =>
        prevChat.map((msg) =>
          msg.id === userMessage.id 
            ? { ...msg, response: formattedResponse, rawText: aiText } 
            : msg
        )
      );
    } catch (error) {
      console.error("Error:", error);
      setChat((prevChat) =>
        prevChat.map((msg) =>
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
    if (chat.length > 0 && chat.some((msg) => msg.text.trim() !== "")) {
      const newHistory = [
        { 
          id: Date.now(), 
          chats: chat, 
          preview: chat[0].text,
          createdAt: new Date().toISOString(),
          expiresAt: Date.now() + 30 * 86400000 // 30 days from now
        },
        ...history
      ];
      setHistory(newHistory);
      await saveChatData(newHistory);
    }
    setChat([]);
    setInput("");
    setActiveChatId(null);
    inputRef.current?.focus();
  };

  const handleClearHistory = async () => {
    setHistory([]);
    setActiveChatId(null);
    setChat([]);
    setShowMenu(false);
    clearLocalStorageKey(STORAGE_KEYS.CHAT_HISTORY);
    try {
      const db = await initDB();
      await db.clear('chats');
    } catch (error) {
      console.error("Error clearing IndexedDB:", error);
    }
  };

  const handleClearSingleChat = async (id) => {
    const updatedHistory = history.filter((item) => item.id !== id);
    setHistory(updatedHistory);
    await saveChatData(updatedHistory);

    if (activeChatId === id) {
      setActiveChatId(null);
      setChat([]);
    }

    setSelectedHistoryMenu(null);
  };

  const handleLoadChatFromHistory = (historyItem) => {
    setChat(historyItem.chats);
    setActiveChatId(historyItem.id);
    inputRef.current?.focus();
    setSelectedHistoryMenu(null);
  };

  const handleFeedback = async (index, isPositive) => {
    console.log(`Feedback for message ${index}: ${isPositive ? 'positive' : 'negative'}`);
    // Save feedback to IndexedDB
    try {
      const db = await initDB();
      await db.put('feedback', {
        id: Date.now(),
        chatId: activeChatId,
        messageIndex: index,
        isPositive,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error saving feedback:", error);
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
        await saveChatData(importedHistory);
      } catch (error) {
        console.error("Error importing chat history:", error);
      }
    };
    reader.readAsText(file);
  };

  return (
    <>
      <div
        className="flex h-full bg-[#121212] font-['Lato','Segoe_UI'] text-black"
        onClick={() => {
          setSelectedHistoryMenu(null);
          setShowMenu(false);
        }}
      >
        <div className="w-1/4 bg-[#121212] flex flex-col overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          <div className="p-[1px_20px_0px] mb-0">
            <div className="flex justify-between items-center text-white mb-0 pt-5">
              <h3>History</h3>

              <div
                className="cursor-pointer relative p-1 group"
                onMouseLeave={() => setShowMenu(false)}
              >
                <FaEllipsisV
                  className="hover:text-[#ff5a5a] transition-colors"
                  onMouseEnter={() => setShowMenu(true)}
                />
                {showMenu && (
                  <div
                    className="absolute right-0 top-6 bg-[#3d3d3d] p-2 z-10 text-sm rounded-md shadow-md min-w-[150px] space-y-2"
                    onMouseLeave={() => setShowMenu(false)}
                  >
                    <div
                      className="p-2 hover:bg-[#ff5a5a] rounded cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClearHistory();
                      }}
                    >
                      Clear All History
                    </div>
                    <div
                      className="p-2 hover:bg-[#ff5a5a] rounded cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        exportChatHistory();
                      }}
                    >
                      Export History
                    </div>
                    <div className="p-2 hover:bg-[#ff5a5a] rounded cursor-pointer">
                      <label htmlFor="import-history" className="cursor-pointer block">
                        Import History
                      </label>
                      <input
                        id="import-history"
                        type="file"
                        accept=".json"
                        onChange={(e) => {
                          e.stopPropagation();
                          importChatHistory(e);
                        }}
                        className="hidden"
                      />
                    </div>
                    <div
                      className="p-2 hover:bg-[#ff5a5a] rounded cursor-pointer"
                      onClick={async (e) => {
                        e.stopPropagation();
                        try {
                          const db = await initDB();
                          const allChats = await db.getAll('chats');
                          console.log("All stored chats:", allChats);
                        } catch (error) {
                          console.error("Error retrieving all chats:", error);
                        }
                      }}
                    >
                      Debug Storage
                    </div>
                  </div>
                )}
              </div>



              {/* <div
                className="cursor-pointer relative p-1"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
              >
                <FaEllipsisV />
                {showMenu && (
                  <div className="absolute right-0 top-6 bg-[#3d3d3d] p-2 cursor-pointer z-10 text-sm rounded-md shadow-md min-w-[75px] hover:bg-[#ff5a5a]">
                    <div onClick={handleClearHistory}>Clear All History</div>
                    <div onClick={exportChatHistory}>Export History</div>
                    <div>
                      <label htmlFor="import-history" className="cursor-pointer block">
                        Import History
                      </label>
                      <input 
                        id="import-history" 
                        type="file" 
                        accept=".json" 
                        onChange={importChatHistory} 
                        className="hidden" 
                      />
                    </div>
                    <div onClick={async () => {
                      try {
                        const db = await initDB();
                        const allChats = await db.getAll('chats');
                        console.log("All stored chats:", allChats);
                      } catch (error) {
                        console.error("Error retrieving all chats:", error);
                      }
                    }}>
                      Debug Storage
                    </div>
                  </div>
                )}
              </div> */}
            </div>
          </div>

          <div className="flex-grow overflow-y-auto p-[10px_20px_10px]">
            {history.map((item) => (
              <div
                key={item.id}
                className={`p-3 text-white rounded-md mb-2 cursor-pointer transition-all duration-200 text-sm relative ${
                  activeChatId === item.id 
                    ? "bg-[rgba(101,132,0,0.50)] font-medium" 
                    : "hover:bg-[#3d3d3d]"
                }`}
                onClick={() => handleLoadChatFromHistory(item)}
              >
                <span>
                  {item.preview.length > 40
                    ? item.preview.slice(0, 40) + "..."
                    : item.preview}
                </span>
                <small className="block text-[#aaa] text-xs">
                  {new Date(item.createdAt).toLocaleString()}
                  {item.expiresAt && (
                    <span className="ml-2 text-[#888]">
                      (Expires: {new Date(item.expiresAt).toLocaleDateString()})
                    </span>
                  )}
                </small>

                <div
                  className="absolute top-3 right-2 group"
                  onClick={(e) => e.stopPropagation()}
                >
                  <FaEllipsisV
                    className="cursor-pointer hover:text-[#ff5a5a] transition-colors"
                    onMouseEnter={() => setSelectedHistoryMenu(item.id)}
                  />
                  {selectedHistoryMenu === item.id && (
                    <div
                      className="absolute right-0 top-6 bg-[#3d3d3d] p-2 cursor-pointer z-10 text-sm rounded-md shadow-md min-w-[75px] hover:bg-[#ff5a5a]"
                      onClick={() => handleClearSingleChat(item.id)}
                      onMouseLeave={() => setSelectedHistoryMenu(null)}
                    >
                      Delete Chat
                    </div>
                  )}
                </div>


                {/* <div className="absolute top-3 right-2" onClick={(e) => e.stopPropagation()}>
                  <FaEllipsisV onClick={() => setSelectedHistoryMenu(item.id)} />
                  {selectedHistoryMenu === item.id && (
                    <div
                      className="absolute right-0 top-6 bg-[#3d3d3d] p-2 cursor-pointer z-10 text-sm rounded-md shadow-md min-w-[75px] hover:bg-[#ff5a5a]"
                      onClick={() => handleClearSingleChat(item.id)}
                    >
                      Delete Chat
                    </div>
                  )}
                </div> */}
              </div>
            ))}
          </div>
        </div>

        <div className="flex-grow w-4/5 flex items-center flex-col h-[87vh] bg-[url('/src/assets/chat-background.png')] bg-cover bg-center bg-no-repeat" onClick={(e) => e.stopPropagation()}>
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
                      title="Copy to clipboard"
                    >
                      {copiedIndex === index ? <FaCopy color="#E78D00" /> : <FaRegCopy />}
                    </button>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleFeedback(index, true)} 
                        className="bg-transparent text-white rounded-full w-7 h-7 flex items-center justify-center cursor-pointer transition-all duration-200 hover:bg-[#3d3d3d] hover:scale-110"
                        title="Helpful"
                      >
                        <FaRegThumbsUp />
                      </button>
                      <button 
                        onClick={() => handleFeedback(index, false)} 
                        className="bg-transparent text-white rounded-full w-7 h-7 flex items-center justify-center cursor-pointer transition-all duration-200 hover:bg-[#3d3d3d] hover:scale-110"
                        title="Not helpful"
                      >
                        <FaRegThumbsDown />
                      </button>
                    </div>
                  </div>
                </div>

                {entry.suggestions?.length > 0 && (
                  <div className="mt-4 bg-[rgba(255,251,230,0.9)] border-l-4 border-[#fdd835] p-3 rounded-r-md">
                    <strong className="block mb-2 text-[#5d4037]">Suggestions:</strong>
                    <ul className="pl-5 m-0">
                      {entry.suggestions.map((sug, i) => (
                        <li key={i} className="mb-2 leading-relaxed text-[#aeaeae]">{sug}</li>
                      ))}
                    </ul>
                  </div>
                )}
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

          <div className="p-4 border-none flex justify-center items-center gap-8 w-[700px] mb-8">
            <button 
              className="bg-[#E78D00] text-white border-none py-1 px-4 rounded-md cursor-pointer font-medium transition-all duration-200 w-fit h-10 min-w-[80px] hover:bg-[#ffb640]" 
              onClick={handleNewChat}
            >
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
                disabled={isLoading || !input.trim()}
              >
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