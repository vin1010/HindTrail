import { useMemo, useRef, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";

interface CommentItem {
  kind: "comment";
  id: string;
  at: string;
  text: string;
  mentions: string[];
  userId?: string;
  userName: string;
}

interface ActivityItem {
  kind: "activity";
  id: string;
  at: string;
  user: string;
  company: string;
  actionType: string;
  objectType: string;
  objectLabel: string;
}

type FeedItem = CommentItem | ActivityItem;

export default function DiscussionTab({ packageId }: { packageId: string }) {
  const { user } = useAuth();
  const { comments, activity, members, addComment } = useData();
  const [text, setText] = useState("");
  const [picked, setPicked] = useState<{ email: string; name: string }[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const [posting, setPosting] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);

  const feed: FeedItem[] = useMemo(() => {
    const c: CommentItem[] = comments
      .filter((x: any) => x.packageId === packageId)
      .map((x: any) => ({
        kind: "comment" as const,
        id: x.id,
        at: x.createdAt,
        text: x.text,
        mentions: x.mentions ?? [],
        userId: x.user?.id ?? x.userId,
        userName: x.user?.fullName ?? "Unknown",
      }));
    const a: ActivityItem[] = activity
      .filter((x: any) => x.packageId === packageId)
      .map((x: any) => ({
        kind: "activity" as const,
        id: x.id,
        at: typeof x.timestamp === "string" ? x.timestamp : new Date(x.timestamp).toISOString(),
        user: x.user ?? "",
        company: x.company ?? "",
        actionType: x.actionType ?? "",
        objectType: x.objectType ?? "",
        objectLabel: x.objectLabel ?? "",
      }));
    return [...c, ...a].sort((x, y) => x.at.localeCompare(y.at));
  }, [comments, activity, packageId]);

  const packageMembers = members.filter((m) => m.packageId === packageId);
  const mentionCandidates = packageMembers.filter(
    (m) => !picked.some((p) => p.email === m.email) && m.email
  );

  const togglePick = (email: string, name: string) => {
    setPicked((prev) =>
      prev.some((p) => p.email === email)
        ? prev.filter((p) => p.email !== email)
        : [...prev, { email, name }]
    );
  };

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setPosting(true);
    try {
      const mentionsList = picked.map((p) => p.email);
      // Prepend @mention tokens to the message body so other viewers see context
      // even if the mention chip UI isn't rendered where the comment is shown.
      const prefix = picked.length
        ? picked.map((p) => `@${p.name}`).join(" ") + " "
        : "";
      await addComment(packageId, prefix + trimmed, mentionsList);
      setText("");
      setPicked([]);
      setShowPicker(false);
      // Scroll to bottom after a tick so the new bubble is visible.
      setTimeout(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    } finally {
      setPosting(false);
    }
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString("en-GB", {
      day: "2-digit", month: "short",
      hour: "2-digit", minute: "2-digit",
    });
  };

  return (
    <div className="tab-content">
      <div className="tab-bar">
        <span className="tab-count">Discussion · {feed.filter((f) => f.kind === "comment").length} message(s)</span>
      </div>

      <div className="disc-feed">
        {feed.length === 0 && (
          <p className="empty-state">No messages or activity yet — say something to get the chain started.</p>
        )}
        {feed.map((item) => {
          if (item.kind === "activity") {
            return (
              <div key={`a-${item.id}`} className="disc-system">
                <span className="disc-system-dot" />
                <span>
                  <strong>{item.user}</strong>
                  <span className="disc-system-muted"> ({item.company})</span>{" "}
                  {item.actionType.toLowerCase()} {item.objectType.toLowerCase()}:{" "}
                  <em>{item.objectLabel}</em>
                </span>
                <span className="disc-system-time">{formatTime(item.at)}</span>
              </div>
            );
          }
          const mine = item.userId === user?.id || item.userName === user?.fullName;
          return (
            <div key={`c-${item.id}`} className={`disc-row ${mine ? "disc-row-mine" : ""}`}>
              {!mine && (
                <div className="disc-avatar">{item.userName.charAt(0)}</div>
              )}
              <div className="disc-bubble-wrap">
                {!mine && <div className="disc-author">{item.userName}</div>}
                <div className="disc-bubble">{renderWithMentions(item.text)}</div>
                <div className="disc-time">{formatTime(item.at)}</div>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      <div className="disc-composer">
        {picked.length > 0 && (
          <div className="disc-chips">
            {picked.map((p) => (
              <span key={p.email} className="disc-chip">
                @{p.name}
                <button
                  type="button"
                  className="disc-chip-x"
                  onClick={() => setPicked((prev) => prev.filter((x) => x.email !== p.email))}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
        <div className="disc-composer-row">
          <textarea
            className="disc-composer-input"
            rows={2}
            placeholder="Write a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <div className="disc-composer-actions">
            {packageMembers.length > 0 && (
              <div className="disc-mention-wrap">
                <button
                  type="button"
                  className="disc-mention-btn"
                  onClick={() => setShowPicker(!showPicker)}
                  disabled={mentionCandidates.length === 0 && picked.length === 0}
                  title="Mention a package member"
                >
                  @ Mention
                </button>
                {showPicker && (
                  <div className="disc-mention-menu">
                    <div className="disc-mention-header">Mention a member</div>
                    {mentionCandidates.length === 0 ? (
                      <div className="disc-mention-empty">All members already mentioned</div>
                    ) : (
                      mentionCandidates.map((m) => (
                        <button
                          key={m.id}
                          className="disc-mention-item"
                          onClick={() => {
                            togglePick(m.email, m.name);
                            setShowPicker(false);
                          }}
                        >
                          <div className="disc-mention-item-name">{m.name}</div>
                          <div className="disc-mention-item-meta">{m.company} · {m.role}</div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
            <button
              className="btn-primary btn-sm"
              onClick={handleSend}
              disabled={!text.trim() || posting}
            >
              {posting ? "Sending..." : "Send"}
            </button>
          </div>
        </div>
        <div className="disc-hint">Enter to send · Shift+Enter for a new line</div>
      </div>
    </div>
  );
}

function renderWithMentions(text: string) {
  // Highlight tokens that look like @Name (a word boundary after @).
  const parts = text.split(/(@[A-Za-z][A-Za-z\s]{0,40}?)(?=[,.:!?\s]|$)/);
  return parts.map((part, i) =>
    part.startsWith("@") ? (
      <span key={i} className="disc-mention-token">{part}</span>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}
