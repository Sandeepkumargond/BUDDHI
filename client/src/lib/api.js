const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

class ApiService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/api/v1`;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Important for cookies
      ...options,
    };

    // Handle FormData separately (for file uploads)
    if (config.body instanceof FormData) {
      // Remove Content-Type header to let browser set it with boundary
      delete config.headers['Content-Type'];
    } else if (config.body && typeof config.body !== 'string') {
      config.body = JSON.stringify(config.body);
    }

    try {
      console.log('Making API request to:', url, 'with options:', config);
      const response = await fetch(url, config);
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      let data;
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = { message: await response.text() };
      }

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication methods
  async login(role, credentials) {
    const roleEndpoints = {
      'superadmin': '/super-admin/login',
      'admin': '/admin/login',
      'subadmin': '/sub-admin/login',
      'student': '/student/login',
      'faculty': '/faculty/login'
    };

    const endpoint = roleEndpoints[role];
    if (!endpoint) {
      throw new Error('Invalid role');
    }

    // For superadmin, ensure both username and email are sent
    let loginData = { ...credentials };
    if (role === 'superadmin' && credentials.email && !credentials.username) {
      loginData.username = credentials.email; // Use email as username if username not provided
    }

    return this.request(endpoint, {
      method: 'POST',
      body: loginData,
    });
  }

  // Refresh access token using refresh token cookie
  async refreshAccessToken(role) {
    const roleEndpoints = {
      'superadmin': '/super-admin/refresh-access-token',
      'admin': '/admin/refresh-access-token',
      'subadmin': '/sub-admin/refresh-access-token',
      'student': '/student/refresh-access-token',
      'faculty': '/faculty/refresh-access-token'
    };

    const endpoint = roleEndpoints[role];
    if (!endpoint) {
      throw new Error('Invalid role');
    }

    return this.request(endpoint, {
      method: 'POST',
    });
  }

  // Create superadmin for testing
  async createSuperAdmin(userData) {
    return this.request('/super-admin/register', {
      method: 'POST',
      body: userData,
    });
  }

  async logout(role) {
    const roleEndpoints = {
      'superadmin': '/super-admin/logout',
      'admin': '/admin/logout',
      'subadmin': '/sub-admin/logout',
      'student': '/student/logout',
      'faculty': '/faculty/logout'
    };

    const endpoint = roleEndpoints[role];
    if (!endpoint) {
      throw new Error('Invalid role');
    }

    return this.request(endpoint, {
      method: 'POST',
    });
  }

  async getProfile(role) {
    const roleEndpoints = {
      'superadmin': '/super-admin/profile',
      'admin': '/admin/profile',
      'subadmin': '/sub-admin/profile', 
      'student': '/student/profile',
      'faculty': '/faculty/profile'
    };

    const endpoint = roleEndpoints[role];
    if (!endpoint) {
      throw new Error(`Invalid role: ${role}`);
    }

    console.log('Getting profile for role:', role, 'endpoint:', endpoint);
    return this.request(endpoint);
  }

  // Generic: get user by id based on role
  async getById(role, id) {
    const roleBases = {
      'superadmin': '/super-admin',
      'admin': '/admin',
      'subadmin': '/sub-admin',
      'student': '/student',
      'faculty': '/faculty'
    };

    const base = roleBases[role];
    if (!base) throw new Error(`Invalid role: ${role}`);
    return this.request(`${base}/${id}`);
  }
}

export const apiService = new ApiService();