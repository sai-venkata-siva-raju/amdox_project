const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    full_name: string;
    role: string;
    tenant_id: string;
    tenant_name: string;
    tenant_slug: string;
    avatar_url?: string;
  };
}

export interface RegisterCredentials {
  fullName: string;
  email: string;
  password: string;
  tenantName: string;
  tenantSlug: string;
  avatarUrl?: string;
}

export type UserRole = 'superadmin' | 'tenantadmin' | 'manager' | 'viewer';

export interface UserProfile {
  id: string;
  tenant_id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  role: UserRole;
  tenant_name?: string;
  tenant_slug?: string;
}

export interface DashboardKpiMetric {
  id: string;
  metric_key: string;
  metric_value: number;
  label: string;
}

export interface DashboardActivity {
  id: string;
  action: string;
  module: string;
  created_at: string;
}

export interface DashboardSummary {
  kpis: DashboardKpiMetric[];
  activities: DashboardActivity[];
}

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  module: string;
  created_at: string;
}

class ApiClient {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  getToken(): string | null {
    if (this.token) return this.token;
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = this.getToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      if (process.env.NODE_ENV === 'development') {
        console.debug('[api]', options.method || 'GET', url);
      }

      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          error: data.error || data.message || `HTTP error! status: ${response.status}`,
        };
      }

      return { data };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Network error occurred',
      };
    }
  }

  async login(credentials: LoginCredentials): Promise<ApiResponse<LoginResponse>> {
    return this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(credentials: RegisterCredentials): Promise<ApiResponse<LoginResponse>> {
    return this.request<LoginResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async getCurrentUser(): Promise<ApiResponse<UserProfile>> {
    return this.request<UserProfile>('/auth/me');
  }

  async getProfiles(): Promise<ApiResponse<UserProfile[]>> {
    return this.request<UserProfile[]>('/profiles');
  }

  async getProfile(id: string): Promise<ApiResponse<UserProfile>> {
    return this.request<UserProfile>(`/profiles/${id}`);
  }

  async createProfile(profileData: Partial<UserProfile>): Promise<ApiResponse<UserProfile>> {
    return this.request<UserProfile>('/profiles', {
      method: 'POST',
      body: JSON.stringify(profileData),
    });
  }

  async updateProfile(id: string, profileData: Partial<UserProfile>): Promise<ApiResponse<UserProfile>> {
    return this.request<UserProfile>(`/profiles/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(profileData),
    });
  }

  async deleteProfile(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/profiles/${id}`, {
      method: 'DELETE',
    });
  }

  async getTenants(): Promise<ApiResponse<any[]>> {
    return this.request<any[]>('/tenants');
  }

  async getTenant(id: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/tenants/${id}`);
  }

  async getHealth(): Promise<ApiResponse<{ status: string; timestamp: string; uptime: number }>> {
    return this.request<{ status: string; timestamp: string; uptime: number }>('/health');
  }

  async getDashboardSummary(): Promise<ApiResponse<DashboardSummary>> {
    return this.request<DashboardSummary>('/dashboard/summary');
  }

  async getNotifications(): Promise<ApiResponse<NotificationItem[]>> {
    return this.request<NotificationItem[]>('/notifications');
  }
}

export const apiClient = new ApiClient();
export default apiClient;
