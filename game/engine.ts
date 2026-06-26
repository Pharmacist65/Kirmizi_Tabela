import { eventTemplates } from "@/data/events";
import { dailyActions } from "@/data/dailyActions";
import { strategicActions } from "@/data/actions";
import { competitorPharmacies } from "@/data/competitors";
import { openingTaskTemplates } from "@/data/openingTasks";
import { getShelfProducts } from "@/data/retailProducts";
import { staffCandidates, staffTasks } from "@/data/staff";
import { createScenarioState } from "@/data/scenarios";
import { surpriseTemplates } from "@/data/surprises";
import { pickBySeed, seededRandom } from "@/game/random";
import type {
  ActionDelta,
  ActionResult,
  ChoiceEffect,
  DailyActionId,
  DayReport,
  DayResolution,
  EventTemplate,
  GameState,
  LedgerEntry,
  PurchasePayment,
  ScenarioEvaluation,
  RivalPharmacy,
  ShelfFocus,
  StaffMember,
  StaffTask,
  StartProfile,
  StrategicActionId,
  TimedTask,
  TurnOutcome
} from "@/game/types";

const clamp = (value: number, min = 0, max = 100) => Math.min(max, Math.max(min, value));
const moneyRound = (value: number) => Math.round(value / 100) * 100;

const scoreKeys = [
  "energy",
  "satisfaction",
  "stockHealth",
  "staffMorale",
  "reputation",
  "supplierTrust",
  "dermoPotential",
  "otcPotential"
] as const;

function getStaffSalaryTotal(state: GameState) {
  return state.staff.reduce((sum, person) => sum + person.salary, 0);
}

function getRoutineExpenseTotal(state: GameState) {
  return Object.values(state.routineExpenses).reduce((sum, value) => sum + value, 0);
}

function getLevelFromXp(xp: number) {
  return Math.min(10, 1 + Math.floor(xp / 140));
}

function withLevelProgress(state: GameState): GameState {
  return {
    ...state,
    level: Math.max(state.level, getLevelFromXp(state.xp))
  };
}

function dayOfMonth(day: number) {
  return ((day - 1) % 30) + 1;
}

function monthOfDay(day: number) {
  return Math.floor((day - 1) / 30) + 1;
}

function formatGameDate(day: number) {
  return `${monthOfDay(day)}. ay ${dayOfMonth(day)}. gün`;
}

function sumOpen(entries: LedgerEntry[] = []) {
  return moneyRound(entries.filter((entry) => entry.status === "open" || entry.status === "overdue").reduce((sum, entry) => sum + entry.amount, 0));
}

function createLedgerEntry(
  state: GameState,
  source: LedgerEntry["source"],
  amount: number,
  dueDay: number,
  description: string
): LedgerEntry {
  return {
    id: `${source}-${state.currentDay}-${Math.round(amount)}-${state.seed % 997}-${description.length}`,
    amount: moneyRound(amount),
    dueDay,
    source,
    status: "open",
    description,
    createdDay: state.currentDay
  };
}

function syncLedgerTotals(state: GameState): GameState {
  return {
    ...state,
    debt: sumOpen(state.supplierPayables),
    posReceivable: sumOpen(state.posReceivables),
    sgkReceivable: sumOpen(state.sgkReceivables),
    privateInsuranceReceivable: sumOpen(state.privateInsuranceReceivables)
  };
}

function getSupplierDueDay(state: GameState, termDays: number) {
  const targetDay = state.currentDay + termDays;
  const targetMonth = monthOfDay(targetDay);
  const preferredDay = state.supplierTrust >= 72 ? 17 : 15;
  const adjusted = (targetMonth - 1) * 30 + preferredDay;
  return Math.max(state.currentDay + 1, adjusted);
}

function getSgkCollectionDay(currentDay: number) {
  const month = monthOfDay(currentDay);
  const day = dayOfMonth(currentDay);
  if (day <= 7) return (month - 1) * 30 + 15;
  if (day <= 15) return (month - 1) * 30 + 16;
  return month * 30 + 15;
}

function getPurchaseTermDays(payment: PurchasePayment) {
  if (payment === "term-45") return 45;
  if (payment === "term-60") return 60;
  if (payment === "term-90") return 90;
  return 0;
}

function getTermMultiplier(state: GameState, payment: PurchasePayment) {
  if (payment === "cash") return 0.94;
  const trustMultiplier = state.supplierTrust >= 74 ? 0.985 : state.supplierTrust < 42 ? 1.035 : 1;
  if (payment === "term-45") return 0.99 * trustMultiplier;
  if (payment === "term-60") return trustMultiplier;
  const longTermPressure = state.supplierTrust >= 70 ? 1.015 : state.supplierTrust < 45 ? 1.09 : 1.045;
  return longTermPressure * trustMultiplier;
}

function getSupplierTrustDelta(payment: PurchasePayment) {
  if (payment === "cash") return 3;
  if (payment === "term-45") return 1.5;
  if (payment === "term-60") return 0.5;
  return -1;
}

export function calculateMonthlyRoutineExpenses(state: GameState) {
  return moneyRound(state.monthlyRent + getStaffSalaryTotal(state) + getRoutineExpenseTotal(state));
}

export function createActionResult(
  before: GameState,
  after: GameState,
  title: string,
  description: string,
  extraDeltas: ActionDelta[] = []
): ActionResult {
  const keys = [
    ["Kasa", "cash", "money"],
    ["Depo borcu", "debt", "money"],
    ["POS alacağı", "posReceivable", "money"],
    ["SGK alacağı", "sgkReceivable", "money"],
    ["Özel sigorta", "privateInsuranceReceivable", "money"],
    ["XP", "xp", "count"],
    ["Level", "level", "count"],
    ["Stok sağlığı", "stockHealth", "score"],
    ["Memnuniyet", "satisfaction", "score"],
    ["Personel morali", "staffMorale", "score"],
    ["Uyum riski", "complianceRisk", "score"],
    ["Depo güveni", "supplierTrust", "score"]
  ] as const;
  const deltas = keys
    .map(([label, key, kind]) => ({
      label,
      before: before[key],
      after: after[key],
      delta: after[key] - before[key],
      kind
    }))
    .filter((item) => Math.round(item.delta) !== 0);

  return {
    title,
    description,
    deltas: [...extraDeltas, ...deltas].slice(0, 8)
  };
}

export function createInitialState(scenarioId?: string, profile?: StartProfile): GameState {
  return createScenarioState(scenarioId, profile);
}

export function formatMoney(value: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0
  }).format(value);
}

