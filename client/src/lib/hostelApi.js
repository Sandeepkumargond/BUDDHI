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
