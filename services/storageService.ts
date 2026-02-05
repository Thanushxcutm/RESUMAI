
import { ResumeAnalysis, User } from "../types";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
const TOKEN_KEY = 'resumai_token';
const USER_KEY = 'resumai_user';
const HISTORY_KEY = 'resumai_history';
const USERS_KEY = 'resumai_users_local';

export interface HistoryItem {
  id: string;
  userId: string;
  timestamp: number;
  resumeText: string;
  analysis: ResumeAnalysis;
}

// Check if API is available
let apiAvailable = true;

export const storageService = {
  getAtlasStatus: () => ({
    uri: "mongodb+srv://thanushmasika_db_user:***@resumai.ibrpozd.mongodb.net/?appName=Resumai",
    clusterName: "resumai.ibrpozd",
    database: "resumai_db",
    collection: "analyses"
  }),

  // Get JWT token
  getToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken: (token: string) => {
    localStorage.setItem(TOKEN_KEY, token);
  },

  // Get auth headers
  getAuthHeaders: () => {
    const token = storageService.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  },

  // --- AUTHENTICATION ---
  register: async (email: string, password: string): Promise<User> => {
    console.log(`[ResumAI] Registering user: ${email}`);
    try {
      // Try API first
      if (apiAvailable) {
        const response = await fetch(`${API_URL}/api/auth/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name: email.split('@')[0] })
        });

        if (response.ok) {
          const data = await response.json();
          storageService.setToken(data.token);
          localStorage.setItem(USER_KEY, JSON.stringify(data.user));
          return data.user;
        }
      }
    } catch (e: any) {
      console.warn('[ResumAI] API unavailable, using local storage fallback');
      apiAvailable = false;
    }

    // Fallback to localStorage
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    if (users.find((u: any) => u.email === email)) {
      throw new Error('User already exists');
    }

    const newUser: User = { 
      id: crypto.randomUUID(), 
      email, 
      name: email.split('@')[0]
    };
    users.push({ ...newUser, password });
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    localStorage.setItem(TOKEN_KEY, email);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    return newUser;
  },

  login: async (email: string, password: string): Promise<User> => {
    console.log(`[ResumAI] Authenticating: ${email}`);
    try {
      // Try API first
      if (apiAvailable) {
        const response = await fetch(`${API_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });

        if (response.ok) {
          const data = await response.json();
          storageService.setToken(data.token);
          localStorage.setItem(USER_KEY, JSON.stringify(data.user));
          return data.user;
        }
      }
    } catch (e: any) {
      console.warn('[ResumAI] API unavailable, using local storage fallback');
      apiAvailable = false;
    }

    // Fallback to localStorage
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const user = users.find((u: any) => u.email === email && u.password === password);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const userData: User = {
      id: user.id,
      email: user.email,
      name: user.name
    };
    localStorage.setItem(TOKEN_KEY, email);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    return userData;
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  getActiveUser: (): User | null => {
    const data = localStorage.getItem(USER_KEY);
    return data ? JSON.parse(data) : null;
  },

  // --- RECORD MANAGEMENT ---
  saveAnalysis: async (userId: string, resumeText: string, analysis: ResumeAnalysis): Promise<void> => {
    console.log(`[ResumAI] Saving analysis`);
    
    // Cache locally
    const history = storageService.getAllHistory();
    const newItem: HistoryItem = {
      id: crypto.randomUUID(),
      userId,
      timestamp: Date.now(),
      resumeText,
      analysis
    };
    localStorage.setItem(HISTORY_KEY, JSON.stringify([newItem, ...history]));
    
    // Try API if available
    if (apiAvailable) {
      try {
        const response = await fetch(`${API_URL}/api/analysis`, {
          method: 'POST',
          headers: storageService.getAuthHeaders(),
          body: JSON.stringify({ resumeText, analysis })
        });

        if (!response.ok) {
          console.warn('[ResumAI] Failed to sync to server, data saved locally');
        }
      } catch (e: any) {
        console.warn('[ResumAI] API unavailable, data saved locally');
      }
    }
    
    console.log(`[ResumAI] Analysis saved successfully`);
  },

  getUserHistory: (userId: string): HistoryItem[] => {
    return storageService.getAllHistory().filter(item => item.userId === userId);
  },

  getAllHistory: (): HistoryItem[] => {
    const data = localStorage.getItem(HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  }
};
