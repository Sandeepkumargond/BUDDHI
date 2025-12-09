// Quick test script to check library data
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Admin } from './models/admin.model.js';
import { Student } from './models/student.model.js';
import { SubAdmin } from './models/subAdmin.model.js';
import { LibraryInventory } from './models/libraryInventory.model.js';

dotenv.config();

const checkData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 15000,
            family: 4,
        });
        console.log('✅ Connected to MongoDB\n');

        // Get all admins
        const admins = await Admin.find().select('_id collegeName abbreviation collegeRegistartionNo');
        console.log('📚 ADMINS (Institutes):');
        admins.forEach(admin => {
            console.log(`  - ${admin.collegeName} (${admin.abbreviation})`);
            console.log(`    ID: ${admin._id}`);
            console.log(`    Reg No: ${admin.collegeRegistartionNo}\n`);
        });

        // Get students
        const students = await Student.find().select('enrollmentNo email firstName lastName collegeName');
        console.log('\n👨‍🎓 STUDENTS:');
        students.forEach(student => {
            console.log(`  - ${student.firstName} ${student.lastName} (${student.email})`);
            console.log(`    Enrollment: ${student.enrollmentNo}`);
            console.log(`    College: ${student.collegeName || 'N/A'}\n`);
        });

        // Get sub admins
        const subAdmins = await SubAdmin.find().select('subAdminId firstName lastName  email collegeRegistartionNo collegeName');
        console.log('\n👔 SUB ADMINS:');
        subAdmins.forEach(subAdmin => {
            console.log(`  - ${subAdmin.firstName} ${subAdmin.lastName} (${subAdmin.email})`);
            console.log(`    Sub Admin ID: ${subAdmin.subAdminId}`);
            console.log(`    College: ${subAdmin.collegeName}`);
            console.log(`    Reg No: ${subAdmin.collegeRegistartionNo}\n`);
        });

        // Get library inventory by institute
        for (const admin of admins) {
            const books = await LibraryInventory.find({ instituteId: admin._id });
            console.log(`\n📖 BOOKS FOR ${admin.collegeName}:`);
            console.log(`  Total: ${books.length}`);
            console.log(`  Shareable: ${books.filter(b => b.isShareable).length}`);
            if (books.length > 0) {
                console.log(`  Sample books:`);
                books.slice(0, 3).forEach(book => {
                    console.log(`    - ${book.title} (${book.bookId}) - Shareable: ${book.isShareable}`);
                });
            }
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

checkData();
