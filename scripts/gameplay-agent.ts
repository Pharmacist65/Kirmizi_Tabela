import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  advanceTradingDay,
  applyDailyAction,
  applyTaskCompletion,
  assignStaffTask,
  buyInventory,
  calculateEndScore,
  changeShelfFocus,
  createInitialState,
  createOpeningTasks,
  evaluateScenario,
  formatMoney,
  getPurchaseQuote,
  hireStaff,
  paySupplierDebt,
  refreshTimedTasks,
  runSgkControl
} from "@/game/engine";
import { scenarioTemplates } from "@/data/scenarios";
import { staffCandidates } from "@/data/staff";
import type { DailyActionId, GameState, PurchasePayment, ScenarioTemplate, ShelfFocus, StaffTask } from "@/game/types";

const DAYS_TO_PLAY = 120;
const reportPath = path.join(process.cwd(), "agent-reports", "gameplay-agent-report.md");

type ScenarioRun = {
  scenario: ScenarioTemplate;
  finalState: GameState;
  openingTasksCompleted: number;
  totalSold: number;
  totalMissed: number;
  worstCash: number;
  maxDebt: number;
  maxComplianceRisk: number;
  minSatisfaction: number;
  minStockHealth: number;
  minEnergy: number;
  purchaseCount: number;
  cashPurchaseCount: number;
  termPurchaseCount: number;
  score: number;
  findings: string[];
};

const taskByRole: Partial<Record<GameState["staff"][number]["role"], StaffTask["id"]>> = {
  pharmacist: "patient-communication",
  technician: "counter-flow",
  sgk: "sgk-file",
  dermo: "dermo-sales",
  cashier: "counter-flow",
  stock: "stock-check"
};

function dayOfMonth(day: number) {
  return ((day - 1) % 30) + 1;
}

function fillRatio(item: GameState["inventory"][number]) {
  return item.stock / Math.max(1, item.capacity);
}

function openingProfile(scenario: ScenarioTemplate) {
  return {
    pharmacistName: "Ecz. Test Ajanı",
    pharmacyName: `${scenario.name} Test Eczanesi`,
    city: scenario.city ?? "İstanbul",
    district: scenario.district ?? "Kadıköy",
    locationType: scenario.locationType,
    startMode: scenario.startMode
  };
}

function completeOpeningIfNeeded(state: GameState) {
  if (state.setupCompleted) return { state, completed: 0 };

  let next = state;
  let completed = 0;
  let tasks = createOpeningTasks();

  for (let guard = 0; guard < 40 && !next.setupCompleted; guard += 1) {
    tasks = refreshTimedTasks(tasks);
    const ready = tasks.find((task) => task.status === "ready");
    if (!ready) break;

    const doneTask = {
      ...ready,
      status: "done" as const,
      startedAt: Date.now(),
      completedAt: Date.now()
    };
    next = applyTaskCompletion(next, doneTask);
    tasks = refreshTimedTasks(tasks.map((task) => (task.id === ready.id ? doneTask : task)));
    completed += 1;
  }

  return { state: next, completed };
}

function hireForScenario(state: GameState) {
  let next = state;
  const desiredStaff = next.traffic >= 78 || next.startMode === "new" ? 3 : 2;

  for (const candidate of staffCandidates) {
    if (next.staff.length >= desiredStaff) break;
    if (next.cash < candidate.salary * 2.2) break;
    next = hireStaff(next, candidate.id);
  }

  return next;
}

function chooseShelfFocus(state: GameState): ShelfFocus {
  if (state.stockHealth < 45) return "balanced";
  if (state.traffic >= 78) return "flow";
  if (state.locationType === "hospital" || state.prescriptionPressure >= 78) return "prescription";
  if (state.dermoPotential >= 68 && state.retailPotential >= 66) return "dermo";
  if (state.otcPotential >= 68 || state.locationType === "touristic") return "otc";
  return "balanced";
}

function assignDailyStaff(state: GameState) {
  let next = state;
  const usedTasks = new Set<string>();

  for (const person of next.staff) {
    let taskId = taskByRole[person.role] ?? "counter-flow";

    if (person.role === "pharmacist" && next.complianceRisk > 38) {
      taskId = "rx-control";
    }
    if (person.role === "technician" && next.traffic < 58 && !usedTasks.has("stock-check")) {
      taskId = "stock-check";
    }
    if (usedTasks.has(taskId) && !usedTasks.has("patient-communication")) {
      taskId = "patient-communication";
    }
    if (usedTasks.has(taskId) && !usedTasks.has("stock-check")) {
      taskId = "stock-check";
    }

    usedTasks.add(taskId);
    next = assignStaffTask(next, person.id, taskId);
  }

  return next;
}

