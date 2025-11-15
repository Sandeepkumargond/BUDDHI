import { Router } from "express";
import { authenticateStudent } from "../middlewares/student.middleware.js";
import { availableMail, changeStudentPassword, getStudentById, loginStudent, logoutStudent, refreshStudentAccessToken, updateStudentAccountDetails, updateStudentImage } from "../controllers/student.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/:id").get(getStudentById);

router.route('/login').post(loginStudent);

router.route('/logout').post(
    authenticateStudent,
    logoutStudent
);

router.route('/refresh-access-token').post(refreshStudentAccessToken);

router.route('/change-password').post(
    authenticateStudent,
    changeStudentPassword
);

router.route('/update-account').patch(
    authenticateStudent,
    updateStudentAccountDetails
);

router.route('/update-image').patch(
    authenticateStudent
    , upload.single("image"),
    updateStudentImage
);

router.route('/available-mail').post(
    availableMail
);

export default router;