import { createContext, useContext, useState, type ReactNode } from "react";
import {
  PROJECTS as INIT_PROJECTS,
  WORK_PACKAGES as INIT_PACKAGES,
  DOCUMENTS as INIT_DOCS,
  INSPECTIONS as INIT_INSPECTIONS,
  ISSUES as INIT_ISSUES,
  APPROVALS as INIT_APPROVALS,
  ACTIVITY as INIT_ACTIVITY,
  MEMBERS as INIT_MEMBERS,
  type Project,
  type WorkPackage,
  type Document,
  type Inspection,
  type Issue,
  type Approval,
  type ActivityEntry,
  type PackageMember,
  type PackageStatus,
  type DocStatus,
  type InspectionResult,
  type IssueStatus,
  type ApprovalDecision,
  type PermissionRole,
} from "../data/mock";

interface DataState {
  // Data
  projects: Project[];
  packages: WorkPackage[];
  documents: Document[];
  inspections: Inspection[];
  issues: Issue[];
  approvals: Approval[];
  activity: ActivityEntry[];
  members: PackageMember[];

  // Project actions
  addProject: (p: Omit<Project, "id">) => Project;
  updateProject: (id: string, updates: Partial<Project>) => void;

  // Package actions
  addPackage: (wp: Omit<WorkPackage, "id">) => WorkPackage;
  updatePackageStatus: (id: string, status: PackageStatus) => void;

  // Document actions
  addDocument: (d: Omit<Document, "id">) => Document;
  supersedePreviousRevisions: (packageId: string, title: string, newDocId: string) => void;

  // Inspection actions
  addInspection: (i: Omit<Inspection, "id">) => Inspection;
  updateInspectionResult: (id: string, result: InspectionResult) => void;

  // Issue actions
  addIssue: (i: Omit<Issue, "id">) => Issue;
  updateIssueStatus: (id: string, status: IssueStatus, closureNotes?: string) => void;

  // Approval actions
  addApproval: (a: Omit<Approval, "id">) => Approval;
  decideApproval: (id: string, decision: ApprovalDecision, comments: string) => void;

  // Member actions
  addMember: (m: Omit<PackageMember, "id">) => PackageMember;
  removeMember: (id: string) => void;
  updateMemberRole: (id: string, role: PermissionRole) => void;

  // Activity - auto-logged
  logActivity: (entry: Omit<ActivityEntry, "id" | "timestamp">) => void;

  // Helpers
  getChildren: (parentId: string | null, projectId: string) => WorkPackage[];
}

const DataContext = createContext<DataState | null>(null);

let _counter = 1000;
function uid(prefix: string) {
  return `${prefix}${++_counter}`;
}

