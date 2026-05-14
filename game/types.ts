export type EventCategory =
  | "finance"
  | "supplier"
  | "sgk"
  | "customer"
  | "staff"
  | "stock"
  | "night-shift"
  | "dermo"
  | "compliance";

export type ShelfFocus = "balanced" | "prescription" | "dermo" | "otc" | "flow";

export type GameStartMode = "new" | "takeover" | "crisis";

export type GamePhase = "setup" | "playing";

export type DayPhase = "morning" | "open" | "closing";

export type LocationType =
  | "hospital"
  | "neighborhood"
  | "avenue"
  | "rural"
  | "touristic"
  | "industrial"
  | "university"
  | "mall";

export type Difficulty = "rahat" | "gercekci" | "zor";

export type GameStatus = "playing" | "warning" | "won" | "lost";

export type StrategicActionId =
  | "none"
  | "rx-stock"
  | "dermo-push"
  | "supplier-term"
  | "sgk-audit"
  | "staff-shift"
  | "cash-discipline"
  | "rest-delegate"
  | "pos-bargain"
  | "private-insurance-check"
  | "emanet-policy";

export type EffectKey =
  | "cash"
  | "debt"
  | "sgkReceivable"
  | "privateInsuranceReceivable"
  | "energy"
  | "satisfaction"
  | "stockHealth"
  | "staffMorale"
  | "reputation"
  | "complianceRisk"
  | "supplierTrust"
  | "dermoPotential"
  | "otcPotential";

export type StaffRole = "pharmacist" | "technician" | "sgk" | "dermo" | "cashier" | "stock";

export type StaffSkill = "speed" | "attention" | "communication" | "dermo" | "stock";

export type StaffMember = {
  id: string;
  name: string;
  role: StaffRole;
  salary: number;
  performance: number;
  morale: number;
  speed: number;
  attention: number;
  communication: number;
  dermo: number;
  stock: number;
  assignedTaskId?: string;
};

export type StaffTask = {
  id: string;
  title: string;
  description: string;
  skill: StaffSkill;
  successEffects: ChoiceEffect;
  failureEffects: ChoiceEffect;
};

export type RoutineExpenses = {
  accounting: number;
  utilities: number;
  cleaning: number;
  software: number;
  chamberAndDues: number;
  bankAndPosFixed: number;
};

export type InventoryKind = "prescription" | "otc" | "dermo" | "medical";

export type PurchasePayment = "cash" | "term";

export type LedgerStatus = "open" | "paid" | "overdue";

export type LedgerSource =
  | "supplier"
  | "dealer"
  | "marketplace"
  | "pos"
  | "sgk"
  | "sgk-special"
  | "private-insurance"
  | "routine";

export type LedgerEntry = {
  id: string;
  amount: number;
  dueDay: number;
  source: LedgerSource;
  status: LedgerStatus;
  description: string;
  createdDay: number;
};

export type InventoryCategory = {
  id: string;
  name: string;
  kind: InventoryKind;
  stock: number;
  capacity: number;
  unitCost: number;
  sellPrice: number;
  demand: number;
  expiryRisk: number;
  defaultTermDays: number;
};

export type DaySaleLine = {
  categoryId: string;
  name: string;
  soldUnits: number;
  missedUnits: number;
  revenue: number;
};

export type DayReport = {
  day: number;
  title: string;
  soldUnits: number;
  missedUnits: number;
  cashSales: number;
  posSales: number;
  sgkAccrued: number;
  privateAccrued: number;
  supplierPaid: number;
  supplierOverdue: number;
  collections: number;
  operatingCost: number;
  xpGain: number;
  lines: DaySaleLine[];
  notes: string[];
};

export type StartProfile = {
  pharmacistName: string;
  pharmacyName: string;
  city: string;
  district: string;
  locationType: LocationType;
  startMode: GameStartMode;
};

export type DailyActionPhase = "morning" | "open" | "closing";

export type DailyActionId =
  | "check-pos"
  | "prepare-order"
  | "assign-counter"
  | "prepare-dermo"
  | "check-sgk"
  | "counter-support"
  | "emergency-trade"
  | "calm-patient"
  | "supplier-offer"
  | "rest-staff"
  | "cash-count"
  | "review-ledger"
  | "next-order-list";

export type DailyAction = {
  id: DailyActionId;
  title: string;
  description: string;
  phase: DailyActionPhase;
  durationMinutes: number;
  cost: number;
  risk: "low" | "medium" | "high";
  expectedEffect: string;
  effects: ChoiceEffect;
};

