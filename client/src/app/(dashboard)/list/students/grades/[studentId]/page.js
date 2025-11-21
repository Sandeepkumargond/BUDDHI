"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiService } from "@/lib/api";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default function StudentGradeDetailsPage() {
  const { user: authUser, role } = useAuth();
  const router = useRouter();
  const params = useParams();
  const studentId = params.studentId;

  const [student, setStudent] = useState(null);
  const [gradeCards, setGradeCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch student details and grade cards
        const [studentResponse, gradesResponse] = await Promise.all([
          apiService.request(`/student/${studentId}`),
          apiService.request(`/grades/admin/student/${studentId}`)
        ]);

        if (studentResponse.success && studentResponse.data) {
          setStudent(studentResponse.data);
        }

        if (gradesResponse.success && gradesResponse.data) {
          const cards = gradesResponse.data.gradeCards || [];
          setGradeCards(cards);
          
          // Set initial selected semester to latest
          if (cards.length > 0) {
            const latestSem = Math.max(...cards.map(c => c.semester));
            setSelectedSemester(latestSem);
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message || 'Failed to fetch student data');
      } finally {
        setLoading(false);
      }
    };

    if (studentId && (role === 'admin' || role === 'sub-admin')) {
      fetchData();
    }
  }, [studentId, role]);

  const calculateCGPA = (cards) => {
    if (cards.length === 0) return 0;
    
    let totalWeightedPoints = 0;
    let totalCredits = 0;
    
    cards.forEach(card => {
      totalWeightedPoints += card.sgpa * card.creditsEarned;
      totalCredits += card.creditsEarned;
    });
    
    return totalCredits > 0 ? +(totalWeightedPoints / totalCredits).toFixed(2) : 0;
  };

  const selectedGradeCard = gradeCards.find(card => card.semester === selectedSemester);
  const cgpa = calculateCGPA(gradeCards);
  const totalCredits = gradeCards.reduce((sum, card) => sum + card.creditsEarned, 0);

  if (role !== 'admin' && role !== 'sub-admin') {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600">Access Denied</h2>
          <p className="text-gray-600 mt-2">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading student grades...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error</h3>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Student Not Found</h3>
          <p className="text-gray-600">The requested student could not be found.</p>
          <button
            onClick={() => router.back()}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex items-center space-x-4">
          <div className="shrink-0">
            <Image
              className="h-16 w-16 rounded-full object-cover"
              src={student.imageUrl || "/student.png"}
              alt=""
              width={64}
              height={64}
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {student.firstName} {student.lastName}
            </h1>
            <p className="text-gray-600">Roll No: {student.rollNo} | Enrollment: {student.enrollmentNo}</p>
            <p className="text-gray-600">{student.program} - {student.branch} | Semester {student.semester}</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <Link
            href={`/list/students/grades/${studentId}/edit`}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            Add/Edit Grades
          </Link>
          <button
            onClick={() => router.back()}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
          >
            Back
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg border">
          <div className="text-sm text-gray-500">CGPA</div>
          <div className="text-2xl font-bold text-blue-600">{cgpa}</div>
        </div>
        <div className="bg-white p-6 rounded-lg border">
          <div className="text-sm text-gray-500">Total Credits</div>
          <div className="text-2xl font-bold text-green-600">{totalCredits}</div>
        </div>
        <div className="bg-white p-6 rounded-lg border">
          <div className="text-sm text-gray-500">Semesters Completed</div>
          <div className="text-2xl font-bold text-purple-600">{gradeCards.length}</div>
        </div>
        <div className="bg-white p-6 rounded-lg border">
          <div className="text-sm text-gray-500">Academic Status</div>
          <div className={`text-2xl font-bold ${
            gradeCards.some(card => card.status !== 'Pass') ? 'text-red-600' : 'text-green-600'
          }`}>
            {gradeCards.some(card => card.status !== 'Pass') ? 'Backlogs' : 'Regular'}
          </div>
        </div>
      </div>

      {gradeCards.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No Grade Cards Available</h3>
          <p className="mt-1 text-sm text-gray-500">This student doesn't have any grade cards yet.</p>
          <div className="mt-6">
            <Link
              href={`/list/students/grades/${studentId}/edit`}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Add First Grade Card
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Semester Selector */}
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Grade Cards by Semester</h3>
              <select
                value={selectedSemester || ''}
                onChange={(e) => setSelectedSemester(parseInt(e.target.value))}
                className="border border-gray-300 rounded-lg px-3 py-2"
              >
                {gradeCards.map(card => (
                  <option key={card.semester} value={card.semester}>
                    Semester {card.semester} (SGPA: {card.sgpa})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Selected Semester Details */}
          {selectedGradeCard && (
            <div className="bg-white rounded-lg border">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">
                      Semester {selectedGradeCard.semester} - {selectedGradeCard.academicYear}
                    </h3>
                    <p className="text-gray-600">
                      {selectedGradeCard.examType} Examination
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">SGPA</div>
                    <div className="text-xl font-bold text-blue-600">{selectedGradeCard.sgpa}</div>
                  </div>
                </div>
                
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm text-gray-500">Credits Attempted</div>
                    <div className="font-semibold">{selectedGradeCard.creditsAttempted}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Credits Earned</div>
                    <div className="font-semibold">{selectedGradeCard.creditsEarned}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Status</div>
                    <div className={`font-semibold ${
                      selectedGradeCard.status === 'Pass' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {selectedGradeCard.status}
                    </div>
                  </div>
                </div>
              </div>

              {/* Subjects Table */}
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 font-medium text-gray-900">Code</th>
                        <th className="text-left p-3 font-medium text-gray-900">Subject</th>
                        <th className="text-left p-3 font-medium text-gray-900">Type</th>
                        <th className="text-left p-3 font-medium text-gray-900">Credits</th>
                        <th className="text-left p-3 font-medium text-gray-900">Internal</th>
                        <th className="text-left p-3 font-medium text-gray-900">External</th>
                        <th className="text-left p-3 font-medium text-gray-900">Total</th>
                        <th className="text-left p-3 font-medium text-gray-900">Grade</th>
                        <th className="text-left p-3 font-medium text-gray-900">Grade Point</th>
                        <th className="text-left p-3 font-medium text-gray-900">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedGradeCard.subjects.map((subject, index) => (
                        <tr key={index} className={`border-b ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                          <td className="p-3 font-mono text-sm">{subject.code}</td>
                          <td className="p-3">{subject.name}</td>
                          <td className="p-3">{subject.type}</td>
                          <td className="p-3 text-center">{subject.credits}</td>
                          <td className="p-3 text-center">{subject.internal}</td>
                          <td className="p-3 text-center">{subject.external}</td>
                          <td className="p-3 text-center font-semibold">{subject.total}</td>
                          <td className="p-3 text-center">
                            <span className={`font-semibold ${
                              subject.grade === 'F' ? 'text-red-600' : 'text-green-600'
                            }`}>
                              {subject.grade}
                            </span>
                          </td>
                          <td className="p-3 text-center">{subject.gradePoint}</td>
                          <td className="p-3 text-center">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              subject.status === 'Pass' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {subject.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* All Semesters Overview */}
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">Academic Progress Overview</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
              {gradeCards.map(card => (
                <div
                  key={card.semester}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                    selectedSemester === card.semester
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedSemester(card.semester)}
                >
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-900">Sem {card.semester}</div>
                    <div className="text-lg font-bold text-blue-600">{card.sgpa}</div>
                    <div className="text-xs text-gray-500">{card.creditsEarned} credits</div>
                    <div className={`text-xs font-medium ${
                      card.status === 'Pass' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {card.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}