function now() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([...INIT_PROJECTS]);
  const [packages, setPackages] = useState<WorkPackage[]>([...INIT_PACKAGES]);
  const [documents, setDocuments] = useState<Document[]>([...INIT_DOCS]);
  const [inspections, setInspections] = useState<Inspection[]>([...INIT_INSPECTIONS]);
  const [issues, setIssues] = useState<Issue[]>([...INIT_ISSUES]);
  const [approvals, setApprovals] = useState<Approval[]>([...INIT_APPROVALS]);
  const [activity, setActivity] = useState<ActivityEntry[]>([...INIT_ACTIVITY]);
  const [members, setMembers] = useState<PackageMember[]>([...INIT_MEMBERS]);

  // ─── Activity logger ──────────────────────────────────────────
  const logActivity = (entry: Omit<ActivityEntry, "id" | "timestamp">) => {
    const newEntry: ActivityEntry = { ...entry, id: uid("act"), timestamp: now() };
    setActivity((prev) => [newEntry, ...prev]);
  };

  // ─── Projects ─────────────────────────────────────────────────
  const addProject = (p: Omit<Project, "id">): Project => {
    const newProject: Project = { ...p, id: uid("p") };
    setProjects((prev) => [...prev, newProject]);
    logActivity({
      packageId: "",
      user: "Vindy",
      company: "Roteq Engineering",
      actionType: "Project Created",
      objectType: "Project",
      objectLabel: newProject.name,
    });
    return newProject;
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  };

  // ─── Packages ─────────────────────────────────────────────────
  const addPackage = (wp: Omit<WorkPackage, "id">): WorkPackage => {
    const newPkg: WorkPackage = { ...wp, id: uid("wp") };
    setPackages((prev) => [...prev, newPkg]);
    logActivity({
      packageId: newPkg.id,
      user: "Vindy",
      company: "Roteq Engineering",
      actionType: "Package Created",
      objectType: "Package",
      objectLabel: newPkg.name,
    });
    return newPkg;
  };

  const updatePackageStatus = (id: string, status: PackageStatus) => {
    const pkg = packages.find((p) => p.id === id);
    if (!pkg || pkg.status === status) return;
    setPackages((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
    logActivity({
      packageId: id,
      user: "Vindy",
      company: "Roteq Engineering",
      actionType: "Status Changed",
      objectType: "Package",
      objectLabel: `${pkg.name} → ${status}`,
    });
  };

  // ─── Documents ────────────────────────────────────────────────
  const addDocument = (d: Omit<Document, "id">): Document => {
    const newDoc: Document = { ...d, id: uid("d") };
    setDocuments((prev) => [...prev, newDoc]);
    logActivity({
      packageId: d.packageId,
      user: d.uploadedBy,
      company: "Roteq Engineering",
      actionType: d.isCurrent ? "Document Uploaded" : "Revision Uploaded",
      objectType: "Document",
      objectLabel: `${d.title} ${d.revision}`,
    });
    return newDoc;
  };

  const supersedePreviousRevisions = (packageId: string, title: string, newDocId: string) => {
    setDocuments((prev) =>
      prev.map((d) =>
        d.packageId === packageId && d.title === title && d.id !== newDocId
          ? { ...d, isCurrent: false, status: "Superseded" as DocStatus }
          : d
      )
    );
  };

  // ─── Inspections ──────────────────────────────────────────────
  const addInspection = (i: Omit<Inspection, "id">): Inspection => {
    const newInsp: Inspection = { ...i, id: uid("i") };
    setInspections((prev) => [...prev, newInsp]);
    logActivity({
      packageId: i.packageId,
      user: i.inspector,
      company: "Roteq Engineering",
      actionType: "Inspection Created",
      objectType: "Inspection",
      objectLabel: i.type,
    });
    return newInsp;
  };

  const updateInspectionResult = (id: string, result: InspectionResult) => {
    const insp = inspections.find((i) => i.id === id);
    if (!insp) return;
    setInspections((prev) => prev.map((i) => (i.id === id ? { ...i, result } : i)));
    logActivity({
      packageId: insp.packageId,
      user: insp.inspector,
      company: "Roteq Engineering",
      actionType: `Inspection ${result}`,
      objectType: "Inspection",
      objectLabel: insp.type,
    });
  };

  // ─── Issues ───────────────────────────────────────────────────
  const addIssue = (i: Omit<Issue, "id">): Issue => {
    const newIssue: Issue = { ...i, id: uid("iss") };
    setIssues((prev) => [...prev, newIssue]);
    logActivity({
      packageId: i.packageId,
      user: i.owner,
      company: "Roteq Engineering",
      actionType: "Issue Created",
      objectType: "Issue",
      objectLabel: i.title,
    });
    return newIssue;
  };

  const updateIssueStatus = (id: string, status: IssueStatus, closureNotes?: string) => {
    const issue = issues.find((i) => i.id === id);
    if (!issue) return;
    setIssues((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, status, closureNotes: closureNotes ?? i.closureNotes } : i
      )
    );
    logActivity({
      packageId: issue.packageId,
      user: "Vindy",
      company: "Roteq Engineering",
      actionType: status === "Closed" ? "Issue Closed" : "Issue Updated",
      objectType: "Issue",
      objectLabel: `${issue.title} → ${status}`,
    });
  };

  // ─── Approvals ────────────────────────────────────────────────
  const addApproval = (a: Omit<Approval, "id">): Approval => {
    const newApproval: Approval = { ...a, id: uid("a") };
    setApprovals((prev) => [...prev, newApproval]);
    logActivity({
      packageId: a.packageId,
      user: a.submittedBy,
      company: "Roteq Engineering",
      actionType: "Submitted for Approval",
      objectType: a.objectType,
      objectLabel: a.objectLabel,
    });
    return newApproval;
  };

  const decideApproval = (id: string, decision: ApprovalDecision, comments: string) => {
    const appr = approvals.find((a) => a.id === id);
    if (!appr) return;
    setApprovals((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, decision, comments, decisionDate: today() } : a
      )
    );
    logActivity({
      packageId: appr.packageId,
      user: appr.approver,
      company: "Roteq Engineering",
      actionType: `Approval ${decision}`,
      objectType: appr.objectType,
      objectLabel: appr.objectLabel,
    });
  };

  // ─── Members ──────────────────────────────────────────────────
  const addMember = (m: Omit<PackageMember, "id">): PackageMember => {
    const newMember: PackageMember = { ...m, id: uid("m") };
    setMembers((prev) => [...prev, newMember]);
    logActivity({
      packageId: m.packageId,
      user: "Vindy",
      company: "Roteq Engineering",
      actionType: "Member Invited",
      objectType: "Permission",
      objectLabel: `${m.name} as ${m.role}`,
    });
    return newMember;
  };

  const removeMember = (id: string) => {
    const member = members.find((m) => m.id === id);
    if (!member) return;
    setMembers((prev) => prev.filter((m) => m.id !== id));
    logActivity({
      packageId: member.packageId,
      user: "Vindy",
      company: "Roteq Engineering",
      actionType: "Member Removed",
      objectType: "Permission",
      objectLabel: member.name,
    });
  };

  const updateMemberRole = (id: string, role: PermissionRole) => {
    const member = members.find((m) => m.id === id);
    if (!member) return;
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, role } : m)));
    logActivity({
      packageId: member.packageId,
      user: "Vindy",
      company: "Roteq Engineering",
      actionType: "Role Changed",
      objectType: "Permission",
      objectLabel: `${member.name} → ${role}`,
    });
  };

  // ─── Helpers ──────────────────────────────────────────────────
  const getChildren = (parentId: string | null, projectId: string) => {
    return packages.filter((wp) => wp.parentId === parentId && wp.projectId === projectId);
  };

  return (
    <DataContext.Provider
      value={{
        projects, packages, documents, inspections, issues, approvals, activity, members,
        addProject, updateProject,
        addPackage, updatePackageStatus,
        addDocument, supersedePreviousRevisions,
        addInspection, updateInspectionResult,
        addIssue, updateIssueStatus,
        addApproval, decideApproval,
        addMember, removeMember, updateMemberRole,
        logActivity, getChildren,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