export function getScoreStatus(value: number, inverse = false) {
  const normalized = inverse ? 100 - value : value;
  if (normalized >= 70) return "good";
  if (normalized >= 45) return "warn";
  return "risk";
}

export function getEventForDay(state: GameState): EventTemplate {
  const eligible = eventTemplates.filter((event) => !event.trigger || event.trigger(state));
  return pickBySeed(eligible.length ? eligible : eventTemplates, state.seed + state.currentDay * 37);
}

export function getSurpriseForDay(state: GameState) {
  return pickBySeed(surpriseTemplates, state.seed + state.currentDay * 131);
}

export const effectLabels = {
  cash: "Kasa",
  debt: "Depo borcu",
  sgkReceivable: "SGK alacağı",
  privateInsuranceReceivable: "Özel sigorta",
  energy: "Enerji",
  satisfaction: "Memnuniyet",
  stockHealth: "Stok sağlığı",
  staffMorale: "Personel morali",
  reputation: "İtibar",
  complianceRisk: "Uyum riski",
  supplierTrust: "Depo güveni",
  dermoPotential: "Dermo",
  otcPotential: "OTC"
} as const;

export const moneyEffectKeys = new Set(["cash", "debt", "sgkReceivable", "privateInsuranceReceivable"]);

export function getStrategicAction(actionId: StrategicActionId) {
  return strategicActions.find((action) => action.id === actionId) ?? strategicActions[0];
}

export function getStaffTask(taskId: string) {
  return staffTasks.find((task) => task.id === taskId) ?? staffTasks[0];
}

export const shelfFocusLabels: Record<ShelfFocus, string> = {
  balanced: "Dengeli Düzen",
  prescription: "Reçete Hızı",
  dermo: "Dermo Vitrini",
  otc: "OTC Hızlı Raf",
  flow: "Akış & Banko"
};

export const purchasePaymentLabels: Record<PurchasePayment, string> = {
  cash: "Peşin iskonto",
  "term-45": "45 gün vade",
  "term-60": "60 gün vade",
  "term-90": "90 gün vade"
};

const shelfProfiles: Record<
  ShelfFocus,
  {
    serviceBonus: number;
    prescriptionShare: number;
    retailMultiplier: number;
    operatingCost: number;
    energyDelta: number;
    satisfactionDelta: number;
    stockDrain: number;
    complianceDelta: number;
  }
> = {
  balanced: {
    serviceBonus: 0,
    prescriptionShare: 0,
    retailMultiplier: 1,
    operatingCost: 0,
    energyDelta: 0,
    satisfactionDelta: 0,
    stockDrain: 1,
    complianceDelta: 0
  },
  prescription: {
    serviceBonus: 6,
    prescriptionShare: 0.08,
    retailMultiplier: 0.94,
    operatingCost: 1200,
    energyDelta: -1,
    satisfactionDelta: 2,
    stockDrain: 1.2,
    complianceDelta: -1
  },
  dermo: {
    serviceBonus: 2,
    prescriptionShare: -0.07,
    retailMultiplier: 1.18,
    operatingCost: 2200,
    energyDelta: -1,
    satisfactionDelta: 1,
    stockDrain: 1.45,
    complianceDelta: 1
  },
  otc: {
    serviceBonus: 3,
    prescriptionShare: -0.04,
    retailMultiplier: 1.12,
    operatingCost: 1500,
    energyDelta: -0.5,
    satisfactionDelta: 1,
    stockDrain: 1.25,
    complianceDelta: 0
  },
  flow: {
    serviceBonus: 8,
    prescriptionShare: 0.02,
    retailMultiplier: 1.03,
    operatingCost: 2800,
    energyDelta: 2,
    satisfactionDelta: 3,
    stockDrain: 0.95,
    complianceDelta: -2
  }
};

export function changeShelfFocus(state: GameState, shelfFocus: ShelfFocus): GameState {
  if (state.shelfFocus === shelfFocus) {
    return state;
  }

  return {
    ...state,
    shelfFocus,
    lastReport: `${shelfFocusLabels[shelfFocus]} seçildi. Bu düzen bir sonraki günün satış kırılımına ve hizmet akışına yansıyacak.`
  };
}

export function chooseStrategicAction(state: GameState, dailyActionId: StrategicActionId): GameState {
  const action = getStrategicAction(dailyActionId);
  return {
    ...state,
    dailyActionId,
    lastReport:
      action.id === "none"
        ? "Bugün ekstra stratejik hamle yapılmayacak. Günlük karar kartı ana akışı belirleyecek."
        : `${action.title} planlandı. Günlük karar verildiğinde bu hamle de sonuçlara işlenecek.`
  };
}

function applyEffects(state: GameState, effects: ChoiceEffect): GameState {
  const next: GameState = { ...state };

  for (const [key, delta] of Object.entries(effects) as [keyof ChoiceEffect, number][]) {
    if (typeof delta !== "number") continue;
    if (key === "cash" || key === "debt" || key === "sgkReceivable" || key === "privateInsuranceReceivable") {
      next[key] = Math.max(0, moneyRound(next[key] + delta));
    } else {
      next[key] = clamp(next[key] + delta);
    }
  }

  return next;
}

export function createOpeningTasks() {
  return openingTaskTemplates.map((task) => ({ ...task }));
}

export function startTimedTask(tasks: TimedTask[], taskId: string, now = Date.now()) {
  return tasks.map((task) =>
    task.id === taskId && task.status === "ready"
      ? {
          ...task,
          status: "running" as const,
          startedAt: now
        }
      : task
  );
}

export function refreshTimedTasks(tasks: TimedTask[], now = Date.now()) {
  const doneIds = new Set(tasks.filter((task) => task.status === "done").map((task) => task.id));

  return tasks.map((task) => {
    if (task.status === "locked" && task.unlocksAfter?.every((id) => doneIds.has(id))) {
      return {
        ...task,
        status: "ready" as const
      };
    }

    return task;
  });
}

export function applyTaskCompletion(state: GameState, task: TimedTask) {
  let preparedState = state;

  if (task.id === "first-stock") {
    preparedState = {
      ...preparedState,
      inventory: preparedState.inventory.map((item) => ({
        ...item,
        stock: Math.max(item.stock, Math.round(item.capacity * 0.42))
      }))
    };
  }

  if (task.id === "staff-choice" && !preparedState.staff.length) {
    preparedState = {
      ...preparedState,
      staff: [
        {
          id: "staff-owner",
          name: preparedState.pharmacistName.replace(/^Ecz\.\s*/i, ""),
          role: "pharmacist",
          salary: 0,
          performance: 72,
          morale: 70,
          speed: 66,
          attention: 76,
          communication: 72,
          dermo: 52,
          stock: 62
        }
      ]
    };
  }

  const completed = withLevelProgress(
    applyEffects(
      {
        ...preparedState,
        setupCompleted: task.id === "opening-day" ? true : preparedState.setupCompleted,
        gamePhase: task.id === "opening-day" ? "playing" : preparedState.gamePhase,
        timeLabel: task.id === "opening-day" ? "08:30" : preparedState.timeLabel,
        xp: preparedState.xp + 18
      },
      task.effects
    )
  );

  return task.id === "first-stock"
    ? {
        ...completed,
        stockHealth: calculateInventoryHealth(completed.inventory)
      }
    : completed;
}

