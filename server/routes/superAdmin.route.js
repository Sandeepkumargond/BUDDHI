import { Router } from "express";
import { changeSuperAdminPassword, createAdmin, deleteAdmin, getAllAdmins, getMyProfile, getSuperAdminById, loginSuperAdmin, logoutSuperAdmin, refreshSuperAdminAccessToken, registerSuperAdmin, updateSuperAdminAccountDetails, updateSuperAdminImage, forgotPassword, verifyPasswordResetOTP, resetPassword } from "../controllers/superAdmin.controller.js";
import { authenticateSuperAdmin } from "../middlewares/superAdmin.middleware.js";
import { upload } from "../middlewares/multer.middleware.js"

const router = Router();


router.route("/register").post(registerSuperAdmin);

// Password reset routes (public)
router.route('/forgot-password').post(forgotPassword);
router.route('/verify-otp').post(verifyPasswordResetOTP);
router.route('/reset-password').post(resetPassword);

router.route("/login").post(loginSuperAdmin);

router.route('/profile').get(
    authenticateSuperAdmin,
    getMyProfile
);

// secured routes
router.route("/logout").post(
    authenticateSuperAdmin,
    logoutSuperAdmin
);

router.route('/refresh-access-token').post(refreshSuperAdminAccessToken);

router.route('/change-password').post(
    authenticateSuperAdmin,
    changeSuperAdminPassword
);

router.route('/update-account').patch(
    authenticateSuperAdmin,
    updateSuperAdminAccountDetails
);

router.route('/update-image').patch(
    authenticateSuperAdmin
    , upload.single("image"),
    updateSuperAdminImage
);

router.route('/create-admin').post(
    authenticateSuperAdmin,
    createAdmin
);

router.route('/delete-admin').delete(
    authenticateSuperAdmin,
    deleteAdmin
)

router.route("/get-admins").get(getAllAdmins);

router.route("/:id").get(getSuperAdminById);

export default router;