import { MapPinned, ReceiptText, ShoppingBasket, UsersRound } from "lucide-react";
import { formatMoney } from "@/game/engine";
import type { GameState } from "@/game/types";

type LocationProfileProps = {
  state: GameState;
};

export function LocationProfile({ state }: LocationProfileProps) {
  return (
    <section className="location-profile">
      <div className="side-label">Lokasyon Profili</div>
      <div className="location-title">
        <MapPinned size={18} aria-hidden="true" />
        <strong>{state.locationName}</strong>
      </div>
      <div className="location-grid">
        <div>
          <UsersRound size={16} aria-hidden="true" />
          <span>Trafik</span>
          <strong>{state.traffic}</strong>
        </div>
        <div>
          <ReceiptText size={16} aria-hidden="true" />
          <span>Reçete</span>
          <strong>{state.prescriptionPressure}</strong>
        </div>
        <div>
          <ShoppingBasket size={16} aria-hidden="true" />
          <span>OTC/Dermo</span>
          <strong>{state.retailPotential}</strong>
        </div>
      </div>
      <div className="rent-line">
        <span>Aylık kira</span>
        <strong>{formatMoney(state.monthlyRent)}</strong>
      </div>
    </section>
  );
}