function evaluateStaffTask(person: StaffMember, task: StaffTask) {
  const skillScore = person[task.skill];
  return skillScore * 0.58 + person.performance * 0.24 + person.morale * 0.18;
}

function updateStaffMember(staff: StaffMember[], personId: string, updater: (person: StaffMember) => StaffMember) {
  return staff.map((person) => (person.id === personId ? updater(person) : person));
}

export function assignStaffTask(state: GameState, personId: string, taskId: string): GameState {
  const person = state.staff.find((item) => item.id === personId);
  const task = getStaffTask(taskId);
  if (!person) return state;

  const score = evaluateStaffTask(person, task);
  const success = score >= 64;
  const nextStaff = updateStaffMember(state.staff, personId, (item) => ({
    ...item,
    assignedTaskId: taskId,
    performance: clamp(item.performance + (success ? 3 : -5)),
    morale: clamp(item.morale + (success ? 2 : -4))
  }));
  const next = withLevelProgress(
    applyEffects(
      {
        ...state,
        staff: nextStaff,
        xp: state.xp + (success ? 10 : 3)
      },
      success ? task.successEffects : task.failureEffects
    )
  );

  return {
    ...next,
    lastReport: `${person.name}, "${task.title}" görevini ${success ? "iyi yönetti" : "zorlandı ve aksattı"}.`
  };
}

export function hireStaff(state: GameState, candidateId: string): GameState {
  const candidate = staffCandidates.find((item) => item.id === candidateId);
  const staffId = candidate?.id.replace("candidate", "staff");
  if (!candidate || !staffId || state.staff.some((item) => item.id === staffId)) return state;

  const onboardingCost = moneyRound(candidate.salary * 0.35);
  return {
    ...state,
    cash: Math.max(0, moneyRound(state.cash - onboardingCost)),
    staff: [...state.staff, { ...candidate, id: staffId }],
    staffMorale: clamp(state.staffMorale + 2),
    lastReport: `${candidate.name} işe alındı. İlk ay oryantasyon maliyeti ${formatMoney(onboardingCost)} yazıldı.`
  };
}

export function fireStaff(state: GameState, personId: string): GameState {
  const person = state.staff.find((item) => item.id === personId);
  if (!person || state.staff.length <= 1) return state;

  const severanceCost = moneyRound(person.salary * 0.5);
  return {
    ...state,
    cash: Math.max(0, moneyRound(state.cash - severanceCost)),
    staff: state.staff.filter((item) => item.id !== personId),
    staffMorale: clamp(state.staffMorale - 7),
    satisfaction: clamp(state.satisfaction - 2),
    lastReport: `${person.name} ekipten ayrıldı. Kısa vadede moral ve hizmet akışı sarsıldı.`
  };
}

export function giveStaffRaise(state: GameState, personId: string): GameState {
  const person = state.staff.find((item) => item.id === personId);
  if (!person) return state;

  const raise = moneyRound(Math.max(2500, person.salary * 0.12));
  const nextStaff = updateStaffMember(state.staff, personId, (item) => ({
    ...item,
    salary: moneyRound(item.salary + raise),
    morale: clamp(item.morale + 8),
    performance: clamp(item.performance + 2)
  }));

  return {
    ...state,
    staff: nextStaff,
    staffMorale: clamp(state.staffMorale + 4),
    lastReport: `${person.name} için ${formatMoney(raise)} zam yapıldı. Aylık personel gideri arttı, moral toparlandı.`
  };
}

export function runSgkControl(state: GameState): GameState {
  const dayOfMonth = ((state.currentDay - 1) % 30) + 1;
  const inControlWindow = dayOfMonth >= 1 && dayOfMonth <= 7;
  const inDeliveryWindow = dayOfMonth >= 8 && dayOfMonth <= 15;
  const riskReduction = inControlWindow ? -11 : inDeliveryWindow ? -7 : -4;

  return withLevelProgress(
    applyEffects(
      {
        ...state,
        xp: state.xp + (inControlWindow ? 16 : 10),
        lastReport: inControlWindow
          ? "SGK fatura/kontrol döneminde dosya tarandı. Kesinti riski belirgin düştü."
          : inDeliveryWindow
            ? "SGK teslim döneminde son kontrol yapıldı. Risk azaldı ama zaman baskısı hissedildi."
            : "SGK dosya kontrolü yapıldı. Dönem dışı olduğu için etkisi sınırlı kaldı."
      },
      { complianceRisk: riskReduction, energy: -4 }
    )
  );
}

export function runChamberApproval(state: GameState): GameState {
  const cost = 3500 + ((state.seed + state.currentDay) % 4) * 500;
  return withLevelProgress(
    applyEffects(
      {
        ...state,
        xp: state.xp + 14,
        lastReport: `C grubu / sıralı-kotalı reçete için oda onayı başlatıldı. Farmainbox benzeri dosya masrafı ${formatMoney(
          cost
        )} yazıldı.`
      },
      { cash: -cost, complianceRisk: -6, reputation: 1 }
    )
  );
}

export function getDailyActions() {
  return dailyActions;
}

export function applyDailyAction(state: GameState, actionId: DailyActionId): GameState {
  const action = dailyActions.find((item) => item.id === actionId);
  if (!action || !state.setupCompleted) return state;
  const phaseTime = action.phase === "morning" ? "08:30" : action.phase === "open" ? "13:30" : "18:30";
  return withLevelProgress(
    applyEffects(
      {
        ...state,
        dayPhase: action.phase,
        timeLabel: phaseTime,
        xp: state.xp + (action.risk === "high" ? 10 : action.risk === "medium" ? 7 : 4),
        lastReport: `${action.title} yapıldı. ${action.expectedEffect}`
      },
      action.effects
    )
  );
}

