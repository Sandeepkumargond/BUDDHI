const deptartmentMap = {
    CSE: "Computer Science and Engineering",
    ECE: "Electronics and Communication Engineering",
    ME: "Mechanical Engineering",
    CE: "Civil Engineering",
    EE: "Electrical Engineering",
    Architecture: "Architecture",
    Chemical: "Chemical Engineering",
    Biotech: "Biotechnology",
    IT: "Information Technology",
};

// Mapping from department code to numeric ID (must match backend)
const deptCodeToId = {
    CSE: 1,
    EE: 2,
    ME: 3,
    CE: 4,
    ECE: 5
};

const programMap = {
    "B.Tech": "Bachelor of Technology",
    "M.Tech": "Master of Technology",
    "Dual Degree": "Dual Degree (B.Tech + M.Tech)",
    MBA: "Master of Business Administration",
    MCA: "Master of Computer Applications",
    BCA: "Bachelor of Computer Applications",
    PhD: "Doctor of Philosophy",
};

export { deptartmentMap, deptCodeToId, programMap };