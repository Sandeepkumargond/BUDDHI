import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Admin } from './models/admin.model.js';
import { SharedLibraryAgreement } from './models/sharedLibraryAgreement.model.js';
import { LibraryInventory } from './models/libraryInventory.model.js';
import bcrypt from 'bcrypt';

dotenv.config();

const seedLibraryData = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 15000,
            family: 4,
        });
        console.log('✅ Connected to MongoDB');

        // Clear existing library data
        await SharedLibraryAgreement.deleteMany({});
        await LibraryInventory.deleteMany({});
        console.log('🗑️  Cleared existing library data');

        // Check if we have at least 2 admins, if not create them
        let admins = await Admin.find().limit(2);

        if (admins.length < 2) {
            console.log('📝 Creating mock admin institutes...');

            const hashedPassword = await bcrypt.hash('admin123', 10);

            const mockAdmins = [
                {
                    firstName: 'Rajesh',
                    lastName: 'Kumar',
                    email: 'admin@mitindia.edu',
                    personalMail: 'rajesh.kumar@gmail.com',
                    password: hashedPassword,
                    collegeName: 'MIT India',
                    collegeRegistartionNo: 'MIT_2024',
                    abbreviation: 'MIT',
                    mobile: 9876543210,
                },
                {
                    firstName: 'Priya',
                    lastName: 'Sharma',
                    email: 'admin@iitdelhi.ac.in',
                    personalMail: 'priya.sharma@gmail.com',
                    password: hashedPassword,
                    collegeName: 'IIT Delhi',
                    collegeRegistartionNo: 'IITD_2024',
                    abbreviation: 'IITD',
                    mobile: 9876543211,
                }
            ];

            // Only create admins that don't exist
            for (const mockAdmin of mockAdmins) {
                const exists = await Admin.findOne({ email: mockAdmin.email });
                if (!exists) {
                    await Admin.create(mockAdmin);
                    console.log(`   ✅ Created admin for ${mockAdmin.collegeName}`);
                }
            }

            admins = await Admin.find().limit(2);
        }

        if (admins.length < 2) {
            console.error('❌ Need at least 2 admins to create library sharing. Please create admins first.');
            process.exit(1);
        }

        const [instituteA, instituteB] = admins;
        console.log(`\n📚 Setting up library sharing between:`);
        console.log(`   - ${instituteA.collegeName} (${instituteA.abbreviation})`);
        console.log(`   - ${instituteB.collegeName} (${instituteB.abbreviation})`);

        // Create sharing agreements (bidirectional)
        const agreement1 = await SharedLibraryAgreement.create({
            agreementId: `AGR-2024-000001`,
            sharingInstituteId: instituteA._id,
            accessInstituteId: instituteB._id,
            sharingPolicy: 'Selected Resources',
            status: 'Active',
        });

        const agreement2 = await SharedLibraryAgreement.create({
            agreementId: `AGR-2024-000002`,
            sharingInstituteId: instituteB._id,
            accessInstituteId: instituteA._id,
            sharingPolicy: 'Full E-Book Catalogue',
            status: 'Active',
        });

        console.log('\n✅ Created sharing agreements');

        // Mock books data
        const PDF_LINK = 'http://freedownloads.dishapublication.com/wp-content/uploads/2024/05/164-Jee-Main-iii-iv.pdf';

        const booksForInstituteA = [
            {
                title: 'Transformer Architectures in Deep Learning',
                author: 'Vaswani et al.',
                category: 'E-Book',
                accessLink: PDF_LINK,
                isbn: '978-1234567890',
                publicationYear: 2023,
                publisher: 'Tech Publications',
                description: 'Comprehensive guide to transformer models and attention mechanisms',
                isShareable: true,
            },
            {
                title: 'Deep Learning Fundamentals',
                author: 'Ian Goodfellow',
                category: 'E-Book',
                accessLink: PDF_LINK,
                isbn: '978-0262035613',
                publicationYear: 2022,
                publisher: 'MIT Press',
                description: 'Introduction to deep learning concepts and applications',
                isShareable: true,
            },
            {
                title: 'Advanced Neural Networks',
                author: 'Geoffrey Hinton',
                category: 'E-Book',
                accessLink: PDF_LINK,
                isbn: '978-1234567891',
                publicationYear: 2023,
                publisher: 'Academic Press',
                description: 'Advanced concepts in neural network architectures',
                isShareable: false, // Not shareable
            },
            {
                title: 'Computer Vision with PyTorch',
                author: 'Adrian Rosebrock',
                category: 'E-Book',
                accessLink: PDF_LINK,
                isbn: '978-1234567892',
                publicationYear: 2023,
                publisher: 'PyImageSearch',
                description: 'Practical computer vision with PyTorch framework',
                isShareable: true,
            },
            {
                title: 'Natural Language Processing',
                author: 'Dan Jurafsky',
                category: 'E-Book',
                accessLink: PDF_LINK,
                isbn: '978-0131873216',
                publicationYear: 2021,
                publisher: 'Pearson',
                description: 'Comprehensive NLP textbook',
                isShareable: true,
            },
            {
                title: 'Reinforcement Learning: An Introduction',
                author: 'Richard Sutton',
                category: 'E-Book',
                accessLink: PDF_LINK,
                isbn: '978-0262039246',
                publicationYear: 2020,
                publisher: 'MIT Press',
                description: 'Foundation of reinforcement learning',
                isShareable: false, // Not shareable
            },
            {
                title: 'Graph Neural Networks',
                author: 'Michael Bronstein',
                category: 'Research Paper',
                accessLink: PDF_LINK,
                isbn: '978-1234567893',
                publicationYear: 2024,
                publisher: 'Springer',
                description: 'Latest research on GNNs',
                isShareable: true,
            },
            {
                title: 'Generative Adversarial Networks',
                author: 'Ian Goodfellow',
                category: 'Journal',
                accessLink: PDF_LINK,
                isbn: '978-1234567894',
                publicationYear: 2023,
                publisher: 'Nature',
                description: 'Comprehensive guide to GANs',
                isShareable: false, // Not shareable
            },
            {
                title: 'Quantum Machine Learning',
                author: 'Peter Wittek',
                category: 'E-Book',
                accessLink: PDF_LINK,
                isbn: '978-0128100400',
                publicationYear: 2023,
                publisher: 'Academic Press',
                description: 'Intersection of quantum computing and ML',
                isShareable: true,
            },
            {
                title: 'Ethics in AI',
                author: 'Timnit Gebru',
                category: 'Reference Material',
                accessLink: PDF_LINK,
                isbn: '978-1234567895',
                publicationYear: 2023,
                publisher: 'Oxford University Press',
                description: 'Ethical considerations in AI development',
                isShareable: false, // Not shareable
            },
        ];

        const booksForInstituteB = [
            {
                title: 'Cloud Computing Architecture',
                author: 'Thomas Erl',
                category: 'E-Book',
                accessLink: PDF_LINK,
                isbn: '978-0133858563',
                publicationYear: 2023,
                publisher: 'Prentice Hall',
                description: 'Comprehensive guide to cloud architecture',
                isShareable: true,
            },
            {
                title: 'Distributed Systems',
                author: 'Andrew Tanenbaum',
                category: 'E-Book',
                accessLink: PDF_LINK,
                isbn: '978-1543057386',
                publicationYear: 2022,
                publisher: 'CreateSpace',
                description: 'Principles and paradigms of distributed systems',
                isShareable: true,
            },
            {
                title: 'Microservices Patterns',
                author: 'Chris Richardson',
                category: 'E-Book',
                accessLink: PDF_LINK,
                isbn: '978-1617294549',
                publicationYear: 2021,
                publisher: 'Manning',
                description: 'Design patterns for microservices',
                isShareable: false, // Not shareable
            },
            {
                title: 'Kubernetes in Action',
                author: 'Marko Luksa',
                category: 'E-Book',
                accessLink: PDF_LINK,
                isbn: '978-1617293726',
                publicationYear: 2023,
                publisher: 'Manning',
                description: 'Practical Kubernetes guide',
                isShareable: true,
            },
            {
                title: 'DevOps Handbook',
                author: 'Gene Kim',
                category: 'E-Book',
                accessLink: PDF_LINK,
                isbn: '978-1942788003',
                publicationYear: 2021,
                publisher: 'IT Revolution',
                description: 'DevOps best practices',
                isShareable: true,
            },
            {
                title: 'System Design Interview',
                author: 'Alex Xu',
                category: 'E-Book',
                accessLink: PDF_LINK,
                isbn: '978-1736049112',
                publicationYear: 2023,
                publisher: 'ByteByteGo',
                description: 'System design interview preparation',
                isShareable: false, // Not shareable
            },
            {
                title: 'Site Reliability Engineering',
                author: 'Betsy Beyer',
                category: 'E-Book',
                accessLink: PDF_LINK,
                isbn: '978-1491929124',
                publicationYear: 2022,
                publisher: "O'Reilly",
                description: 'Google SRE practices',
                isShareable: true,
            },
            {
                title: 'Database Internals',
                author: 'Alex Petrov',
                category: 'E-Book',
                accessLink: PDF_LINK,
                isbn: '978-1492040347',
                publicationYear: 2023,
                publisher: "O'Reilly",
                description: 'Deep dive into database systems',
                isShareable: false, // Not shareable
            },
            {
                title: 'Clean Architecture',
                author: 'Robert C. Martin',
                category: 'E-Book',
                accessLink: PDF_LINK,
                isbn: '978-0134494166',
                publicationYear: 2021,
                publisher: 'Prentice Hall',
                description: 'Software architecture principles',
                isShareable: true,
            },
            {
                title: 'Domain-Driven Design',
                author: 'Eric Evans',
                category: 'E-Book',
                accessLink: PDF_LINK,
                isbn: '978-0321125217',
                publicationYear: 2020,
                publisher: 'Addison-Wesley',
                description: 'Tackling complexity in software',
                isShareable: true,
            },
        ];

        // Add books to Institute A
        let bookCounter = 1;
        for (const bookData of booksForInstituteA) {
            await LibraryInventory.create({
                bookId: `BK-2024-${String(bookCounter).padStart(6, '0')}`,
                ...bookData,
                instituteId: instituteA._id,
                isLocalAvailable: true,
            });
            bookCounter++;
        }
        console.log(`\n✅ Added ${booksForInstituteA.length} books to ${instituteA.collegeName}`);
        console.log(`   - ${booksForInstituteA.filter(b => b.isShareable).length} shareable`);
        console.log(`   - ${booksForInstituteA.filter(b => !b.isShareable).length} not shareable`);

        // Add books to Institute B
        for (const bookData of booksForInstituteB) {
            await LibraryInventory.create({
                bookId: `BK-2024-${String(bookCounter).padStart(6, '0')}`,
                ...bookData,
                instituteId: instituteB._id,
                isLocalAvailable: true,
            });
            bookCounter++;
        }
        console.log(`\n✅ Added ${booksForInstituteB.length} books to ${instituteB.collegeName}`);
        console.log(`   - ${booksForInstituteB.filter(b => b.isShareable).length} shareable`);
        console.log(`   - ${booksForInstituteB.filter(b => !b.isShareable).length} not shareable`);

        console.log('\n✅ Library seed data creation completed successfully!');
        console.log('\n📊 Summary:');
        console.log(`   - Institutes: 2`);
        console.log(`   - Sharing Agreements: 2 (bidirectional)`);
        console.log(`   - Total Books: ${booksForInstituteA.length + booksForInstituteB.length}`);
        console.log(`   - Institute A Books: ${booksForInstituteA.length} (${booksForInstituteA.filter(b => b.isShareable).length} shareable)`);
        console.log(`   - Institute B Books: ${booksForInstituteB.length} (${booksForInstituteB.filter(b => b.isShareable).length} shareable)`);

        console.log('\n💡 Test Scenario:');
        console.log(`   1. Students from ${instituteB.collegeName} can search for "Transformer Architectures"`);
        console.log(`   2. They will find it in ${instituteA.collegeName}'s shareable inventory`);
        console.log(`   3. Students from ${instituteA.collegeName} can search for "Cloud Computing"`);
        console.log(`   4. They will find it in ${instituteB.collegeName}'s shareable inventory`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding library data:', error);
        process.exit(1);
    }
};

seedLibraryData();