export function paySupplierDebt(state: GameState, amount = 25000): GameState {
  const openPayables = [...state.supplierPayables]
    .filter((entry) => entry.status === "open" || entry.status === "overdue")
    .sort((a, b) => a.dueDay - b.dueDay);
  const payment = Math.min(amount, sumOpen(openPayables), state.cash);
  if (payment <= 0) return state;
  let remaining = payment;
  const paidIds = new Set<string>();
  const adjustedPayables = state.supplierPayables.map((entry) => {
    if (remaining <= 0 || !openPayables.some((payable) => payable.id === entry.id)) return entry;
    const paid = Math.min(entry.amount, remaining);
    remaining -= paid;
    if (paid >= entry.amount) {
      paidIds.add(entry.id);
      return { ...entry, amount: 0, status: "paid" as const };
    }
    return { ...entry, amount: moneyRound(entry.amount - paid), status: entry.dueDay < state.currentDay ? "overdue" as const : entry.status };
  });

  return syncLedgerTotals(withLevelProgress({
    ...state,
    cash: moneyRound(state.cash - payment),
    supplierPayables: adjustedPayables,
    supplierTrust: clamp(state.supplierTrust + 4),
    xp: state.xp + 10,
    lastReport: `Depoya ${formatMoney(payment)} ödeme yapıldı. ${paidIds.size ? "En yakın vade kapandı." : "En yakın vade azaltıldı."}`
  }));
}

export function getPurchaseQuote(state: GameState, categoryId: string, units: number, payment: PurchasePayment) {
  const category = state.inventory.find((item) => item.id === categoryId);
  if (!category) return null;
  const availableSpace = Math.max(0, category.capacity - category.stock);
  const boughtUnits = Math.min(units, availableSpace);
  const baseCost = moneyRound(category.unitCost * boughtUnits);
  const termDays = getPurchaseTermDays(payment);
  const amount = moneyRound(baseCost * getTermMultiplier(state, payment));
  const dueDay = payment === "cash" ? state.currentDay : getSupplierDueDay(state, termDays);

  return {
    category,
    boughtUnits,
    amount,
    termDays,
    dueDay,
    dueLabel: payment === "cash" ? "peşin" : formatGameDate(dueDay),
    paymentLabel: purchasePaymentLabels[payment],
    unitPrice: boughtUnits ? moneyRound(amount / boughtUnits) : 0
  };
}

export function buyInventory(
  state: GameState,
  categoryId: string,
  units: number,
  payment: PurchasePayment
): GameState {
  const quote = getPurchaseQuote(state, categoryId, units, payment);
  if (!quote) return state;
  const { category, boughtUnits, amount, termDays, dueDay } = quote;

  if (boughtUnits <= 0) return state;

  const nextXp = state.xp + Math.max(2, Math.round(boughtUnits / 3));
  const nextInventory = state.inventory.map((item) =>
    item.id === categoryId
      ? {
          ...item,
          stock: item.stock + boughtUnits
        }
      : item
  );
  const supplierPayables =
    payment !== "cash"
      ? [
          ...state.supplierPayables,
          createLedgerEntry(
            state,
            category.kind === "dermo" ? "dealer" : "supplier",
            amount,
            dueDay,
            `${category.name} alımı · ${boughtUnits} adet · ${purchasePaymentLabels[payment]}`
          )
        ]
      : state.supplierPayables;

  return syncLedgerTotals({
    ...state,
    inventory: nextInventory,
    supplierPayables,
    stockHealth: calculateInventoryHealth(nextInventory),
    xp: nextXp,
    level: Math.max(state.level, getLevelFromXp(nextXp)),
    cash: payment === "cash" ? Math.max(0, moneyRound(state.cash - amount)) : state.cash,
    supplierTrust: clamp(state.supplierTrust + getSupplierTrustDelta(payment)),
    lastReport:
      payment === "cash"
        ? `${category.name} için ${boughtUnits} adet peşin alım yapıldı. Peşin iskonto alındı.`
        : `${category.name} için ${boughtUnits} adet alındı; ${termDays} gün vade ${formatGameDate(dueDay)} tarihine yazıldı.`
  });
}

export function placeDepotOrder(
  state: GameState,
  categoryId: string,
  payment: PurchasePayment,
  units = 12
): GameState {
  const quote = getPurchaseQuote(state, categoryId, units, payment);
  if (!quote || quote.boughtUnits <= 0) return state;
  const { category, boughtUnits, amount, dueDay, termDays } = quote;
  const currentOrders = state.depotOrders ?? [];
  const productLabels = getShelfProducts(categoryId).map((product) => product.label);
  const revealItems = productLabels.length
    ? productLabels.slice(0, Math.min(5, productLabels.length))
    : [category.name, `${category.name} destek`, `${category.name} yedek`];
  const orderId = `depot-order-${state.currentDay}-${categoryId}-${payment}-${currentOrders.length + 1}`;
  const supplierPayables =
    payment !== "cash"
      ? [
          ...state.supplierPayables,
          createLedgerEntry(
            state,
            category.kind === "dermo" ? "dealer" : "supplier",
            amount,
            dueDay,
            `${category.name} koli siparişi · ${boughtUnits} adet · ${purchasePaymentLabels[payment]}`
          )
        ]
      : state.supplierPayables;

  return syncLedgerTotals(withLevelProgress({
    ...state,
    cash: payment === "cash" ? Math.max(0, moneyRound(state.cash - amount)) : state.cash,
    supplierPayables,
    supplierTrust: clamp(state.supplierTrust + getSupplierTrustDelta(payment)),
    xp: state.xp + 3,
    depotOrders: [
      {
        id: orderId,
        categoryId,
        categoryName: category.name,
        units: boughtUnits,
        amount,
        payment,
        paymentLabel: purchasePaymentLabels[payment],
        dueDay,
        orderedDay: state.currentDay,
        status: "delivered",
        boxCode: `${category.kind.toLocaleUpperCase("tr-TR")}-${state.currentDay}-${currentOrders.length + 1}`,
        revealItems
      },
      ...currentOrders
    ],
    lastReport:
      payment === "cash"
        ? `${category.name} için ${boughtUnits} adetlik koli peşin sipariş edildi. Koli teslim alanında açılmayı bekliyor.`
        : `${category.name} kolisi sipariş edildi; ${termDays} gün vade ${formatGameDate(dueDay)} tarihine yazıldı. Koli açılmayı bekliyor.`
  }));
}

export function openDepotBox(state: GameState, orderId: string): GameState {
  const currentOrders = state.depotOrders ?? [];
  const order = currentOrders.find((item) => item.id === orderId);
  if (!order || order.status !== "delivered") return state;

  return withLevelProgress({
    ...state,
    xp: state.xp + 4,
    depotOrders: currentOrders.map((item) => (item.id === orderId ? { ...item, status: "opened" as const } : item)),
    lastReport: `${order.categoryName} kolisi açıldı: ${order.revealItems.join(", ")}. Şimdi raf/depoya yerleştir.`
  });
}

