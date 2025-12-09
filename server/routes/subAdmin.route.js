import { Router } from "express";
import { changeSubAdminPassword, createFaculty, createStudent, updateStudent, getMyProfile, loginSubAdmin, logoutSubAdmin, refreshSubAdminAccessToken, updateSubAdminAccountDetails, updateSubAdminImage, getAllStudents, bulkCreateStudents, forgotPassword, verifyPasswordResetOTP, resetPassword} from "../controllers/subAdmin.controller.js";
import { authenticateSubAdmin } from "../middlewares/subAdmin.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// Password reset routes (public)
router.route('/forgot-password').post(forgotPassword);
router.route('/verify-otp').post(verifyPasswordResetOTP);
router.route('/reset-password').post(resetPassword);

router.route('/login').post(loginSubAdmin);

router.route('/profile').get(
    authenticateSubAdmin,
    getMyProfile
);

router.route('/logout').post(
    authenticateSubAdmin,
    logoutSubAdmin
);

router.route('/refresh-access-token').post(refreshSubAdminAccessToken);

router.route('/change-password').post(
    authenticateSubAdmin,
    changeSubAdminPassword
);

router.route('/update-account').patch(
    authenticateSubAdmin,
    updateSubAdminAccountDetails
);

router.route('/update-image').patch(
    authenticateSubAdmin
    , upload.single("image"),
    updateSubAdminImage
);

router.route('/create-student').post(
    authenticateSubAdmin,
    createStudent
)

router.route('/bulk-create-students').post(
    authenticateSubAdmin,
    bulkCreateStudents
)

router.route('/update-student/:id').patch(
    authenticateSubAdmin,
    updateStudent
)

router.route('/create-faculty').post(
    authenticateSubAdmin,
    createFaculty
)

router.route("/students").get(
    authenticateSubAdmin,
    getAllStudents
);


export default router;