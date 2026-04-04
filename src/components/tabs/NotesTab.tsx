import { useState } from "react";
import { useData } from "../../context/DataContext";

export default function NotesTab({ packageId }: { packageId: string }) {
  const { comments, addComment } = useData();
  const [text, setText] = useState("");
  const items = comments.filter((c) => c.packageId === packageId);

  const handlePost = async () => {
    if (!text.trim()) return;
    await addComment(packageId, text.trim());
    setText("");
  };

  return (
    <div className="tab-content">
      <div className="tab-bar">
        <span className="tab-count">{items.length} note(s)</span>
      </div>
      {items.length === 0 && <p className="empty-state">No notes yet. Be the first to add one.</p>}
      <div className="activity-list">
        {items.map((c) => (
          <div key={c.id} className="activity-row">
            <div>
              <strong>{c.user?.fullName ?? "Unknown"}</strong>
              <span className="act-meta"> · {new Date(c.createdAt).toLocaleString()}</span>
            </div>
            <p style={{ margin: "4px 0 0", fontSize: 14 }}>{c.text}</p>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
        <textarea
          rows={2}
          style={{ flex: 1, resize: "vertical" }}
          placeholder="Add a note..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button className="btn-primary btn-sm" onClick={handlePost} disabled={!text.trim()}>
          Post
        </button>
      </div>
    </div>
  );
}
