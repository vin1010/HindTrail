import "./HierarchyCard.css";

type Props = {
  title: string;
  subtitle: string;
  progress: number; // 0–100
  status: "Active" | "In Progress" | "Completed";
};

function HierarchyCard({ title, subtitle, progress, status }: Props) {
  return (
    <div className="h-card">
      <div className="h-card-header">
        <div>
          <h3>{title}</h3>
          <p>{subtitle}</p>
        </div>

        <span className={`status ${status.toLowerCase().replace(" ", "-")}`}>
          {status}
        </span>
      </div>

      <div className="progress">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span>{progress}%</span>
      </div>
    </div>
  );
}

export default HierarchyCard;
