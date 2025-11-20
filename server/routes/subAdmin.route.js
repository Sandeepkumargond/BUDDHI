import { Router } from "express";
import { changeSubAdminPassword, createFaculty, createStudent, loginSubAdmin, logoutSubAdmin, refreshSubAdminAccessToken, updateSubAdminAccountDetails, updateSubAdminImage, getAllStudents} from "../controllers/subAdmin.controller.js";
import { authenticateSubAdmin } from "../middlewares/subAdmin.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route('/login').post(loginSubAdmin);

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

router.route('/create-faculty').post(
    authenticateSubAdmin,
    createFaculty
)

router.route("/students").get(
    authenticateSubAdmin,
    getAllStudents
);


export default router;