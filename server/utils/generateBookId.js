import { Counter } from "../models/counter.model.js";

/**
 * Generates a unique book ID in format: BK-YYYY-NNNNNN
 * Example: BK-2024-000001
 */
export const generateBookId = async () => {
    const year = new Date().getFullYear();
    const counterName = `book_${year}`;

    try {
        const counter = await Counter.findOneAndUpdate(
            { name: counterName },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );

        const paddedNumber = String(counter.seq).padStart(6, '0');
        return `BK-${year}-${paddedNumber}`;
    } catch (error) {
        console.error("Error generating book ID:", error);
        // Fallback to timestamp-based ID
        return `BK-${year}-${Date.now()}`;
    }
};

/**
 * Generates a unique agreement ID in format: AGR-YYYY-NNNNNN
 * Example: AGR-2024-000001
 */
export const generateAgreementId = async () => {
    const year = new Date().getFullYear();
    const counterName = `agreement_${year}`;

    try {
        const counter = await Counter.findOneAndUpdate(
            { name: counterName },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );

        const paddedNumber = String(counter.seq).padStart(6, '0');
        return `AGR-${year}-${paddedNumber}`;
    } catch (error) {
        console.error("Error generating agreement ID:", error);
        // Fallback to timestamp-based ID
        return `AGR-${year}-${Date.now()}`;
    }
};
