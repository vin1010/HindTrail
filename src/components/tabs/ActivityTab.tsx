import { useData } from "../../context/DataContext";

export default function ActivityTab({ packageId }: { packageId: string }) {
  const { activity } = useData();
  const entries = activity
    .filter((a) => a.packageId === packageId)
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp));

  return (
    <div className="tab-content">
      <div className="tab-bar">
        <span className="tab-count">Audit trail — {entries.length} events</span>
      </div>

      <div className="activity-list">
        {entries.map((e) => (
          <div key={e.id} className="activity-row">
            <div className="activity-dot" />
            <div className="activity-body">
              <div className="activity-action">
                <strong>{e.user}</strong>
                <span className="activity-company">({e.company})</span>
                <span>·</span>
                <span>{e.actionType}</span>
              </div>
              <div className="activity-obj">
                <span className="obj-type-badge">{e.objectType}</span>
                {e.objectLabel}
              </div>
              <span className="activity-time">{e.timestamp}</span>
            </div>
          </div>
        ))}
        {entries.length === 0 && <p className="empty-state">No activity recorded yet.</p>}
      </div>
    </div>
  );
}
