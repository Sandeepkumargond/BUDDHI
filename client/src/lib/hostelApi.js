import { apiService } from './api';

export async function fetchHostels() {
  const res = await apiService.request('/hostel/hostels');
  return res.data || [];
}

export async function submitHostelApplication(payload) {
  const res = await apiService.request('/hostel/student/hostel/application', { method: 'POST', body: payload });
  return res.data;
}

export async function fetchStudentHostelAllocation() {
  const res = await apiService.request('/hostel/student/hostel/allocation');
  return res.data || null;
}

export async function adminSaveHostel(payload) {
  const res = await apiService.request('/hostel/admin/hostels', { method: 'POST', body: payload });
  return res.data;
}

export async function fetchHostelApplications() {
  const res = await apiService.request('/hostel/admin/hostel/applications');
  return res.data || [];
}

export async function updateHostelAllocation(applicationId, newHostelName, newRoomNumber, newFloor) {
  const res = await apiService.request('/hostel/admin/hostel/allocation', {
    method: 'PUT',
    body: { applicationId, newHostelName, newRoomNumber, newFloor }
  });
  return res.data;
}

export async function removeHostelAllocation(applicationId) {
  const res = await apiService.request('/hostel/admin/hostel/allocation', {
    method: 'DELETE',
    body: { applicationId }
  });
  return res.data;
}

export async function deleteHostel(hostelId, hostelName) {
  const res = await apiService.request('/hostel/admin/hostels', {
    method: 'DELETE',
    body: { hostelId, hostelName }
  });
  return res.data;
}

// ============= COMPLAINT API FUNCTIONS =============

export async function submitComplaint(title, description, category, priority) {
  const res = await apiService.request('/hostel/student/complaint', {
    method: 'POST',
    body: { title, description, category, priority }
  });
  return res.data;
}

export async function getMyComplaints() {
  const res = await apiService.request('/hostel/student/complaints');
  return res.data || [];
}

export async function getAllComplaints(filters = {}) {
  const query = new URLSearchParams(filters).toString();
  const qs = query ? `?${query}` : '';
  const res = await apiService.request(`/hostel/admin/complaints${qs}`);
  return res.data || [];
}

export async function getComplaintStats() {
  const res = await apiService.request('/hostel/admin/complaints/stats');
  return res.data || {};
}

export async function getComplaintDetail(complaintId) {
  const res = await apiService.request(`/hostel/complaint/${complaintId}`);
  return res.data;
}

export async function updateComplaintStatus(complaintId, status, adminNotes) {
  const res = await apiService.request(`/hostel/admin/complaint/${complaintId}`, {
    method: 'PUT',
    body: { status, adminNotes }
  });
  return res.data;
}

export async function deleteComplaint(complaintId) {
  const res = await apiService.request(`/hostel/admin/complaint/${complaintId}`, {
    method: 'DELETE'
  });
  return res.data;
}

export async function bulkUpdateComplaints(complaintIds, status, priority) {
  const res = await apiService.request('/hostel/admin/complaints/bulk-update', {
    method: 'PUT',
    body: { complaintIds, status, priority }
  });
  return res.data;
}