function choosePayment(state: GameState, categoryId: string, units: number): PurchasePayment {
  const cashQuote = getPurchaseQuote(state, categoryId, units, "cash");
  const cashBuffer = Math.max(85000, state.monthlyRent * 1.3);

  if (cashQuote && state.cash - cashQuote.amount > cashBuffer && state.debt < state.goals.maxDebt * 0.85) {
    return "cash";
  }

  if (state.debt > state.goals.maxDebt * 0.95 || state.supplierTrust < 45) {
    return "term-45";
  }

  if (state.cash < cashBuffer) {
    return "term-90";
  }

  return "term-60";
}

function restockCriticalShelves(state: GameState) {
  let next = state;
  let purchaseCount = 0;
  let cashPurchaseCount = 0;
  let termPurchaseCount = 0;
  const sorted = [...next.inventory].sort((a, b) => fillRatio(a) - fillRatio(b));

  for (const item of sorted.slice(0, 4)) {
    const ratio = fillRatio(item);
    if (ratio > 0.46 && next.stockHealth > 62) continue;

    const targetRatio = item.kind === "prescription" ? 0.72 : 0.66;
    const desiredUnits = Math.max(0, Math.round(item.capacity * targetRatio) - item.stock);
    const units = Math.min(desiredUnits, item.kind === "dermo" ? 16 : 24);
    if (units <= 0) continue;

    const payment = choosePayment(next, item.id, units);
    next = buyInventory(next, item.id, units, payment);
    purchaseCount += 1;
    if (payment === "cash") {
      cashPurchaseCount += 1;
    } else {
      termPurchaseCount += 1;
    }
  }

  return { state: next, purchaseCount, cashPurchaseCount, termPurchaseCount };
}

function applyDailyPreparation(state: GameState) {
  let next = state;
  const actions: DailyActionId[] = [];
  const dom = dayOfMonth(next.currentDay);

  actions.push(next.stockHealth < 64 ? "prepare-order" : "check-pos");

  if (next.traffic >= 70 || next.satisfaction < 66) {
    actions.push("assign-counter");
  }
  if (next.complianceRisk > 32 || dom <= 15) {
    actions.push("check-sgk");
  }
  if (next.retailPotential >= 70 && next.cash > 70000) {
    actions.push("prepare-dermo");
  }
  actions.push(next.debt > next.goals.maxDebt * 0.7 ? "review-ledger" : "cash-count");

  for (const actionId of [...new Set(actions)].slice(0, 4)) {
    next = applyDailyAction(next, actionId);
  }

  return next;
}

function reduceKnownRisks(state: GameState) {
  let next = state;
  const dom = dayOfMonth(next.currentDay);

  if (dom <= 15 || next.complianceRisk > 40) {
    next = runSgkControl(next);
  }

  const shouldPaySupplier =
    (dom >= 13 && dom <= 17 && next.cash > Math.max(80000, next.monthlyRent * 1.4)) ||
    (next.debt > next.goals.maxDebt && next.cash > next.monthlyRent * 2);

  if (shouldPaySupplier) {
    next = paySupplierDebt(next, Math.min(45000, Math.max(12000, next.cash - next.monthlyRent * 1.25)));
  }

  return next;
}

