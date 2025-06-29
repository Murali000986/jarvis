import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  History, 
  Search, 
  Trash2, 
  Download, 
  Upload, 
  Plus, 
  MessageSquare, 
  Calendar,
  Clock,
  Star,
  Archive,
  Edit3,
  Check,
  X,
  Filter,
  SortDesc,
  MoreVertical
} from 'lucide-react';
import { Message } from '../types';

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  isStarred: boolean;
  isArchived: boolean;
  tags: string[];
}

interface ChatHistoryProps {
  isVisible: boolean;
  onToggle: () => void;
  currentMessages: Message[];
  onLoadSession: (messages: Message[]) => void;
  onNewChat: () => void;
  isMobile?: boolean;
}

const ChatHistory: React.FC<ChatHistoryProps> = ({
  isVisible,
  onToggle,
  currentMessages,
  onLoadSession,
  onNewChat,
  isMobile = false
}) => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [editingSession, setEditingSession] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'starred'>('date');
  const [filterBy, setFilterBy] = useState<'all' | 'starred' | 'archived'>('all');
  const [showOptions, setShowOptions] = useState<string | null>(null);

  // Load sessions from localStorage on component mount
  useEffect(() => {
    loadSessions();
  }, []);

  // Auto-save current session when messages change
  useEffect(() => {
    if (currentMessages.length > 1) {
      autoSaveCurrentSession();
    }
  }, [currentMessages]);

  const loadSessions = () => {
    try {
      const savedSessions = localStorage.getItem('jarvis-chat-sessions');
      if (savedSessions) {
        const parsed = JSON.parse(savedSessions);
        const sessionsWithDates = parsed.map((session: any) => ({
          ...session,
          createdAt: new Date(session.createdAt),
          updatedAt: new Date(session.updatedAt)
        }));
        setSessions(sessionsWithDates);
      }
    } catch (error) {
      console.error('Error loading chat sessions:', error);
    }
  };

  const saveSessions = (newSessions: ChatSession[]) => {
    try {
      localStorage.setItem('jarvis-chat-sessions', JSON.stringify(newSessions));
      setSessions(newSessions);
    } catch (error) {
      console.error('Error saving chat sessions:', error);
    }
  };

  const generateSessionTitle = (messages: Message[]): string => {
    if (messages.length === 0) return 'New Chat';
    
    const firstUserMessage = messages.find(m => m.type === 'user');
    if (firstUserMessage) {
      const title = firstUserMessage.content.substring(0, 50);
      return title.length < firstUserMessage.content.length ? title + '...' : title;
    }
    
    return 'New Chat';
  };

  const autoSaveCurrentSession = () => {
    if (currentMessages.length === 0) return;

    const currentSessionId = localStorage.getItem('jarvis-current-session-id');
    const now = new Date();
    
    if (currentSessionId) {
      // Update existing session
      const updatedSessions = sessions.map(session => {
        if (session.id === currentSessionId) {
          return {
            ...session,
            messages: [...currentMessages],
            updatedAt: now,
            title: session.title === 'New Chat' ? generateSessionTitle(currentMessages) : session.title
          };
        }
        return session;
      });
      saveSessions(updatedSessions);
    } else {
      // Create new session
      const newSession: ChatSession = {
        id: Date.now().toString(),
        title: generateSessionTitle(currentMessages),
        messages: [...currentMessages],
        createdAt: now,
        updatedAt: now,
        isStarred: false,
        isArchived: false,
        tags: []
      };
      
      const updatedSessions = [newSession, ...sessions];
      saveSessions(updatedSessions);
      localStorage.setItem('jarvis-current-session-id', newSession.id);
    }
  };

  const createNewChat = () => {
    localStorage.removeItem('jarvis-current-session-id');
    onNewChat();
    setSelectedSession(null);
  };

  const loadSession = (session: ChatSession) => {
    localStorage.setItem('jarvis-current-session-id', session.id);
    onLoadSession(session.messages);
    setSelectedSession(session.id);
    
    // Update last accessed time
    const updatedSessions = sessions.map(s => 
      s.id === session.id ? { ...s, updatedAt: new Date() } : s
    );
    saveSessions(updatedSessions);
  };

  const deleteSession = (sessionId: string) => {
    const updatedSessions = sessions.filter(s => s.id !== sessionId);
    saveSessions(updatedSessions);
    
    if (selectedSession === sessionId) {
      createNewChat();
    }
  };

  const toggleStarSession = (sessionId: string) => {
    const updatedSessions = sessions.map(session =>
      session.id === sessionId ? { ...session, isStarred: !session.isStarred } : session
    );
    saveSessions(updatedSessions);
  };

  const toggleArchiveSession = (sessionId: string) => {
    const updatedSessions = sessions.map(session =>
      session.id === sessionId ? { ...session, isArchived: !session.isArchived } : session
    );
    saveSessions(updatedSessions);
  };

  const updateSessionTitle = (sessionId: string, newTitle: string) => {
    const updatedSessions = sessions.map(session =>
      session.id === sessionId ? { ...session, title: newTitle } : session
    );
    saveSessions(updatedSessions);
    setEditingSession(null);
    setEditTitle('');
  };

  const exportSessions = () => {
    const dataStr = JSON.stringify(sessions, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `jarvis-chat-history-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importSessions = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedSessions = JSON.parse(e.target?.result as string);
        const sessionsWithDates = importedSessions.map((session: any) => ({
          ...session,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9), // Generate new IDs
          createdAt: new Date(session.createdAt),
          updatedAt: new Date(session.updatedAt)
        }));
        
        const mergedSessions = [...sessionsWithDates, ...sessions];
        saveSessions(mergedSessions);
      } catch (error) {
        console.error('Error importing sessions:', error);
        alert('Error importing chat history. Please check the file format.');
      }
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset input
  };

  const filteredAndSortedSessions = sessions
    .filter(session => {
      // Filter by search query
      if (searchQuery && !session.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !session.messages.some(m => m.content.toLowerCase().includes(searchQuery.toLowerCase()))) {
        return false;
      }
      
      // Filter by type
      switch (filterBy) {
        case 'starred':
          return session.isStarred;
        case 'archived':
          return session.isArchived;
        default:
          return !session.isArchived;
      }
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'starred':
          return (b.isStarred ? 1 : 0) - (a.isStarred ? 1 : 0);
        default:
          return b.updatedAt.getTime() - a.updatedAt.getTime();
      }
    });

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (!isVisible) {
    return (
      <motion.button
        onClick={onToggle}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`fixed ${
          isMobile ? 'top-16 left-4' : 'top-20 left-8'
        } z-50 p-3 bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-full shadow-lg border border-indigo-500/30`}
        title="Show chat history"
      >
        <History className="w-5 h-5 text-white" />
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className={`fixed ${
        isMobile ? 'top-16 left-4 right-4 bottom-4' : 'top-20 left-8 bottom-8'
      } z-50 glass-effect rounded-xl border border-white/20 ${
        isMobile ? 'w-auto' : 'w-96'
      } flex flex-col`}
    >
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <History className="w-5 h-5 text-indigo-400" />
            <h3 className="text-lg font-semibold text-white">Chat History</h3>
          </div>
          <div className="flex items-center space-x-2">
            <motion.button
              onClick={createNewChat}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/30 transition-colors"
              title="New chat"
            >
              <Plus className="w-4 h-4" />
            </motion.button>
            <motion.button
              onClick={onToggle}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 bg-gray-600/20 text-gray-400 border border-gray-600/30 rounded-lg hover:text-white transition-colors"
              title="Hide history"
            >
              <X className="w-4 h-4" />
            </motion.button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 glass-effect rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          />
        </div>

        {/* Filters and Sort */}
        <div className="flex items-center justify-between space-x-2">
          <div className="flex items-center space-x-2">
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value as any)}
              className="px-3 py-1 glass-effect rounded text-sm text-white bg-transparent border border-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
              <option value="all" className="bg-gray-800">All</option>
              <option value="starred" className="bg-gray-800">Starred</option>
              <option value="archived" className="bg-gray-800">Archived</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1 glass-effect rounded text-sm text-white bg-transparent border border-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
              <option value="date" className="bg-gray-800">Date</option>
              <option value="title" className="bg-gray-800">Title</option>
              <option value="starred" className="bg-gray-800">Starred</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-1">
            <motion.button
              onClick={exportSessions}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-1 text-gray-400 hover:text-indigo-400 transition-colors"
              title="Export history"
            >
              <Download className="w-4 h-4" />
            </motion.button>
            <label className="cursor-pointer">
              <input
                type="file"
                accept=".json"
                onChange={importSessions}
                className="hidden"
              />
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-1 text-gray-400 hover:text-indigo-400 transition-colors"
                title="Import history"
              >
                <Upload className="w-4 h-4" />
              </motion.div>
            </label>
          </div>
        </div>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        <AnimatePresence>
          {filteredAndSortedSessions.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8 text-gray-400"
            >
              <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No conversations found</p>
              <p className="text-sm mt-2">Start a new chat to begin</p>
            </motion.div>
          ) : (
            filteredAndSortedSessions.map((session) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 relative group ${
                  selectedSession === session.id
                    ? 'bg-indigo-500/20 border-indigo-500/50'
                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                }`}
                onClick={() => loadSession(session)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    {editingSession === session.id ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              updateSessionTitle(session.id, editTitle);
                            } else if (e.key === 'Escape') {
                              setEditingSession(null);
                              setEditTitle('');
                            }
                          }}
                          className="flex-1 px-2 py-1 text-sm bg-gray-800 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          autoFocus
                        />
                        <motion.button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateSessionTitle(session.id, editTitle);
                          }}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-1 text-green-400 hover:text-green-300"
                        >
                          <Check className="w-3 h-3" />
                        </motion.button>
                        <motion.button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingSession(null);
                            setEditTitle('');
                          }}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-1 text-red-400 hover:text-red-300"
                        >
                          <X className="w-3 h-3" />
                        </motion.button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        {session.isStarred && (
                          <Star className="w-3 h-3 text-yellow-400 fill-current" />
                        )}
                        {session.isArchived && (
                          <Archive className="w-3 h-3 text-gray-400" />
                        )}
                        <h4 className="font-medium text-white truncate text-sm">
                          {session.title}
                        </h4>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-2 mt-1">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-400">
                        {formatDate(session.updatedAt)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {session.messages.length} messages
                      </span>
                    </div>
                    
                    {session.messages.length > 0 && (
                      <p className="text-xs text-gray-400 mt-1 truncate">
                        {session.messages[session.messages.length - 1].content.substring(0, 60)}...
                      </p>
                    )}
                  </div>

                  {/* Options Menu */}
                  <div className="relative">
                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowOptions(showOptions === session.id ? null : session.id);
                      }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-1 text-gray-400 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </motion.button>

                    <AnimatePresence>
                      {showOptions === session.id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="absolute right-0 top-6 w-40 glass-effect rounded-lg border border-white/20 py-2 z-10"
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingSession(session.id);
                              setEditTitle(session.title);
                              setShowOptions(null);
                            }}
                            className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-white/10 flex items-center space-x-2"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Rename</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleStarSession(session.id);
                              setShowOptions(null);
                            }}
                            className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-white/10 flex items-center space-x-2"
                          >
                            <Star className={`w-3 h-3 ${session.isStarred ? 'text-yellow-400 fill-current' : ''}`} />
                            <span>{session.isStarred ? 'Unstar' : 'Star'}</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleArchiveSession(session.id);
                              setShowOptions(null);
                            }}
                            className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-white/10 flex items-center space-x-2"
                          >
                            <Archive className="w-3 h-3" />
                            <span>{session.isArchived ? 'Unarchive' : 'Archive'}</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm('Are you sure you want to delete this conversation?')) {
                                deleteSession(session.id);
                              }
                              setShowOptions(null);
                            }}
                            className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center space-x-2"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Delete</span>
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Footer Stats */}
      <div className="p-4 border-t border-white/10">
        <div className="text-xs text-gray-400 text-center">
          {sessions.length} total conversations • {sessions.filter(s => s.isStarred).length} starred
        </div>
      </div>
    </motion.div>
  );
};

export default ChatHistory;