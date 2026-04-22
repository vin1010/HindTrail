import { Document, Page, View, Text, Image, StyleSheet, Link } from "@react-pdf/renderer";

export interface HandoverPackProps {
  pkg: any;
  project: any;
  documents: any[];
  inspections: any[];
  issues: any[];
  approvals: any[];
  activity: any[];
  generatedBy: string;
}

const styles = StyleSheet.create({
  document: { fontSize: 10, fontFamily: "Helvetica" },
  page: { padding: 40, backgroundColor: "#ffffff" },

  coverPage: { justifyContent: "space-between" },
  coverTitle: { fontSize: 32, fontWeight: "bold", color: "#4f46e5", marginBottom: 8 },
  coverSubtitle: { fontSize: 12, color: "#6b7280", marginBottom: 32 },
  coverMetadata: { marginBottom: 20, paddingTop: 20, borderTopWidth: 1, borderTopColor: "#e5e7eb" },
  coverField: { flexDirection: "row", marginBottom: 8, fontSize: 11 },
  coverLabel: { fontWeight: "bold", color: "#111827", width: 120 },
  coverValue: { color: "#374151", flex: 1 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, marginBottom: 20, width: 100 },

  readinessBox: {
    marginTop: 20, padding: 16, borderRadius: 8,
    backgroundColor: "#f9fafb", borderWidth: 1, borderColor: "#e5e7eb",
  },
  readinessTitle: { fontSize: 12, fontWeight: "bold", color: "#111827", marginBottom: 8 },
  readinessRow: { flexDirection: "row", fontSize: 10, marginBottom: 4 },
  readinessPctBig: { fontSize: 24, fontWeight: "bold", color: "#047857", marginBottom: 4 },
  readinessPctAmber: { fontSize: 24, fontWeight: "bold", color: "#b45309", marginBottom: 4 },

  sectionHeading: {
    backgroundColor: "#4f46e5", color: "#ffffff", fontSize: 12, fontWeight: "bold",
    paddingHorizontal: 8, paddingVertical: 6, marginBottom: 12, marginTop: 16,
  },

  table: { marginBottom: 16 },
  tableRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#e5e7eb", paddingVertical: 8 },
  tableHeader: { backgroundColor: "#f3f4f6", fontWeight: "bold", paddingVertical: 8 },
  tableCell: { flex: 1, paddingHorizontal: 6, fontSize: 9 },

  text: { fontSize: 10, color: "#111827" },
  textMuted: { fontSize: 9, color: "#6b7280" },
  linkText: { fontSize: 9, color: "#4f46e5", textDecoration: "underline" },

  inspectionBlock: {
    marginBottom: 14, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: "#e5e7eb",
  },
  inspectionHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  inspectionTitle: { fontSize: 11, fontWeight: "bold", color: "#111827" },
  inspectionMeta: { fontSize: 9, color: "#6b7280", marginBottom: 6 },
  inspectionNotes: { fontSize: 10, color: "#374151", marginBottom: 8, lineHeight: 1.3 },

  photoGrid: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 4 },
  photoThumb: { width: 110, height: 80, borderRadius: 4, objectFit: "cover" },

  issueBlock: { marginBottom: 12, padding: 8, backgroundColor: "#fffbeb", borderRadius: 4 },
  issueHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  issueTitle: { fontSize: 11, fontWeight: "bold", color: "#111827" },
  issueBody: { fontSize: 9, color: "#374151", marginBottom: 4 },
  issueMeta: { fontSize: 8, color: "#6b7280" },

  approvalBlock: { marginBottom: 10, padding: 8, backgroundColor: "#f9fafb", borderRadius: 4 },

  footer: {
    position: "absolute", bottom: 20, left: 40, right: 40,
    flexDirection: "row", justifyContent: "space-between",
    fontSize: 8, color: "#9ca3af", borderTopWidth: 1, borderTopColor: "#e5e7eb", paddingTop: 8,
  },
});

