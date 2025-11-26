import { Counter } from "../models/counter.model.js";

/**
 * Generate the next enrollment number for a given year.
 * Uses an atomic counter in the Counter collection to avoid races.
 *
 * @param {number|string} [year] - optional year (defaults to current year)
 * @param {number} [pad=6] - number of digits to pad the sequential part
 * @returns {string} formatted enrollment number: <year><padded-seq>
 */
export async function generateEnrollmentNo(year = new Date().getFullYear(), pad = 6) {
    const yr = String(year);

    const counterKey = `enrollment_${yr}`;

    const result = await Counter.findOneAndUpdate(
        { _id: counterKey },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
    ).lean();

    const seq = String(result.seq).padStart(pad, "0");

    return `${yr}${seq}`;
}

/**
 * Generate the next roll number for a program+branch (optionally scoped by year).
 * This keeps a separate atomic counter per program, branch and year to guarantee
 * unique, incrementing roll numbers within that scope.
 *
 * @param {string} program - program identifier (e.g. "BTech")
 * @param {string} branch - branch identifier (e.g. "CSE")
 * @param {number|string} [year] - optional year (defaults to current year)
 * @param {number} [pad=4] - number of digits to pad the sequential part
 * @returns {{ raw: number, formatted: string }} raw seq and a formatted string (year + padded seq)
 */
export async function generateRollNo(prefix, year = new Date().getFullYear(), pad = 4) {
    if (!prefix) {
        throw new Error("program and branch are required to generate roll number");
    }

    const yr = String(year);

    const counterKey = `roll_${prefix}_${yr}`;

    const result = await Counter.findOneAndUpdate(
        { _id: counterKey },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
    ).lean();

    const seq = String(result.seq).padStart(pad, "0");

    return { raw: result.seq, formatted: `${yr}${seq}` };
}


/**
 * Generate the next faculty ID for a department (optionally scoped by year).
 * Uses an atomic counter in the Counter collection to guarantee unique,
 * incrementing IDs per department per year.
 *
 * @param {string} departmentCode - short department code (e.g. 'CSE')
 * @param {number|string} [year=new Date().getFullYear()] - year scope for the ID
 * @param {number} [pad=3] - number of digits to pad the sequential part
 * @returns {string} formatted faculty id like '2025_CSE_001'
 */
export async function generateFacultyId(departmentCode, year = new Date().getFullYear(), pad = 3) {
    if (!departmentCode) {
        throw new Error("departmentCode is required to generate faculty ID");
    }

    const yr = String(year)

    const counterKey = `faculty_${departmentCode}_${yr}`;
    
    const result = await Counter.findOneAndUpdate(
        { _id: counterKey },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
    ).lean();

    const seq = String(result.seq).padStart(pad, "0");

    return `${yr}_${departmentCode}_${seq}`;
}

/**
 * Generate the next sub-admin ID for a department.
 * Format: <DEPT><YEAR><SEQ_PADDED>
 * Example: CSE2025001
 */
export async function generateSubAdminId(departmentCode, year = new Date().getFullYear(), pad = 3) {
    if (!departmentCode) throw new Error('departmentCode is required to generate sub-admin id');

    const yr = String(year);
    const counterKey = `subadmin_${departmentCode}_${yr}`;

    const result = await Counter.findOneAndUpdate(
        { _id: counterKey },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
    ).lean();

    const seq = String(result.seq).padStart(pad, '0');

    return `${departmentCode}${yr}${seq}`;
}