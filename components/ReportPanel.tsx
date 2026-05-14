import { calculateEndScore, formatMoney } from "@/game/engine";
import type { GameState } from "@/game/types";

type ReportPanelProps = {
  state: GameState;
};

export function ReportPanel({ state }: ReportPanelProps) {
  return (
    <section className="report">
      <h3>Gün Sonu Özeti</h3>
      <div className="report-grid">
        <div className="report-item">
          <small>Günlük ciro</small>
          <strong>{formatMoney(state.dailyRevenue)}</strong>
        </div>
        <div className="report-item">
          <small>Günlük sonuç</small>
          <strong>{formatMoney(state.dailyProfit)}</strong>
        </div>
        <div className="report-item">
          <small>SGK alacağı</small>
          <strong>{formatMoney(state.sgkReceivable)}</strong>
        </div>
        <div className="report-item">
          <small>Başarı skoru</small>
          <strong>{calculateEndScore(state)}/100</strong>
        </div>
      </div>
    </section>
  );
}