function statusColor(s: string): string {
  const map: Record<string, string> = {
    "Approved for Use": "#047857", Approved: "#047857", Passed: "#047857",
    Draft: "#6b7280", Open: "#6b7280",
    Submitted: "#1d4ed8", "In Progress": "#1d4ed8",
    Superseded: "#9ca3af", Closed: "#6b7280",
    Failed: "#dc2626", Rejected: "#dc2626",
    "Awaiting Approval": "#d97706", Pending: "#d97706",
  };
  return map[s] ?? "#6b7280";
}

function CoverPage({ pkg, project, generatedBy, documents, inspections, issues, approvals }: HandoverPackProps) {
  const today = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  const r = pkg.rollup;
  const openIssues = r?.openIssues ?? issues.filter((i) => i.status !== "Closed").length;
  const pendingApprovals = r?.pendingApprovals ?? approvals.filter((a) => a.decision === "Pending").length;
  const completionPct = r?.completionPct ?? 0;
  const ready = completionPct >= 100 && openIssues === 0 && pendingApprovals === 0;

  return (
    <Page size="A4" style={[styles.page, styles.coverPage]}>
      <View>
        <Text style={styles.coverTitle}>{pkg.name}</Text>
        <Text style={styles.coverSubtitle}>Evidence & Handover Pack</Text>

        <View style={[styles.statusBadge, { backgroundColor: statusColor(pkg.status) }]}>
          <Text style={{ color: "#ffffff", fontSize: 10, fontWeight: "bold" }}>{pkg.status}</Text>
        </View>

        <View style={styles.coverMetadata}>
          <View style={styles.coverField}>
            <Text style={styles.coverLabel}>Package Code</Text>
            <Text style={styles.coverValue}>{pkg.code}</Text>
          </View>
          {project && (
            <>
              <View style={styles.coverField}>
                <Text style={styles.coverLabel}>Project</Text>
                <Text style={styles.coverValue}>{project.name}</Text>
              </View>
              <View style={styles.coverField}>
                <Text style={styles.coverLabel}>Client</Text>
                <Text style={styles.coverValue}>{project.clientName || project.client}</Text>
              </View>
              <View style={styles.coverField}>
                <Text style={styles.coverLabel}>Location</Text>
                <Text style={styles.coverValue}>{project.location}</Text>
              </View>
            </>
          )}
          <View style={styles.coverField}>
            <Text style={styles.coverLabel}>Owner</Text>
            <Text style={styles.coverValue}>{pkg.ownerCompany}</Text>
          </View>
          <View style={styles.coverField}>
            <Text style={styles.coverLabel}>Responsible</Text>
            <Text style={styles.coverValue}>{pkg.responsible}</Text>
          </View>
          <View style={styles.coverField}>
            <Text style={styles.coverLabel}>Due Date</Text>
            <Text style={styles.coverValue}>{pkg.dueDate || "—"}</Text>
          </View>
        </View>

        <View style={styles.readinessBox}>
          <Text style={styles.readinessTitle}>Handover Readiness</Text>
          <Text style={ready ? styles.readinessPctBig : styles.readinessPctAmber}>
            {completionPct}% {ready ? "· Ready" : "· Not yet ready"}
          </Text>
          <View style={styles.readinessRow}>
            <Text style={{ width: 160 }}>Documents:</Text>
            <Text>{documents.length}</Text>
          </View>
          <View style={styles.readinessRow}>
            <Text style={{ width: 160 }}>Inspections:</Text>
            <Text>{inspections.length} ({inspections.filter((i) => i.result === "Passed").length} passed)</Text>
          </View>
          <View style={styles.readinessRow}>
            <Text style={{ width: 160 }}>Open issues:</Text>
            <Text>{openIssues}</Text>
          </View>
          <View style={styles.readinessRow}>
            <Text style={{ width: 160 }}>Pending approvals:</Text>
            <Text>{pendingApprovals}</Text>
          </View>
        </View>
      </View>

      <View style={{ borderTopWidth: 1, borderTopColor: "#e5e7eb", paddingTop: 20 }}>
        <Text style={styles.textMuted}>Generated by: {generatedBy}</Text>
        <Text style={styles.textMuted}>{today}</Text>
        <Text style={[styles.textMuted, { marginTop: 16, fontWeight: "bold" }]}>HindTrail</Text>
        <Text style={styles.textMuted}>Project execution across contractors</Text>
      </View>
    </Page>
  );
}

