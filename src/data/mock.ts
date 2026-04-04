// ─── Types ───────────────────────────────────────────────────────────────────

export type ProjectStatus = "Active" | "Closed" | "On Hold";
export type PackageStatus =
  | "Not Started"
  | "In Progress"
  | "Awaiting Approval"
  | "Ready for Handover"
  | "Closed";
export type DocStatus = "Draft" | "Submitted" | "Approved for Use" | "Superseded";
export type InspectionResult = "Open" | "Passed" | "Failed";
export type IssueStatus = "Open" | "In Progress" | "Awaiting Review" | "Closed";
export type ApprovalDecision = "Pending" | "Approved" | "Rejected";
export type PermissionRole = "Owner" | "Contributor" | "Approver" | "Viewer";

export interface Project {
  id: string;
  name: string;
  code: string;
  client: string;
  location: string;
  startDate: string;
  endDate: string;
  status: ProjectStatus;
  description: string;
}

export interface WorkPackage {
  id: string;
  projectId: string;
  parentId: string | null;
  name: string;
  code: string;
  ownerCompanyId?: string;
  ownerCompany: string;
  responsible: string;
  dueDate: string;
  status: PackageStatus;
  description: string;
}

export interface Document {
  id: string;
  packageId: string;
  title: string;
  type: string;
  revision: string;
  status: DocStatus;
  uploadedBy: string;
  uploadDate: string;
  isCurrent: boolean;
  notes: string;
  fileUrl?: string;
}

export interface Inspection {
  id: string;
  packageId: string;
  type: string;
  linkedDocId: string | null;
  date: string;
  inspector: string;
  result: InspectionResult;
  notes: string;
}

export interface Issue {
  id: string;
  packageId: string;
  title: string;
  description: string;
  severity: "Critical" | "Major" | "Minor";
  linkedInspectionId: string | null;
  owner: string;
  dueDate: string;
  status: IssueStatus;
  closureNotes: string;
}

export interface Approval {
  id: string;
  packageId: string;
  objectType: "Document" | "Inspection" | "Issue" | "Package";
  objectLabel: string;
  submittedBy: string;
  submittedDate: string;
  approver: string;
  decision: ApprovalDecision;
  decisionDate: string;
  comments: string;
}

export interface ActivityEntry {
  id: string;
  packageId: string;
  timestamp: string;
  user: string;
  company: string;
  actionType: string;
  objectType: string;
  objectLabel: string;
}

