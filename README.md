# Buddhi – Integrated Academic Management System

Buddhi is a full-stack, role-based academic management system designed to serve universities and colleges as a **low-cost, scalable alternative to traditional ERP solutions**. The platform unifies admissions, academics, finance, hostel, library, and alumni operations into a **single source of truth**, while providing real-time visibility to institutional authorities.

Buddhi was conceptualized and developed in alignment with a national-level governance challenge and is suitable for public institutions, autonomous colleges, and multi-campus universities.

---

## Problem Statement (Smart India Hackathon – Finalist)

**Problem Statement ID:** 25103
**Title:** ERP-based Integrated Student Management System
**Organization:** Government of Rajasthan
**Department:** Directorate of Technical Education (DTE)
**Category:** Software
**Theme:** Smart Automation

### Background

In many public educational institutions, critical processes such as admissions, fee collection, hostel allocation, library management, and examination records are maintained in isolated systems or manual ledgers. This fragmentation leads to repetitive data entry, long queues for students, operational inefficiencies, delayed reporting, and the absence of real-time institutional visibility for administrators.

### Core Challenge

Although comprehensive ERP solutions exist, they are often financially inaccessible for public colleges and technically complex for staff adoption. The challenge was to design an **integrated, secure, and affordable ERP-like system** that could:

* Centralize student data across departments
* Automate financial and administrative workflows
* Provide real-time dashboards for decision-makers
* Enforce role-based access and data security from day one
* Remain easy to adopt with a minimal learning curve

### Buddhi as the Proposed Solution

Buddhi directly addresses this challenge by offering an **end-to-end academic management platform** where:

* Admission data flows seamlessly into a centralized student database
* Fee transactions automatically generate digital receipts
* Hostel, library, academic, and examination records update in real time
* Administrators access live dashboards with institutional KPIs
* Role-based permissions and secure authentication are enforced system-wide

The system demonstrates how thoughtful process mapping, modern web technologies, and smart automation can deliver ERP-level functionality without expensive proprietary software or hardware-intensive infrastructure.

---

## Live System (Role-Based Access)

Buddhi provides dedicated dashboards with clearly separated permissions and workflows for each user role:

* Super Admin (University / Governing Body)
* Admin (College / Institution Head)
* Sub Admin (Admissions & Records)
* Faculty
* Student
* Alumni

---

## System Architecture

Buddhi follows a modular, service-oriented architecture to ensure scalability, security, and maintainability.

```
Client (Next.js + React)
        │
        ▼
Server (Node.js + Express REST API)
        │
        ▼
ML Service (FastAPI + PyTorch)
```

### Core Services

* **Frontend:** Next.js (App Router) with TailwindCSS
* **Backend:** Node.js, Express.js, MongoDB
* **ML Service:** FastAPI with PyTorch-based models
* **Real-Time Layer:** Socket.io

---

## Key Capabilities

* Multi-institution support
* Role-based access control (RBAC)
* Centralized student database
* Real-time dashboards and analytics
* Digital document generation (ID, Admit Card, Bonafide)
* Secure online fee payments (Razorpay)
* AI-driven student risk prediction
* Alumni engagement and career support

---

## Super Admin (University / System Head)

The **Super Admin** represents the highest authority in the Buddhi ecosystem and operates at the **university or governing-body level**. This role is responsible for system-wide governance, institutional oversight, and policy enforcement across multiple colleges or campuses.

### Scope of Control

* Operates across all registered institutions
* Has visibility into aggregated academic, financial, and operational data
* Ensures compliance with university-level regulations and standards

### Key Responsibilities

* Approve and onboard new colleges into the system
* Maintain a centralized view of institutional performance
* Define governance policies and access hierarchies
* Monitor adoption, compliance, and operational health

### Functional Features

* **Multi-Institution Dashboard:** View active, pending, and onboarded institutions with key metrics
* **Institution Onboarding & Verification:** Review and approve college registration requests
* **System Governance:** Manage super admin accounts and system-wide permissions
* **Cross-Institution Communication:** Publish announcements and circulars across all colleges
* **Analytics & Reporting:** University-level insights for strategic planning and monitoring

### Overview
<img width="1852" height="1065" alt="Screenshot from 2026-02-01 10-50-18" src="https://github.com/user-attachments/assets/ee7ebcf9-d4c7-4e8e-a789-948b80780323" />

---

## Admin (College / Institution Head)

The **Admin** is the highest authority at the institutional level and manages all academic, administrative, and financial operations of a single college.

### Scope of Control

* Full control over one institution
* Oversees students, faculty, staff, and sub-admins
* Responsible for institutional compliance and performance

### Key Responsibilities

* Institutional leadership and decision-making
* Academic quality assurance
* Financial and resource management

### Functional Features