function OverviewPage({ pkg }: HandoverPackProps) {
  return (
    <Page size="A4" style={styles.page}>
      <Text style={styles.sectionHeading}>1. Package Overview</Text>
      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={[styles.tableCell, { flex: 1.5 }]}>Field</Text>
          <Text style={[styles.tableCell, { flex: 2 }]}>Value</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={[styles.tableCell, { flex: 1.5, fontWeight: "bold" }]}>Status</Text>
          <Text style={[styles.tableCell, { flex: 2 }]}>{pkg.status}</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={[styles.tableCell, { flex: 1.5, fontWeight: "bold" }]}>Owner Company</Text>
          <Text style={[styles.tableCell, { flex: 2 }]}>{pkg.ownerCompany}</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={[styles.tableCell, { flex: 1.5, fontWeight: "bold" }]}>Responsible</Text>
          <Text style={[styles.tableCell, { flex: 2 }]}>{pkg.responsible}</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={[styles.tableCell, { flex: 1.5, fontWeight: "bold" }]}>Due Date</Text>
          <Text style={[styles.tableCell, { flex: 2 }]}>{pkg.dueDate || "—"}</Text>
        </View>
      </View>
      {pkg.description && (
        <>
          <Text style={[styles.sectionHeading, { marginTop: 20 }]}>Description</Text>
          <Text style={[styles.text, { lineHeight: 1.4 }]}>{pkg.description}</Text>
        </>
      )}
    </Page>
  );
}