export function shelveDepotBox(state: GameState, orderId: string): GameState {
  const currentOrders = state.depotOrders ?? [];
  const order = currentOrders.find((item) => item.id === orderId);
  if (!order || order.status !== "opened") return state;

  const nextInventory = state.inventory.map((item) =>
    item.id === order.categoryId
      ? {
          ...item,
          stock: Math.min(item.capacity, item.stock + order.units)
        }
      : item
  );

  return syncLedgerTotals(withLevelProgress({
    ...state,
    inventory: nextInventory,
    depotOrders: currentOrders.map((item) => (item.id === orderId ? { ...item, status: "shelved" as const } : item)),
    stockHealth: calculateInventoryHealth(nextInventory),
    satisfaction: clamp(state.satisfaction + 1),
    xp: state.xp + 8,
    lastReport: `${order.categoryName} kolisi rafa alındı. ${order.units} adet stok eklendi, raf sağlığı güncellendi.`
  }));
}

export function buyFromMarketplace(state: GameState, categoryId: string, units = 6): GameState {
  const category = state.inventory.find((item) => item.id === categoryId);
  if (!category) return state;
  const boughtUnits = Math.min(units, Math.max(0, category.capacity - category.stock));
  if (boughtUnits <= 0) return state;
  const price = moneyRound(category.unitCost * boughtUnits * 1.08);
  const balanceUsed = Math.min(price, state.pharmacyMarketBalance);
  const cashUsed = Math.max(0, price - balanceUsed);
  const nextInventory = state.inventory.map((item) =>
    item.id === categoryId
      ? {
          ...item,
          stock: item.stock + boughtUnits
        }
      : item
  );

  return syncLedgerTotals(withLevelProgress({
    ...state,
    inventory: nextInventory,
    cash: Math.max(0, moneyRound(state.cash - cashUsed)),
    pharmacyMarketBalance: moneyRound(state.pharmacyMarketBalance - balanceUsed),
    stockHealth: calculateInventoryHealth(nextInventory),
    reputation: clamp(state.reputation + 1),
    xp: state.xp + 6,
    lastReport: `${category.name} eczacı pazarından ${boughtUnits} adet bulundu. Bayilik yok ama ürün kaçmadı.`
  }));
}

export function sellOnMarketplace(state: GameState, categoryId: string, units = 6): GameState {
  const category = state.inventory.find((item) => item.id === categoryId);
  if (!category) return state;
  const soldUnits = Math.min(units, Math.max(0, category.stock - Math.round(category.capacity * 0.25)));
  if (soldUnits <= 0) return state;
  const amount = moneyRound(category.unitCost * soldUnits * 1.03);
  const nextInventory = state.inventory.map((item) =>
    item.id === categoryId
      ? {
          ...item,
          stock: item.stock - soldUnits
        }
      : item
  );

  return syncLedgerTotals(withLevelProgress({
    ...state,
    inventory: nextInventory,
    marketplaceReceivables: [
      ...state.marketplaceReceivables,
      createLedgerEntry(state, "marketplace", amount, state.currentDay + 21, `${category.name} eczacı pazarı satışı`)
    ],
    stockHealth: calculateInventoryHealth(nextInventory),
    reputation: clamp(state.reputation + 2),
    xp: state.xp + 8,
    lastReport: `${category.name} fazlasından ${soldUnits} adet pazara koyuldu. Ödeme yaklaşık 3 hafta sonra gelecek.`
  }));
}

export function calculateInventoryHealth(inventory: GameState["inventory"]) {
  if (!inventory.length) return 0;
  const averageFill =
    inventory.reduce((sum, item) => {
      const fill = (item.stock / item.capacity) * 100;
      const expiryPenalty = fill > 82 ? item.expiryRisk * 0.45 : 0;
      const emptyPenalty = fill < 18 ? 18 : 0;
      return sum + clamp(fill - expiryPenalty - emptyPenalty);
    }, 0) / inventory.length;

  return Math.round(clamp(averageFill));
}

function sellFromInventory(state: GameState, random: () => number) {
  let cashSales = 0;
  let posSales = 0;
  let sgkAccrued = 0;
  let privateAccrued = 0;
  let xpGain = 0;
  let missedDemand = 0;
  const lines: DayReport["lines"] = [];
  const bankoAssigned = state.staff.some((person) => person.assignedTaskId === "counter-flow");
  const sgkAssigned = state.staff.some((person) => person.assignedTaskId === "sgk-file" || person.assignedTaskId === "rx-control");
  const dermoAssigned = state.staff.some((person) => person.assignedTaskId === "dermo-sales");
  const stockAssigned = state.staff.some((person) => person.assignedTaskId === "stock-check");

  const nextInventory = state.inventory.map((item) => {
    const focusBoost =
      (state.shelfFocus === "prescription" && item.kind === "prescription") ||
      (state.shelfFocus === "otc" && item.kind === "otc") ||
      (state.shelfFocus === "dermo" && item.kind === "dermo")
        ? 1.35
        : state.shelfFocus === "balanced"
          ? 1.05
          : 1;
    const taskBoost =
      (item.kind === "dermo" && dermoAssigned) ||
      (item.kind === "prescription" && sgkAssigned) ||
      (item.kind !== "prescription" && bankoAssigned)
        ? 1.14
        : 1;
    const stockConfidence = stockAssigned ? 1.05 : 1;
    const demandBoost =
      item.kind === "prescription"
        ? 0.8 + state.prescriptionPressure / 130
        : 0.85 + state.retailPotential / 160;
    const wanted = Math.max(
      1,
      Math.round(item.demand * focusBoost * taskBoost * stockConfidence * demandBoost * (0.72 + random() * 0.48))
    );
    const sold = Math.min(item.stock, wanted);
    const missed = Math.max(0, wanted - sold);
    missedDemand += missed;
    const revenue = moneyRound(sold * item.sellPrice);

    if (item.kind === "prescription") {
      const specialShare = item.id === "quota-special" ? 0.84 : 0.68;
      sgkAccrued += moneyRound(revenue * specialShare);
      cashSales += moneyRound(revenue * 0.14);
      posSales += moneyRound(revenue * (item.id === "quota-special" ? 0.02 : 0.1));
    } else {
      cashSales += moneyRound(revenue * 0.28);
      posSales += moneyRound(revenue * 0.72);
      if (item.kind === "medical") {
        privateAccrued += moneyRound(revenue * 0.08);
      }
    }

    xpGain += sold;
    lines.push({
      categoryId: item.id,
      name: item.name,
      soldUnits: sold,
      missedUnits: missed,
      revenue
    });

    return {
      ...item,
      stock: item.stock - sold
    };
  });

  return {
    inventory: nextInventory,
    cashSales,
    posSales,
    sgkAccrued,
    privateAccrued,
    xpGain,
    missedDemand,
    lines,
    stockHealth: calculateInventoryHealth(nextInventory)
  };
}

