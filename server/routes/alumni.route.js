import { Router } from "express";
import {
    registerAlumni,
    loginAlumni,
    refreshAlumniAccessToken,
    logoutAlumni,
    getMyProfile,
    updateAlumniProfile,
    addInternshipOpportunity,
    updateInternshipOpportunity,
    deleteInternshipOpportunity,
    addReferral,
    updateReferral,
    deleteReferral,
    addDonation,
    listAllAlumni,
    getAlumniById,
    updateAlumniStatus,
    deleteAlumni,
    getAllInternshipOpportunities,
    forgotPassword,
    verifyPasswordResetOTP,
    resetPassword,
    getAllReferrals,
    getDonationStats,
    updateDonationStatus,
    updateInternshipApproval,
    updateReferralApproval,
} from "../controllers/alumni.controller.js";
import { authenticateAlumni } from "../middlewares/alumni.middleware.js";
import { authenticateAdmin } from "../middlewares/admin.middleware.js";

const router = Router();

// Admin routes for alumni management (MUST come first to avoid conflicts)
router.route("/admin/register").post(authenticateAdmin, registerAlumni);
router.route("/admin/list").get(authenticateAdmin, listAllAlumni);
router.route("/admin/stats/donations").get(authenticateAdmin, getDonationStats);
router.route("/admin/:alumniId/internships/:internshipId/approval").patch(authenticateAdmin, updateInternshipApproval);
router.route("/admin/:alumniId/referrals/:referralId/approval").patch(authenticateAdmin, updateReferralApproval);
router.route("/admin/:alumniId/status").patch(authenticateAdmin, updateAlumniStatus);
router.route("/admin/:alumniId/donations/:donationId/status").patch(authenticateAdmin, updateDonationStatus);
router.route("/admin/:alumniId").get(authenticateAdmin, getAlumniById);
router.route("/admin/:alumniId").delete(authenticateAdmin, deleteAlumni);

// Alumni authentication routes
// Password reset routes (public)
router.route('/forgot-password').post(forgotPassword);
router.route('/verify-otp').post(verifyPasswordResetOTP);
router.route('/reset-password').post(resetPassword);

router.route("/login").post(loginAlumni);
router.route("/refresh-access-token").post(refreshAlumniAccessToken);

// Alumni protected routes (specific routes before parametric)
router.route("/logout").post(authenticateAlumni, logoutAlumni);
router.route("/profile").get(authenticateAlumni, getMyProfile);
router.route("/profile/update").patch(authenticateAlumni, updateAlumniProfile);

// Alumni internship management (specific before parametric)
router.route("/internships/add").post(authenticateAlumni, addInternshipOpportunity);
router.route("/internships/:internshipId").patch(authenticateAlumni, updateInternshipOpportunity);
router.route("/internships/:internshipId").delete(authenticateAlumni, deleteInternshipOpportunity);

// Alumni referral management (specific before parametric)
router.route("/referrals/add").post(authenticateAlumni, addReferral);
router.route("/referrals/:referralId").patch(authenticateAlumni, updateReferral);
router.route("/referrals/:referralId").delete(authenticateAlumni, deleteReferral);

// Alumni donation management (specific before parametric)
router.route("/donations/add").post(authenticateAlumni, addDonation);

// Public routes (accessible by students/anyone) - MUST come last
router.route("/internships").get(getAllInternshipOpportunities);
router.route("/referrals").get(getAllReferrals);

export default router;
