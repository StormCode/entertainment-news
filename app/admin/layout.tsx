import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "管理後台", template: "%s — 散場之後管理" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", background: "var(--paper)" }}>
      {children}
    </div>
  );
}
