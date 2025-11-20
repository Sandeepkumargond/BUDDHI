// Base URL resolution: prefer explicit env, else infer from window origin (client-side) or default localhost.
// Ensure single /api/v1 suffix.
function resolveBaseUrl() {
  let raw = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!raw && typeof window !== 'undefined') {
    raw = window.location.origin; // fallback to current origin in production if env missing
  }
  if (!raw) raw = 'http://localhost:5000';
  // Strip trailing slashes
  raw = raw.replace(/\/$/, '');
  // If raw already ends with /api or /api/v1 leave, else append /api/v1
  if (!/\/api(\/v1)?$/.test(raw)) raw = `${raw}/api/v1`;
  return raw;
}

class ApiService {
  constructor() {
    this.baseURL = resolveBaseUrl();
    this.accessToken = null; // in-memory token fallback if cookies blocked cross-site
  }

  setAccessToken(token) {
    this.accessToken = token;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    const method = (options.method || 'GET').toUpperCase();
    const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;

    // Build headers safely based on method/body
    const headers = { ...(options.headers || {}) };
    // Attach bearer token if available (helps when cookies are stripped on cross-site requests)
    if (this.accessToken && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }
    if (!isFormData && method !== 'GET') {
      headers['Content-Type'] = headers['Content-Type'] || 'application/json';
    }

    const config = {
      method,
      headers,
      credentials: 'include', // include cookies for auth
      cache: 'no-store', // always fetch fresh data
    };

    // Attach body appropriately
    if (method !== 'GET' && method !== 'HEAD') {
      if (isFormData) {
        config.body = options.body; // browser sets correct boundary
      } else if (options.body && typeof options.body !== 'string') {
        config.body = JSON.stringify(options.body);
      } else if (typeof options.body === 'string') {
        config.body = options.body;
      }
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

    const res = await this.request(endpoint, {
      method: 'POST',
      body: loginData,
    });
    // Store accessToken if present (for Authorization header on cross-site without cookies)
    const token = res?.data?.accessToken;
    if (token) this.setAccessToken(token);
    return res;
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

    const res = await this.request(endpoint, {
      method: 'POST',
    });
    const token = res?.data?.accessToken;
    if (token) this.setAccessToken(token);
    return res;
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
  async getAllFaculty() {
    return this.request('/admin/get-all-faculty', { method: 'GET' });
  }

  async createFaculty(payload) {
    return this.request('/admin/create-faculty', { method: 'POST', body: payload });
  }

  async adminDeleteFaculty(id) {
    return this.request('/admin/delete-faculty', { method: 'DELETE', body: { id } });
  }

  async deleteFaculty(id) {
    return this.adminDeleteFaculty(id);
  }

  // Departments (admin)
  async getAllDepartments() {
    return this.request('/admin/departments', { method: 'GET' });
  }

  async getCoursesByDepartment(departmentId) {
    return this.request(`/admin/departments/${departmentId}/courses`, { method: 'GET' });
  }

  async getAllCourses() {
    return this.request('/admin/courses', { method: 'GET' });
  }

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

  async adminUpdateStudent(id, payload) {
    return this.request(`/admin/update-student/${id}`, { method: 'PATCH', body: payload });
  }

  async subAdminListStudents(params = {}) {
    const query = new URLSearchParams(params).toString();
    const qs = query ? `?${query}` : '';
    return this.request(`/sub-admin/students${qs}`, { method: 'GET' });
  }

  async subAdminCreateStudent(payload) {
    return this.request('/sub-admin/create-student', { method: 'POST', body: payload });
  }

  async subAdminUpdateStudent(id, payload) {
    return this.request(`/sub-admin/update-student/${id}`, { method: 'PATCH', body: payload });
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

  // Attendance APIs (faculty)
  async saveAttendance(payload) {
    return this.request('/faculty/attendance', { method: 'POST', body: payload });
  }

  async listMyAttendance(params = {}) {
    const query = new URLSearchParams(params).toString();
    const qs = query ? `?${query}` : '';
    return this.request(`/faculty/attendance${qs}`, { method: 'GET' });
  }

  async getAttendanceById(id) {
    return this.request(`/faculty/attendance/${id}`, { method: 'GET' });
  }

  async deleteAttendance(id) {
    return this.request(`/faculty/attendance/${id}`, { method: 'DELETE' });
  }

  async getStudentsForAttendance(params = {}) {
    const query = new URLSearchParams(params).toString();
    const qs = query ? `?${query}` : '';
    return this.request(`/faculty/attendance/students${qs}`, { method: 'GET' });
  }

  async getMyAssignedCourses() {
    return this.request('/faculty/my-courses', { method: 'GET' });
  }

  // Alias for consistency
  async facultyListMyCourses() {
    return this.getMyAssignedCourses();
  }

  async facultyGetCourseStudents(courseId, params = {}) {
    const query = new URLSearchParams(params).toString();
    const qs = query ? `?${query}` : '';
    return this.request(`/faculty/courses/${courseId}/students${qs}`, { method: 'GET' });
  }

  async assignCourseToFaculty(payload) {
    return this.request('/admin/assign-course', { method: 'POST', body: payload });
  }

  async removeCourseFromFaculty(facultyId, assignmentId) {
    return this.request('/admin/remove-course', { method: 'POST', body: { facultyId, assignmentId } });
  }

  // Monthly Attendance APIs
  async getMonthlyAttendance(params) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/faculty/monthly-attendance?${query}`, { method: 'GET' });
  }

  async getMyMonthlyAttendances(params = {}) {
    const query = new URLSearchParams(params).toString();
    const qs = query ? `?${query}` : '';
    return this.request(`/faculty/monthly-attendance/list${qs}`, { method: 'GET' });
  }

  async updateActiveDays(attendanceId, totalActiveDays) {
    return this.request('/faculty/monthly-attendance/active-days', {
      method: 'PATCH',
      body: { attendanceId, totalActiveDays }
    });
  }

  async updateStudentAttendance(attendanceId, studentId, daysPresent) {
    return this.request('/faculty/monthly-attendance/student', {
      method: 'PATCH',
      body: { attendanceId, studentId, daysPresent }
    });
  }

  async bulkUpdateAttendance(attendanceId, updates) {
    return this.request('/faculty/monthly-attendance/bulk-update', {
      method: 'PATCH',
      body: { attendanceId, updates }
    });
  }

  async finalizeMonthlyAttendance(attendanceId) {
    return this.request('/faculty/monthly-attendance/finalize', {
      method: 'PATCH',
      body: { attendanceId }
    });
  }

  async unfinalizeMonthlyAttendance(attendanceId) {
    return this.request('/faculty/monthly-attendance/unfinalize', {
      method: 'PATCH',
      body: { attendanceId }
    });
  }

  async deleteMonthlyAttendance(attendanceId) {
    return this.request(`/faculty/monthly-attendance/${attendanceId}`, {
      method: 'DELETE'
    });
  }

  async syncStudents(attendanceId) {
    return this.request('/faculty/monthly-attendance/sync-students', {
      method: 'PATCH',
      body: { attendanceId }
    });
  }

  // Student endpoints
  async getMyMonthlyAttendance(params) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/student/monthly-attendance?${queryString}`, {
      method: 'GET'
    });
  }
}

export const apiService = new ApiService();