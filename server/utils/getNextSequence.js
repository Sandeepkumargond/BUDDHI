import { Counter } from "../models/counter.model.js";

export async function generateCollegeRegistrationNo() {
    const year = new Date().getFullYear();

    // Use a unique counter key per year
    const counterKey = `collegeReg_${year}`;

    const result = await Counter.findOneAndUpdate(
        { _id: counterKey },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
    ).lean();

    const seq = String(result.seq).padStart(7, "0"); // 7-digit padded number

    return `${year}${seq}`;
}
