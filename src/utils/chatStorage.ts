export interface ChatSession {
  id: string;
  title: string;
  messages: any[];
  createdAt: Date;
  updatedAt: Date;
  isStarred: boolean;
  isArchived: boolean;
  tags: string[];
  messageCount: number;
  lastMessage?: string;
}

export class ChatStorageManager {
  private static readonly STORAGE_KEY = 'jarvis-chat-sessions';
  private static readonly CURRENT_SESSION_KEY = 'jarvis-current-session-id';
  private static readonly SETTINGS_KEY = 'jarvis-chat-settings';

  // Get all chat sessions
  static getAllSessions(): ChatSession[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];
      
      const sessions = JSON.parse(stored);
      return sessions.map((session: any) => ({
        ...session,
        createdAt: new Date(session.createdAt),
        updatedAt: new Date(session.updatedAt)
      }));
    } catch (error) {
      console.error('Error loading chat sessions:', error);
      return [];
    }
  }

  // Save all sessions
  static saveSessions(sessions: ChatSession[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sessions));
    } catch (error) {
      console.error('Error saving chat sessions:', error);
    }
  }

  // Create a new session
  static createSession(messages: any[], title?: string): ChatSession {
    const now = new Date();
    const session: ChatSession = {
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: title || this.generateTitle(messages),
      messages: [...messages],
      createdAt: now,
      updatedAt: now,
      isStarred: false,
      isArchived: false,
      tags: [],
      messageCount: messages.length,
      lastMessage: messages.length > 0 ? messages[messages.length - 1].content : undefined
    };

    const sessions = this.getAllSessions();
    sessions.unshift(session);
    this.saveSessions(sessions);
    this.setCurrentSession(session.id);
    
    return session;
  }

  // Update an existing session
  static updateSession(sessionId: string, updates: Partial<ChatSession>): void {
    const sessions = this.getAllSessions();
    const sessionIndex = sessions.findIndex(s => s.id === sessionId);
    
    if (sessionIndex !== -1) {
      sessions[sessionIndex] = {
        ...sessions[sessionIndex],
        ...updates,
        updatedAt: new Date()
      };
      
      // Update derived fields
      if (updates.messages) {
        sessions[sessionIndex].messageCount = updates.messages.length;
        sessions[sessionIndex].lastMessage = updates.messages.length > 0 
          ? updates.messages[updates.messages.length - 1].content 
          : undefined;
      }
      
      this.saveSessions(sessions);
    }
  }

  // Delete a session
  static deleteSession(sessionId: string): void {
    const sessions = this.getAllSessions();
    const filteredSessions = sessions.filter(s => s.id !== sessionId);
    this.saveSessions(filteredSessions);
    
    if (this.getCurrentSessionId() === sessionId) {
      this.clearCurrentSession();
    }
  }

  // Get session by ID
  static getSession(sessionId: string): ChatSession | null {
    const sessions = this.getAllSessions();
    return sessions.find(s => s.id === sessionId) || null;
  }

  // Generate title from messages
  static generateTitle(messages: any[]): string {
    if (messages.length === 0) return 'New Chat';
    
    const firstUserMessage = messages.find(m => m.type === 'user');
    if (firstUserMessage) {
      let title = firstUserMessage.content.trim();
      
      // Clean up the title
      title = title.replace(/[^\w\s\-.,!?]/g, ''); // Remove special characters
      title = title.substring(0, 60); // Limit length
      
      if (title.length < firstUserMessage.content.length) {
        title += '...';
      }
      
      return title || 'New Chat';
    }
    
    return 'New Chat';
  }

  // Current session management
  static getCurrentSessionId(): string | null {
    return localStorage.getItem(this.CURRENT_SESSION_KEY);
  }

  static setCurrentSession(sessionId: string): void {
    localStorage.setItem(this.CURRENT_SESSION_KEY, sessionId);
  }

  static clearCurrentSession(): void {
    localStorage.removeItem(this.CURRENT_SESSION_KEY);
  }

  // Search sessions
  static searchSessions(query: string): ChatSession[] {
    const sessions = this.getAllSessions();
    const lowerQuery = query.toLowerCase();
    
    return sessions.filter(session => {
      // Search in title
      if (session.title.toLowerCase().includes(lowerQuery)) {
        return true;
      }
      
      // Search in messages
      return session.messages.some(message => 
        message.content.toLowerCase().includes(lowerQuery)
      );
    });
  }

  // Filter sessions
  static filterSessions(filter: 'all' | 'starred' | 'archived'): ChatSession[] {
    const sessions = this.getAllSessions();
    
    switch (filter) {
      case 'starred':
        return sessions.filter(s => s.isStarred);
      case 'archived':
        return sessions.filter(s => s.isArchived);
      default:
        return sessions.filter(s => !s.isArchived);
    }
  }

  // Sort sessions
  static sortSessions(sessions: ChatSession[], sortBy: 'date' | 'title' | 'starred' | 'messageCount'): ChatSession[] {
    return [...sessions].sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'starred':
          return (b.isStarred ? 1 : 0) - (a.isStarred ? 1 : 0);
        case 'messageCount':
          return b.messageCount - a.messageCount;
        default: // date
          return b.updatedAt.getTime() - a.updatedAt.getTime();
      }
    });
  }

  // Export sessions
  static exportSessions(): string {
    const sessions = this.getAllSessions();
    const exportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      sessions: sessions,
      totalSessions: sessions.length,
      totalMessages: sessions.reduce((sum, s) => sum + s.messageCount, 0)
    };
    
    return JSON.stringify(exportData, null, 2);
  }

  // Import sessions
  static importSessions(jsonData: string): { success: boolean; message: string; imported: number } {
    try {
      const importData = JSON.parse(jsonData);
      
      if (!importData.sessions || !Array.isArray(importData.sessions)) {
        return { success: false, message: 'Invalid file format', imported: 0 };
      }
      
      const existingSessions = this.getAllSessions();
      const importedSessions = importData.sessions.map((session: any) => ({
        ...session,
        id: `imported_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(session.createdAt),
        updatedAt: new Date(session.updatedAt)
      }));
      
      const mergedSessions = [...importedSessions, ...existingSessions];
      this.saveSessions(mergedSessions);
      
      return { 
        success: true, 
        message: `Successfully imported ${importedSessions.length} conversations`, 
        imported: importedSessions.length 
      };
    } catch (error) {
      return { success: false, message: 'Error parsing file', imported: 0 };
    }
  }

  // Get statistics
  static getStatistics() {
    const sessions = this.getAllSessions();
    const totalMessages = sessions.reduce((sum, s) => sum + s.messageCount, 0);
    const starredCount = sessions.filter(s => s.isStarred).length;
    const archivedCount = sessions.filter(s => s.isArchived).length;
    
    return {
      totalSessions: sessions.length,
      totalMessages,
      starredSessions: starredCount,
      archivedSessions: archivedCount,
      averageMessagesPerSession: sessions.length > 0 ? Math.round(totalMessages / sessions.length) : 0
    };
  }

  // Clean up old sessions (optional)
  static cleanupOldSessions(daysToKeep: number = 30): number {
    const sessions = this.getAllSessions();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    
    const sessionsToKeep = sessions.filter(session => 
      session.isStarred || 
      session.updatedAt > cutoffDate ||
      session.messageCount > 10 // Keep sessions with significant content
    );
    
    const removedCount = sessions.length - sessionsToKeep.length;
    
    if (removedCount > 0) {
      this.saveSessions(sessionsToKeep);
    }
    
    return removedCount;
  }

  // Backup sessions to file
  static createBackup(): void {
    const exportData = this.exportSessions();
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `jarvis-chat-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }
}