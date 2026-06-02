import { ClipboardCheck } from "lucide-react";
import { formatMoney } from "@/game/engine";
import type { DayReport } from "@/game/types";

type DayReportPanelProps = {
  report: DayReport | null;
};

export function DayReportPanel({ report }: DayReportPanelProps) {
  return (
    <section className="day-report-panel">
      <div className="event-meta">
        <span>GÜN SONU RAPORU</span>
        <ClipboardCheck size={18} aria-hidden="true" />
      </div>
      {report ? (
        <>
          <h3>{report.title}</h3>
          <div className="report-kpis">
            <div><span>Nakit</span><strong>{formatMoney(report.cashSales)}</strong></div>
            <div><span>POS alacağı</span><strong>{formatMoney(report.posSales)}</strong></div>
            <div><span>SGK</span><strong>{formatMoney(report.sgkAccrued)}</strong></div>
            <div><span>Kaçan</span><strong>{report.missedUnits}</strong></div>
            <div><span>Tahsilat</span><strong>{formatMoney(report.collections)}</strong></div>
            <div><span>Depo ödemesi</span><strong>{formatMoney(report.supplierPaid)}</strong></div>
          </div>
          <div className="sold-lines">
            {report.lines.filter((line) => line.soldUnits || line.missedUnits).slice(0, 5).map((line) => (
              <div key={line.categoryId}>
                <span>{line.name}</span>
                <strong>{line.soldUnits} satış · {line.missedUnits} kaçan</strong>
              </div>
            ))}
          </div>
          <ul>
            {report.notes.slice(0, 4).map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </>
      ) : (
        <>
          <h3>Henüz gün kapanmadı</h3>
          <p>Hazırlık yap, stok/raf/personel kararlarını ver, sonra günü simüle et. Kararlarının raporu burada çıkacak.</p>
        </>
      )}
    </section>
  );
}