export type GameState = {
  pharmacistName: string;
  scenarioId: string;
  pharmacyName: string;
  city: string;
  district: string;
  scenarioName: string;
  startMode: GameStartMode;
  gamePhase: GamePhase;
  setupCompleted: boolean;
  dayPhase: DayPhase;
  timeLabel: string;
  locationName: string;
  locationType: LocationType;
  difficulty: Difficulty;
  monthlyRent: number;
  posCommissionRate: number;
  privateInsuranceReceivable: number;
  traffic: number;
  prescriptionPressure: number;
  retailPotential: number;
  currentDay: number;
  month: number;
  cash: number;
  debt: number;
  sgkReceivable: number;
  posReceivable: number;
  energy: number;
  satisfaction: number;
  stockHealth: number;
  staffMorale: number;
  reputation: number;
  complianceRisk: number;
  supplierTrust: number;
  dermoPotential: number;
  otcPotential: number;
  dailyRevenue: number;
  dailyProfit: number;
  level: number;
  xp: number;
  inventory: InventoryCategory[];
  staff: StaffMember[];
  supplierPayables: LedgerEntry[];
  posReceivables: LedgerEntry[];
  sgkReceivables: LedgerEntry[];
  privateInsuranceReceivables: LedgerEntry[];
  marketplaceReceivables: LedgerEntry[];
  pharmacyMarketBalance: number;
  lastDayReport: DayReport | null;
  routineExpenses: RoutineExpenses;
  shelfFocus: ShelfFocus;
  dailyActionId: StrategicActionId;
  lastReport: string;
  goals: ScenarioGoals;
  seed: number;
};

export type ChoiceEffect = Partial<Record<EffectKey, number>>;

export type EventChoice = {
  label: string;
  detail: string;
  effects: ChoiceEffect;
};

export type EventTemplate = {
  id: string;
  title: string;
  category: EventCategory;
  description: string;
  trigger?: (state: GameState) => boolean;
  choices: EventChoice[];
};

export type DayResolution = {
  state: GameState;
  summary: string;
  outcome: TurnOutcome;
};

export type OutcomeDelta = {
  key: EffectKey;
  label: string;
  before: number;
  after: number;
  delta: number;
  kind: "money" | "score";
};

export type TurnOutcome = {
  day: number;
  actionTitle: string;
  eventTitle: string;
  choiceLabel: string;
  surpriseTitle: string;
  surpriseDescription: string;
  summary: string;
  deltas: OutcomeDelta[];
};

export type ActionDelta = {
  label: string;
  before: number;
  after: number;
  delta: number;
  kind: "money" | "score" | "count";
};

export type ActionResult = {
  title: string;
  description: string;
  deltas: ActionDelta[];
};

export type SurpriseTone = "good" | "bad" | "odd";

export type SurpriseTemplate = {
  id: string;
  title: string;
  description: string;
  tone: SurpriseTone;
  effects: ChoiceEffect;
};

export type RivalPharmacy = {
  pharmacistName: string;
  pharmacyName: string;
  city: string;
  district: string;
  level: number;
  name: string;
  style: string;
  score: number;
  monthlyRevenue: number;
  netProfit: number;
  reputation: number;
  debtRisk: number;
  cashFlowScore: number;
  missedSalesRate: number;
  trend: "Yükseliyor" | "Dengede" | "Baskıda";
  isPlayer?: boolean;
};

export type ScenarioTemplate = {
  id: string;
  name: string;
  startMode: GameStartMode;
  locationName: string;
  locationType: LocationType;
  difficulty: Difficulty;
  description: string;
  startingCash: number;
  startingDebt: number;
  startingSgkReceivable: number;
  startingPosReceivable: number;
  monthlyRent: number;
  posCommissionRate: number;
  privateInsuranceReceivable: number;
  city?: string;
  district?: string;
  traffic: number;
  prescriptionPressure: number;
  retailPotential: number;
  energy: number;
  satisfaction: number;
  stockHealth: number;
  staffMorale: number;
  reputation: number;
  complianceRisk: number;
  supplierTrust: number;
  dermoPotential: number;
  otcPotential: number;
  goals: ScenarioGoals;
  tags: string[];
};

export type ScenarioGoals = {
  months: number;
  targetCash: number;
  maxDebt: number;
  minSatisfaction: number;
  minStockHealth: number;
  minEnergy: number;
  maxComplianceRisk: number;
  minScore: number;
};

export type GoalCheck = {
  label: string;
  current: number;
  target: number;
  met: boolean;
  inverse?: boolean;
  kind: "money" | "score";
};

export type ScenarioEvaluation = {
  status: GameStatus;
  title: string;
  message: string;
  checks: GoalCheck[];
  failReasons: string[];
  monthsRemaining: number;
};

export type StrategicAction = {
  id: StrategicActionId;
  title: string;
  description: string;
  bestFor: string;
  effects: ChoiceEffect;
};

export type TimedTaskStatus = "locked" | "ready" | "running" | "done";

export type TimedTask = {
  id: string;
  title: string;
  description: string;
  durationMinutes: number;
  demoDurationSeconds: number;
  status: TimedTaskStatus;
  startedAt?: number;
  completedAt?: number;
  unlocksAfter?: string[];
  effects: ChoiceEffect;
};
