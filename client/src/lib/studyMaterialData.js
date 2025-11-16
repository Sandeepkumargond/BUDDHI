// src/lib/studyMaterialData.js
export const DEFAULT_MATERIALS = [
  {
    id: "MAT001",
    title: "Unit 2 - Memory Management",
    type: "Lecture Notes",
    subject: "CS201",
    semester: "3",
    section: "A",
    description: "Paging, segmentation & examples.",
    files: [
      { name: "memory_notes.pdf", url: "/dummy.pdf", size: 120_000 },
    ],
    externalLinks: [],
    visibility: { to: "All", sections: [] },
    releaseOn: null,
    expireOn: null,
    downloadAllowed: true,
    uploadedAt: "2025-02-10T10:00:00Z",
    uploadedBy: { name: "Prof. A. Kumar", photo: "/teacher.png" },
    stats: { views: 12, downloads: 4 },
    status: "published",
    versions: [],
  },
  {
    id: "MAT002",
    title: "Lab Manual - Microprocessors",
    type: "Lab Manual",
    subject: "CS202",
    semester: "3",
    section: "B",
    description: "Lab experiments for Microprocessors.",
    files: [],
    externalLinks: ["https://drive.example/lab-manual"],
    visibility: { to: "Selected", sections: ["B"] },
    releaseOn: null,
    expireOn: null,
    downloadAllowed: false,
    uploadedAt: "2025-03-01T12:00:00Z",
    uploadedBy: { name: "Prof. A. Kumar", photo: "/teacher.png" },
    stats: { views: 8, downloads: 0 },
    status: "draft",
    versions: [],
  },
];

export function loadMaterials() {
  try {
    const raw = localStorage.getItem("studyMaterials");
    if (!raw) {
      localStorage.setItem("studyMaterials", JSON.stringify(DEFAULT_MATERIALS));
      return DEFAULT_MATERIALS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error("loadMaterials error", e);
    return DEFAULT_MATERIALS;
  }
}

export function saveMaterials(arr) {
  try {
    localStorage.setItem("studyMaterials", JSON.stringify(arr));
  } catch (e) {
    console.error("saveMaterials error", e);
  }
}
