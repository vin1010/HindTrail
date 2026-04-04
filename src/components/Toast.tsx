import { useState, useEffect } from "react";

type ToastFn = (message: string, type?: "error" | "info") => void;
let _show: ToastFn | null = null;

export function showToast(message: string, type: "error" | "info" = "error") {
  _show?.(message, type);
}

export function ToastProvider() {
  const [toasts, setToasts] = useState<{ id: number; message: string; type: string }[]>([]);

  useEffect(() => {
    _show = (message, type = "error") => {
      const id = Date.now();
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
    };
    return () => {
      _show = null;
    };
  }, []);

  if (toasts.length === 0) return null;
  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        zIndex: 9999,
      }}
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          style={{
            background: t.type === "error" ? "#dc2626" : "#1d4ed8",
            color: "white",
            padding: "10px 18px",
            borderRadius: 8,
            fontSize: 14,
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            maxWidth: 360,
          }}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