function collectDue(entries: LedgerEntry[], currentDay: number) {
  let collected = 0;
  const nextEntries = entries.map((entry) => {
    if (entry.status === "open" && entry.dueDay <= currentDay) {
      collected += entry.amount;
      return { ...entry, amount: 0, status: "paid" as const };
    }
    return entry;
  });

  return { entries: nextEntries, collected: moneyRound(collected) };
}

function processDueSupplierPayables(entries: LedgerEntry[], currentDay: number, availableCash: number) {
  let cash = availableCash;
  let paid = 0;
  let overdue = 0;
  let trustDelta = 0;
  const nextEntries = entries
    .map((entry) => {
      if ((entry.status !== "open" && entry.status !== "overdue") || entry.dueDay > currentDay || entry.amount <= 0) {
        return entry;
      }

      if (cash >= entry.amount) {
        cash = moneyRound(cash - entry.amount);
        paid += entry.amount;
        trustDelta += 2;
        return { ...entry, amount: 0, status: "paid" as const };
      }

      overdue += entry.amount;
      trustDelta -= 6;
      return {
        ...entry,
        amount: moneyRound(entry.amount * 1.035),
        status: "overdue" as const,
        description: `${entry.description} · vade aksadı`
      };
    });

  return {
    entries: nextEntries,
    cash,
    paid: moneyRound(paid),
    overdue: moneyRound(overdue),
    trustDelta
  };
}

function simulateBusinessDay(state: GameState): GameState {
  const random = seededRandom(state.seed + state.currentDay * 97);
  const shelfProfile = shelfProfiles[state.shelfFocus];
  const currentDayOfMonth = dayOfMonth(state.currentDay);
  const inventorySales = sellFromInventory(state, random);
  const posCollection = collectDue(state.posReceivables, state.currentDay);
  const sgkCollection = collectDue(state.sgkReceivables, state.currentDay);
  const privateCollection = collectDue(state.privateInsuranceReceivables, state.currentDay);
  const marketplaceCollection = collectDue(state.marketplaceReceivables, state.currentDay);
  const collections = moneyRound(
    posCollection.collected + sgkCollection.collected + privateCollection.collected + marketplaceCollection.collected
  );
  const operatingCost = moneyRound(1800 + random() * 1200 + shelfProfile.operatingCost * 0.35);
  const posCommission = moneyRound(inventorySales.posSales * (state.posCommissionRate / 100));
  const netPos = Math.max(0, moneyRound(inventorySales.posSales - posCommission));
  const posDelay = state.posCommissionRate < 0.75 ? 10 : 1;
  const sgkDueDay = getSgkCollectionDay(state.currentDay);
  const privateDueDay = state.currentDay + 25;
  const posReceivables =
    netPos > 0
      ? [
          ...posCollection.entries,
          createLedgerEntry(state, "pos", netPos, state.currentDay + posDelay, `POS tahsilatı · komisyon ${formatMoney(posCommission)}`)
        ]
      : posCollection.entries;
  const sgkReceivables =
    inventorySales.sgkAccrued > 0
      ? [
          ...sgkCollection.entries,
          createLedgerEntry(state, "sgk", inventorySales.sgkAccrued, sgkDueDay, "Günlük reçete SGK alacağı")
        ]
      : sgkCollection.entries;
  const privateInsuranceReceivables =
    inventorySales.privateAccrued > 0
      ? [
          ...privateCollection.entries,
          createLedgerEntry(state, "private-insurance", inventorySales.privateAccrued, privateDueDay, "Özel sigorta provizyon alacağı")
        ]
      : privateCollection.entries;
  const totalRevenue = moneyRound(
    inventorySales.cashSales + inventorySales.posSales + inventorySales.sgkAccrued + inventorySales.privateAccrued
  );
  const grossProfit = moneyRound(totalRevenue * 0.28 - operatingCost - posCommission);
  const nextXp = state.xp + inventorySales.xpGain + Math.max(0, Math.round(grossProfit / 1800));
  const nextLevel = Math.max(state.level, getLevelFromXp(nextXp));
  let cashAfterSales = moneyRound(state.cash + collections + inventorySales.cashSales - operatingCost);
  const supplierSettlement = processDueSupplierPayables(state.supplierPayables, state.currentDay, cashAfterSales);
  cashAfterSales = supplierSettlement.cash;
  const sgkAssigned = state.staff.some((person) => person.assignedTaskId === "sgk-file" || person.assignedTaskId === "rx-control");
  const bankoAssigned = state.staff.some((person) => person.assignedTaskId === "counter-flow");
  const inSgkWindow = currentDayOfMonth <= 15;
  const missedPenalty = inventorySales.missedDemand > 10 ? -4 : inventorySales.missedDemand > 4 ? -2 : 1;
  const queuePenalty = state.traffic > 70 && !bankoAssigned ? -2 : 0;
  const complianceDelta = inSgkWindow ? (sgkAssigned ? -1 : 4) : 1;
  const notes: string[] = [];

  if (collections > 0) {
    notes.push(`Vadesi gelen alacak tahsil edildi: ${formatMoney(collections)}.`);
  }
  if (inventorySales.missedDemand > 0) {
    notes.push(`${inventorySales.missedDemand} talep stok veya akış yüzünden kaçtı.`);
  }
  if (supplierSettlement.paid > 0) {
    notes.push(`Depo vadesinden ${formatMoney(supplierSettlement.paid)} ödendi.`);
  }
  if (supplierSettlement.overdue > 0) {
    notes.push(`Vadesi gelen ${formatMoney(supplierSettlement.overdue)} ödenemedi; depo güveni düştü.`);
  }
  if (inSgkWindow && !sgkAssigned) {
    notes.push("SGK döneminde dosyaya kimse atanmadı; kesinti riski büyüdü.");
  }
  if (state.traffic > 70 && !bankoAssigned) {
    notes.push("Banko akışına personel ayrılmadığı için sıra uzadı.");
  }

  let next: GameState = {
    ...state,
    inventory: inventorySales.inventory,
    supplierPayables: supplierSettlement.entries,
    posReceivables,
    sgkReceivables,
    privateInsuranceReceivables,
    marketplaceReceivables: marketplaceCollection.entries,
    pharmacyMarketBalance: moneyRound(state.pharmacyMarketBalance + marketplaceCollection.collected),
    level: nextLevel,
    xp: nextXp,
    cash: Math.max(0, cashAfterSales),
    dailyRevenue: totalRevenue,
    dailyProfit: grossProfit,
    energy: clamp(state.energy - (3 + random() * 4) + shelfProfile.energyDelta - (inventorySales.missedDemand > 10 ? 1 : 0)),
    stockHealth: inventorySales.stockHealth,
    satisfaction: clamp(
      state.satisfaction +
        missedPenalty +
        queuePenalty +
        shelfProfile.satisfactionDelta +
        (state.traffic > 78 && state.shelfFocus !== "flow" ? -1 : 0)
    ),
    staffMorale: clamp(state.staffMorale - (state.energy < 45 ? 2 : 0)),
    complianceRisk: clamp(state.complianceRisk + complianceDelta + shelfProfile.complianceDelta),
    supplierTrust: clamp(state.supplierTrust + supplierSettlement.trustDelta),
    lastDayReport: {
      day: state.currentDay,
      title: `${formatGameDate(state.currentDay)} gün sonu`,
      soldUnits: inventorySales.lines.reduce((sum, line) => sum + line.soldUnits, 0),
      missedUnits: inventorySales.missedDemand,
      cashSales: inventorySales.cashSales,
      posSales: inventorySales.posSales,
      sgkAccrued: inventorySales.sgkAccrued,
      privateAccrued: inventorySales.privateAccrued,
      supplierPaid: supplierSettlement.paid,
      supplierOverdue: supplierSettlement.overdue,
      collections,
      operatingCost,
      xpGain: nextXp - state.xp,
      lines: inventorySales.lines,
      notes: notes.length ? notes : ["Gün sakin geçti; satışlar stok ve raf kararlarına göre işlendi."]
    }
  };

  if (currentDayOfMonth === 30) {
    const fixedExpenses = calculateMonthlyRoutineExpenses(state);
    next = {
      ...next,
      cash: Math.max(0, moneyRound(next.cash - fixedExpenses)),
      energy: clamp(next.energy + 10),
      staffMorale: clamp(next.staffMorale + 2),
      lastReport: `Ay kapandı. Kira, maaş ve rutin giderler ödendi: ${formatMoney(fixedExpenses)}.`,
      lastDayReport: next.lastDayReport
        ? {
            ...next.lastDayReport,
            operatingCost: moneyRound(next.lastDayReport.operatingCost + fixedExpenses),
            notes: [...next.lastDayReport.notes, `Ay sonu sabit giderleri ödendi: ${formatMoney(fixedExpenses)}.`]
          }
        : null
    };
  }

  const nextDay = state.currentDay + 1;
  return syncLedgerTotals({
    ...next,
    currentDay: nextDay,
    month: Math.floor((nextDay - 1) / 30) + 1,
    dayPhase: "morning",
    timeLabel: "08:30"
  });
}

