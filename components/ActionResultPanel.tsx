import { Activity } from "lucide-react";
import { formatMoney } from "@/game/engine";
import type { ActionResult } from "@/game/types";

type ActionResultPanelProps = {
  result: ActionResult | null;
};

function formatDelta(delta: ActionResult["deltas"][number]) {
  const sign = delta.delta > 0 ? "+" : "";
  if (delta.kind === "money") {
    return `${sign}${formatMoney(delta.delta)}`;
  }
  return `${sign}${Math.round(delta.delta)}`;
}

export function ActionResultPanel({ result }: ActionResultPanelProps) {
  return (
    <aside className="action-result-panel">
      <div className="event-meta">
        <span>SON AKSİYON</span>
        <Activity size={18} aria-hidden="true" />
      </div>
      {result ? (
        <>
          <h3>{result.title}</h3>
          <p>{result.description}</p>
          {result.deltas.length ? (
            <div className="action-deltas">
              {result.deltas.map((delta) => (
                <div className={delta.delta >= 0 ? "up" : "down"} key={delta.label}>
                  <span>{delta.label}</span>
                  <strong>{formatDelta(delta)}</strong>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-delta">Bu hamle etkisini sonraki gün satışlarında gösterecek.</div>
          )}
        </>
      ) : (
        <>
          <h3>Henüz hamle yapmadın</h3>
          <p>Depodan ürün al, gün ilerlet, personele görev ver veya SGK kontrolü yap. Sonuç burada görünecek.</p>
        </>
      )}
    </aside>
  );
}
