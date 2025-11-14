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