export function resolveDay(state: GameState, event: EventTemplate, choiceIndex: number): DayResolution {
  const choice = event.choices[choiceIndex] ?? event.choices[0];
  const action = getStrategicAction(state.dailyActionId);
  const surprise = getSurpriseForDay(state);
  const afterAction = applyEffects(state, action.effects);
  const afterChoice = applyEffects(afterAction, choice.effects);
  const afterSurprise = applyEffects(afterChoice, surprise.effects);
  const next = simulateBusinessDay(afterSurprise);
  const summary = `${event.title}: "${choice.label}" seçildi. Günlük ciro ${formatMoney(
    next.dailyRevenue
  )}, günlük sonuç ${formatMoney(next.dailyProfit)}. Sürpriz: ${surprise.title}.`;
  const outcome = buildOutcome(
    state,
    next,
    action.title,
    event.title,
    choice.label,
    surprise.title,
    surprise.description,
    summary
  );

  return {
    state: {
      ...next,
      dailyActionId: "none",
      lastReport: next.lastReport.includes("Haftalık") || next.lastReport.includes("Ay kapandı")
        ? `${summary} ${next.lastReport}`
        : summary
    },
    summary,
    outcome
  };
}

export function advanceTradingDay(state: GameState): GameState {
  const next = simulateBusinessDay(state);
  const surpriseShouldOpen = (state.seed + state.currentDay * 17) % 6 === 0;

  if (surpriseShouldOpen) {
    const surprise = getSurpriseForDay(state);
    const afterSurprise = applyEffects(next, surprise.effects);
    return {
      ...afterSurprise,
      dailyActionId: "none",
      lastReport: `Gün ilerledi. Raf satışları işlendi. Sürpriz ortaya çıktı: ${surprise.title}. ${surprise.description}`
    };
  }

  return {
    ...next,
    dailyActionId: "none",
    lastReport: "Gün ilerledi. Raf satışları işlendi, stok azaldı, nakit ve alacaklar güncellendi."
  };
}

export function fastForwardDay(state: GameState): DayResolution {
  return resolveDay(state, getEventForDay(state), 0);
}

export function calculateEndScore(state: GameState) {
  const monthlyRevenue = Math.max(state.dailyRevenue * 26, 1);
  const netProfitScore = clamp(50 + (state.dailyProfit / 9000) * 18);
  const cashFlowScore = clamp((state.cash / Math.max(calculateMonthlyRoutineExpenses(state), 1)) * 45 + (state.posReceivable > 0 ? 8 : 0));
  const debtScore = clamp(100 - (state.debt / Math.max(monthlyRevenue, 1)) * 70);
  const sgkScore = clamp(100 - state.complianceRisk);
  const stockScore = clamp(state.stockHealth);
  const missedRate = state.lastDayReport?.soldUnits
    ? ((state.lastDayReport.missedUnits ?? 0) / Math.max(1, state.lastDayReport.soldUnits + state.lastDayReport.missedUnits)) * 100
    : 8;
  const missedScore = clamp(100 - missedRate * 4);
  const satisfactionScore = clamp(state.satisfaction);
  const staffScore = clamp(state.staffMorale);

  return Math.round(
    clamp(
      netProfitScore * 0.2 +
        cashFlowScore * 0.15 +
        debtScore * 0.15 +
        sgkScore * 0.15 +
        stockScore * 0.1 +
        missedScore * 0.1 +
        satisfactionScore * 0.1 +
        staffScore * 0.05
    )
  );
}

