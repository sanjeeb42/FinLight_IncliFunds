const API_BASE_URL = 'http://localhost:8000';

export interface User {
  id: number;
  email: string;
  full_name: string;
  name?: string; // Alias for full_name
  phone?: string;
  state: string;
  language: string;
  cultural_background: string;
  religion?: string;
  financial_knowledge_level?: string;
  is_active: boolean;
  created_at: string;
  onboardingCompleted?: boolean;
  growthScore?: number;
  culturalProfile?: {
    state: string;
    religion: string;
    language: string;
    familyStructure?: string;
    incomeSource?: string;
  };
  financialProfile?: {
    monthlyIncome?: number;
    expenses?: number;
    savingsGoal?: number;
  };
  financialGoals?: string[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  state?: string;
  language?: string;
  cultural_background?: string;
  religion?: string;
  preferred_language?: string;
  financial_knowledge_level?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface FinancialProfile {
  id: number;
  user_id: number;
  monthly_income: number;
  monthly_expenses: number;
  savings_goal: number;
  risk_tolerance: string;
  investment_preferences: string[];
  financial_goals: string[];
  created_at: string;
  updated_at: string;
}

export interface CommunityCircle {
  id: number;
  name: string;
  description: string;
  region: string;
  language: string;
  member_count: number;
  category: string;
  is_active: boolean;
  created_at: string;
}

export interface GovernmentScheme {
  id: number;
  name: string;
  name_hindi?: string;
  description: string;
  department?: string;
  eligibility: string[];
  eligibility_criteria: string[];
  benefits: string[];
  benefits_hindi?: string[];
  application_process: string;
  required_documents: string[];
  state_specific: boolean;
  target_states: string[];
  category: string;
  is_active: boolean;
}

export interface SavingsGoal {
  id: number;
  user_id: number;
  title: string;
  name?: string; // Alias for title
  name_hindi?: string;
  description: string;
  target_amount: number;
  current_amount: number;
  target_date: string;
  deadline?: string; // Alias for target_date
  category: string;
  priority?: 'high' | 'medium' | 'low';
  monthly_target?: number;
  is_festival_related: boolean;
  festival_name?: string;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface VoiceInteraction {
  id: number;
  user_id: number;
  query_text: string;
  response_text: string;
  language: string;
  intent: string;
  confidence_score: number;
  created_at: string;
}

class ApiService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('token');
    console.log('API: Getting auth headers, token exists:', !!token);
    if (token) {
      console.log('API: Token preview:', token.substring(0, 20) + '...');
    }
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      // Handle 401 Unauthorized specifically
      if (response.status === 401) {
        console.log('API: 401 Unauthorized - clearing token and redirecting');
        localStorage.removeItem('token');
        // Redirect to login page
        window.location.href = '/login';
        throw new Error('Session expired. Please log in again.');
      }
      
      const errorData = await response.json().catch(() => ({ detail: 'Network error' }));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  // Authentication APIs
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password
      })
    });
    return this.handleResponse<AuthResponse>(response);
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return this.handleResponse<AuthResponse>(response);
  }

  async getCurrentUser(): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<User>(response);
  }

  async updateProfile(updates: Partial<User>): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(updates)
    });
    return this.handleResponse<User>(response);
  }

  async getLevelContent(): Promise<{
    level: string;
    tagline: string;
    name: string;
    description: string;
    content: any;
  }> {
    const response = await fetch(`${API_BASE_URL}/users/level-content`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<{
      level: string;
      tagline: string;
      name: string;
      description: string;
      content: any;
    }>(response);
  }

  // Financial Profile APIs
  async getFinancialProfile(): Promise<FinancialProfile | null> {
    const response = await fetch(`${API_BASE_URL}/financial-profile/`, {
      headers: this.getAuthHeaders()
    });
    if (response.status === 404) return null;
    return this.handleResponse<FinancialProfile>(response);
  }

  async createFinancialProfile(profile: Partial<FinancialProfile>): Promise<FinancialProfile> {
    const response = await fetch(`${API_BASE_URL}/financial-profile/`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(profile)
    });
    return this.handleResponse<FinancialProfile>(response);
  }

  async updateFinancialProfile(profile: Partial<FinancialProfile>): Promise<FinancialProfile> {
    const response = await fetch(`${API_BASE_URL}/financial-profile/`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(profile)
    });
    return this.handleResponse<FinancialProfile>(response);
  }

  // Community APIs
  async getCommunityCircles(): Promise<CommunityCircle[]> {
    const response = await fetch(`${API_BASE_URL}/community/circles`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<CommunityCircle[]>(response);
  }

  async joinCommunityCircle(circleId: number): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/community/circles/${circleId}/join`, {
      method: 'POST',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<{ message: string }>(response);
  }

  async getUserCommunityCircles(): Promise<CommunityCircle[]> {
    const response = await fetch(`${API_BASE_URL}/community/my-circles`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<CommunityCircle[]>(response);
  }

  // Government Schemes APIs
  async getGovernmentSchemes(): Promise<GovernmentScheme[]> {
    const response = await fetch(`${API_BASE_URL}/schemes/`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<GovernmentScheme[]>(response);
  }

  async checkSchemeEligibility(schemeId: number): Promise<{ eligible: boolean; reasons: string[] }> {
    const response = await fetch(`${API_BASE_URL}/schemes/${schemeId}/eligibility`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<{ eligible: boolean; reasons: string[] }>(response);
  }

  // Savings Goals APIs
  async getSavingsGoals(): Promise<SavingsGoal[]> {
    const response = await fetch(`${API_BASE_URL}/savings-goals/`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<SavingsGoal[]>(response);
  }

  async createSavingsGoal(goal: Partial<SavingsGoal>): Promise<SavingsGoal> {
    const response = await fetch(`${API_BASE_URL}/savings-goals/`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(goal)
    });
    return this.handleResponse<SavingsGoal>(response);
  }

  async updateSavingsGoal(goalId: number, updates: Partial<SavingsGoal>): Promise<SavingsGoal> {
    const response = await fetch(`${API_BASE_URL}/savings-goals/${goalId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(updates)
    });
    return this.handleResponse<SavingsGoal>(response);
  }

  async deleteSavingsGoal(goalId: number): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/savings-goals/${goalId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<{ message: string }>(response);
  }

  // Voice Assistant APIs
  async processVoiceQuery(query: string, language: string = 'en'): Promise<{ response: string; intent: string }> {
    const response = await fetch(`${API_BASE_URL}/voice/process`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ query, language })
    });
    return this.handleResponse<{ response: string; intent: string }>(response);
  }

  async getVoiceHistory(): Promise<VoiceInteraction[]> {
    const response = await fetch(`${API_BASE_URL}/voice/history`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<VoiceInteraction[]>(response);
  }

  // AI Services APIs
  async getCulturalNudges(): Promise<{ nudges: string[]; cultural_context: string }> {
    const response = await fetch(`${API_BASE_URL}/ai/cultural-nudges`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<{ nudges: string[]; cultural_context: string }>(response);
  }

  async getFinancialAdvice(query: string): Promise<{ advice: string; confidence: number }> {
    const response = await fetch(`${API_BASE_URL}/ai/financial-advice`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ query })
    });
    return this.handleResponse<{ advice: string; confidence: number }>(response);
  }

  async getPersonalizedRecommendations(): Promise<{ recommendations: string[]; category: string }> {
    const response = await fetch(`${API_BASE_URL}/ai/recommendations`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<{ recommendations: string[]; category: string }>(response);
  }

  async getChatResponse(data: {
    message: string;
    language: string;
    user_context?: any;
  }): Promise<{ content: string; content_hindi?: string }> {
    const response = await fetch(`${API_BASE_URL}/ai/chat`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return this.handleResponse<{ content: string; content_hindi?: string }>(response);
  }

  // Dashboard APIs
  async getDashboardData(): Promise<{
    financial_score: number;
    monthly_summary: any;
    recent_activities: any[];
    upcoming_festivals: any[];
    cultural_nudges: string[];
  }> {
    const response = await fetch(`${API_BASE_URL}/dashboard/`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<{
      financial_score: number;
      monthly_summary: any;
      recent_activities: any[];
      upcoming_festivals: any[];
      cultural_nudges: string[];
    }>(response);
  }

  // Simulation Profile Services
  async saveSimulationProfile(profileData: any): Promise<{ success: boolean; message: string }> {
    console.log('API: Saving simulation profile with data:', profileData);
    console.log('API: Auth headers:', this.getAuthHeaders());
    
    const response = await fetch(`${API_BASE_URL}/simulations/save-profile`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(profileData)
    });
    
    console.log('API: Response status:', response.status);
    console.log('API: Response ok:', response.ok);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API: Error response text:', errorText);
      try {
        const errorData = JSON.parse(errorText);
        console.error('API: Error data:', errorData);
      } catch (e) {
        console.error('API: Could not parse error as JSON');
      }
    }
    
    return this.handleResponse<{ success: boolean; message: string }>(response);
  }

  async getSimulationProfile(): Promise<{ has_profile: boolean; profile: any }> {
    const response = await fetch(`${API_BASE_URL}/simulations/profile`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<{ has_profile: boolean; profile: any }>(response);
  }

  async runSimulation(simulationData: any): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/simulations/run`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(simulationData)
    });
    return this.handleResponse<any>(response);
  }
}

export const apiService = new ApiService();
export default apiService;