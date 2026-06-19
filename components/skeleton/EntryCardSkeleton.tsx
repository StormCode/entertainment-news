export function EntryCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      role="presentation"
      style={{ display: "flex", flexDirection: "row", alignItems: "flex-start" }}
    >
      {/* Poster */}
      <div
        className="skeleton"
        style={{ flexShrink: 0, width: 250, height: 375 }}
      />
      {/* Article card */}
      <div
        style={{
          flex: 1,
          height: 336,
          marginTop: 28,
          marginLeft: -14,
          padding: "22px 22px 22px 28px",
          display: "flex",
          flexDirection: "column",
          background: "var(--paper-2)",
          borderRadius: "0 12px 12px 12px",
          overflow: "hidden",
        }}
      >
        {/* film label */}
        <div className="skeleton" style={{ height: 10, width: "55%", marginBottom: 12 }} />
        {/* title line 1 */}
        <div className="skeleton" style={{ height: 21, width: "92%", marginBottom: 7 }} />
        {/* title line 2 */}
        <div className="skeleton" style={{ height: 21, width: "68%", marginBottom: 20 }} />
        {/* excerpt lines */}
        <div className="skeleton" style={{ height: 13, width: "100%", marginBottom: 6 }} />
        <div className="skeleton" style={{ height: 13, width: "100%", marginBottom: 6 }} />
        <div className="skeleton" style={{ height: 13, width: "72%" }} />
        {/* chips */}
        <div style={{ marginTop: "auto", paddingTop: 14, display: "flex", gap: 8 }}>
          <div className="skeleton" style={{ height: 24, width: 80, borderRadius: 999 }} />
          <div className="skeleton" style={{ height: 24, width: 40, borderRadius: 999 }} />
        </div>
      </div>
    </div>
  );
}
