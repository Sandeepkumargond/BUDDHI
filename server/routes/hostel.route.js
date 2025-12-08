import { Router } from "express";
import { createOrUpdateHostel, listHostels, submitHostelApplication, listApplications, getStudentHostelAllocation, updateHostelAllocation, removeHostelAllocation, deleteHostel } from "../controllers/hostel.controller.js";
import { submitComplaint, getMyComplaints, getAllComplaints, getComplaintStats, updateComplaintStatus, getComplaintDetail, deleteComplaint, bulkUpdateComplaints } from "../controllers/hostelComplaint.controller.js";
import { authenticateAdmin } from "../middlewares/admin.middleware.js";
import { authenticateStudent } from "../middlewares/student.middleware.js";

const router = Router();

// Admin/faculty: create or update hostel & rooms
router.post("/admin/hostels", authenticateAdmin, createOrUpdateHostel);

// List hostels (both admin and student pages can use)
router.get("/hostels", listHostels);

// Student submits hostel application
router.post("/student/hostel/application", authenticateStudent, submitHostelApplication);

// Student view hostel allocation details
router.get("/student/hostel/allocation", authenticateStudent, getStudentHostelAllocation);

// Admin view applications
router.get("/admin/hostel/applications", authenticateAdmin, listApplications);

// Admin: Update hostel allocation (edit hostel/room for student)
router.put("/admin/hostel/allocation", authenticateAdmin, updateHostelAllocation);

// Admin: Remove student from hostel
router.delete("/admin/hostel/allocation", authenticateAdmin, removeHostelAllocation);

// Admin: Delete hostel
router.delete("/admin/hostels", authenticateAdmin, deleteHostel);

// ============= COMPLAINT ROUTES =============

// Student: Submit a complaint
router.post("/student/complaint", authenticateStudent, submitComplaint);

// Student: Get my complaints
router.get("/student/complaints", authenticateStudent, getMyComplaints);

// Admin: Get all complaints (with filters)
router.get("/admin/complaints", authenticateAdmin, getAllComplaints);

// Admin: Get complaint statistics
router.get("/admin/complaints/stats", authenticateAdmin, getComplaintStats);

// Admin/Student: Get complaint details
router.get("/complaint/:complaintId", getComplaintDetail);

// Admin: Update complaint status
router.put("/admin/complaint/:complaintId", authenticateAdmin, updateComplaintStatus);

// Admin: Delete complaint
router.delete("/admin/complaint/:complaintId", authenticateAdmin, deleteComplaint);

// Admin: Bulk update complaints
router.put("/admin/complaints/bulk-update", authenticateAdmin, bulkUpdateComplaints);

// Debug: Get all applications (remove in production)
router.get("/debug/all-applications", async (req, res) => {
  try {
    const { HostelApplication } = await import("../models/hostelApplication.model.js");
    const apps = await HostelApplication.find().lean();
    res.json({ total: apps.length, applications: apps });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
