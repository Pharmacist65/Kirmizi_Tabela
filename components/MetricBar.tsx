import { getScoreStatus } from "@/game/engine";

type MetricBarProps = {
  label: string;
  value: number;
  inverse?: boolean;
};

export function MetricBar({ label, value, inverse = false }: MetricBarProps) {
  return (
    <section className="metric-panel">
      <div className="metric-top">
        <span>{label}</span>
        <strong>{Math.round(value)}</strong>
      </div>
      <div className={`meter ${getScoreStatus(value, inverse)}`}>
        <span style={{ width: `${Math.max(2, Math.min(100, value))}%` }} />
      </div>
    </section>
  );
}