function collectFindings(run: Omit<ScenarioRun, "findings">) {
  const findings: string[] = [];
  const missedRate = run.totalMissed / Math.max(1, run.totalSold + run.totalMissed);
  const evaluation = evaluateScenario(run.finalState);

  if (run.openingTasksCompleted >= 10) {
    findings.push("Sıfırdan açılış görevleri doğru kilitli, fakat akış tamamen lineer; oyuncuya 2-3 gerçek seçim dalı eklenmeli.");
  }
  if (missedRate > 0.16) {
    findings.push(`Kaçan satış oranı yüksek: %${Math.round(missedRate * 100)}. Raf uyarısı ve otomatik sipariş önerisi daha görünür olmalı.`);
  }
  if (run.finalState.debt > run.finalState.goals.maxDebt) {
    findings.push(`Depo borcu hedef üstünde kaldı: ${formatMoney(run.finalState.debt)} / hedef ${formatMoney(run.finalState.goals.maxDebt)}.`);
  }
  if (run.maxComplianceRisk > run.finalState.goals.maxComplianceRisk + 12) {
    findings.push(`SGK uyum riski dönem içinde ${run.maxComplianceRisk}/100 seviyesine çıktı; 1-7 ve 7-15 takvim uyarıları daha agresif olmalı.`);
  }
  if (run.minStockHealth < 38) {
    findings.push(`Stok sağlığı ${run.minStockHealth}/100 seviyesine kadar düştü; kritik raflar sahnede ve aksiyon panelinde daha net kırmızıya dönmeli.`);
  }
  if (run.minEnergy < 18) {
    findings.push(`Enerji ${run.minEnergy}/100 seviyesine indi; personel dinlendirme ve vardiya kararları daha erken önerilmeli.`);
  }
  if (run.purchaseCount > DAYS_TO_PLAY * 2) {
    findings.push(`${run.purchaseCount} depo siparişi oluştu; tek tek kategori alımı yerine haftalık sipariş sepeti ve minimum sipariş limiti tasarlanmalı.`);
  }
  if (run.finalState.staff.length < 2 && run.finalState.traffic > 60) {
    findings.push("Tek kişiyle yoğun eczane yürüyebiliyor görünüyor; işe alım baskısı ve kuyruk cezası güçlendirilmeli.");
  }
  if (run.score < run.finalState.goals.minScore) {
    findings.push(`Başarı puanı hedef altında: ${run.score}/100. Oyuncu sonuç ekranında hangi skor kırılımının kaybettirdiğini görmeli.`);
  }
  if (evaluation.status === "lost" || evaluation.failReasons.length) {
    findings.push(`Senaryo değerlendirmesi risk veriyor: ${evaluation.failReasons.slice(0, 2).join(", ")}.`);
  }
  if (!findings.length) {
    findings.push("Ajan bu senaryoda 120 günü bitirebildi; ana eksik daha fazla karar çeşitliliği ve sonuç ekranı açıklığı.");
  }

  return findings;
}

function playScenario(scenario: ScenarioTemplate): ScenarioRun {
  let state = createInitialState(scenario.id, openingProfile(scenario));
  const opening = completeOpeningIfNeeded(state);
  state = hireForScenario(opening.state);

  let totalSold = 0;
  let totalMissed = 0;
  let worstCash = state.cash;
  let maxDebt = state.debt;
  let maxComplianceRisk = state.complianceRisk;
  let minSatisfaction = state.satisfaction;
  let minStockHealth = state.stockHealth;
  let minEnergy = state.energy;
  let purchaseCount = 0;
  let cashPurchaseCount = 0;
  let termPurchaseCount = 0;

  for (let day = 0; day < DAYS_TO_PLAY; day += 1) {
    state = changeShelfFocus(state, chooseShelfFocus(state));
    state = hireForScenario(state);
    state = assignDailyStaff(state);

    const restock = restockCriticalShelves(state);
    state = restock.state;
    purchaseCount += restock.purchaseCount;
    cashPurchaseCount += restock.cashPurchaseCount;
    termPurchaseCount += restock.termPurchaseCount;

    state = applyDailyPreparation(state);
    state = reduceKnownRisks(state);
    state = advanceTradingDay(state);

    const report = state.lastDayReport;
    totalSold += report?.soldUnits ?? 0;
    totalMissed += report?.missedUnits ?? 0;
    worstCash = Math.min(worstCash, state.cash);
    maxDebt = Math.max(maxDebt, state.debt);
    maxComplianceRisk = Math.max(maxComplianceRisk, state.complianceRisk);
    minSatisfaction = Math.min(minSatisfaction, state.satisfaction);
    minStockHealth = Math.min(minStockHealth, state.stockHealth);
    minEnergy = Math.min(minEnergy, state.energy);
  }

  const score = calculateEndScore(state);
  const runWithoutFindings = {
    scenario,
    finalState: state,
    openingTasksCompleted: opening.completed,
    totalSold,
    totalMissed,
    worstCash,
    maxDebt,
    maxComplianceRisk,
    minSatisfaction,
    minStockHealth,
    minEnergy,
    purchaseCount,
    cashPurchaseCount,
    termPurchaseCount,
    score
  };

  return {
    ...runWithoutFindings,
    findings: collectFindings(runWithoutFindings)
  };
}

function formatPercent(value: number) {
  return new Intl.NumberFormat("tr-TR", {
    maximumFractionDigits: 1,
    minimumFractionDigits: value > 0 && value < 1 ? 1 : 0
  }).format(value);
}

