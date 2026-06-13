export function EntryCardSkeleton() {
  return (
    <div aria-hidden="true" role="presentation">
      {/* Poster 2:3 */}
      <div className="skeleton" style={{ aspectRatio: "2/3", width: "100%", marginBottom: 12 }} />
      {/* Title */}
      <div className="skeleton" style={{ height: "1.2em", width: "90%", marginBottom: 8 }} />
      {/* Meta */}
      <div className="skeleton" style={{ height: "0.9em", width: "60%" }} />
    </div>
  );
}
