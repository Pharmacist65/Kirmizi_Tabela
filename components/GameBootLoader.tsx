import type { CSSProperties } from "react";

export function GameBootLoader({ label = "Eczane sahnesi hazırlanıyor" }: { label?: string }) {
  return (
    <div className="game-boot-loader" role="status" aria-live="polite">
      <div className="game-boot-mark" aria-hidden="true">
        {Array.from({ length: 8 }, (_, index) => (
          <span key={index} style={{ "--frame": index } as CSSProperties & Record<"--frame", number>} />
        ))}
      </div>
      <strong>Kırmızı Tabela</strong>
      <small>{label}</small>
    </div>
  );
}
