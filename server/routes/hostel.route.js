import { Router } from "express";
import { createOrUpdateHostel, listHostels, submitHostelApplication, listApplications, getStudentHostelAllocation, updateHostelAllocation, removeHostelAllocation, deleteHostel } from "../controllers/hostel.controller.js";
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
