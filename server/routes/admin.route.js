import { Router } from "express";
import { loginAdmin, logoutAdmin, refreshAdminAccessToken, changeAdminPassword, updateAdminAccountDetails, updateAdminImage } from "../controllers/admin.controller.js";
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

export default router;