* **Institutional Dashboard:** Real-time statistics on students, faculty, attendance, and finance
* **Faculty & Staff Management:** Create, assign, and manage faculty and staff roles
* **Student Lifecycle Management:** Admission, enrollment, academics, and graduation
* **Academic Oversight:** Attendance monitoring and grade supervision
* **Finance & Scholarships:** Fee management, payment tracking, and scholarship allocation
* **Documents & Services:** Admit cards, ID cards, bonafide certificates, and records
* **Campus Management:** Hostel, library, and infrastructure administration

  
### Overview
<img width="1906" height="1045" alt="Screenshot from 2026-02-01 11-56-38" src="https://github.com/user-attachments/assets/1f4f7f33-4f88-48fd-9ff1-e8768977aa82" />

  
---

## Sub Admin (Admissions & Records)

The **Sub Admin** supports institutional operations by managing admissions, verification, and student records with a focus on accuracy and efficiency.

### Scope of Control

* Limited to assigned administrative domains
* Operates under Admin supervision
* Focused on execution and operational workflows

### Key Responsibilities

* Process student admissions and applications
* Maintain verified and accurate student records
* Support institutional reporting requirements

### Functional Features

* **Admissions Dashboard:** Track daily, weekly, and monthly admission statistics
* **Student Registration:** Create and update student profiles
* **Document Verification:** Validate certificates and admission documents
* **Reporting:** Generate admission and enrollment reports
* **Academic Resources:** Manage PYQs and library inventory data

### Overview
<img width="1852" height="1065" alt="Screenshot from 2026-02-01 10-42-09" src="https://github.com/user-attachments/assets/098ac578-149c-4119-95c9-9d8488b62374" />

---

## Faculty

Faculty members are responsible for academic delivery, evaluation, and student mentoring, forming the backbone of the teaching ecosystem.

### Scope of Control

* Access limited to assigned courses and students
* Academic and evaluative responsibilities

### Key Responsibilities

* Deliver course content
* Evaluate and mentor students
* Maintain academic records

### Functional Features

* **Faculty Dashboard:** Teaching schedules and announcements
* **Attendance & Grades:** Mark attendance and submit grades
* **Student Monitoring:** Track academic performance
* **Academic Content:** Upload study materials and class notices
* **Communication:** Direct interaction with students and administration

### Overview
<img width="1852" height="1065" alt="Screenshot from 2026-02-01 10-40-45" src="https://github.com/user-attachments/assets/5686c22a-22b8-42b0-b8e6-3b50140e0ae0" />

---

## Student

Students use Buddhi as a unified digital campus platform to manage their academic, administrative, and financial activities.

### Scope of Control

* Self-service access to personal academic data

### Key Responsibilities

* Participate in academic activities
* Submit requests and applications digitally

### Functional Features

* **Student Dashboard:** Schedule, attendance, and academic analytics
* **Academics:** Course registration, grades, attendance tracking
* **Learning Resources:** Study materials and previous year questions
* **Digital Services:** ID cards, admit cards, certificates, and leave requests
* **Finance:** Fee payments, receipts, and scholarship access
* **Communication:** Notices, messaging, and feedback submission

### Overview
<img width="1828" height="1077" alt="Screenshot from 2026-02-01 10-39-52" src="https://github.com/user-attachments/assets/66e63bdb-53e7-4fa4-82dc-1a749d83c72a" />

---

## Alumni

The Alumni module enables long-term engagement between graduates and the institution beyond graduation.

### Scope of Control

* Access limited to alumni services and engagement modules

### Key Responsibilities

* Support current students
* Contribute to institutional growth

### Functional Features

* **Alumni Profiles:** Professional details and verification
* **Career Support:** Internship postings, job referrals, and mentoring
* **Networking:** Interaction with students, faculty, and fellow alumni
* **Donations:** Contribution tracking and fundraising participation

### Overview
<img width="1862" height="1061" alt="image" src="https://github.com/user-attachments/assets/2cf3b009-cc9e-4463-a36b-9ba452c5eaa5" />

---

## AI and Machine Learning

### Student Risk Prediction

Buddhi includes an AI-driven risk prediction engine to identify students who may require academic or administrative intervention.

* Inputs include CGPA, attendance, fee status, and library usage
* Outputs are classified into:

  * no_risk
  * on_the_verge
  * critical

### AI Counselor

* Context-aware academic guidance
* Personalized student recommendations
* Real-time interaction interface

---

## Technology Stack

### Frontend

* Next.js (App Router)
* React 19
* TailwindCSS
* Recharts
* React Big Calendar

### Backend

* Node.js
* Express.js
* MongoDB with Mongoose
* JWT-based authentication
* Socket.io
* Razorpay integration

### ML Service

* FastAPI
* PyTorch
* Scikit-learn

---

## Installation and Setup

```bash
git clone <repository-url>
cd buddhi_archives-dev
```

### Frontend

```bash
cd client
npm install
npm run dev
```

### Backend

```bash
cd server
npm install
npm run dev
```

### ML Service

```bash
cd ml_service
pip install -r requirements.txt
python app.py
```

---

## Security

* JWT authentication with access and refresh tokens
* Strict role-based access control
* Encrypted password storage (bcrypt)
* Secure file handling and validation

---

## Future Enhancements

* Mobile application (React Native)
* Advanced predictive analytics
* Smart timetable generation
* Blockchain-based academic certificates
* Voice-enabled system navigation



---

Buddhi – A Smart, Secure, and Scalable Academic Management Platform