function buildOutcome(
  before: GameState,
  after: GameState,
  actionTitle: string,
  eventTitle: string,
  choiceLabel: string,
  surpriseTitle: string,
  surpriseDescription: string,
  summary: string
): TurnOutcome {
  const keys = [
    "cash",
    "debt",
    "sgkReceivable",
    "privateInsuranceReceivable",
    "energy",
    "satisfaction",
    "stockHealth",
    "staffMorale",
    "reputation",
    "complianceRisk",
    "supplierTrust",
    "dermoPotential",
    "otcPotential"
  ] as const;

  const deltas = keys
    .map((key) => ({
      key,
      label: effectLabels[key],
      before: before[key],
      after: after[key],
      delta: after[key] - before[key],
      kind: moneyEffectKeys.has(key) ? ("money" as const) : ("score" as const)
    }))
    .filter((item) => Math.round(item.delta) !== 0)
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
    .slice(0, 6);

  return {
    day: before.currentDay,
    actionTitle,
    eventTitle,
    choiceLabel,
    surpriseTitle,
    surpriseDescription,
    summary,
    deltas
  };
}

export function evaluateScenario(state: GameState): ScenarioEvaluation {
  const score = calculateEndScore(state);
  const lastMonth = state.currentDay > state.goals.months * 30;
  const checks = [
    {
      label: "Kasa",
      current: state.cash,
      target: state.goals.targetCash,
      met: state.cash >= state.goals.targetCash,
      kind: "money" as const
    },
    {
      label: "Depo borcu",
      current: state.debt,
      target: state.goals.maxDebt,
      met: state.debt <= state.goals.maxDebt,
      inverse: true,
      kind: "money" as const
    },
    {
      label: "Memnuniyet",
      current: state.satisfaction,
      target: state.goals.minSatisfaction,
      met: state.satisfaction >= state.goals.minSatisfaction,
      kind: "score" as const
    },
    {
      label: "Stok sağlığı",
      current: state.stockHealth,
      target: state.goals.minStockHealth,
      met: state.stockHealth >= state.goals.minStockHealth,
      kind: "score" as const
    },
    {
      label: "Enerji",
      current: state.energy,
      target: state.goals.minEnergy,
      met: state.energy >= state.goals.minEnergy,
      kind: "score" as const
    },
    {
      label: "Uyum riski",
      current: state.complianceRisk,
      target: state.goals.maxComplianceRisk,
      met: state.complianceRisk <= state.goals.maxComplianceRisk,
      inverse: true,
      kind: "score" as const
    },
    {
      label: "Başarı puanı",
      current: score,
      target: state.goals.minScore,
      met: score >= state.goals.minScore,
      kind: "score" as const
    }
  ];

  const failReasons = [
    state.debt > state.goals.maxDebt * 2.2 ? "Depo borcu sürdürülemez seviyede." : "",
    state.complianceRisk >= 90 ? "Uyum riski kritik eşiği geçti." : "",
    state.satisfaction <= 12 ? "Müşteri memnuniyeti çöktü." : "",
    state.energy <= 5 ? "Eczacı enerjisi tükendi." : "",
    state.supplierTrust <= 5 ? "Depo güveni kaybedildi." : ""
  ].filter(Boolean);
  const allMet = checks.every((check) => check.met);
  const warning = checks.filter((check) => !check.met).length >= 4 || failReasons.length > 0;
  const monthsRemaining = Math.max(0, state.goals.months - state.month + 1);

  if (lastMonth && allMet) {
    return {
      status: "won",
      title: "Senaryo başarıyla tamamlandı",
      message: "Eczane 12 ay sonunda finans, hizmet ve uyum dengesini korudu.",
      checks,
      failReasons,
      monthsRemaining
    };
  }

  if (failReasons.length > 0 || (lastMonth && !allMet)) {
    return {
      status: "lost",
      title: "Senaryo başarısız",
      message: failReasons[0] ?? "12 ay sonunda hedeflerin yeterli kısmı tutmadı.",
      checks,
      failReasons,
      monthsRemaining
    };
  }

  if (warning) {
    return {
      status: "warning",
      title: "Eczane baskı altında",
      message: "Birkaç kritik hedef geride. Öncelik seçip toparlanma hamlesi yapmak gerekiyor.",
      checks,
      failReasons,
      monthsRemaining
    };
  }

  return {
    status: "playing",
    title: "Senaryo devam ediyor",
    message: "Hedefler ulaşılabilir. Günlük hamleleri uzun vadeli dengeyle seç.",
    checks,
    failReasons,
    monthsRemaining
  };
}

export function buildLeaderboard(state: GameState): RivalPharmacy[] {
  const random = seededRandom(state.seed + state.currentDay * 53);
  const missedRate = state.lastDayReport?.soldUnits
    ? Math.round(
        ((state.lastDayReport.missedUnits ?? 0) / Math.max(1, state.lastDayReport.soldUnits + state.lastDayReport.missedUnits)) * 100
      )
    : 0;
  const player: RivalPharmacy = {
    pharmacistName: state.pharmacistName,
    pharmacyName: state.pharmacyName,
    city: state.city,
    district: state.district,
    level: state.level,
    name: state.pharmacyName,
    style: `${state.pharmacistName} · ${state.city}/${state.district}`,
    score: calculateEndScore(state),
    monthlyRevenue: moneyRound(Math.max(state.dailyRevenue, 42000) * 26),
    netProfit: moneyRound(state.dailyProfit * 26),
    reputation: Math.round(state.reputation),
    debtRisk: Math.round(clamp(state.debt / 4200)),
    cashFlowScore: Math.round(clamp((state.cash / Math.max(calculateMonthlyRoutineExpenses(state), 1)) * 45)),
    missedSalesRate: missedRate,
    trend: state.dailyProfit > 4500 ? "Yükseliyor" : state.dailyProfit < -2500 ? "Baskıda" : "Dengede",
    isPlayer: true
  };

  const rivals = competitorPharmacies.map((competitor, index) => {
    const wobble = Math.round((random() - 0.5) * 8 + Math.sin((state.currentDay + index * 5) / 9) * 3);
    const revenueWobble = 0.92 + random() * 0.18;
    return {
      ...competitor,
      score: Math.round(clamp(competitor.score + wobble)),
      monthlyRevenue: moneyRound(competitor.monthlyRevenue * revenueWobble),
      netProfit: moneyRound(competitor.netProfit * (0.9 + random() * 0.2)),
      reputation: Math.round(clamp(competitor.reputation + wobble * 0.6)),
      debtRisk: Math.round(clamp(competitor.debtRisk - wobble * 0.4)),
      cashFlowScore: Math.round(clamp(competitor.cashFlowScore + wobble * 0.5)),
      missedSalesRate: Math.round(clamp(competitor.missedSalesRate - wobble * 0.2))
    };
  });

  return [player, ...rivals].sort((a, b) => b.score - a.score);
}
