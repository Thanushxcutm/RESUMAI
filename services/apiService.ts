const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name?: string;
  };
}

export const apiService = {
  // Auth endpoints
  register: async (email: string, password: string, name: string = ''): Promise<AuthResponse> => {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Registration failed');
    }

    return response.json();
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    return response.json();
  },

  getProfile: async (token: string) => {
    const response = await fetch(`${API_URL}/api/auth/profile`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch profile');
    }

    return response.json();
  },

  // Analysis endpoints
  saveAnalysis: async (token: string, resumeText: string, analysis: any) => {
    const response = await fetch(`${API_URL}/api/analyses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ resumeText, analysis })
    });

    if (!response.ok) {
      throw new Error('Failed to save analysis');
    }

    return response.json();
  },

  getAnalyses: async (token: string) => {
    const response = await fetch(`${API_URL}/api/analyses`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch analyses');
    }

    return response.json();
  }
};