function DocumentsPage({ documents }: HandoverPackProps) {
  if (documents.length === 0) return null;
  const current = documents.filter((d) => d.isCurrent);
  const superseded = documents.filter((d) => !d.isCurrent);

  return (
    <Page size="A4" style={styles.page}>
      <Text style={styles.sectionHeading}>2. Documents</Text>

      {current.length > 0 && (
        <View style={styles.table}>
          <Text style={[styles.text, { fontWeight: "bold", marginBottom: 8 }]}>Current Versions</Text>
          {current.map((d) => (
            <View key={d.id} style={{ marginBottom: 10, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: "#e5e7eb" }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={[styles.text, { fontWeight: "bold", flex: 2 }]}>{d.title}</Text>
                <Text style={[styles.text, { color: statusColor(d.status) }]}>{d.status}</Text>
              </View>
              <Text style={styles.textMuted}>
                {d.type} · {d.revision} · uploaded by {d.uploadedBy} on {d.uploadDate}
              </Text>
              {d.notes && <Text style={[styles.textMuted, { marginTop: 2 }]}>{d.notes}</Text>}
              {d.fileUrl && (
                <Link src={d.fileUrl} style={[styles.linkText, { marginTop: 3 }]}>
                  {d.fileUrl}
                </Link>
              )}
            </View>
          ))}
        </View>
      )}

      {superseded.length > 0 && (
        <View style={[styles.table, { marginTop: 12 }]}>
          <Text style={[styles.text, { fontWeight: "bold", marginBottom: 8, color: "#6b7280" }]}>Superseded Versions</Text>
          {superseded.map((d) => (
            <View key={d.id} style={{ opacity: 0.6, marginBottom: 4 }}>
              <Text style={styles.textMuted}>
                {d.title} · {d.revision} · {d.uploadDate}
              </Text>
            </View>
          ))}
        </View>
      )}
    </Page>
  );
}

function InspectionsPage({ inspections }: HandoverPackProps) {
  if (inspections.length === 0) return null;

  return (
    <Page size="A4" style={styles.page}>
      <Text style={styles.sectionHeading}>3. Inspections</Text>
      {inspections.map((i) => (
        <View key={i.id} style={styles.inspectionBlock} wrap={false}>
          <View style={styles.inspectionHeader}>
            <Text style={styles.inspectionTitle}>{i.type}</Text>
            <Text style={[styles.text, { color: statusColor(i.result), fontWeight: "bold" }]}>{i.result}</Text>
          </View>
          <Text style={styles.inspectionMeta}>
            {i.date} · Inspector: {i.inspector}
          </Text>
          {i.notes && <Text style={styles.inspectionNotes}>{i.notes}</Text>}
          {i.evidencePhotos && i.evidencePhotos.length > 0 && (
            <View style={styles.photoGrid}>
              {i.evidencePhotos.slice(0, 6).map((url: string, idx: number) => (
                <Image key={idx} src={url} style={styles.photoThumb} />
              ))}
            </View>
          )}
        </View>
      ))}
    </Page>
  );
}

function IssuesPage({ issues }: HandoverPackProps) {
  if (issues.length === 0) return null;

  return (
    <Page size="A4" style={styles.page}>
      <Text style={styles.sectionHeading}>4. Issues / NCRs</Text>
      {issues.map((iss) => (
        <View key={iss.id} style={styles.issueBlock} wrap={false}>
          <View style={styles.issueHeader}>
            <Text style={styles.issueTitle}>
              [{iss.severity}] {iss.title}
            </Text>
            <Text style={[styles.text, { color: statusColor(iss.status), fontWeight: "bold" }]}>{iss.status}</Text>
          </View>
          {iss.description && <Text style={styles.issueBody}>{iss.description}</Text>}
          <Text style={styles.issueMeta}>
            Owner: {iss.owner} · Due: {iss.dueDate || "—"}
          </Text>
          {iss.closureNotes && (
            <Text style={[styles.issueMeta, { marginTop: 3, fontStyle: "italic" }]}>
              Closure: {iss.closureNotes}
            </Text>
          )}
        </View>
      ))}
    </Page>
  );
}

function ApprovalsPage({ approvals }: HandoverPackProps) {
  if (approvals.length === 0) return null;

  return (
    <Page size="A4" style={styles.page}>
      <Text style={styles.sectionHeading}>5. Approvals / Sign-offs</Text>
      {approvals.map((a) => (
        <View key={a.id} style={styles.approvalBlock} wrap={false}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
            <Text style={[styles.text, { fontWeight: "bold" }]}>
              {a.objectType}: {a.objectLabel}
            </Text>
            <Text style={[styles.text, { color: statusColor(a.decision), fontWeight: "bold" }]}>{a.decision}</Text>
          </View>
          <Text style={styles.textMuted}>
            Submitted by {a.submittedBy} on {a.submittedDate} · Approver: {a.approver}
            {a.decisionDate ? ` · Decided ${a.decisionDate}` : ""}
          </Text>
          {a.comments && (
            <Text style={[styles.text, { marginTop: 4, fontStyle: "italic" }]}>“{a.comments}”</Text>
          )}
        </View>
      ))}
    </Page>
  );
}

function ActivityPage({ activity }: HandoverPackProps) {
  return (
    <Page size="A4" style={styles.page}>
      <Text style={styles.sectionHeading}>6. Audit Trail</Text>
      {activity.length === 0 ? (
        <Text style={styles.textMuted}>No activity recorded</Text>
      ) : (
        activity.map((a, idx) => (
          <View key={a.id || idx} style={{ marginBottom: 8, flexDirection: "row" }}>
            <Text style={[styles.textMuted, { width: 90 }]}>
              {new Date(a.timestamp).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
            </Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.text}>
                <Text style={{ fontWeight: "bold" }}>{a.user}</Text>{" "}
                <Text style={styles.textMuted}>({a.company})</Text>
              </Text>
              <Text style={styles.textMuted}>
                {a.actionType} {a.objectType}: {a.objectLabel}
              </Text>
            </View>
          </View>
        ))
      )}
    </Page>
  );
}

export function HandoverPackPDF(props: HandoverPackProps) {
  return (
    <Document>
      <CoverPage {...props} />
      <OverviewPage {...props} />
      <DocumentsPage {...props} />
      <InspectionsPage {...props} />
      <IssuesPage {...props} />
      <ApprovalsPage {...props} />
      <ActivityPage {...props} />
    </Document>
  );
}
