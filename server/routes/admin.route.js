import { Router } from "express";
import { loginAdmin, logoutAdmin, refreshAdminAccessToken, changeAdminPassword, updateAdminAccountDetails, updateAdminImage, createStudent, createFaculty, createSubAdmin, deleteStudent, deleteFaculty, deleteSubAdmin, getAllFaculty } from "../controllers/admin.controller.js";
import { adminGetFeePaymentById, adminGetReceiptRedirect, adminListFeePayments } from "../controllers/feePayment.controller.js";
import { validateAdminFeePaymentQuery } from "../middlewares/feePayment.middleware.js";
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

// Fee payment admin queries
router.route('/fee-payments').get(
    authenticateAdmin,
    validateAdminFeePaymentQuery,
    adminListFeePayments
)

router.route('/fee-payment/:id').get(
    authenticateAdmin,
    adminGetFeePaymentById
)

router.route('/fee-payment/:id/receipt').get(
    authenticateAdmin,
    adminGetReceiptRedirect
)

// Fee structures (admin)
router.route('/fee-structure').post(
    authenticateAdmin,
    validateCreateFeeStructure,
    adminCreateFeeStructure
)

router.route('/fee-structures').get(
    authenticateAdmin,
    adminListFeeStructures
)

router.route('/fee-structure/:id').get(
    authenticateAdmin,
    adminGetFeeStructureById
)

router.route('/fee-structure/:id/publish').patch(
    authenticateAdmin,
    adminPublishFeeStructure
)
router.route('/get-all-faculty').get(getAllFaculty);

export default router;