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
        const rawMessage = data.message || `HTTP ${response.status}: ${response.statusText}`;
        // Map specific backend refresh token errors to a clearer client-side message
        if (rawMessage.includes('Refresh Token is expired or used')) {
          throw new Error('Session expired. Please log in again.');
        }
        if (rawMessage.toLowerCase().includes('invalid refresh token')) {
          throw new Error('Session invalid. Please log in again.');
        }
        throw new Error(rawMessage);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Health
  async health() {
    // No auth required; useful to detect server availability
    return this.request('/health', { method: 'GET' });
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

  // Fee payments (student)
  async listMyFeePayments() {
    return this.request('/student/fee-payment', { method: 'GET' });
  }

  async getMyFeeReceipt(id) {
    if (!id) throw new Error('Payment id is required');
    return this.request(`/student/fee-payment/${id}/receipt`, { method: 'GET' });
  }

  // Fee structure
  async getMyFeeStructure(session) {
    const qs = session ? `?session=${encodeURIComponent(session)}` : '';
    return this.request(`/student/fee-structure${qs}`, { method: 'GET' });
  }

  async getMyFeeStructures() {
    return this.request('/student/fee-structures', { method: 'GET' });
  }

  async adminCreateFeeStructure(payload) {
    return this.request('/admin/fee-structure', { method: 'POST', body: payload });
  }

  async adminListFeeStructures(params = {}) {
    const query = new URLSearchParams(params).toString();
    const qs = query ? `?${query}` : '';
    return this.request(`/admin/fee-structures${qs}`, { method: 'GET' });
  }

  // Courses (admin)
  async adminCreateCourse(payload) {
    return this.request('/admin/courses', { method: 'POST', body: payload });
  }

  async adminListCoursesByDepartment(departmentId) {
    return this.request(`/admin/departments/${departmentId}/courses`, { method: 'GET' });
  }

  async adminListCoursesByDepartmentCode(code, params = {}) {
    const query = new URLSearchParams(params).toString();
    const qs = query ? `?${query}` : '';
    return this.request(`/admin/departments/${code}/courses-by-code${qs}`, { method: 'GET' });
  }

  async adminDeleteCourse(id) {
    return this.request(`/admin/courses/${id}`, { method: 'DELETE' });
  }

  // Registration (admin)
  async adminCreateRegistrationForm(payload) {
    return this.request('/admin/registration-forms', { method: 'POST', body: payload });
  }

  async adminListRegistrationForms(params = {}) {
    const query = new URLSearchParams(params).toString();
    const qs = query ? `?${query}` : '';
    return this.request(`/admin/registration-forms${qs}`, { method: 'GET' });
  }

  async adminPublishRegistrationForm(id) {
    return this.request(`/admin/registration-forms/${id}/publish`, { method: 'PATCH' });
  }

  async adminDeleteRegistrationForm(id) {
    return this.request(`/admin/registration-forms/${id}`, { method: 'DELETE' });
  }

  async adminListRegistrationFormSubmissions(id) {
    return this.request(`/admin/registration-forms/${id}/submissions`, { method: 'GET' });
  }

  async adminListAllRegistrations(params = {}) {
    const query = new URLSearchParams(params).toString();
    const qs = query ? `?${query}` : '';
    return this.request(`/admin/registrations${qs}`, { method: 'GET' });
  }

  // Faculty (admin)
  async adminDeleteFaculty(id) {
    return this.request('/admin/delete-faculty', { method: 'DELETE', body: { id } });
  }

  // Departments (admin)
  async adminGetDepartment(code) {
    return this.request(`/admin/departments/${code}`, { method: 'GET' });
  }

  async adminUpdateDepartmentHod(code, facultyId) {
    return this.request(`/admin/departments/${code}/hod`, { method: 'PATCH', body: { facultyId } });
  }

  async adminListStudents(params = {}) {
    const query = new URLSearchParams(params).toString();
    const qs = query ? `?${query}` : '';
    return this.request(`/admin/students${qs}`, { method: 'GET' });
  }

  async adminCreateStudent(payload) {
    return this.request('/admin/create-student', { method: 'POST', body: payload });
  }

  async subAdminListStudents(params = {}) {
    const query = new URLSearchParams(params).toString();
    const qs = query ? `?${query}` : '';
    return this.request(`/sub-admin/students${qs}`, { method: 'GET' });
  }

  async subAdminCreateStudent(payload) {
    return this.request('/sub-admin/create-student', { method: 'POST', body: payload });
  }

  // Departments (admin)
  async adminListDepartments(params = {}) {
    const query = new URLSearchParams(params).toString();
    const qs = query ? `?${query}` : '';
    return this.request(`/admin/departments${qs}`, { method: 'GET' });
  }

  // Admit Cards (admin)
  async adminPublishAdmitCard(payload) {
    return this.request('/admin/admit-cards/publish', { method: 'POST', body: payload });
  }

  async adminGetAdmitCardByDeptSem(code, semester) {
    return this.request(`/admin/admit-cards/by-dept/${encodeURIComponent(code)}/semester/${encodeURIComponent(semester)}`, { method: 'GET' });
  }

  // Admit Card (student)
  async studentGetMyAdmitCard() {
    return this.request('/student/admit-card', { method: 'GET' });
  }

  async adminListAdmitCards(params = {}) {
    const query = new URLSearchParams(params).toString();
    const qs = query ? `?${query}` : '';
    return this.request(`/admin/admit-cards${qs}`, { method: 'GET' });
  }

  async adminDeleteAdmitCard(id) {
    return this.request(`/admin/admit-cards/${id}`, { method: 'DELETE' });
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

  // Registration (student)
  async studentListRegistrationForms(params = {}) {
    const query = new URLSearchParams(params).toString();
    const qs = query ? `?${query}` : '';
    return this.request(`/student/registration-forms${qs}`, { method: 'GET' });
  }

  async studentGetRegistrationForm(id) {
    return this.request(`/student/registration-forms/${id}`, { method: 'GET' });
  }

  async studentSubmitRegistration(id) {
    return this.request(`/student/registration-forms/${id}/submit`, { method: 'POST' });
  }

  async studentListMyRegistrations() {
    return this.request('/student/registrations', { method: 'GET' });
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