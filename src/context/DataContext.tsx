import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import * as api from "../api";
import { showToast } from "../components/Toast";
import type {
  Project, WorkPackage, Document, Inspection, Issue,
  Approval, ActivityEntry, PackageMember,
  PackageStatus, DocStatus, InspectionResult, IssueStatus,
  ApprovalDecision, PermissionRole,
} from "../data/mock";

interface DataState {
  // Data (loaded on demand)
  projects: Project[];
  packages: WorkPackage[];
  documents: Document[];
  inspections: Inspection[];
  issues: Issue[];
  approvals: Approval[];
  activity: ActivityEntry[];
  members: PackageMember[];
  comments: any[];
  loading: boolean;

  // Loaders
  loadProjects: () => Promise<void>;
  loadPackages: (projectId: string) => Promise<void>;
  loadPackageData: (packageId: string) => Promise<void>;
  loadWorkspaceData: (companyId?: string) => Promise<{ stats: any; recentActivity: any[] }>;

  // Project actions
  addProject: (p: Omit<Project, "id">) => Promise<Project>;

  // Package actions
  addPackage: (wp: Omit<WorkPackage, "id">) => Promise<WorkPackage>;
  updatePackageStatus: (id: string, status: PackageStatus) => Promise<void>;

  // Document actions
  addDocument: (d: Omit<Document, "id">) => Promise<Document>;

  // Inspection actions
  addInspection: (i: Omit<Inspection, "id">) => Promise<Inspection>;
  updateInspectionResult: (id: string, result: InspectionResult) => Promise<void>;

  // Issue actions
  addIssue: (i: Omit<Issue, "id">) => Promise<Issue>;
  updateIssueStatus: (id: string, status: IssueStatus, closureNotes?: string) => Promise<void>;

  // Approval actions
  addApproval: (a: Omit<Approval, "id">) => Promise<Approval>;
  decideApproval: (id: string, decision: ApprovalDecision, comments: string) => Promise<void>;

  // Member actions
  addMember: (m: Omit<PackageMember, "id">) => Promise<PackageMember>;
  removeMember: (id: string) => Promise<void>;
  updateMemberRole: (id: string, role: PermissionRole) => Promise<void>;

  // Activity
  logActivity: (entry: Omit<ActivityEntry, "id" | "timestamp">) => Promise<void>;

  // Comment actions
  loadComments: (packageId: string) => Promise<void>;
  addComment: (packageId: string, text: string) => Promise<void>;

  // Helpers
  getChildren: (parentId: string | null, projectId: string) => WorkPackage[];
}

