"use client";

import { useState, useMemo, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { toast } from "react-hot-toast";

import FormModal from "@/components/FormModal";
import Table from "@/components/Table";
import Pagination from "@/components/Pagination";

import { apiService } from "@/lib/api";
import { deptCodeToId } from "@/lib/maps";

const StatCard = ({ title, value, subtitle }) => (
  <div className="flex-1 min-w-40 rounded-xl p-5 bg-[#F5F9FF] border border-[#DCE7FF] shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
    <div className="text-xs font-medium text-gray-600">{title}</div>
    <div className="mt-1 text-3xl font-semibold text-gray-800">{value}</div>
    {subtitle && (
      <div className="text-xs text-blue-600 font-medium mt-1">{subtitle}</div>
    )}
  </div>
);


const TabButton = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${active
        ? "bg-[#E9F2FF] text-blue-600 shadow-inner"
        : "text-gray-600 hover:bg-gray-50"
      }`}
  >
    {children}
  </button>
);

export default function DepartmentDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const deptCode = params?.id ?? null; // This is the department code from URL

  // UI state
  const [activeTab, setActiveTab] = useState("overview");
  const [showHodModal, setShowHodModal] = useState(false);
  const [selectedHod, setSelectedHod] = useState(null);
  const [localDept, setLocalDept] = useState(null);
  const [backendDept, setBackendDept] = useState(null);
  const [deptStats, setDeptStats] = useState({ facultyCount: 0, studentCount: 0 });
  const [loadingDept, setLoadingDept] = useState(true);
  const [hodLoading, setHodLoading] = useState(false);
  const [facultyPage, setFacultyPage] = useState(1);
  const [studentPage, setStudentPage] = useState(1);
  const [refreshTrigger, setRefreshTrigger] = useState(0);


  // Derived data
  const [faculties, setFaculties] = useState([]);
  const [feedbackAnalytics, setFeedbackAnalytics] = useState([]);
  
  // Fetch faculty list from backend for this department
  // Fetch department details from backend
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!deptCode) return;
      setLoadingDept(true);
      try {
        const res = await apiService.adminGetDepartmentByCode(deptCode);
        const dept = res?.data?.department || res?.department || null;
        if (mounted && dept) {
          setLocalDept(dept);
          setBackendDept(dept);
          if (dept?.hod?._id) setSelectedHod(dept.hod._id);
          // Set stats from counts
          const stats = {
            facultyCount: dept.facultyCount || 0,
            studentCount: dept.studentCount || 0
          };
          setDeptStats(stats);
        }
      } catch (e) {
        toast.error('Failed to load department details');
        router.push('/admin/departments');
      } finally {
        if (mounted) setLoadingDept(false);
      }
    })();
    return () => { mounted = false; };
  }, [deptCode, router, refreshTrigger]);
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!localDept?.code) return;
      try {
        const qs = `?department=${encodeURIComponent(localDept.code)}`;
        const res = await apiService.request(`/admin/get-all-faculty${qs}`);
        const list = res?.data?.faculty || [];
        if (!mounted) return;
        // Map to minimal structure used in this page
        const mapped = list.map((f) => ({
          id: f._id,
          name: `${f.firstName || ''} ${f.lastName || ''}`.trim(),
          designation: (Array.isArray(f.designation) && f.designation[0]) || f.designation || '',
          email: f.email || f.personalMail || '',
          phone: f.mobile || '',
          department: f.department,
          photo: f.imageUrl || null,
        }));
        setFaculties(mapped);
        // Update faculty count in stats
        setDeptStats(prev => ({ ...prev, facultyCount: mapped.length }));
      } catch (e) {
        // fallback to empty array if API fails
        if (mounted) setFaculties([]);
      }
    })();
    return () => { mounted = false; };
  }, [localDept?.code, refreshTrigger]);

  // Fetch feedback analytics for faculty ratings
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        console.log('[DepartmentDetails] Fetching feedback analytics');
        const res = await apiService.getFacultyFeedbackAnalytics();
        const analytics = res?.data?.analytics || [];
        if (mounted) {
          console.log('[DepartmentDetails] Got analytics:', analytics);
          setFeedbackAnalytics(analytics);
        }
      } catch (e) {
        console.error('[DepartmentDetails] Failed to fetch analytics:', e.message);
        if (mounted) setFeedbackAnalytics([]);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Merge ratings into faculties when analytics updates
  useEffect(() => {
    if (feedbackAnalytics.length === 0 || faculties.length === 0) return;
    
    const updatedFaculties = faculties.map((faculty) => {
      const analytic = feedbackAnalytics.find((a) => a.facultyId === faculty.id);
      return {
        ...faculty,
        rating: analytic?.averageRating || null,
      };
    });
    
    setFaculties(updatedFaculties);
  }, [feedbackAnalytics]);

  const [students, setStudents] = useState([]);
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (!localDept?.code) return;
        const res = await apiService.adminListStudents({ branch: localDept.code });
        const list = res?.data?.students || res?.students || [];
        if (!mounted) return;
        const mapped = list.map(st => ({
          id: st._id,
          name: `${st.firstName || ''} ${st.lastName || ''}`.trim(),
          roll: st.rollNo || st.enrollmentNo || '',
          year: st.program || '',
          semester: st.semester || '',
        }));
        setStudents(mapped);
        // Update student count in stats
        setDeptStats(prev => ({ ...prev, studentCount: mapped.length }));
      } catch (e) {
        // fallback to empty array if API fails
        if (mounted) setStudents([]);
      }
    })();
    return () => { mounted = false; };
  }, [localDept?.code, refreshTrigger]);

  const hod = useMemo(() => {
    if (backendDept?.hod) {
      return {
        id: backendDept.hod._id,
        name: `${backendDept.hod.firstName || ''} ${backendDept.hod.lastName || ''}`.trim(),
        email: backendDept.hod.email,
        phone: backendDept.hod.mobile,
        photo: backendDept.hod.imageUrl,
        designation: Array.isArray(backendDept.hod.designation) ? backendDept.hod.designation[0] : backendDept.hod.designation
      };
    }
    return null;
  }, [backendDept]);

  // ⭐ Courses list for this department
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!localDept?.code) {
        console.log('[Courses] No department code available yet');
        return;
      }
      console.log('[Courses] Fetching courses for department:', localDept.code);
      try {
        const res = await apiService.adminListCoursesByDepartmentCode(localDept.code);
        console.log('[Courses] API response:', res);
        const fetched = res?.data?.courses || res?.courses || [];
        console.log('[Courses] Fetched courses:', fetched);
        if (mounted && Array.isArray(fetched)) {
          setCourses(fetched);
          console.log('[Courses] Set courses state:', fetched.length, 'courses');
        }
      } catch (e) {
        console.error('[Courses] Failed to fetch courses:', e);
        // fallback to empty array if API not available
        if (mounted) setCourses([]);
      }
    })();
    return () => { mounted = false; }; 
  }, [localDept?.code, refreshTrigger]);

  // Pagination (simple)
  const FACULTY_PER_PAGE = 6;
  const STUDENT_PER_PAGE = 8;

  const facultySlice = faculties.slice(
    (facultyPage - 1) * FACULTY_PER_PAGE,
    facultyPage * FACULTY_PER_PAGE
  );
  const studentSlice = students.slice(
    (studentPage - 1) * STUDENT_PER_PAGE,
    studentPage * STUDENT_PER_PAGE
  );

  // Table columns
  const facultyColumns = [
    { header: "Name", accessor: "name" },
    { header: "Designation", accessor: "designation", className: "hidden md:table-cell" },
    { header: "Email", accessor: "email", className: "hidden lg:table-cell" },
    { header: "Phone", accessor: "phone", className: "hidden lg:table-cell" },
    { header: "Rating", accessor: "rating", className: "hidden md:table-cell" },
    { header: "Actions", accessor: "action" },
  ];

  const studentColumns = [
    { header: "Name", accessor: "name" },
    { header: "Roll", accessor: "roll", className: "hidden md:table-cell" },
    { header: "Year", accessor: "year", className: "hidden md:table-cell" },
    { header: "Semester", accessor: "semester", className: "hidden md:table-cell" },
  ];


  const courseColumns = [
    { header: "Course Name", accessor: "name" },
    { header: "Course Code", accessor: "code", className: "hidden md:table-cell" },
    { header: "Credits", accessor: "credits", className: "hidden md:table-cell" },
    { header: "Semester", accessor: "semester", className: "hidden md:table-cell" },
    { header: "Actions", accessor: "action" },
  ];

  // Renderers
  const renderFacultyRow = (f) => (
    <tr key={f.id} className="border-b border-gray-100 hover:bg-[#F7FBFF]">
      <td className="p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
          <Image src={f.photo ?? "/avatar.png"} alt={f.name} width={40} height={40} />
        </div>
        <div>
          <div className="font-medium text-gray-700">{f.name}</div>
          <div className="text-xs text-gray-400">{f.email}</div>
        </div>
      </td>
      <td className="hidden md:table-cell p-4">{f.designation}</td>
      <td className="hidden lg:table-cell p-4">{f.email}</td>
      <td className="hidden lg:table-cell p-4">{f.phone}</td>
      <td className="hidden md:table-cell p-4">
        <div className="flex items-center gap-1">
          <span className="text-yellow-500">★</span>
          <span className="font-medium">{f.rating ? f.rating.toFixed(1) : 'N/A'}</span>
        </div>
      </td>
      <td className="p-4">
        <div className="flex items-center gap-2">
          <button className="text-sm px-3 py-1 rounded-md border border-gray-200 hover:bg-gray-50" onClick={() => openFacultyModal(f.id)}>View</button>
          <button className="text-sm px-3 py-1 rounded-md border border-red-200 text-red-600 hover:bg-red-50" onClick={() => handleDeleteFaculty(f.id)}>Remove</button>
        </div>
      </td>
    </tr>
  );
  const [showFacultyModal, setShowFacultyModal] = useState(false);
  const [facultyDetails, setFacultyDetails] = useState(null);
  const [facultyLoading, setFacultyLoading] = useState(false);

  async function openFacultyModal(facultyId) {
    setFacultyLoading(true);
    setShowFacultyModal(true);
    try {
      const res = await apiService.request(`/faculty/${facultyId}`);
      const fac = res?.data || res;
      // Support ApiResponse shape
      const user = fac?.user || fac;
      setFacultyDetails(user);
    } catch (e) {
      setFacultyDetails({ error: e.message || 'Failed to load faculty' });
    } finally {
      setFacultyLoading(false);
    }
  }

  async function handleDeleteFaculty(id) {
    try {
      await apiService.adminDeleteFaculty(id);
      setFaculties(prev => prev.filter(f => f.id !== id));
    } catch (e) {
      // optionally toast
    }
  }

  const renderStudentRow = (s) => (
    <tr key={s.id} className="border-b border-gray-100 hover:bg-[#F7FBFF]">
      <td className="p-4">
        <div className="font-medium text-gray-700">{s.name}</div>
        <div className="text-xs text-gray-400">{s.roll}</div>
      </td>
      <td className="hidden md:table-cell p-4">{s.roll}</td>
      <td className="hidden md:table-cell p-4">{s.year}</td>
      <td className="hidden md:table-cell p-4">{s.semester}</td>
    </tr>
  );

  const renderCourseRow = (c) => (
    <tr key={c.id} className="border-b border-gray-100 hover:bg-[#F7FBFF]">
      <td className="p-4">{c.name}</td>
      <td className="hidden md:table-cell p-4">{c.code}</td>
      <td className="hidden md:table-cell p-4">{c.credits}</td>
      <td className="hidden md:table-cell p-4">{c.semester ?? "-"}</td>
      <td className="p-4">
        <div className="flex items-center gap-2">
          <button className="text-sm px-3 py-1 rounded-md border border-red-200 text-red-600 hover:bg-red-50"
            onClick={() => handleDeleteCourse(c.id)}>
            Delete
          </button>
        </div>
      </td>
    </tr>
  );


  // Handlers
  async function handleApplyHod() {
    if (!selectedHod || !localDept?.code) {
      setShowHodModal(false);
      return;
    }
    setHodLoading(true);
    try {
      await apiService.adminUpdateDepartmentHod(localDept.code, selectedHod);
      const res = await apiService.adminGetDepartmentByCode(localDept.code);
      const dept = res?.data?.department || res?.department;
      if (dept) {
        setBackendDept(dept);
        setLocalDept(dept);
        if (dept?.hod?._id) setSelectedHod(dept.hod._id);
      }
      toast.success('HOD updated successfully');
    } catch (e) {
      toast.error(e.message || 'Failed to update HOD');
    } finally {
      setHodLoading(false);
      setShowHodModal(false);
    }
  }

  async function handleDeleteDepartment() {
    if (!localDept?.code) return;
    
    const confirmed = window.confirm(
      `Are you sure you want to delete ${localDept.name}? This action cannot be undone.`
    );
    
    if (!confirmed) return;
    
    try {
      await apiService.adminDeleteDepartment(localDept.code);
      toast.success('Department deleted successfully');
      router.push("/admin/departments");
    } catch (e) {
      toast.error(e.message || 'Failed to delete department');
    }
  }

  async function handleDeleteCourse(id) {
    try {
      await apiService.adminDeleteCourse(id);
      setCourses((prev) => prev.filter((c) => (c._id || c.id) !== id));
      toast.success("Course deleted");
    } catch (e) {
      toast.error(e.message || "Failed to delete course");
    }
  }

  // Loading state
  if (loadingDept || !localDept) {
    return (
      <div className="p-4 m-4 bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading department details...</p>
          </div>
        </div>
      </div>
    );
  }

  // UI
  return (
    <div className="p-4 m-4 bg-white rounded-xl border border-gray-100 shadow-sm">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <div className="text-sm text-gray-400">Departments / {localDept.name}</div>
          <h1 className="text-2xl font-semibold text-gray-800 mt-1">{localDept.name}</h1>
          <div className="text-sm text-gray-500 mt-1">
            Code: <span className="font-medium text-gray-700">{localDept.code}</span> • Established {localDept.established || localDept.establishedYear || 'N/A'} • <span className="px-2 py-0.5 rounded-md bg-green-50 text-green-700 text-xs">{localDept.status || 'Active'}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <FormModal table="department" type="update" data={localDept} />
          <button
            onClick={() => setShowHodModal(true)}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700"
          >
            Change HOD
          </button>
          <button
            onClick={handleDeleteDepartment}
            className="px-4 py-2 rounded-lg border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 text-sm"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-4 flex-wrap mb-6">
        <StatCard title="Total Faculty" value={deptStats.facultyCount || faculties.length} />
        <StatCard title="Total Students" value={deptStats.studentCount || students.length} />
        <StatCard title="Courses Offered" value={courses.length} />
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="flex items-center gap-2 mb-4">
          <TabButton active={activeTab === "overview"} onClick={() => setActiveTab("overview")}>Overview</TabButton>
          <TabButton active={activeTab === "hod"} onClick={() => setActiveTab("hod")}>HOD</TabButton>
          <TabButton active={activeTab === "faculty"} onClick={() => setActiveTab("faculty")}>Faculty</TabButton>
          <TabButton active={activeTab === "students"} onClick={() => setActiveTab("students")}>Students</TabButton>
          <TabButton active={activeTab === "courses"} onClick={() => setActiveTab("courses")}>Courses</TabButton>

        </div>

        {/* Tab content */}
        <div>
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left: Description & details */}
              <div className="col-span-2 bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Department Overview</h3>
                <p className="text-sm text-gray-600 mb-4">
                  {localDept.description ??
                    "This department focuses on ... (replace with real description). Use this section to show mission, programs, labs, and accomplishments."}
                </p>

                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="text-sm text-gray-500">Head of Department</div>
                  <div className="text-sm font-medium text-gray-700">{hod ? hod.name : "—"}</div>

                  <div className="text-sm text-gray-500">Established</div>
                  <div className="text-sm font-medium text-gray-700">{localDept.established}</div>

                  <div className="text-sm text-gray-500">Status</div>
                  <div className="text-sm font-medium text-gray-700">{localDept.status}</div>

                  <div className="text-sm text-gray-500">Faculty Count</div>
                  <div className="text-sm font-medium text-gray-700">{faculties.length}</div>

                  <div className="text-sm text-gray-500">Student Count</div>
                  <div className="text-sm font-medium text-gray-700">{students.length}</div>
                </div>
              </div>

              {/* Right: HOD card + quick actions */}
              <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Quick Info</h3>

                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                      <Image src={hod?.photo ?? "/profile.png"} alt={hod?.name ?? "No HOD"} width={56} height={56} />
                    </div>
                    <div>
                      <div className="text-sm font-medium">{hod?.name ?? "Not assigned"}</div>
                      <div className="text-xs text-gray-400">{hod?.email ?? ""}</div>
                    </div>
                  </div>

                  <div className="border-t pt-3">
                    <Link href="/admin/departments" className="text-sm text-blue-600">Back to Departments</Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "hod" && (
            <div>
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-700">Head of Department</h3>
                <p className="text-sm text-gray-500">View or change the current HOD.</p>
              </div>

              <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                {hod ? (
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100">
                      <Image src={hod.photo} alt={hod.name} width={64} height={64} />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">{hod.name}</div>
                      <div className="text-sm text-gray-500">{hod.designation}</div>
                      <div className="text-sm text-gray-500 mt-1">{hod.email} • {hod.phone}</div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button onClick={() => setShowHodModal(true)} className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm">Change HOD</button>
                      <FormModal table="department" type="update" data={localDept} />
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">No HOD assigned yet.</div>
                )}
              </div>
            </div>
          )}

          {activeTab === "faculty" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-700">Faculty</h3>
                  <p className="text-sm text-gray-500">Manage faculty members in this department.</p>
                </div>
                <button
                  onClick={async () => {
                    try {
                      console.log('[DepartmentDetails] Refreshing ratings...');
                      const res = await apiService.getFacultyFeedbackAnalytics();
                      const analytics = res?.data?.analytics || [];
                      console.log('[DepartmentDetails] Refreshed analytics:', analytics);
                      setFeedbackAnalytics(analytics);
                    } catch (e) {
                      console.error('[DepartmentDetails] Failed to refresh ratings:', e.message);
                      toast.error('Failed to refresh ratings');
                    }
                  }}
                  className="px-4 py-2 rounded-lg bg-blue-100 text-blue-600 text-sm hover:bg-blue-200 transition font-medium"
                >
                  🔄 Refresh Ratings
                </button>
              </div>

              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <Table
                  columns={facultyColumns}
                  renderRow={renderFacultyRow}
                  data={facultySlice}
                />
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-gray-500">Showing {facultySlice.length} of {faculties.length} faculty</div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setFacultyPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1 border rounded"
                  >
                    Prev
                  </button>
                  <div className="px-3 py-1 border rounded">{facultyPage}</div>
                  <button
                    onClick={() =>
                      setFacultyPage((p) =>
                        p * FACULTY_PER_PAGE < faculties.length ? p + 1 : p
                      )
                    }
                    className="px-3 py-1 border rounded"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "students" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-700">Students</h3>
                  <p className="text-sm text-gray-500">All students assigned to this department.</p>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <Table
                  columns={studentColumns}
                  renderRow={renderStudentRow}
                  data={studentSlice}
                />
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-gray-500">Showing {studentSlice.length} of {students.length} students</div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setStudentPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1 border rounded"
                  >
                    Prev
                  </button>
                  <div className="px-3 py-1 border rounded">{studentPage}</div>
                  <button
                    onClick={() =>
                      setStudentPage((p) =>
                        p * STUDENT_PER_PAGE < students.length ? p + 1 : p
                      )
                    }
                    className="px-3 py-1 border rounded"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}


          {activeTab === "courses" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-700">Courses</h3>
                  <p className="text-sm text-gray-500">All courses under this department.</p>
                </div>

                {/* ⭐ Add Course Button */}
                {localDept?.code && deptCodeToId[localDept.code] && (
                  <FormModal
                    table="course"
                    type="create"
                    departmentId={deptCodeToId[localDept.code]}
                    onCreate={(newCourse) => {
                      setCourses((prev) => [newCourse, ...prev]);
                      setRefreshTrigger((prev) => prev + 1);
                    }}
                  />
                )}
              </div>

              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <Table
                  columns={courseColumns}
                  renderRow={renderCourseRow}
                  data={courses.map((c) => ({
                    id: c._id || c.id,
                    name: c.name,
                    code: c.code,
                    credits: c.credits,
                    semester: c.semester,
                  }))}
                />
              </div>
            </div>
          )}

        </div>
      </div>

      {/* HOD Modal (custom) */}
      {showHodModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowHodModal(false)} />

          <div className="relative bg-white rounded-2xl w-full max-w-lg p-6 z-10 shadow-lg border border-gray-100">

            {/* Close Icon */}
            <button
              onClick={() => setShowHodModal(false)}
              className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 text-xl"
            >
              ✕
            </button>

            <h3 className="text-lg font-semibold text-gray-800 mb-3">Change Head of Department</h3>
            <p className="text-sm text-gray-500 mb-4">
              Select a faculty member from this department to assign as HOD.
            </p>

            <div className="space-y-3">
              <label className="text-sm text-gray-600">Select HOD</label>
              <select
                value={selectedHod}
                onChange={(e) => setSelectedHod(e.target.value)}
                className="w-full border rounded-md p-2"
              >
                <option value="">-- Select --</option>
                {faculties.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} — {f.designation}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowHodModal(false)}
                className="px-4 py-2 rounded-lg border"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyHod}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-50"
                disabled={hodLoading}
              >
                {hodLoading ? 'Saving...' : 'Apply'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Faculty View Modal */}
      {showFacultyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => { setShowFacultyModal(false); setFacultyDetails(null); }} />
          <div className="relative bg-white rounded-2xl w-full max-w-xl p-6 z-10 shadow-lg border border-gray-100">
            <button
              onClick={() => { setShowFacultyModal(false); setFacultyDetails(null); }}
              className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 text-xl"
            >✕</button>
            {facultyLoading && <p className="text-sm text-gray-500">Loading...</p>}
            {!facultyLoading && facultyDetails && !facultyDetails.error && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Faculty Details</h3>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100">
                    <Image src={facultyDetails.imageUrl || '/avatar.png'} alt={facultyDetails.firstName || ''} width={64} height={64} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">{facultyDetails.firstName} {facultyDetails.lastName}</p>
                    <p className="text-xs text-gray-500">{facultyDetails.email}</p>
                    <p className="text-xs text-gray-500">{facultyDetails.mobile}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="text-gray-500">Department</div>
                  <div className="text-gray-700">{facultyDetails.department}</div>
                  <div className="text-gray-500">Designation</div>
                  <div className="text-gray-700">{Array.isArray(facultyDetails.designation) ? facultyDetails.designation.join(', ') : facultyDetails.designation}</div>
                  <div className="text-gray-500">Account Status</div>
                  <div className="text-gray-700">{facultyDetails.accountStatus}</div>
                  <div className="text-gray-500">Rating</div>
                  <div className="text-gray-700 flex items-center gap-2">
                    <span className="text-yellow-500">★</span>
                    <span>{facultyDetails.rating ? facultyDetails.rating.toFixed(1) : 'N/A'}</span>
                  </div>
                </div>
              </div>
            )}
            {!facultyLoading && facultyDetails?.error && (
              <p className="text-sm text-red-500">{facultyDetails.error}</p>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
