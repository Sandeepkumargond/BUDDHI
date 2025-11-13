import { Router } from "express";
import { changeSuperAdminPassword, getSuperAdminById, loginSuperAdmin, logoutSuperAdmin, refreshSuperAdminAccessToken, registerSuperAdmin, updateSuperAdminAccountDetails, updateSuperAdminImage } from "../controllers/superAdmin.controller.js";
import { authenticateSuperAdmin } from "../middlewares/superAdmin.middleware.js";
import { upload } from "../middlewares/multer.middleware.js"

const router = Router();

router.route("/:id").get(getSuperAdminById);

router.route("/register").post(registerSuperAdmin);

router.route("/login").post(loginSuperAdmin);

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


export default router;