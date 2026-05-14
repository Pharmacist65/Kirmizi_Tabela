import type { LucideIcon } from "lucide-react";

type StatCardProps = {
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
};

export function StatCard({ label, value, detail, icon: Icon }: StatCardProps) {
  return (
    <section className="stat-card">
      <div className="stat-head">
        <span>{label}</span>
        <Icon size={19} strokeWidth={2} aria-hidden="true" />
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-detail">{detail}</div>
    </section>
  );
}
