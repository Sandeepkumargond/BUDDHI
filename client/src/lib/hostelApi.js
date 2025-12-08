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
