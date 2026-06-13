export function HeroSkeleton() {
  return (
    <div
      className="skeleton"
      style={{ aspectRatio: "21/9", width: "100%" }}
      aria-hidden="true"
      role="presentation"
    />
  );
}