export interface PackageMember {
  id: string;
  packageId: string;
  name: string;
  company: string;
  email: string;
  role: PermissionRole;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

export const PROJECTS: Project[] = [
  {
    id: "p1",
    name: "Mining Complex Alpha — Shutdown 2025",
    code: "MCA-SD-25",
    client: "Glencore Ltd.",
    location: "Katanga Province, DRC",
    startDate: "2025-01-15",
    endDate: "2025-06-30",
    status: "Active",
    description: "Planned shutdown and refurbishment of primary processing equipment.",
  },
  {
    id: "p2",
    name: "Refinery Turnaround — Unit 4",
    code: "RTU4-2025",
    client: "SasolOil",
    location: "Secunda, South Africa",
    startDate: "2025-03-01",
    endDate: "2025-05-15",
    status: "Active",
    description: "Full turnaround of Unit 4 including heat exchangers and valves.",
  },
  {
    id: "p3",
    name: "Pump Station Upgrade",
    code: "PSU-24",
    client: "Transnet Pipelines",
    location: "Durban, South Africa",
    startDate: "2024-09-01",
    endDate: "2025-02-28",
    status: "Closed",
    description: "Upgrade of main pump station control systems and impellers.",
  },
];

export const WORK_PACKAGES: WorkPackage[] = [
  // p1 tree
  {
    id: "wp1",
    projectId: "p1",
    parentId: null,
    name: "Mechanical Scope",
    code: "MCA-MECH",
    ownerCompany: "Roteq Engineering",
    responsible: "James Okafor",
    dueDate: "2025-05-30",
    status: "In Progress",
    description: "All mechanical scope under the shutdown.",
  },
  {
    id: "wp2",
    projectId: "p1",
    parentId: "wp1",
    name: "Equipment Installation",
    code: "MCA-MECH-EQ",
    ownerCompany: "Roteq Engineering",
    responsible: "Sara Nkosi",
    dueDate: "2025-04-15",
    status: "In Progress",
    description: "Installation of rotating and static equipment.",
  },
  {
    id: "wp3",
    projectId: "p1",
    parentId: "wp1",
    name: "Piping Works",
    code: "MCA-MECH-PIP",
    ownerCompany: "PipePro Ltd.",
    responsible: "Anton Ferreira",
    dueDate: "2025-05-01",
    status: "Not Started",
    description: "All piping replacement and tie-ins.",
  },
  {
    id: "wp4",
    projectId: "p1",
    parentId: "wp2",
    name: "Pump P-101 Overhaul",
    code: "MCA-MECH-EQ-P101",
    ownerCompany: "Roteq Engineering",
    responsible: "Sara Nkosi",
    dueDate: "2025-03-30",
    status: "Awaiting Approval",
    description: "Full overhaul of pump P-101 including seal and impeller replacement.",
  },
  {
    id: "wp5",
    projectId: "p1",
    parentId: null,
    name: "Electrical Scope",
    code: "MCA-ELEC",
    ownerCompany: "Voltex Services",
    responsible: "Linda Chen",
    dueDate: "2025-06-01",
    status: "Not Started",
    description: "Electrical works including MCC replacement.",
  },
];

export const DOCUMENTS: Document[] = [
  {
    id: "d1",
    packageId: "wp4",
    title: "P-101 Overhaul Procedure",
    type: "Procedure",
    revision: "Rev C",
    status: "Approved for Use",
    uploadedBy: "Sara Nkosi",
    uploadDate: "2025-02-10",
    isCurrent: true,
    notes: "Approved by client QA on 10 Feb.",
  },
  {
    id: "d2",
    packageId: "wp4",
    title: "P-101 Overhaul Procedure",
    type: "Procedure",
    revision: "Rev B",
    status: "Superseded",
    uploadedBy: "Sara Nkosi",
    uploadDate: "2025-01-20",
    isCurrent: false,
    notes: "Superseded by Rev C.",
  },
  {
    id: "d3",
    packageId: "wp4",
    title: "Mechanical Completion Certificate",
    type: "Certificate",
    revision: "Rev 0",
    status: "Draft",
    uploadedBy: "James Okafor",
    uploadDate: "2025-03-01",
    isCurrent: true,
    notes: "",
  },
  {
    id: "d4",
    packageId: "wp2",
    title: "Equipment Installation Method Statement",
    type: "Method Statement",
    revision: "Rev A",
    status: "Submitted",
    uploadedBy: "Sara Nkosi",
    uploadDate: "2025-02-28",
    isCurrent: true,
    notes: "Pending QA review.",
  },
];

export const INSPECTIONS: Inspection[] = [
  {
    id: "i1",
    packageId: "wp4",
    type: "Pre-Overhaul Condition Check",
    linkedDocId: "d1",
    date: "2025-02-15",
    inspector: "Tom Venter",
    result: "Passed",
    notes: "All checks passed. Seal worn, scheduled for replacement.",
  },
  {
    id: "i2",
    packageId: "wp4",
    type: "Impeller Dimensional Check",
    linkedDocId: "d1",
    date: "2025-02-20",
    inspector: "Tom Venter",
    result: "Failed",
    notes: "Impeller OD out of spec. NCR raised.",
  },
  {
    id: "i3",
    packageId: "wp4",
    type: "Final Assembly Inspection",
    linkedDocId: "d1",
    date: "2025-03-05",
    inspector: "Tom Venter",
    result: "Open",
    notes: "Awaiting parts.",
  },
];

export const ISSUES: Issue[] = [
  {
    id: "iss1",
    packageId: "wp4",
    title: "Impeller OD Out of Tolerance",
    description:
      "Measured OD of 312mm vs 308mm specified. Requires replacement before reassembly.",
    severity: "Critical",
    linkedInspectionId: "i2",
    owner: "Sara Nkosi",
    dueDate: "2025-03-10",
    status: "In Progress",
    closureNotes: "",
  },
  {
    id: "iss2",
    packageId: "wp4",
    title: "Missing Gasket Set on ITP",
    description:
      "Gasket set not included in ITP documentation. Document controller to update.",
    severity: "Minor",
    linkedInspectionId: null,
    owner: "James Okafor",
    dueDate: "2025-03-08",
    status: "Awaiting Review",
    closureNotes: "Gasket set added to Rev C. Pending reviewer sign-off.",
  },
];

export const APPROVALS: Approval[] = [
  {
    id: "a1",
    packageId: "wp4",
    objectType: "Document",
    objectLabel: "P-101 Overhaul Procedure Rev C",
    submittedBy: "Sara Nkosi",
    submittedDate: "2025-02-08",
    approver: "Client QA Rep",
    decision: "Approved",
    decisionDate: "2025-02-10",
    comments: "Approved as submitted.",
  },
  {
    id: "a2",
    packageId: "wp4",
    objectType: "Issue",
    objectLabel: "Missing Gasket Set on ITP",
    submittedBy: "James Okafor",
    submittedDate: "2025-03-06",
    approver: "Tom Venter",
    decision: "Pending",
    decisionDate: "",
    comments: "",
  },
  {
    id: "a3",
    packageId: "wp4",
    objectType: "Package",
    objectLabel: "Pump P-101 Overhaul",
    submittedBy: "Sara Nkosi",
    submittedDate: "2025-03-15",
    approver: "Client QA Rep",
    decision: "Pending",
    decisionDate: "",
    comments: "",
  },
];

export const ACTIVITY: ActivityEntry[] = [
  {
    id: "act1",
    packageId: "wp4",
    timestamp: "2025-03-15 09:12",
    user: "Sara Nkosi",
    company: "Roteq Engineering",
    actionType: "Submitted for Approval",
    objectType: "Package",
    objectLabel: "Pump P-101 Overhaul",
  },
  {
    id: "act2",
    packageId: "wp4",
    timestamp: "2025-03-06 14:30",
    user: "James Okafor",
    company: "Roteq Engineering",
    actionType: "Issue Updated",
    objectType: "Issue",
    objectLabel: "Missing Gasket Set on ITP → Awaiting Review",
  },
  {
    id: "act3",
    packageId: "wp4",
    timestamp: "2025-03-05 08:00",
    user: "Tom Venter",
    company: "Glencore Ltd.",
    actionType: "Inspection Created",
    objectType: "Inspection",
    objectLabel: "Final Assembly Inspection",
  },
  {
    id: "act4",
    packageId: "wp4",
    timestamp: "2025-02-20 11:45",
    user: "Tom Venter",
    company: "Glencore Ltd.",
    actionType: "Issue Created",
    objectType: "Issue",
    objectLabel: "Impeller OD Out of Tolerance",
  },
  {
    id: "act5",
    packageId: "wp4",
    timestamp: "2025-02-10 10:00",
    user: "Client QA Rep",
    company: "Glencore Ltd.",
    actionType: "Document Approved",
    objectType: "Document",
    objectLabel: "P-101 Overhaul Procedure Rev C",
  },
];

export const MEMBERS: PackageMember[] = [
  {
    id: "m1",
    packageId: "wp4",
    name: "Sara Nkosi",
    company: "Roteq Engineering",
    email: "sara@roteq.co.za",
    role: "Owner",
  },
  {
    id: "m2",
    packageId: "wp4",
    name: "Tom Venter",
    company: "Glencore Ltd.",
    email: "tom@glencore.com",
    role: "Approver",
  },
  {
    id: "m3",
    packageId: "wp4",
    name: "James Okafor",
    company: "Roteq Engineering",
    email: "james@roteq.co.za",
    role: "Contributor",
  },
  {
    id: "m4",
    packageId: "wp4",
    name: "Vindy",
    company: "Roteq Engineering",
    email: "vindy@roteq.co.za",
    role: "Owner",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getChildren(packages: WorkPackage[], parentId: string | null, projectId: string) {
  return packages.filter((wp) => wp.parentId === parentId && wp.projectId === projectId);
}
