import {
  Banknote,
  Boxes,
  ClipboardCheck,
  CreditCard,
  LayoutGrid,
  Repeat2,
  Receipt,
  ReceiptText,
  ShoppingCart,
  UsersRound
} from "lucide-react";
import { roleLabels, staffCandidates, staffTasks } from "@/data/staff";
import {
  calculateMonthlyRoutineExpenses,
  formatMoney,
  getPurchaseQuote,
  purchasePaymentLabels,
  shelfFocusLabels
} from "@/game/engine";
import type { GameState, LedgerEntry, PurchasePayment, ShelfFocus } from "@/game/types";

export type ModuleId = "eczane" | "depo" | "stok" | "sgk" | "personel" | "finans" | "pazar";

type GameModulesProps = {
  activeModule: ModuleId;
  state: GameState;
  onBuyInventory: (categoryId: string, payment: PurchasePayment) => void;
  onAdvanceDay: () => void;
  onShelfFocus: (focus: ShelfFocus) => void;
  onAssignStaff: (personId: string, taskId: string) => void;
  onHireStaff: (candidateId: string) => void;
  onFireStaff: (personId: string) => void;
  onRaiseStaff: (personId: string) => void;
  onSgkControl: () => void;
  onChamberApproval: () => void;
  onMarketplaceBuy: (categoryId: string) => void;
  onMarketplaceSell: (categoryId: string) => void;
  onPayDebt: () => void;
};

const shelfOptions: ShelfFocus[] = ["balanced", "prescription", "otc", "dermo", "flow"];
const purchaseOptions: PurchasePayment[] = ["cash", "term-45", "term-60", "term-90"];

function stockRatio(stock: number, capacity: number) {
  return Math.min(100, Math.round((stock / capacity) * 100));
}

function ledgerStatusLabel(status: LedgerEntry["status"]) {
  if (status === "paid") return "Ödendi";
  if (status === "overdue") return "Aksadı";
  return "Açık";
}

function LedgerList({ title, entries, emptyLabel }: { title: string; entries: LedgerEntry[]; emptyLabel: string }) {
  const visibleEntries = entries
    .filter((entry) => entry.status !== "paid" && entry.amount > 0)
    .sort((a, b) => a.dueDay - b.dueDay)
    .slice(0, 5);

  return (
    <div className="ledger-list">
      <strong>{title}</strong>
      {visibleEntries.length ? (
        visibleEntries.map((entry, index) => (
          <span className={entry.status === "overdue" ? "overdue" : ""} key={`${entry.id}-${index}`}>
            <b>{entry.description}</b>
            <em>
              {formatMoney(entry.amount)} · gün {entry.dueDay} · {ledgerStatusLabel(entry.status)}
            </em>
          </span>
        ))
      ) : (
        <span>{emptyLabel}</span>
      )}
    </div>
  );
}

