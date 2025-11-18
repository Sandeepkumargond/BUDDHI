import { Router } from "express";
import { loginAdmin, logoutAdmin, refreshAdminAccessToken, changeAdminPassword, updateAdminAccountDetails, updateAdminImage, createStudent, createFaculty, createSubAdmin, deleteStudent, deleteFaculty, deleteSubAdmin } from "../controllers/admin.controller.js";
import { authenticateAdmin } from "../middlewares/admin.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route('/login').post(loginAdmin);

router.route('/logout').post(
    authenticateAdmin,
    logoutAdmin
);

router.route('/refresh-access-token').post(refreshAdminAccessToken);

router.route('/change-password').post(
    authenticateAdmin,
    changeAdminPassword
);

router.route('/update-account').patch(
    authenticateAdmin,
    updateAdminAccountDetails
);

router.route('/update-image').patch(
    authenticateAdmin
    , upload.single("image"),
    updateAdminImage
);

router.route('/create-student').post(
    authenticateAdmin,
    createStudent
)

router.route('/create-faculty').post(
    authenticateAdmin,
    createFaculty
)

router.route('/create-subAdmin').post(
    authenticateAdmin,
    createSubAdmin
)

router.route('/delete-student').delete(
    authenticateAdmin,
    deleteStudent
)

router.route('/delete-faculty').delete(
    authenticateAdmin,
    deleteFaculty
)

router.route('/delete-sub-admin').delete(
    authenticateAdmin,
    deleteSubAdmin
)

export default router;