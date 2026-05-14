import type { RoutineExpenses, StaffMember, StaffTask } from "@/game/types";

export const roleLabels = {
  pharmacist: "Eczacı",
  technician: "Tekniker",
  sgk: "SGK sorumlusu",
  dermo: "Dermo danışmanı",
  cashier: "Kasa destek",
  stock: "Stok sorumlusu"
};

export const staffTasks: StaffTask[] = [
  {
    id: "rx-control",
    title: "Reçete kontrol",
    description: "E-reçete, manuel ve grup reçete kontrollerini yapar.",
    skill: "attention",
    successEffects: { complianceRisk: -5, sgkReceivable: 4500, reputation: 1 },
    failureEffects: { complianceRisk: 6, sgkReceivable: -3500, staffMorale: -2 }
  },
  {
    id: "sgk-file",
    title: "SGK dosyası",
    description: "Ayın 1-7 ve 7-15 dönemlerinde dosya/fatura takibini yürütür.",
    skill: "attention",
    successEffects: { complianceRisk: -7, energy: 2 },
    failureEffects: { complianceRisk: 8, energy: -3 }
  },
  {
    id: "dermo-sales",
    title: "Dermo danışmanlığı",
    description: "Dermo/OTC müşterisine doğru dil ve raf yönlendirmesi yapar.",
    skill: "dermo",
    successEffects: { cash: 9000, dermoPotential: 4, satisfaction: 2 },
    failureEffects: { satisfaction: -3, dermoPotential: -2, staffMorale: -1 }
  },
  {
    id: "counter-flow",
    title: "Banko akışı",
    description: "Kuyruk, kasa ve reçete bankosu trafiğini rahatlatır.",
    skill: "speed",
    successEffects: { satisfaction: 4, energy: 3, cash: 3500 },
    failureEffects: { satisfaction: -4, energy: -2 }
  },
  {
    id: "stock-check",
    title: "Stok ve miat kontrolü",
    description: "Raf, depo odası, miat ve eksik ürün listesini toparlar.",
    skill: "stock",
    successEffects: { stockHealth: 7, cash: -2500 },
    failureEffects: { stockHealth: -5, cash: -4500, complianceRisk: 2 }
  },
  {
    id: "patient-communication",
    title: "Hasta iletişimi",
    description: "Emanet, fiyat, bekleme ve zor müşteri konuşmalarını yumuşatır.",
    skill: "communication",
    successEffects: { satisfaction: 5, reputation: 3, energy: 1 },
    failureEffects: { satisfaction: -5, reputation: -2, energy: -2 }
  }
];

export const staffCandidates: StaffMember[] = [
  {
    id: "candidate-aylin",
    name: "Aylin",
    role: "sgk",
    salary: 36000,
    performance: 66,
    morale: 70,
    speed: 54,
    attention: 82,
    communication: 62,
    dermo: 38,
    stock: 58
  },
  {
    id: "candidate-burak",
    name: "Burak",
    role: "dermo",
    salary: 33000,
    performance: 62,
    morale: 68,
    speed: 61,
    attention: 50,
    communication: 76,
    dermo: 84,
    stock: 42
  },
  {
    id: "candidate-seda",
    name: "Seda",
    role: "technician",
    salary: 30000,
    performance: 60,
    morale: 72,
    speed: 78,
    attention: 66,
    communication: 70,
    dermo: 46,
    stock: 63
  }
];

export function createInitialStaff(): StaffMember[] {
  return [
    {
      id: "staff-ayse",
      name: "Ayşe",
      role: "technician",
      salary: 30000,
      performance: 68,
      morale: 66,
      speed: 74,
      attention: 70,
      communication: 65,
      dermo: 42,
      stock: 60
    },
    {
      id: "staff-mehmet",
      name: "Mehmet",
      role: "sgk",
      salary: 34500,
      performance: 70,
      morale: 62,
      speed: 55,
      attention: 80,
      communication: 58,
      dermo: 35,
      stock: 64
    }
  ];
}

export function createRoutineExpenses(): RoutineExpenses {
  return {
    accounting: 9500,
    utilities: 14000,
    cleaning: 8500,
    software: 6200,
    chamberAndDues: 5500,
    bankAndPosFixed: 4200
  };
}