export function GameModules({
  activeModule,
  state,
  onBuyInventory,
  onAdvanceDay,
  onShelfFocus,
  onAssignStaff,
  onHireStaff,
  onFireStaff,
  onRaiseStaff,
  onSgkControl,
  onChamberApproval,
  onMarketplaceBuy,
  onMarketplaceSell,
  onPayDebt
}: GameModulesProps) {
  const totalStock = state.inventory.reduce((sum, item) => sum + item.stock, 0);
  const totalCapacity = state.inventory.reduce((sum, item) => sum + item.capacity, 0);
  const lowestStock = [...state.inventory].sort((a, b) => a.stock / a.capacity - b.stock / b.capacity)[0];

  if (activeModule === "depo") {
    return (
      <section className="module-surface">
        <div className="module-head">
          <div>
            <h2>Depo</h2>
            <p>Ürün al, rafı doldur. Peşin alım kasayı düşürür; vadeli alım depo borcunu büyütür.</p>
          </div>
          <ShoppingCart size={22} aria-hidden="true" />
        </div>
        <div className="trade-grid">
          {state.inventory.map((item) => {
            return (
              <article className="trade-card" key={item.id}>
                <div>
                  <strong>{item.name}</strong>
                  <span>
                    Stok {item.stock}/{item.capacity} · Talep {item.demand}/gün
                  </span>
                </div>
                <div className="stock-meter">
                  <i style={{ width: `${stockRatio(item.stock, item.capacity)}%` }} />
                </div>
                <small>
                  Kategori vade alışkanlığı {item.defaultTermDays} gün · miat riski {item.expiryRisk}/100
                </small>
                <div className="preview-line term-preview">
                  {purchaseOptions.map((payment) => {
                    const quote = getPurchaseQuote(state, item.id, 10, payment);
                    return (
                      <span key={payment}>
                        {purchasePaymentLabels[payment]}: {formatMoney(quote?.amount ?? 0)}
                        {payment === "cash" ? " bugün" : ` · ${quote?.dueLabel ?? "vade"}`}
                      </span>
                    );
                  })}
                </div>
                <div className="payment-button-grid">
                  {purchaseOptions.map((payment) => (
                    <button disabled={item.stock >= item.capacity} key={payment} onClick={() => onBuyInventory(item.id, payment)}>
                      {purchasePaymentLabels[payment]}
                    </button>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      </section>
    );
  }

  if (activeModule === "stok") {
    return (
      <section className="module-surface">
        <div className="module-head">
          <div>
            <h2>Raf / Stok</h2>
            <p>Raf odağı satış dağılımını değiştirir. Stok azsa satış kaçar, stok fazlaysa miat riski doğar.</p>
          </div>
          <LayoutGrid size={22} aria-hidden="true" />
        </div>
        <div className="focus-row">
          {shelfOptions.map((focus) => (
            <button className={state.shelfFocus === focus ? "active" : ""} key={focus} onClick={() => onShelfFocus(focus)}>
              {shelfFocusLabels[focus]}
            </button>
          ))}
        </div>
        <div className="inventory-table">
          {state.inventory.map((item) => (
            <div key={item.id}>
              <strong>{item.name}</strong>
              <span>{item.kind}</span>
              <span>{item.stock}/{item.capacity}</span>
              <span>Miat riski {item.expiryRisk}</span>
              <span>Satış {formatMoney(item.sellPrice)}</span>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (activeModule === "sgk") {
    const day = ((state.currentDay - 1) % 30) + 1;
    const phase =
      day <= 7
        ? "Fatura ve reçete kontrol dönemi"
        : day === 15
          ? "Tahsilat günü"
          : day < 15
            ? "Teslim ve son kontrol dönemi"
            : "Bekleme ve eski kesinti riski";
    return (
      <section className="module-surface">
        <div className="module-head">
          <div>
            <h2>SGK</h2>
            <p>Ayın {day}. günü: {phase}. Kontrol yaparsan kesinti riski düşer ama enerji ve zaman harcarsın.</p>
          </div>
          <ReceiptText size={22} aria-hidden="true" />
        </div>
        <div className="finance-grid">
          <div><span>SGK alacağı</span><strong>{formatMoney(state.sgkReceivable)}</strong></div>
          <div><span>Özel sigorta</span><strong>{formatMoney(state.privateInsuranceReceivable)}</strong></div>
          <div><span>Uyum riski</span><strong>{Math.round(state.complianceRisk)}/100</strong></div>
        </div>
        <div className="button-row">
          <button className="large-action" onClick={onSgkControl}>SGK dosya kontrolü yap</button>
          <button className="large-action secondary" onClick={onChamberApproval}>
            <Receipt size={17} aria-hidden="true" />
            Oda onayı işlemi
          </button>
        </div>
        <div className="ledger-columns">
          <LedgerList title="SGK alacak defteri" entries={state.sgkReceivables} emptyLabel="Açık SGK alacağı yok." />
          <LedgerList
            title="Özel sigorta alacakları"
            entries={state.privateInsuranceReceivables}
            emptyLabel="Açık özel sigorta alacağı yok."
          />
        </div>
      </section>
    );
  }

  if (activeModule === "personel") {
    return (
      <section className="module-surface">
        <div className="module-head">
          <div>
            <h2>Personeller</h2>
            <p>Doğru kişiye doğru görev ver. Yanlış eşleşme puan ve moral kaybettirir.</p>
          </div>
          <UsersRound size={22} aria-hidden="true" />
        </div>
        <div className="staff-grid">
          {state.staff.map((person) => (
            <article className="staff-card" key={person.id}>
              <strong>{person.name}</strong>
              <span>{roleLabels[person.role]} · {formatMoney(person.salary)}</span>
              <small>Performans {person.performance} · Moral {person.morale} · Dikkat {person.attention}</small>
              <select onChange={(event) => event.target.value && onAssignStaff(person.id, event.target.value)} defaultValue="">
                <option value="">Görev ata</option>
                {staffTasks.map((task) => (
                  <option value={task.id} key={task.id}>{task.title}</option>
                ))}
              </select>
              <div className="button-row">
                <button onClick={() => onRaiseStaff(person.id)}>Zam yap</button>
                <button onClick={() => onFireStaff(person.id)}>Çıkar</button>
              </div>
            </article>
          ))}
        </div>
        <h3>Adaylar</h3>
        <div className="candidate-row">
          {staffCandidates
            .filter((candidate) => !state.staff.some((person) => person.id === candidate.id.replace("candidate", "staff")))
            .map((candidate) => (
              <button key={candidate.id} onClick={() => onHireStaff(candidate.id)}>
                {candidate.name} işe al · {formatMoney(candidate.salary)}
              </button>
            ))}
        </div>
      </section>
    );
  }

  if (activeModule === "finans") {
    return (
      <section className="module-surface">
        <div className="module-head">
          <div>
            <h2>Finans</h2>
            <p>Kasa, alacak, depo borcu ve rutin giderler. Oyunun asıl stresi burada.</p>
          </div>
          <CreditCard size={22} aria-hidden="true" />
        </div>
        <div className="finance-grid">
          <div><span>Kasa</span><strong>{formatMoney(state.cash)}</strong></div>
          <div><span>Depo borcu</span><strong>{formatMoney(state.debt)}</strong></div>
          <div><span>POS alacağı</span><strong>{formatMoney(state.posReceivable)}</strong></div>
          <div><span>SGK alacağı</span><strong>{formatMoney(state.sgkReceivable)}</strong></div>
          <div><span>Aylık gider</span><strong>{formatMoney(calculateMonthlyRoutineExpenses(state))}</strong></div>
          <div><span>POS oranı</span><strong>%{state.posCommissionRate.toFixed(2)}</strong></div>
          <div><span>Son günlük kâr</span><strong>{formatMoney(state.dailyProfit)}</strong></div>
          <div><span>Eczacı pazarı bakiyesi</span><strong>{formatMoney(state.pharmacyMarketBalance)}</strong></div>
        </div>
        <div className="ledger-columns">
          <LedgerList title="Depo vadeleri" entries={state.supplierPayables} emptyLabel="Açık depo vadesi yok." />
          <LedgerList
            title="Bekleyen tahsilatlar"
            entries={[...state.posReceivables, ...state.sgkReceivables, ...state.privateInsuranceReceivables, ...state.marketplaceReceivables]}
            emptyLabel="Bekleyen tahsilat yok."
          />
        </div>
        <button className="large-action" onClick={onPayDebt}>Depo borcundan ödeme yap</button>
      </section>
    );
  }

  if (activeModule === "pazar") {
    return (
      <section className="module-surface">
        <div className="module-head">
          <div>
            <h2>Eczacı Pazarı / Takas</h2>
            <p>Bayilik alamadığın ürünü diğer eczacıdan bul; fazla stoğu 3 hafta vadeli sat.</p>
          </div>
          <Repeat2 size={22} aria-hidden="true" />
        </div>
        <div className="finance-grid">
          <div><span>Pazar bakiyesi</span><strong>{formatMoney(state.pharmacyMarketBalance)}</strong></div>
          <div><span>Pazar alacağı</span><strong>{formatMoney(state.marketplaceReceivables.reduce((sum, entry) => entry.status === "paid" ? sum : sum + entry.amount, 0))}</strong></div>
          <div><span>İtibar</span><strong>{Math.round(state.reputation)}/100</strong></div>
        </div>
        <div className="trade-grid">
          {state.inventory.map((item) => (
            <article className="trade-card" key={item.id}>
              <div>
                <strong>{item.name}</strong>
                <span>Stok {item.stock}/{item.capacity} · pazarda fiyat biraz yüksek ama erişim hızlı</span>
              </div>
              <div className="button-row">
                <button disabled={item.stock >= item.capacity} onClick={() => onMarketplaceBuy(item.id)}>
                  Pazardan bul
                </button>
                <button disabled={item.stock <= item.capacity * 0.25} onClick={() => onMarketplaceSell(item.id)}>
                  Fazlayı sat
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="module-surface">
      <div className="module-head">
        <div>
          <h2>Eczane</h2>
          <p>Gün ilerlet: raflardan satış olur, SGK alacağı oluşur, stok düşer, XP gelir.</p>
        </div>
        <Boxes size={22} aria-hidden="true" />
      </div>
      <div className="level-panel">
        <div><span>Level</span><strong>{state.level}</strong></div>
        <div><span>XP</span><strong>{state.xp}</strong></div>
        <div><span>Gün</span><strong>{state.currentDay}</strong></div>
        <div><span>Ay</span><strong>{state.month}</strong></div>
        <div><span>Raf doluluğu</span><strong>%{stockRatio(totalStock, totalCapacity)}</strong></div>
      </div>
      <button className="advance-day" onClick={onAdvanceDay}>
        <Banknote size={20} aria-hidden="true" />
        Günü ilerlet ve satışları işle
      </button>
      <div className="objective-list">
        <div>
          <span>Şimdi ne yapmalı?</span>
          <strong>
            {lowestStock && lowestStock.stock / lowestStock.capacity < 0.35
              ? `${lowestStock.name} düşük. Depo'dan alım yap.`
              : "Stok iyi. Günü ilerlet ve satışları işle."}
          </strong>
        </div>
        <div>
          <span>Level akışı</span>
          <strong>Satış, SGK kontrolü, depo ödemesi ve personel görevi XP kazandırır.</strong>
        </div>
        <div>
          <span>Başarısızlık riski</span>
          <strong>Kasa, depo güveni, uyum riski ve memnuniyet çökerse senaryo kaybedilir.</strong>
        </div>
      </div>
      <div className="objective-box">
        <ClipboardCheck size={18} aria-hidden="true" />
        <span>{state.lastReport}</span>
      </div>
    </section>
  );
}