const DataContext = createContext<DataState | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [packages, setPackages] = useState<WorkPackage[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [members, setMembers] = useState<PackageMember[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // ─── Loaders ──────────────────────────────────────────────────
  const loadProjects = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.projects.list();
      setProjects(data);
    } finally { setLoading(false); }
  }, []);

  const loadPackages = useCallback(async (projectId: string) => {
    const data = await api.packages.list(projectId);
    setPackages(data);
  }, []);

  const loadPackageData = useCallback(async (packageId: string) => {
    try {
      const [docs, insps, iss, apprs, acts, mems, comms] = await Promise.all([
        api.documents.list(packageId),
        api.inspections.list(packageId),
        api.issues.list(packageId),
        api.approvals.list(packageId),
        api.activity.list(packageId),
        api.members.list(packageId),
        api.comments.list(packageId),
      ]);
      setDocuments(docs);
      setInspections(insps);
      setIssues(iss);
      setApprovals(apprs);
      setActivity(acts);
      setMembers(mems);
      setComments(comms);
    } catch (err: any) {
      showToast(err.message || "Failed to load package data");
    }
  }, []);

  const loadWorkspaceData = useCallback(async (companyId?: string) => {
    try {
      const data = await api.workspace.get(companyId);
      setProjects(data.projects);
      return { stats: data.stats, recentActivity: data.recentActivity };
    } catch (err: any) {
      showToast(err.message || "Failed to load workspace data");
      return { stats: {}, recentActivity: [] };
    }
  }, []);

  // ─── Log activity helper ─────────────────────────────────────
  const logActivity = async (entry: Omit<ActivityEntry, "id" | "timestamp">) => {
    try {
      const created = await api.activity.create(entry);
      setActivity((prev) => [created, ...prev]);
    } catch { /* non-blocking */ }
  };

  // ─── Comments ─────────────────────────────────────────────────
  const loadComments = useCallback(async (packageId: string) => {
    const data = await api.comments.list(packageId);
    setComments(data);
  }, []);

  const addComment = useCallback(async (packageId: string, text: string) => {
    try {
      const created = await api.comments.create(packageId, text);
      setComments((prev) => [created, ...prev]);
    } catch (err: any) {
      showToast(err.message || "Failed to post comment");
    }
  }, []);

  // ─── Projects ─────────────────────────────────────────────────
  const addProject = async (p: Omit<Project, "id">): Promise<Project> => {
    const created = await api.projects.create(p);
    setProjects((prev) => [created, ...prev]);
    logActivity({ packageId: "", user: "Vindy", company: "Roteq Engineering", actionType: "Project Created", objectType: "Project", objectLabel: created.name });
    return created;
  };

  // ─── Packages ─────────────────────────────────────────────────
  const addPackage = async (wp: Omit<WorkPackage, "id">): Promise<WorkPackage> => {
    const created = await api.packages.create(wp);
    setPackages((prev) => [...prev, created]);
    logActivity({ packageId: created.id, user: "Vindy", company: "Roteq Engineering", actionType: "Package Created", objectType: "Package", objectLabel: created.name });
    return created;
  };

  const updatePackageStatus = async (id: string, status: PackageStatus) => {
    const pkg = packages.find((p) => p.id === id);
    if (!pkg || pkg.status === status) return;
    await api.packages.update(id, { status });
    setPackages((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
    logActivity({ packageId: id, user: "Vindy", company: "Roteq Engineering", actionType: "Status Changed", objectType: "Package", objectLabel: `${pkg.name} → ${status}` });
  };

  // ─── Documents ────────────────────────────────────────────────
  const addDocument = async (d: Omit<Document, "id">): Promise<Document> => {
    const created = await api.documents.create(d);
    setDocuments((prev) => {
      // Auto-supersede in local state
      const updated = prev.map((doc) =>
        doc.packageId === d.packageId && doc.title === d.title
          ? { ...doc, isCurrent: false, status: "Superseded" as DocStatus }
          : doc
      );
      return [created, ...updated];
    });
    logActivity({ packageId: d.packageId, user: d.uploadedBy, company: "Roteq Engineering", actionType: "Document Uploaded", objectType: "Document", objectLabel: `${d.title} ${d.revision}` });
    return created;
  };

  // ─── Inspections ──────────────────────────────────────────────
  const addInspection = async (i: Omit<Inspection, "id">): Promise<Inspection> => {
    const created = await api.inspections.create(i);
    setInspections((prev) => [created, ...prev]);
    logActivity({ packageId: i.packageId, user: i.inspector, company: "Roteq Engineering", actionType: "Inspection Created", objectType: "Inspection", objectLabel: i.type });
    return created;
  };

  const updateInspectionResult = async (id: string, result: InspectionResult) => {
    const insp = inspections.find((i) => i.id === id);
    if (!insp) return;
    await api.inspections.update(id, { result });
    setInspections((prev) => prev.map((i) => (i.id === id ? { ...i, result } : i)));
    logActivity({ packageId: insp.packageId, user: insp.inspector, company: "Roteq Engineering", actionType: `Inspection ${result}`, objectType: "Inspection", objectLabel: insp.type });
  };

  // ─── Issues ───────────────────────────────────────────────────
  const addIssue = async (i: Omit<Issue, "id">): Promise<Issue> => {
    const created = await api.issues.create(i);
    setIssues((prev) => [created, ...prev]);
    logActivity({ packageId: i.packageId, user: i.owner, company: "Roteq Engineering", actionType: "Issue Created", objectType: "Issue", objectLabel: i.title });
    return created;
  };

  const updateIssueStatus = async (id: string, status: IssueStatus, closureNotes?: string) => {
    const issue = issues.find((i) => i.id === id);
    if (!issue) return;
    const data: any = { status };
    if (closureNotes !== undefined) data.closureNotes = closureNotes;
    await api.issues.update(id, data);
    setIssues((prev) => prev.map((i) => (i.id === id ? { ...i, ...data } : i)));
    logActivity({ packageId: issue.packageId, user: "Vindy", company: "Roteq Engineering", actionType: status === "Closed" ? "Issue Closed" : "Issue Updated", objectType: "Issue", objectLabel: `${issue.title} → ${status}` });
  };

  // ─── Approvals ────────────────────────────────────────────────
  const addApproval = async (a: Omit<Approval, "id">): Promise<Approval> => {
    const created = await api.approvals.create(a);
    setApprovals((prev) => [created, ...prev]);
    logActivity({ packageId: a.packageId, user: a.submittedBy, company: "Roteq Engineering", actionType: "Submitted for Approval", objectType: a.objectType, objectLabel: a.objectLabel });
    return created;
  };

  const decideApproval = async (id: string, decision: ApprovalDecision, comments: string) => {
    const appr = approvals.find((a) => a.id === id);
    if (!appr) return;
    const today = new Date().toISOString().split("T")[0];
    await api.approvals.update(id, { decision, comments, decisionDate: today });
    setApprovals((prev) => prev.map((a) => (a.id === id ? { ...a, decision, comments, decisionDate: today } : a)));
    logActivity({ packageId: appr.packageId, user: appr.approver, company: "Roteq Engineering", actionType: `Approval ${decision}`, objectType: appr.objectType, objectLabel: appr.objectLabel });
  };

  // ─── Members ──────────────────────────────────────────────────
  const addMember = async (m: Omit<PackageMember, "id">): Promise<PackageMember> => {
    const created = await api.members.create(m);
    setMembers((prev) => [...prev, created]);
    logActivity({ packageId: m.packageId, user: "Vindy", company: "Roteq Engineering", actionType: "Member Invited", objectType: "Permission", objectLabel: `${m.name} as ${m.role}` });
    return created;
  };

  const removeMember = async (id: string) => {
    const member = members.find((m) => m.id === id);
    if (!member) return;
    await api.members.remove(id);
    setMembers((prev) => prev.filter((m) => m.id !== id));
    logActivity({ packageId: member.packageId, user: "Vindy", company: "Roteq Engineering", actionType: "Member Removed", objectType: "Permission", objectLabel: member.name });
  };

  const updateMemberRole = async (id: string, role: PermissionRole) => {
    const member = members.find((m) => m.id === id);
    if (!member) return;
    await api.members.update(id, { role });
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, role } : m)));
    logActivity({ packageId: member.packageId, user: "Vindy", company: "Roteq Engineering", actionType: "Role Changed", objectType: "Permission", objectLabel: `${member.name} → ${role}` });
  };

  // ─── Helpers ──────────────────────────────────────────────────
  const getChildren = (parentId: string | null, projectId: string) => {
    return packages.filter((wp) => wp.parentId === parentId && wp.projectId === projectId);
  };

  return (
    <DataContext.Provider
      value={{
        projects, packages, documents, inspections, issues, approvals, activity, members, comments, loading,
        loadProjects, loadPackages, loadPackageData, loadWorkspaceData,
        addProject, addPackage, updatePackageStatus,
        addDocument, addInspection, updateInspectionResult,
        addIssue, updateIssueStatus, addApproval, decideApproval,
        addMember, removeMember, updateMemberRole,
        logActivity, loadComments, addComment, getChildren,
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
