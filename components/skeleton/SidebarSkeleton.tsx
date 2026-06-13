export function SidebarSkeleton() {
  return (
    <div aria-hidden="true" role="presentation" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {[0, 1, 2].map((i) => (
        <div key={i}>
          {/* Panel heading */}
          <div className="skeleton" style={{ height: "0.8em", width: "50%", marginBottom: 12 }} />
          {/* 3 items */}
          {[0, 1, 2].map((j) => (
            <div
              key={j}
              className="skeleton"
              style={{ height: "0.9em", width: `${80 - j * 10}%`, marginBottom: 8 }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
