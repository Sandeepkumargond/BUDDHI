// Base URL resolution: prefer explicit env, else infer from window origin (client-side) or default localhost.
// Ensure single /api/v1 suffix.
function resolveBaseUrl() {
  // Prefer explicit envs; avoid window origin fallback to prevent pointing at port 3000
  let raw = process.env.NEXT_PUBLIC_API_BASE_URL
    || process.env.NEXT_PUBLIC_API_BASE
    || process.env.NEXT_PUBLIC_SERVER_URL
    || 'http://localhost:5000';
  raw = raw.replace(/\/$/, '');
  if (!/\/api(\/v1)?$/.test(raw)) raw = `${raw}/api/v1`;
  return raw;
}

class ApiService {
  constructor() {
    this.baseURL = resolveBaseUrl();
    this.accessToken = null; // in-memory token fallback if cookies blocked cross-site
    try { console.info('[apiService] Base URL:', this.baseURL); } catch { }
  }

  setAccessToken(token) {
    this.accessToken = token;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const silent = options.silent === true;

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
      try { if (!silent) console.debug('[apiService] Request', { url, method, headers }); } catch { }
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
        const err = new Error(rawMessage);
        err.status = response.status;
        err.endpoint = endpoint;
        err.url = url;
        throw err;
      }

      return data;
    } catch (error) {
      // Enhanced error logging
      let message = error?.message;
      if (!message || message === '') {
        if (error instanceof TypeError) {
          message = `Network error: Unable to reach ${url} - Check if server is running`;
        } else {
          message = 'Unknown error occurred';
        }
      }

      const errorInfo = {
        message,
        status: error?.status,
        url: error?.url || url,
        endpoint: error?.endpoint || endpoint,
        type: error?.constructor?.name || typeof error
      };

      // Reduce noise for expected session expiry errors
      const isSessionError = message.includes('Session expired') || message.includes('Session invalid');
      if (!isSessionError) {
        console.error('API request failed:', message);
        console.error('Error details:', errorInfo);
      } else {
        console.log('Session expired, please log in again');
      }
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
      'faculty': '/faculty/login',
      'alumni': '/alumni/login'
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
      'faculty': '/faculty/refresh-access-token',
      'alumni': '/alumni/refresh-access-token'
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
      'faculty': '/faculty/logout',
      'alumni': '/alumni/logout'
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

  async getAllCourses() {
    return this.request('/admin/courses', { method: 'GET' });
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

  async getAllFaculties() {
    return this.getAllFaculty();
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

  async adminGetDepartmentByCode(code) {
    return this.request(`/admin/departments/${code}`, { method: 'GET' });
  }

  async adminCreateDepartment(payload) {
    return this.request('/admin/departments', { method: 'POST', body: payload });
  }

  async adminUpdateDepartment(code, payload) {
    return this.request(`/admin/departments/${code}`, { method: 'PATCH', body: payload });
  }

  async adminDeleteDepartment(code) {
    return this.request(`/admin/departments/${code}`, { method: 'DELETE' });
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
      'faculty': '/faculty/profile',
      'alumni': '/alumni/profile'
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

  // Dashboard endpoints
  async getDashboardStats() {
    return this.request('/admin/dashboard-stats', {
      method: 'GET'
    });
  }

  // Public faculties (student view)
  async listPublicFaculties(params = {}) {
    const query = new URLSearchParams(params).toString();
    const qs = query ? `?${query}` : '';
    return this.request(`/faculty/public${qs}`, { method: 'GET' });
  }

  // Faculty class notices
  async getFacultyClassNotices(params = {}) {
    const query = new URLSearchParams(params).toString();
    const qs = query ? `?${query}` : '';
    return this.request(`/notices/faculty/class${qs}`, { method: 'GET' });
  }

  async createFacultyClassNotice(formData) {
    // formData must be FormData with fields: courseId, title, content, optional section/priority/publishDate/expiryDate/tags, and optional attachment
    return this.request('/notices/faculty/class', {
      method: 'POST',
      body: formData
    });
  }

  // Study Material endpoints
  async getFacultyCourses() {
    return this.request('/study-materials/faculty/courses', {
      method: 'GET'
    });
  }

  // Analytics (Faculty & Admin)
  async getStudentRiskAnalytics(role = 'faculty') {
    const endpoint = role === 'admin'
      ? '/admin/analytics/risk-trends'
      : '/faculty/analytics/risk-trends';

    return this.request(endpoint, {
      method: 'GET'
    });
  }

  // Feedback endpoints
  async submitFeedback(feedbackData) {
    return this.request('/student/submit-feedback', {
      method: 'POST',
      body: feedbackData
    });
  }

  async getFacultyFeedback(facultyId, academicYear = null) {
    const params = new URLSearchParams({ facultyId });
    if (academicYear) params.append('academicYear', academicYear);
    return this.request(`/faculty/${facultyId}/feedback?${params.toString()}`, {
      method: 'GET'
    });
  }

  async getAllFeedback(page = 1, limit = 10) {
    return this.request(`/admin/feedback?page=${page}&limit=${limit}`, {
      method: 'GET'
    });
  }

  async deleteFeedback(feedbackId) {
    return this.request(`/admin/feedback/${feedbackId}`, {
      method: 'DELETE'
    });
  }

  async getFacultyRating(facultyId) {
    return this.request(`/faculty/${facultyId}/rating`, {
      method: 'GET'
    });
  }

  async getFacultyRatings() {
    return this.request('/admin/faculty-ratings', {
      method: 'GET'
    });
  }

  // Feedback Form endpoints
  async createFeedbackForm(formData) {
    return this.request('/feedback/admin/feedback-forms', {
      method: 'POST',
      body: formData
    });
  }

  async getAllFeedbackForms(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    return this.request(`/feedback/admin/feedback-forms?${params}`, {
      method: 'GET'
    });
  }

  async getFeedbackFormById(formId) {
    return this.request(`/feedback/student/feedback-forms/${formId}`, {
      method: 'GET'
    });
  }

  async getFeedbackFormByIdAdmin(formId) {
    return this.request(`/feedback/admin/feedback-forms/${formId}`, {
      method: 'GET'
    });
  }

  async updateFeedbackForm(formId, formData) {
    return this.request(`/feedback/admin/feedback-forms/${formId}`, {
      method: 'PATCH',
      body: formData
    });
  }

  async deleteFeedbackForm(formId) {
    return this.request(`/feedback/admin/feedback-forms/${formId}`, {
      method: 'DELETE'
    });
  }

  async activateFeedbackForm(formId) {
    return this.request(`/feedback/admin/feedback-forms/${formId}/activate`, {
      method: 'PATCH'
    });
  }

  async closeFeedbackForm(formId) {
    return this.request(`/feedback/admin/feedback-forms/${formId}/close`, {
      method: 'PATCH'
    });
  }

  async getFeedbackFormsForStudent(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    return this.request(`/feedback/student/feedback-forms?${params}`, {
      method: 'GET'
    });
  }

  async submitFeedbackForm(feedbackData) {
    return this.request('/feedback/student/feedback-forms/submit', {
      method: 'POST',
      body: feedbackData
    });
  }

  // Faculty feedback analytics
  async getFacultyFeedbackAnalytics(filters = {}) {
    const queryStr = new URLSearchParams(filters).toString();
    return this.request(`/feedback/admin/faculty-analytics${queryStr ? '?' + queryStr : ''}`, {
      method: 'GET'
    });
  }

  async getFacultyFeedbackDetails(facultyId) {
    return this.request(`/feedback/admin/faculty/${facultyId}/feedback`, {
      method: 'GET'
    });
  }

  // ========== Razorpay Payment Integration ==========

  // Create Razorpay order
  async createRazorpayOrder(payload) {
    return this.request('/razorpay/order', {
      method: 'POST',
      body: payload
    });
  }

  // Verify payment and create fee payment record
  async verifyRazorpayPayment(payload) {
    return this.request('/razorpay/verify', {
      method: 'POST',
      body: payload
    });
  }

  // Get transaction status
  async getRazorpayTransactionStatus(orderId) {
    return this.request(`/razorpay/transaction-status?orderId=${encodeURIComponent(orderId)}`, {
      method: 'GET'
    });
  }
  // ============ Alumni Methods ============

  // Alumni Authentication
  async loginAlumni(credentials) {
    return this.request('/alumni/login', {
      method: 'POST',
      body: credentials
    });
  }

  async logoutAlumni() {
    return this.request('/alumni/logout', {
      method: 'POST'
    });
  }

  // Alumni Profile
  async getAlumniProfile() {
    return this.request('/alumni/profile', {
      method: 'GET'
    });
  }

  // Get student's fee payments (via Razorpay)
  async getStudentFeePayments() {
    return this.request('/razorpay/payments', {
      method: 'GET'
    });
  }

  // Admin: Get Razorpay credentials
  async getRazorpayCredentials() {
    return this.request('/razorpay/credentials', {
      method: 'GET'
    });
  }

  // Admin: Save/update Razorpay credentials
  async updateRazorpayCredentials(payload) {
    return this.request('/razorpay/credentials', {
      method: 'POST',
      body: payload
    });
  }

  // Admin: Delete Razorpay credentials
  async deleteRazorpayCredentials() {
    return this.request('/razorpay/credentials', {
      method: 'DELETE'
    });
  }

  async updateAlumniProfile(data) {
    return this.request('/alumni/profile/update', {
      method: 'PATCH',
      body: data
    });
  }
  // Alumni Internship Management
  async addInternshipOpportunity(data) {
    return this.request('/alumni/internships/add', {
      method: 'POST',
      body: data
    });
  }

  async updateInternshipOpportunity(internshipId, data) {
    return this.request(`/alumni/internships/${internshipId}`, {
      method: 'PATCH',
      body: data
    });
  }

  async deleteInternshipOpportunity(internshipId) {
    return this.request(`/alumni/internships/${internshipId}`, {
      method: 'DELETE'
    });
  }

  // Admin: Test Razorpay credentials
  async testRazorpayCredentials(payload) {
    return this.request('/razorpay/credentials/test', {
      method: 'POST',
      body: payload
    });
  }
  // Alumni Referral Management
  async addReferral(data) {
    return this.request('/alumni/referrals/add', {
      method: 'POST',
      body: data
    });
  }

  async updateReferral(referralId, data) {
    return this.request(`/alumni/referrals/${referralId}`, {
      method: 'PATCH',
      body: data
    });
  }

  async deleteReferral(referralId) {
    return this.request(`/alumni/referrals/${referralId}`, {
      method: 'DELETE'
    });
  }

  // Alumni Donation Management
  async addDonation(data) {
    return this.request('/alumni/donations/add', {
      method: 'POST',
      body: data
    });
  }

  // Public Alumni Endpoints (for students)
  async getAllInternshipOpportunities(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    return this.request(`/alumni/internships?${params}`, {
      method: 'GET'
    });
  }

  async getAllReferrals(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    return this.request(`/alumni/referrals?${params}`, {
      method: 'GET'
    });
  }

  // Admin Alumni Management
  async registerAlumni(data) {
    return this.request('/alumni/admin/register', {
      method: 'POST',
      body: data
    });
  }

  async listAllAlumni(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    return this.request(`/alumni/admin/list?${params}`, {
      method: 'GET'
    });
  }

  async getAlumniById(alumniId) {
    return this.request(`/alumni/admin/${alumniId}`, {
      method: 'GET'
    });
  }

  async updateAlumniStatus(alumniId, data) {
    return this.request(`/alumni/admin/${alumniId}/status`, {
      method: 'PATCH',
      body: data
    });
  }

  async deleteAlumniById(alumniId) {
    return this.request(`/alumni/admin/${alumniId}`, {
      method: 'DELETE'
    });
  }

  async getDonationStats() {
    return this.request('/alumni/admin/stats/donations', {
      method: 'GET'
    });
  }

  async updateDonationStatus(alumniId, donationId, data) {
    return this.request(`/alumni/admin/${alumniId}/donations/${donationId}/status`, {
      method: 'PATCH',
      body: data
    });
  }

  async approveInternship(alumniId, internshipId, isApproved) {
    return this.request(`/alumni/admin/${alumniId}/internships/${internshipId}/approval`, {
      method: 'PATCH',
      body: { isApproved }
    });
  }

  async approveReferral(alumniId, referralId, isApproved) {
    return this.request(`/alumni/admin/${alumniId}/referrals/${referralId}/approval`, {
      method: 'PATCH',
      body: { isApproved }
    });
  }

  // Leave Management
  async applyLeave(formData) {
    return this.request('/leaves/student/apply', {
      method: 'POST',
      body: formData
    });
  }

  async applyLeaveFaculty(formData) {
    return this.request('/leaves/faculty/apply', {
      method: 'POST',
      body: formData
    });
  }

  async getMyLeaves(status = '', page = 1, limit = 20) {
    let url = '/leaves/student/my-leaves?';
    if (status) url += `status=${status}&`;
    url += `page=${page}&limit=${limit}`;
    return this.request(url, { method: 'GET' });
  }

  async getMyLeavesFaculty(status = '', page = 1, limit = 20) {
    let url = '/leaves/faculty/my-leaves?';
    if (status) url += `status=${status}&`;
    url += `page=${page}&limit=${limit}`;
    return this.request(url, { method: 'GET' });
  }

  async getLeaveById(leaveId) {
    return this.request(`/leaves/student/${leaveId}`, {
      method: 'GET'
    });
  }

  async getLeaveByIdFaculty(leaveId) {
    return this.request(`/leaves/faculty/${leaveId}`, {
      method: 'GET'
    });
  }

  async cancelLeave(leaveId) {
    return this.request(`/leaves/student/${leaveId}/cancel`, {
      method: 'DELETE'
    });
  }

  async cancelLeaveFaculty(leaveId) {
    return this.request(`/leaves/faculty/${leaveId}/cancel`, {
      method: 'DELETE'
    });
  }

  // Admin Leave Management
  async getAllLeaves(status = '', applicantType = '', search = '', page = 1, limit = 20) {
    let url = '/leaves/admin/all?';
    if (status && status !== '') url += `status=${status}&`;
    if (applicantType && applicantType !== '') url += `applicantType=${applicantType}&`;
    if (search && search !== '') url += `search=${search}&`;
    url += `page=${page}&limit=${limit}`;
    return this.request(url, { method: 'GET' });
  }

  async reviewLeave(leaveId, status, adminRemarks = '') {
    return this.request(`/leaves/admin/${leaveId}/review`, {
      method: 'PATCH',
      body: { status, adminRemarks }
    });
  }

  async deleteLeave(leaveId) {
    return this.request(`/leaves/admin/${leaveId}`, {
      method: 'DELETE'
    });
  }

  // Scholarships
  async applyScholarship(formData) {
    return this.request('/scholarships/student/apply', {
      method: 'POST',
      body: formData,
    });
  }

  async getMyScholarships(status = '', page = 1, limit = 20) {
    let url = '/scholarships/student/my?';
    if (status) url += `status=${status}&`;
    url += `page=${page}&limit=${limit}`;
    return this.request(url, { method: 'GET' });
  }

  async getAllScholarships(status = '', search = '', page = 1, limit = 20) {
    let url = '/scholarships/admin/all?';
    if (status) url += `status=${status}&`;
    if (search) url += `search=${encodeURIComponent(search)}&`;
    url += `page=${page}&limit=${limit}`;
    return this.request(url, { method: 'GET' });
  }

  async reviewScholarship(scholarshipId, status, adminRemarks = '') {
    return this.request(`/scholarships/admin/${scholarshipId}/review`, {
      method: 'PATCH',
      body: { status, adminRemarks },
    });
  }

  // Bonafide Certificates
  async applyBonafide(formData) {
    return this.request('/bonafide/student/apply', {
      method: 'POST',
      body: formData,
    });
  }

  async getMyBonafides(status = '', page = 1, limit = 20) {
    let url = '/bonafide/student/my?';
    if (status) url += `status=${status}&`;
    url += `page=${page}&limit=${limit}`;
    return this.request(url, { method: 'GET' });
  }

  async getMyBonafideById(bonafideId) {
    return this.request(`/bonafide/student/${bonafideId}`, { method: 'GET' });
  }

  async getAllBonafides(status = '', search = '', page = 1, limit = 20) {
    let url = '/bonafide/admin/all?';
    if (status) url += `status=${status}&`;
    if (search) url += `search=${encodeURIComponent(search)}&`;
    url += `page=${page}&limit=${limit}`;
    return this.request(url, { method: 'GET' });
  }

  async reviewBonafide(bonafideId, status, rejectionReason = '') {
    return this.request(`/bonafide/admin/${bonafideId}/review`, {
      method: 'PATCH',
      body: { status, rejectionReason },
    });
  }

  // ============ Messaging Methods ============

  // Get user's conversations
  async getConversations() {
    return this.request('/messages/conversations', {
      method: 'GET'
    });
  }

  // Get messages in a conversation
  async getConversationMessages(conversationId, page = 1, limit = 50) {
    return this.request(`/messages/conversations/${conversationId}?page=${page}&limit=${limit}`, {
      method: 'GET'
    });
  }

  // Send a message
  async sendMessage(receiverId, receiverModel, content, attachments = []) {
    return this.request('/messages/send', {
      method: 'POST',
      body: { receiverId, receiverModel, content, attachments }
    });
  }

  // Mark message as read
  async markMessageAsRead(messageId) {
    return this.request(`/messages/${messageId}/read`, {
      method: 'PATCH'
    });
  }

  // Mark all messages in conversation as read
  async markConversationAsRead(conversationId) {
    return this.request(`/messages/conversations/${conversationId}/read`, {
      method: 'PATCH'
    });
  }

  // Delete a message
  async deleteMessage(messageId) {
    return this.request(`/messages/${messageId}`, {
      method: 'DELETE'
    });
  }

  // Search users (alumni or students)
  async searchUsers(role, query = '') {
    return this.request(`/messages/search-users?role=${role}&query=${encodeURIComponent(query)}`, {
      method: 'GET'
    });
  }

  // Get unread message count
  async getUnreadMessageCount() {
    return this.request('/messages/unread-count', {
      method: 'GET'
    });
  }
}


export const apiService = new ApiService();