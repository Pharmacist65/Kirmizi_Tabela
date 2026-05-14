import { Gift } from "lucide-react";
import type { TurnOutcome } from "@/game/types";

type SurpriseCardProps = {
  outcome: TurnOutcome | null;
};

export function SurpriseCard({ outcome }: SurpriseCardProps) {
  return (
    <section className={`surprise-panel ${outcome ? "odd" : "sealed"}`}>
      <div className="event-meta">
        <span>GÜNÜN SÜRPRİZİ</span>
        <Gift size={18} aria-hidden="true" />
      </div>
      {outcome ? (
        <>
          <h3>{outcome.surpriseTitle}</h3>
          <p>{outcome.surpriseDescription}</p>
        </>
      ) : (
        <>
          <h3>Kapalı Zarf</h3>
          <p>Günlük hamle ve karar seçilmeden açılmaz. İyi de olabilir, kötü de.</p>
        </>
      )}
    </section>
  );
}
