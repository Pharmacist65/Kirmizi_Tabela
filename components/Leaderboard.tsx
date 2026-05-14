import { Trophy } from "lucide-react";
import { buildLeaderboard, formatMoney } from "@/game/engine";
import type { GameState } from "@/game/types";

type LeaderboardProps = {
  state: GameState;
};

export function Leaderboard({ state }: LeaderboardProps) {
  const rows = buildLeaderboard(state);

  return (
    <section className="leaderboard">
      <div className="panel-header">
        <div>
          <h3>Eczacı Ligi</h3>
          <div className="panel-note">Ana kıyas başarı puanı; ciro tek başına kazandırmaz.</div>
        </div>
        <Trophy size={19} aria-hidden="true" />
      </div>
      <div className="leaderboard-list">
        {rows.map((row, index) => (
          <div className={`leaderboard-row ${row.isPlayer ? "player" : ""}`} key={`${row.pharmacyName}-${row.pharmacistName}`}>
            <div className="rank">{index + 1}</div>
            <div className="rival-main">
              <strong>{row.pharmacyName}</strong>
              <span>{row.pharmacistName} · {row.city}/{row.district} · Level {row.level}</span>
            </div>
            <div className="rival-score">
              <strong>{row.score}</strong>
              <span>{formatMoney(row.netProfit)} net</span>
            </div>
            <div className="rival-trend">
              {row.trend}
              <span>Kaçan %{row.missedSalesRate}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
