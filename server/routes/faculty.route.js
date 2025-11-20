import { Router } from "express";
import { availableMail, changeFacultyPassword, getFacultyById, getMyProfile, loginFaculty, logoutFaculty, refreshFacultyAccessToken, updateFacultyAccountDetails, updateFacultyImage } from "../controllers/faculty.controller.js";
import { authenticateFaculty } from "../middlewares/faculty.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/:id").get(getFacultyById);

router.route('/login').post(loginFaculty);

router.route('/profile').get(
    authenticateFaculty,
    getMyProfile
);

router.route('/logout').post(
    authenticateFaculty,
    logoutFaculty
);

router.route('/refresh-access-token').post(refreshFacultyAccessToken);

router.route('/change-password').post(
    authenticateFaculty,
    changeFacultyPassword
);

router.route('/update-account').patch(
    authenticateFaculty,
    updateFacultyAccountDetails
);

router.route('/update-image').patch(
    authenticateFaculty
    , upload.single("image"),
    updateFacultyImage
);

router.route('/available-mail').post(
    availableMail
);

export default router;