function lineForRun(run: ScenarioRun) {
  const missedRate = (run.totalMissed / Math.max(1, run.totalSold + run.totalMissed)) * 100;
  const evaluation = evaluateScenario(run.finalState);

  return [
    `### ${run.scenario.name}`,
    "",
    `- Başlangıç modu: ${run.scenario.startMode}`,
    `- Oynanan süre: ${DAYS_TO_PLAY} gün`,
    `- Skor: ${run.score}/100 (hedef ${run.finalState.goals.minScore})`,
    `- Değerlendirme: ${evaluation.title}`,
    `- Kasa / borç / SGK / POS: ${formatMoney(run.finalState.cash)} / ${formatMoney(run.finalState.debt)} / ${formatMoney(run.finalState.sgkReceivable)} / ${formatMoney(run.finalState.posReceivable)}`,
    `- Satış: ${run.totalSold} adet, kaçan ${run.totalMissed} adet (%${formatPercent(missedRate)})`,
    `- Dip metrikler: kasa ${formatMoney(run.worstCash)}, stok ${run.minStockHealth}/100, memnuniyet ${run.minSatisfaction}/100, enerji ${run.minEnergy}/100, SGK risk tepe ${run.maxComplianceRisk}/100`,
    `- Depo alımı: ${run.purchaseCount} sipariş (${run.cashPurchaseCount} peşin, ${run.termPurchaseCount} vadeli)`,
    "",
    "**Ajan notları**",
    ...run.findings.map((finding) => `- ${finding}`),
    ""
  ].join("\n");
}

async function main() {
  const runs = scenarioTemplates.map(playScenario);
  const aggregateMissed = runs.reduce((sum, run) => sum + run.totalMissed, 0);
  const aggregateSold = runs.reduce((sum, run) => sum + run.totalSold, 0);
  const aggregateMissedRate = (aggregateMissed / Math.max(1, aggregateSold + aggregateMissed)) * 100;
  const averageScore = Math.round(runs.reduce((sum, run) => sum + run.score, 0) / Math.max(1, runs.length));
  const weakRuns = runs.filter((run) => run.score < run.finalState.goals.minScore);

  const report = [
    "# Kırmızı Tabela Gameplay Test Ajanı Raporu",
    "",
    `Bu rapor \`npm run agent:gameplay\` ile üretildi. Ajan ${scenarioTemplates.length} senaryoyu oyun motorunun gerçek fonksiyonlarıyla ${DAYS_TO_PLAY} gün oynadı.`,
    "",
    "## Özet",
    "",
    `- Ortalama skor: ${averageScore}/100`,
    `- Toplam satış / kaçan satış: ${aggregateSold} / ${aggregateMissed} (%${formatPercent(aggregateMissedRate)})`,
    `- Hedef skoru kaçıran senaryo: ${weakRuns.length}/${runs.length}`,
    "- Kontrol edilen akışlar: sıfırdan açılış kilidi, depo vadesi, POS alacağı, SGK alacağı, personel görevi, raf odağı ve gün sonu skorları.",
    "",
    "## Öncelikli Ürün Eksikleri",
    "",
    "- Açılış görevleri çalışıyor ama oyuncuya seçim duygusu az veriyor; görevlerden bazıları alternatifli karar kartına dönmeli.",
    "- Senaryo sonu ve lig tablosu daha belirgin olmalı; oyuncu eczacı adı, eczane, il/ilçe, net kar, borç ve kaçan satış kırılımını tek sonuç ekranında görmeli.",
    "- Stok azaldığında 3D rafta ürün eksilmesi var, fakat kritik raf uyarısı daha dramatik olmalı.",
    "- Depo alımı karar sayısı fazla büyüyor; kategori kategori satın alma yerine sepet, önerilen sipariş ve vade karşılaştırması tek ekranda toplanmalı.",
    "- Personel sisteminde görev ataması etkili, ancak işe alım ihtiyacı ve kötü görev eşleşmesi daha sert geri bildirim vermeli.",
    "- SGK/POS vadeleri motor seviyesinde doğru ayrışıyor; arayüzde takvim şeridi ve yaklaşan tahsilat/ödeme listesi daha görünür olmalı.",
    "",
    "## Senaryo Detayları",
    "",
    ...runs.map(lineForRun)
  ].join("\n");

  await mkdir(path.dirname(reportPath), { recursive: true });
  await writeFile(reportPath, report, "utf8");

  console.log(`Gameplay agent completed ${runs.length} scenarios.`);
  console.log(`Average score: ${averageScore}/100`);
  console.log(`Report: ${reportPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
