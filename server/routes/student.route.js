import { Router } from "express";
import { authenticateStudent } from "../middlewares/student.middleware.js";
import { availableMail, changeStudentPassword, getStudentById, loginStudent, logoutStudent, refreshStudentAccessToken, updateStudentAccountDetails, updateStudentImage } from "../controllers/student.controller.js";
import { createFeePayment, listMyFeePayments, getMyFeePaymentReceipt, getMyApplicableFeeStructure, getMyApplicableFeeStructures } from "../controllers/feePayment.controller.js";
import { validateCreateFeePayment } from "../middlewares/feePayment.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

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

// Fee Payments (student-auth only)
router.route('/fee-payment').post(
    authenticateStudent,
    upload.single("image"),
    validateCreateFeePayment,
    createFeePayment
);

router.route('/fee-payment').get(
    authenticateStudent,
    listMyFeePayments
);

router.route('/fee-payment/:id/receipt').get(
    authenticateStudent,
    getMyFeePaymentReceipt
);

// Fee Structure (student)
router.route('/fee-structure').get(
    authenticateStudent,
    getMyApplicableFeeStructure
)

router.route('/fee-structures').get(
    authenticateStudent,
    getMyApplicableFeeStructures
)

// Keep generic id route last (no regex due to router lib constraints)
router.route('/:id').get(getStudentById);

export default router;