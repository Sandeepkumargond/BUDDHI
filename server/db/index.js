import mongoose from "mongoose";
import dotenv from "dotenv";
import { FeePayment } from "../models/feePayment.model.js";

dotenv.config();

const connectDB = async () => {
    const uri = process.env.MONGODB_URI;
    const directUri = process.env.MONGODB_URI_DIRECT; // optional non-SRV fallback
    const options = {
        serverSelectionTimeoutMS: 15000,
        family: 4,
    };

    const tryConnect = async (connectionString, label) => {
        await mongoose.connect(connectionString, options);
        console.log(`MongoDB connected successfully (${label})`);
    };

    try {
        try {
            await tryConnect(uri, 'primary');
        } catch (primaryErr) {
            const msg = String(primaryErr?.message || primaryErr);
            const looksLikeSrvDns = msg.includes('querySrv') || msg.includes('_mongodb._tcp');
            if (looksLikeSrvDns && directUri) {
                console.warn('SRV DNS failed, attempting direct connection string...');
                await tryConnect(directUri, 'direct');
            } else {
                throw primaryErr;
            }
        }

        // One-time index migration to avoid duplicate null transactionId
        try {
            const coll = mongoose.connection.collection('feepayments');
            const indexes = await coll.indexes();
            // Drop any legacy transactionId indexes without partial filter or unique
            for (const idx of indexes) {
                const isTxnIdx = idx?.key && Object.keys(idx.key).length === 1 && idx.key.transactionId === 1;
                const isLegacy = isTxnIdx && (!idx.partialFilterExpression || idx.unique !== true);
                if (isLegacy) {
                    try {
                        await coll.dropIndex(idx.name);
                    } catch (e) {
                        if (e.codeName !== 'IndexNotFound') {
                            console.warn(`Could not drop legacy txn index ${idx.name}:`, e.message);
                        }
                    }
                }
            }
            // Ensure the correct partial unique txn index exists with explicit name
            await coll.createIndex(
                { transactionId: 1 },
                {
                    name: 'transactionId_1_payment_unique',
                    unique: true,
                    partialFilterExpression: { docType: 'payment', transactionId: { $type: 'string' } }
                }
            );
            // Drop legacy unique structure scope index if present
            const legacyStructIdx = indexes.find(i => i.name === 'branch_1_semester_1_session_1_category_1' && i.unique);
            if (legacyStructIdx) {
                try {
                    await coll.dropIndex('branch_1_semester_1_session_1_category_1');
                    console.log('Dropped legacy unique structure scope index');
                } catch (e) {
                    if (e.codeName !== 'IndexNotFound') {
                        console.warn('Could not drop legacy structure scope index:', e.message);
                    }
                }
            }
            await FeePayment.syncIndexes();
        } catch (e) {
            console.warn('Index sync warning:', e.message);
        }

        // Ensure courses collection does not enforce unique (departmentId, code)
        try {
            const courseColl = mongoose.connection.collection('courses');
            const courseIndexes = await courseColl.indexes();
            for (const idx of courseIndexes) {
                const keys = idx?.key || {};
                const isDeptCodeIdx = keys.departmentId === 1 && keys.code === 1 && Object.keys(keys).length === 2;
                if (isDeptCodeIdx && idx.unique) {
                    try {
                        await courseColl.dropIndex(idx.name);
                        console.log(`Dropped unique index on courses: ${idx.name}`);
                    } catch (e) {
                        if (e.codeName !== 'IndexNotFound') {
                            console.warn(`Could not drop courses index ${idx.name}:`, e.message);
                        }
                    }
                }
            }
            // Recreate a non-unique index for performance
            await courseColl.createIndex({ departmentId: 1, code: 1 }, { name: 'departmentId_1_code_1' });
        } catch (e) {
            console.warn('Courses index sync warning:', e.message);
        }

        // Seed departments if missing
        try {
            const Department = (await import('../models/department.model.js')).Department;
            const seeds = [
                { code: 'CSE', name: 'Computer Science & Engineering', established: 1995 },
                { code: 'EE', name: 'Electrical Engineering', established: 1988 },
                { code: 'ME', name: 'Mechanical Engineering', established: 1975 },
                { code: 'CE', name: 'Civil Engineering', established: 1965 },
                { code: 'ECE', name: 'Electronics & Communication Engineering', established: 1992 },
            ];
            for (const s of seeds) {
                await Department.updateOne({ code: s.code }, { $setOnInsert: s }, { upsert: true });
            }
        } catch (e) {
            console.warn('Department seeding warning:', e.message);
        }
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
        console.error("Hint: If you're behind a DNS/firewall that blocks SRV lookups, set MONGODB_URI_DIRECT to a non-SRV connection string (mongodb://host:27017/db). Also ensure network access to the cluster.");
        process.exit(1);
    }
};

export default connectDB;