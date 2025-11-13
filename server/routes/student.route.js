import { Router } from "express";
import { authenticateStudent } from "../middlewares/student.middleware.js";
import { getStudentById } from "../controllers/student.controller.js";

const router = Router();

router.route("/:id").get(getStudentById);

router.route("/change-password").post(authenticateStudent, changePassword);


export default router;