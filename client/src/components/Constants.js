// 🌐 BUDDHI ERP System – Landing Page Data File

export const NAV_LINKS = [
  { title: "Home", url: "#" },
  { title: "About Us", url: "#about" },
  { title: "How it Works", url: "#how-it-works" },
  { title: "Services", url: "#services" },
  { title: "Contact Us", url: "#request" },
  { title: "FAQ", url: "#faq" },
];

export const HERO = {
  title: "A Unified, Low-Cost ERP for Smarter Campus Management",
  description:
    "BUDDHI is an affordable cloud-based ERP system that unifies admissions, fees, hostel, and examination management into a single platform. Designed for public colleges, it simplifies administration, saves time, and offers real-time institutional insights—all using familiar tools and minimal setup cost.",
};

export const HOW_IT_WORKS = {
  title: "How It Works",
  content:
    "BUDDHI connects essential campus operations through an integrated workflow that keeps data centralized, accurate, and accessible. The platform is built to be intuitive for both staff and students, minimizing the learning curve while maximizing efficiency.",
  steps: [
    {
      title: "STEP 1",
      text: "Register your institute through the online registration form and receive admin credentials to access the ERP system.",
    },
    {
      title: "STEP 2",
      text: "Login to your secure dashboard and add department heads, faculty, and staff with role-based access.",
    },
    {
      title: "STEP 3",
      text: "Manage admissions, fee collection, hostel allocations, and student data — all from one central system.",
    },
    {
      title: "STEP 4",
      text: "Track, analyze, and visualize your institute’s data in real-time using the built-in analytics and reporting tools.",
    },
  ],
};

export const SERVICES_TEXT = `
BUDDHI offers a suite of cloud-connected services designed to simplify institutional management:

🎓 Admissions Management: Digital admission forms and instant student record creation.
💰 Fee Collection & Receipting: Automated fee processing with digital receipts and secure online transactions.
🏠 Hostel Management: Real-time room allocation, occupancy tracking, and vacancy monitoring.
📚 Academic Records: Centralized storage of grades, examination results, and course data.
📊 Analytics Dashboard: Visual reports that help administrators monitor operations and decision-making.
🔐 Role-Based Access Control: Different access levels for admins, faculty, and students ensuring data security.
☁️ Cloud Integration: Runs on widely available cloud office suites for cost efficiency and easy adoption.
`;

export const ABOUT_US_TEXT = `
At BUDDHI, we believe in making technology accessible to every educational institution. Our mission is to bridge the digital divide between high-end private ERPs and financially constrained public colleges.

By combining familiar tools like online forms, spreadsheets, and dashboards with intelligent automation, BUDDHI delivers a unified ERP experience without costly infrastructure. Our solution streamlines admission intake, automates fee processing, tracks hostel occupancy, and provides administrators with real-time insights.

Developed for ease of use, BUDDHI empowers staff to manage everything digitally—without steep learning curves or additional training. It’s a step toward a transparent, efficient, and data-driven education system for all institutions.
`;

export const FAQ = [
  {
    question: "What is BUDDHI ERP?",
    answer:
      "BUDDHI ERP is a cloud-based platform that integrates all major academic and administrative tasks—such as admissions, fee collection, hostel management, and examination tracking—into a single, affordable system for educational institutions.",
    value: "faq-1",
  },
  {
    question: "Who can use BUDDHI?",
    answer:
      "BUDDHI is designed for colleges, universities, and institutes of all sizes. It supports administrators, faculty, and students through role-based dashboards.",
    value: "faq-2",
  },
  {
    question: "Does it require special hardware or software installation?",
    answer:
      "No, BUDDHI runs completely on cloud platforms and standard web browsers. Institutes can access it from any device without additional infrastructure.",
    value: "faq-3",
  },
  {
    question: "How secure is the data?",
    answer:
      "BUDDHI follows role-based access control and uses encrypted cloud storage to ensure that student and institutional data remain protected and private.",
    value: "faq-4",
  },
  {
    question: "Can BUDDHI integrate with existing tools?",
    answer:
      "Yes, it integrates seamlessly with common cloud tools like Google Workspace and Microsoft Office Suite to maintain flexibility and reduce setup time.",
    value: "faq-5",
  },
  {
    question: "How can an institute register to use BUDDHI?",
    answer:
      "Institutes can fill out the 'Request to Register' form available on the platform. Once verified, they will receive admin credentials and onboarding support.",
    value: "faq-6",
  },
  {
    question: "Is training required for staff?",
    answer:
      "Minimal. Since the system is built on familiar tools like online forms and spreadsheets, staff can adapt quickly with minimal training.",
    value: "faq-7",
  },
  {
    question: "Can BUDDHI generate reports and analytics?",
    answer:
      "Yes. The built-in dashboard visualizes admissions, fees, occupancy, and performance metrics in real-time for efficient decision-making.",
    value: "faq-8",
  },
  {
    question: "Is the platform scalable?",
    answer:
      "Absolutely. BUDDHI is built to scale across institutions, handling thousands of student records while maintaining performance and security.",
    value: "faq-9",
  },
  {
    question: "How much does it cost to implement BUDDHI?",
    answer:
      "BUDDHI is designed as a low-cost ERP alternative. Because it uses cloud office integrations, institutions pay minimal recurring costs compared to proprietary ERPs.",
    value: "faq-10",
  },
];

export const FOOTER = {
  description:
    "BUDDHI is a unified ERP platform for colleges and universities to manage all campus operations efficiently. Our goal is to make advanced technology accessible to every educational institution.",
  copyright: `© ${new Date().getFullYear()} BUDDHI. All rights reserved.`,
  categories: [
    {
      name: "Explore",
      links: [
        { title: "Home", url: "#" },
        { title: "About Us", url: "#" },
        { title: "How It Works", url: "#" },
        { title: "Services", url: "#" },
        { title: "Contact Us", url: "#" },
      ],
    },
    {
      name: "Resources",
      links: [
        { title: "Documentation", url: "#" },
        { title: "Privacy Policy", url: "#" },
        { title: "Terms of Service", url: "#" },
        { title: "Support", url: "#" },
      ],
    },
    {
      name: "Connect",
      links: [
        { title: "Email: buddhi.erp@gmail.com", url: "mailto:buddhi.erp@gmail.com" },
        { title: "Phone: +91 98765 43210", url: "#" },
        { title: "LinkedIn", url: "#" },
        { title: "Instagram", url: "#" },
      ],
    },
  ],
};
