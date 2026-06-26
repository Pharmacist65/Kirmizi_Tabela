export type WorldVec3 = [number, number, number];

export type WorldActorKind = "pharmacist" | "staff" | "patient" | "courier";

export type WorldActor = {
  id: string;
  kind: WorldActorKind;
  title: string;
  subtitle: string;
  status: string;
  detail: string;
  module?: string;
  stats?: { label: string; value: string | number }[];
};

export type WorldRoute = WorldVec3[];

export const worldRoutes = {
  pharmacistPatrol: [
    [0.25, 0, 3.18],
    [0.12, 0, 2.18],
    [-0.62, 0, 1.18],
    [-1.42, 0, 0.55],
    [-0.82, 0, 1.64]
  ],
  patientQueue: [
    [-3.95, 0, 2.65],
    [-3.08, 0, 2.24],
    [-2.28, 0, 1.88],
    [-1.48, 0, 1.5],
    [-0.72, 0, 1.02],
    [-1.74, 0, 0.55],
    [-2.7, 0, 1.42]
  ],
  staffIdle: [
    [-0.58, 0, 2.2],
    [-1.28, 0, 1.62],
    [-0.82, 0, 0.96],
    [0.1, 0, 1.62]
  ],
  staffCounter: [
    [-0.86, 0, 0.58],
    [-1.66, 0, 0.38],
    [-1.96, 0, 0.88],
    [-1.2, 0, 1.08]
  ],
  staffStock: [
    [-2.42, 0, 0.26],
    [-3.18, 0, -0.12],
    [-3.72, 0, 0.44],
    [-2.88, 0, 0.82]
  ],
  staffSgk: [
    [2.42, 0, 0.32],
    [3.42, 0, 0.06],
    [4.64, 0, 0.42],
    [5.52, 0, 0.12],
    [4.24, 0, 0.9]
  ],
  staffDermo: [
    [-2.12, 0, 0.1],
    [-1.28, 0, -0.28],
    [-0.42, 0, 0.12],
    [-1.2, 0, 0.76]
  ],
  courierLoop: [
    [-6.65, 0, 1.08],
    [-5.28, 0, 1.18],
    [-3.72, 0, 1.1],
    [-2.12, 0, 1.08],
    [-0.72, 0, 1.24],
    [-2.9, 0, 1.5],
    [-5.7, 0, 1.38]
  ],
  interiorPharmacistPatrol: [
    [0.35, 0, 2.28],
    [-0.48, 0, 1.26],
    [-1.38, 0, 0.42],
    [-0.72, 0, -1.18],
    [0.92, 0, -0.48],
    [0.42, 0, 0.82]
  ],
  interiorPatientQueue: [
    [-1.82, 0, 2.7],
    [-1.42, 0, 2.05],
    [-1.04, 0, 1.38],
    [-0.62, 0, 0.75],
    [-1.18, 0, 1.62]
  ],
  interiorStaffIdle: [
    [0.15, 0, 1.92],
    [-0.62, 0, 1.22],
    [-0.12, 0, 0.48],
    [0.72, 0, 1.08]
  ],
  interiorStaffCounter: [
    [-0.78, 0, 0.58],
    [-1.38, 0, 0.22],
    [-1.76, 0, 0.82],
    [-0.92, 0, 1.08]
  ],
  interiorStaffStock: [
    [-2.45, 0, -0.42],
    [-3.22, 0, -1.36],
    [-2.72, 0, -2.12],
    [-1.95, 0, -1.18]
  ],
  interiorStaffSgk: [
    [1.18, 0, 0.32],
    [2.12, 0, -0.2],
    [2.56, 0, -1.16],
    [1.52, 0, -0.82]
  ],
  interiorStaffDermo: [
    [-1.12, 0, -1.55],
    [0.02, 0, -1.92],
    [0.92, 0, -1.34],
    [-0.24, 0, -0.86]
  ]
} satisfies Record<string, WorldRoute>;

function normalizeProgress(progress: number) {
  return ((progress % 1) + 1) % 1;
}

function lerp(start: number, end: number, amount: number) {
  return start + (end - start) * amount;
}

export function getRoutePose(route: WorldRoute, progress: number) {
  if (route.length === 0) {
    return { position: [0, 0, 0] as WorldVec3, rotationY: 0 };
  }

  if (route.length === 1) {
    return { position: route[0] ?? ([0, 0, 0] as WorldVec3), rotationY: 0 };
  }

  const normalized = normalizeProgress(progress);
  const routePosition = normalized * route.length;
  const index = Math.floor(routePosition) % route.length;
  const nextIndex = (index + 1) % route.length;
  const amount = routePosition - index;
  const start = route[index] ?? route[0] ?? ([0, 0, 0] as WorldVec3);
  const end = route[nextIndex] ?? route[0] ?? start;
  const dx = end[0] - start[0];
  const dz = end[2] - start[2];

  return {
    position: [lerp(start[0], end[0], amount), lerp(start[1], end[1], amount), lerp(start[2], end[2], amount)] as WorldVec3,
    rotationY: Math.atan2(dx, dz)
  };
}
