import { Flag, MousePointer2, Trophy } from "lucide-react";
import { calculateEndScore, evaluateScenario } from "@/game/engine";
import type { GameState } from "@/game/types";

type PlayGuideProps = {
  state: GameState;
};

export function PlayGuide({ state }: PlayGuideProps) {
  const score = calculateEndScore(state);
  const evaluation = evaluateScenario(state);
  const danger =
    state.cash < 50000
      ? "Kasa düşük; peşin nakit yaratan kararlar değerli."
      : state.energy < 35
        ? "Enerji düşük; banko akışı ve personel morali önemli."
        : state.complianceRisk > 55
          ? "Uyum riski yükselmiş; SGK/reçete kontrolü öncelikli."
          : "Bugün karar alanın geniş; uzun vadeli dengeyi koru.";

  return (
    <section className="play-guide">
      <div>
        <Flag size={18} aria-hidden="true" />
        <span>Sezon hedefi</span>
        <strong>{evaluation.monthsRemaining} ay içinde hedefleri tuttur</strong>
      </div>
      <div>
        <MousePointer2 size={18} aria-hidden="true" />
        <span>Bugünkü odak</span>
        <strong>{danger}</strong>
      </div>
      <div>
        <Trophy size={18} aria-hidden="true" />
        <span>Başarı puanı</span>
        <strong>{score}/100</strong>
      </div>
    </section>
  );
}
