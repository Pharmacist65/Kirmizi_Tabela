import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  BoxGeometry,
  ConeGeometry,
  CylinderGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  Scene,
  SphereGeometry
} from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";

const outDir = path.join(process.cwd(), "public", "assets", "game", "models");

globalThis.FileReader ??= class NodeFileReader {
  result = null;
  onloadend = null;
  onerror = null;

  readAsArrayBuffer(blob) {
    blob.arrayBuffer()
      .then((buffer) => {
        this.result = buffer;
        this.onloadend?.({ target: this });
      })
      .catch((error) => {
        this.onerror?.(error);
      });
  }
};

function material(color, options = {}) {
  return new MeshStandardMaterial({ color, roughness: 0.64, ...options });
}

function applyTransform(mesh, position, scale, rotation = [0, 0, 0]) {
  mesh.position.set(...position);
  mesh.scale.set(...scale);
  mesh.rotation.set(...rotation);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
}

function box(parent, name, color, position, scale, options = {}) {
  const { rotation = [0, 0, 0], ...materialOptions } = options;
  const mesh = new Mesh(new BoxGeometry(), material(color, materialOptions));
  mesh.name = name;
  applyTransform(mesh, position, scale, rotation);
  parent.add(mesh);
  return mesh;
}

function cylinder(parent, name, color, position, radiusTop, radiusBottom, height, segments = 14, options = {}) {
  const { rotation = [0, 0, 0], ...materialOptions } = options;
  const mesh = new Mesh(new CylinderGeometry(radiusTop, radiusBottom, height, segments), material(color, materialOptions));
  mesh.name = name;
  mesh.position.set(...position);
  mesh.rotation.set(...rotation);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function sphere(parent, name, color, position, radius, scale = [1, 1, 1], options = {}) {
  const { rotation = [0, 0, 0], ...materialOptions } = options;
  const mesh = new Mesh(new SphereGeometry(radius, 24, 16), material(color, materialOptions));
  mesh.name = name;
  applyTransform(mesh, position, scale, rotation);
  parent.add(mesh);
  return mesh;
}

function cone(parent, name, color, position, radius, height, segments = 16, options = {}) {
  const { rotation = [0, 0, 0], ...materialOptions } = options;
  const mesh = new Mesh(new ConeGeometry(radius, height, segments), material(color, materialOptions));
  mesh.name = name;
  mesh.position.set(...position);
  mesh.rotation.set(...rotation);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function assetScene(name, group) {
  const scene = new Scene();
  scene.name = name;
  scene.add(group);
  return scene;
}

function group(name) {
  const g = new Group();
  g.name = name;
  return g;
}

function roundedShadow(parent, width = 0.36, depth = 0.24) {
  const shadow = cylinder(parent, "contact_shadow", "#14221d", [0, 0.012, 0], width, width, 0.014, 32, { transparent: true, opacity: 0.2, rotation: [Math.PI / 2, 0, 0] });
  shadow.scale.z = depth / width;
}

function makeHuman({
  name,
  gender,
  top,
  accent = "#f7f1ec",
  pants = "#26313a",
  shoes = "#f3f1e8",
  hair = "#272635",
  hairStyle = "short",
  skin = "#e1b084",
  mask = false,
  bag = false,
  badge = false,
  clipboard = false,
  skirt = false,
  height = 1
}) {
  const g = group(name);
  g.scale.set(height, height, height);
  roundedShadow(g, gender === "male" ? 0.32 : 0.3, 0.22);

  for (const x of [-0.095, 0.095]) {
    cylinder(g, `leg_${x}`, pants, [x, 0.34, 0], 0.046, 0.058, 0.62, 14);
    box(g, `shoe_${x}`, shoes, [x, 0.035, 0.07], [0.115, 0.04, 0.17]);
  }

  if (skirt) {
    cylinder(g, "skirt", pants, [0, 0.62, 0], 0.16, 0.22, 0.38, 10);
  }

  cylinder(g, "torso", top, [0, 0.86, 0], gender === "male" ? 0.18 : 0.165, gender === "male" ? 0.245 : 0.225, 0.62, 10);
  box(g, "front_trim", accent, [0, 0.87, 0.145], [0.045, 0.49, 0.016]);
  box(g, "left_pocket", accent, [-0.08, 0.68, 0.156], [0.05, 0.04, 0.012]);
  box(g, "right_pocket", accent, [0.08, 0.68, 0.156], [0.05, 0.04, 0.012]);
  cylinder(g, "neck", skin, [0, 1.22, 0], 0.055, 0.063, 0.11, 12);

  for (const x of [-0.255, 0.255]) {
    const arm = cylinder(g, `arm_${x}`, top, [x, 0.82, 0.01], 0.035, 0.045, 0.56, 10);
    arm.rotation.z = x > 0 ? -0.28 : 0.28;
    sphere(g, `hand_${x}`, skin, [x, 0.51, 0.03], 0.044);
  }

  sphere(g, "head", skin, [0, 1.4, 0], 0.13, [0.92, 1.08, 0.92]);
  sphere(g, "nose", "#ca8b69", [0.02, 1.39, 0.12], 1, [0.035, 0.018, 0.022]);
  for (const x of [-0.045, 0.045]) sphere(g, `eye_${x}`, "#1b1d21", [x, 1.42, 0.12], 1, [0.015, 0.018, 0.01]);

  if (mask) {
    box(g, "medical_mask", "#eef3ee", [0, 1.365, 0.126], [0.152, 0.065, 0.015]);
    box(g, "mask_top_line", "#cdd8d4", [0, 1.395, 0.136], [0.16, 0.007, 0.01]);
    for (const x of [-0.087, 0.087]) box(g, `mask_strap_${x}`, "#d7e0dc", [x, 1.365, 0.119], [0.014, 0.055, 0.01]);
  } else {
    box(g, "mouth", "#9a584d", [0, 1.355, 0.126], [0.045, 0.007, 0.009]);
  }

  if (hairStyle === "covered") {
    sphere(g, "covered_hair", "#f0eadf", [0, 1.49, -0.02], 0.128, [1.02, 0.52, 1.02]);
    box(g, "scarf_tail", "#c8d0c7", [0, 1.22, -0.1], [0.18, 0.15, 0.05]);
  } else {
    sphere(g, "hair_cap", hair, [0, 1.49, -0.02], 0.128, [1.08, hairStyle === "bob" ? 0.64 : 0.5, 0.98]);
    if (hairStyle === "bob" || hairStyle === "long") {
      for (const x of [-0.105, 0.105]) box(g, `side_hair_${x}`, hair, [x, 1.33, 0.0], [0.05, hairStyle === "long" ? 0.25 : 0.18, 0.055]);
    }
    if (hairStyle === "long") box(g, "back_hair", hair, [0, 1.3, -0.105], [0.16, 0.24, 0.05]);
  }

  if (bag) {
    box(g, "shoulder_bag", "#4b5e54", [0.23, 0.84, -0.12], [0.11, 0.3, 0.07]);
    box(g, "bag_strap", "#2f3b36", [0.08, 0.93, 0.12], [0.03, 0.48, 0.016], { rotation: [0, 0, -0.4] });
  }

  if (badge) {
    box(g, "name_badge", "#f8f7ef", [0.095, 0.97, 0.164], [0.07, 0.032, 0.012]);
    box(g, "badge_line", "#b21f2d", [0.095, 0.97, 0.174], [0.042, 0.006, 0.009]);
  }

  if (clipboard) {
    box(g, "clipboard", "#f3eee0", [-0.27, 0.72, 0.1], [0.105, 0.17, 0.024], { rotation: [0.08, -0.12, -0.18] });
    box(g, "clipboard_clip", "#6e7771", [-0.27, 0.795, 0.12], [0.066, 0.024, 0.017], { rotation: [0.08, -0.12, -0.18] });
  }

  return g;
}

function makeStreetBase() {
  const g = group("street_base");
  sphere(g, "small_planet_ground", "#87a982", [0, -1.58, 0.18], 1, [8.8, 1.64, 5.05]);
  box(g, "asphalt", "#48534f", [0, 0.02, 1.28], [11.8, 0.08, 1.05]);
  box(g, "sidewalk", "#ddd9c9", [0, 0.045, -0.34], [11.6, 0.07, 2.35]);
  box(g, "curb", "#efe9da", [0, 0.085, 0.62], [11.8, 0.08, 0.08]);
  for (const x of [-3.8, -2.25, -0.7, 0.85, 2.4, 3.95]) box(g, `lane_${x}`, "#dfe4dc", [x, 0.075, 1.26], [0.52, 0.025, 0.035]);
  for (const x of [-0.72, -0.42, -0.12, 0.18, 0.48, 0.78]) box(g, `crosswalk_${x}`, "#f8f5e9", [x, 0.095, 1.75], [0.18, 0.028, 0.72]);
  for (const x of [-5.65, 5.65]) box(g, `edge_${x}`, "#66776c", [x, 0.15, 0.28], [0.12, 0.22, 3.05]);
  return g;
}

function makeRoadStraight() {
  const g = group("road_straight");
  box(g, "road", "#46514d", [0, 0, 0], [2.4, 0.08, 1]);
  box(g, "curb_left", "#e5dfce", [0, 0.06, -0.55], [2.4, 0.06, 0.08]);
  box(g, "curb_right", "#e5dfce", [0, 0.06, 0.55], [2.4, 0.06, 0.08]);
  for (const x of [-0.8, 0, 0.8]) box(g, `lane_${x}`, "#e9efe6", [x, 0.075, 0], [0.34, 0.018, 0.035]);
  return g;
}

function makeRoadCorner() {
  const g = group("road_corner");
  box(g, "road_x", "#46514d", [0, 0, 0], [2.4, 0.08, 1]);
  box(g, "road_z", "#46514d", [-0.72, 0, -0.72], [1, 0.08, 2.4]);
  box(g, "corner_sidewalk", "#ded9c8", [0.55, 0.035, -0.55], [1.25, 0.07, 1.25]);
  return g;
}

function makeRoadCrosswalk() {
  const g = makeRoadStraight();
  g.name = "road_crosswalk";
  for (const x of [-0.42, -0.21, 0, 0.21, 0.42]) box(g, `walk_${x}`, "#fbf8ec", [x, 0.095, 0.25], [0.09, 0.02, 0.5]);
  return g;
}

function makeSidewalkTile() {
  const g = group("sidewalk_tile");
  box(g, "tile", "#d9d3c2", [0, 0, 0], [1.2, 0.06, 1.2]);
  for (const x of [-0.4, 0, 0.4]) box(g, `groove_x_${x}`, "#c5bdab", [x, 0.035, 0], [0.012, 0.012, 1.12]);
  for (const z of [-0.4, 0, 0.4]) box(g, `groove_z_${z}`, "#c5bdab", [0, 0.036, z], [1.12, 0.012, 0.012]);
  return g;
}

function makeSmallPlanetPatch() {
  const g = group("small_planet_patch");
  sphere(g, "curved_grass", "#8fb58d", [0, -0.62, 0], 1, [2.2, 0.68, 2.2]);
  box(g, "path", "#d9cdb4", [0.18, 0.05, 0], [1.5, 0.045, 0.26], { rotation: [0, 0.32, 0] });
  return g;
}

function makePharmacyFacade() {
  const g = group("pharmacy_facade");
  box(g, "body", "#efe7dc", [0, 1.08, 0], [2, 2.16, 0.56]);
  box(g, "roof", "#34453f", [0, 2.26, 0.02], [2.22, 0.18, 0.64]);
  box(g, "red_sign", "#d71925", [0, 1.72, 0.32], [1.62, 0.26, 0.06], { emissive: "#6a0710", emissiveIntensity: 0.14 });
  box(g, "sign_cross_h", "#ffffff", [-0.68, 1.72, 0.37], [0.16, 0.04, 0.045]);
  box(g, "sign_cross_v", "#ffffff", [-0.68, 1.72, 0.375], [0.045, 0.16, 0.045]);
  box(g, "awning_bar", "#f7f3e7", [0, 1.2, 0.34], [1.82, 0.16, 0.54]);
  for (const [index, x] of [-0.72, -0.36, 0, 0.36, 0.72].entries()) box(g, `awning_${index}`, index % 2 === 0 ? "#e42b31" : "#fff7eb", [x, 1.13, 0.43], [0.18, 0.12, 0.44]);
  for (const x of [-0.44, 0.44]) box(g, `glass_door_${x}`, "#dbe9ea", [x, 0.53, 0.315], [0.36, 0.86, 0.045], { metalness: 0.08, transparent: true, opacity: 0.82 });
  box(g, "door_join", "#5f706b", [0, 0.52, 0.36], [0.038, 0.82, 0.04]);
  for (const x of [-0.9, 0.9]) box(g, `window_${x}`, "#d8eceb", [x, 0.62, 0.315], [0.28, 0.52, 0.04], { metalness: 0.05, transparent: true, opacity: 0.8 });
  box(g, "entry_step", "#cfc9b7", [0, 0.08, 0.53], [1.38, 0.12, 0.34]);
  return g;
}

function makeDeliveryTruck() {
  const g = group("delivery_truck");
  box(g, "cargo", "#f8f4e7", [0, 0.34, 0], [0.82, 0.46, 0.42]);
  box(g, "cab", "#e6efe9", [-0.5, 0.28, 0.02], [0.36, 0.36, 0.4]);
  box(g, "windshield", "#b8d4da", [-0.6, 0.36, 0.23], [0.18, 0.11, 0.025], { emissive: "#2a5962", emissiveIntensity: 0.04 });
  box(g, "red_logo", "#b21f2d", [0.08, 0.42, 0.23], [0.24, 0.07, 0.025]);
  for (const x of [-0.48, 0.42]) {
    cylinder(g, `wheel_${x}`, "#17201d", [x, 0.08, 0.24], 0.105, 0.105, 0.06, 18, { rotation: [Math.PI / 2, 0, 0] });
  }
  return g;
}

function makeDepotWarehouse() {
  const g = group("depot_warehouse");
  box(g, "body", "#dfceb3", [0, 0.72, 0], [1.46, 1.44, 0.82]);
  box(g, "roof", "#3e5049", [0, 1.55, 0.02], [1.66, 0.18, 0.92]);
  box(g, "sign", "#f7f1dc", [0, 1.02, 0.45], [1.05, 0.24, 0.05]);
  box(g, "shutter", "#b9aa91", [-0.28, 0.38, 0.46], [0.48, 0.7, 0.045]);
  for (const y of [0.18, 0.34, 0.5]) box(g, `roll_${y}`, "#6c776e", [-0.28, y, 0.49], [0.5, 0.015, 0.025]);
  const truck = makeDeliveryTruck();
  truck.position.set(0.82, 0, 0.95);
  truck.rotation.y = -0.18;
  truck.scale.set(0.72, 0.72, 0.72);
  g.add(truck);
  return g;
}

function makeSgkOffice() {
  const g = group("sgk_office");
  box(g, "body", "#d9e5e8", [0, 0.82, 0], [1.58, 1.64, 0.76]);
  box(g, "roof", "#3f575b", [0, 1.72, 0.02], [1.72, 0.18, 0.86]);
  box(g, "sign", "#f6fbff", [0, 1.08, 0.42], [1.1, 0.26, 0.05]);
  for (const x of [-0.54, 0, 0.54]) box(g, `column_${x}`, "#edf3ef", [x, 0.46, 0.45], [0.08, 0.82, 0.08]);
  box(g, "step", "#c5d1d0", [0, 0.08, 0.6], [1.32, 0.11, 0.36]);
  box(g, "flag", "#c51d2a", [0.74, 1.28, 0.47], [0.26, 0.16, 0.035]);
  return g;
}

function makeBankBranch() {
  const g = group("bank_branch");
  box(g, "body", "#e8e4d8", [0, 0.52, 0], [1.18, 1.04, 0.58]);
  box(g, "roof", "#3a4b45", [0, 1.12, 0.02], [1.34, 0.16, 0.66]);
  box(g, "sign", "#fbfaf2", [0, 0.72, 0.33], [0.96, 0.26, 0.05]);
  box(g, "window", "#d9ebe9", [-0.38, 0.34, 0.35], [0.32, 0.5, 0.05], { metalness: 0.04 });
  box(g, "atm", "#68746d", [0.34, 0.36, 0.35], [0.34, 0.56, 0.055]);
  box(g, "atm_screen", "#b8d4da", [0.34, 0.48, 0.39], [0.22, 0.12, 0.025], { emissive: "#2a5962", emissiveIntensity: 0.08 });
  return g;
}

function makeSimpleBuilding({ name, body, roof = "#3f504a", sign = "#f6f2e8", windows = 4, height = 1.4, width = 1.3 }) {
  const g = group(name);
  box(g, "body", body, [0, height / 2, 0], [width, height, 0.66]);
  box(g, "roof", roof, [0, height + 0.11, 0.02], [width + 0.18, 0.16, 0.76]);
  box(g, "sign", sign, [0, height * 0.68, 0.37], [width * 0.62, 0.2, 0.045]);
  for (let i = 0; i < windows; i += 1) {
    const x = -width * 0.36 + (i % 3) * width * 0.36;
    const y = 0.42 + Math.floor(i / 3) * 0.42;
    box(g, `window_${i}`, "#d5e8e8", [x, y, 0.36], [0.19, 0.2, 0.04], { transparent: true, opacity: 0.84 });
  }
  box(g, "door", "#59665f", [width * 0.34, 0.28, 0.37], [0.22, 0.55, 0.045]);
  return g;
}

function makeTreeRound() {
  const g = group("tree_round");
  cylinder(g, "trunk", "#765b3b", [0, 0.38, 0], 0.055, 0.075, 0.76, 10);
  sphere(g, "leaf_main", "#4c9d67", [0, 0.9, 0], 0.46, [0.72, 0.54, 0.72]);
  sphere(g, "leaf_side", "#3e8e5d", [0.22, 0.76, 0.06], 0.38, [0.48, 0.36, 0.48]);
  return g;
}

function makeTreeTall() {
  const g = group("tree_tall");
  cylinder(g, "trunk", "#6d5539", [0, 0.55, 0], 0.05, 0.08, 1.08, 10);
  cone(g, "leaf_low", "#4f9b62", [0, 0.95, 0], 0.36, 0.62, 18);
  cone(g, "leaf_high", "#3f8757", [0, 1.26, 0], 0.28, 0.52, 18);
  return g;
}

function makeTreePlane() {
  const g = group("tree_plane");
  cylinder(g, "trunk", "#725235", [0, 0.42, 0], 0.055, 0.075, 0.82, 10);
  sphere(g, "flat_canopy", "#5aa06a", [0, 0.95, 0], 0.5, [0.95, 0.3, 0.74]);
  box(g, "canopy_cut", "#70b376", [0.16, 0.98, 0.08], [0.42, 0.12, 0.42], { rotation: [0, 0.2, 0] });
  return g;
}

function makeShrub() {
  const g = group("shrub");
  sphere(g, "shrub_a", "#4e9860", [-0.12, 0.18, 0], 0.22, [1, 0.65, 0.85]);
  sphere(g, "shrub_b", "#5aab6b", [0.1, 0.2, 0.02], 0.24, [1, 0.62, 0.85]);
  return g;
}

function makePlanter() {
  const g = group("flower_planter");
  box(g, "pot", "#b88a5b", [0, 0.11, 0], [0.46, 0.22, 0.28]);
  for (const [index, x] of [-0.16, 0, 0.16].entries()) {
    cylinder(g, `stem_${index}`, "#4d8a55", [x, 0.31, 0], 0.01, 0.014, 0.18, 8);
    sphere(g, `flower_${index}`, index % 2 === 0 ? "#d85167" : "#f1c95a", [x, 0.42, 0], 0.045);
  }
  return g;
}

function makeGrassPatch() {
  const g = group("grass_patch");
  for (let i = 0; i < 12; i += 1) {
    const x = -0.28 + (i % 6) * 0.11;
    const z = -0.08 + Math.floor(i / 6) * 0.16;
    cone(g, `blade_${i}`, i % 2 === 0 ? "#4f9d5e" : "#66ad69", [x, 0.08, z], 0.028, 0.16, 5, { rotation: [0, 0, (i % 3 - 1) * 0.16] });
  }
  return g;
}

function makeLampPost() {
  const g = group("lamp_post");
  cylinder(g, "pole", "#3a4743", [0, 0.48, 0], 0.025, 0.035, 0.96, 12);
  cylinder(g, "arm", "#3a4743", [0.14, 0.96, 0], 0.018, 0.018, 0.3, 10, { rotation: [0, 0, Math.PI / 2] });
  sphere(g, "lamp_glow", "#fff4c5", [0.29, 0.93, 0], 1, [0.14, 0.09, 0.14], { emissive: "#c89b38", emissiveIntensity: 0.12 });
  return g;
}

function makeTrafficCone() {
  const g = group("traffic_cone");
  cone(g, "orange_cone", "#ef8a23", [0, 0.16, 0], 0.12, 0.32);
  cylinder(g, "stripe", "#fff6e9", [0, 0.18, 0], 0.09, 0.09, 0.03, 16);
  g.getObjectByName("stripe").scale.y = 0.14;
  box(g, "base", "#ef8a23", [0, 0.02, 0], [0.32, 0.035, 0.32]);
  return g;
}

function makeStreetProps() {
  const g = group("street_props");
  const treeA = makeTreeRound();
  treeA.position.set(-5.2, 0, -1.7);
  g.add(treeA);
  const treeB = makeTreeTall();
  treeB.position.set(5.35, 0, -1.65);
  g.add(treeB);
  const treeC = makeTreePlane();
  treeC.position.set(1.95, 0, -2.25);
  treeC.scale.set(0.82, 0.82, 0.82);
  g.add(treeC);
  for (const position of [[-2.55, 0, 0.52], [3.72, 0, 0.55]]) {
    const lamp = makeLampPost();
    lamp.position.set(...position);
    g.add(lamp);
  }
  for (const x of [-4, -3.72, 4.02, 4.32]) {
    const c = makeTrafficCone();
    c.position.set(x, 0, 1.9);
    c.scale.set(0.58, 0.58, 0.58);
    g.add(c);
  }
  return g;
}

function makeBench() {
  const g = group("bench");
  box(g, "seat", "#8b6548", [0, 0.24, 0], [0.72, 0.09, 0.22]);
  box(g, "back", "#8b6548", [0, 0.44, -0.12], [0.72, 0.1, 0.08]);
  for (const x of [-0.28, 0.28]) {
    cylinder(g, `leg_${x}_a`, "#394541", [x, 0.12, -0.07], 0.018, 0.022, 0.24, 8);
    cylinder(g, `leg_${x}_b`, "#394541", [x, 0.12, 0.09], 0.018, 0.022, 0.24, 8);
  }
  return g;
}

function makeTrashBin() {
  const g = group("trash_bin");
  cylinder(g, "bin", "#65746d", [0, 0.28, 0], 0.14, 0.16, 0.46, 16);
  cylinder(g, "lid", "#33413d", [0, 0.53, 0], 0.17, 0.14, 0.06, 16);
  box(g, "label", "#f1f5ef", [0, 0.31, 0.145], [0.11, 0.08, 0.012]);
  return g;
}

function makePharmacyCrossSign() {
  const g = group("pharmacy_cross_sign");
  box(g, "pole", "#5b6862", [0, 0.42, 0], [0.04, 0.84, 0.04]);
  box(g, "panel", "#c91f2d", [0, 0.92, 0], [0.42, 0.42, 0.06], { emissive: "#5b0a12", emissiveIntensity: 0.16 });
  box(g, "cross_h", "#ffffff", [0, 0.92, 0.04], [0.28, 0.065, 0.025]);
  box(g, "cross_v", "#ffffff", [0, 0.92, 0.04], [0.065, 0.28, 0.025]);
  return g;
}

function makeParcelBox(name = "parcel_box") {
  const g = group(name);
  box(g, "box", "#d8b985", [0, 0.16, 0], [0.42, 0.32, 0.34]);
  box(g, "tape_h", "#f7f1dc", [0, 0.27, 0.18], [0.38, 0.045, 0.018]);
  box(g, "tape_v", "#f7f1dc", [0, 0.16, 0.19], [0.055, 0.22, 0.018]);
  return g;
}

function makeProductCrate() {
  const g = group("product_crate");
  box(g, "crate", "#577068", [0, 0.12, 0], [0.52, 0.24, 0.34]);
  for (const x of [-0.16, 0, 0.16]) box(g, `bottle_${x}`, "#edf3ee", [x, 0.31, 0.02], [0.07, 0.14, 0.06]);
  return g;
}

function makePosTerminal() {
  const g = group("pos_terminal");
  box(g, "body", "#26323a", [0, 0.12, 0], [0.22, 0.15, 0.28], { rotation: [-0.18, 0, 0] });
  box(g, "screen", "#88c8cf", [0, 0.18, 0.12], [0.16, 0.055, 0.018], { emissive: "#2f6f7a", emissiveIntensity: 0.08, rotation: [-0.18, 0, 0] });
  for (const x of [-0.055, 0, 0.055]) box(g, `key_${x}`, "#f2f2e9", [x, 0.08, 0.14], [0.035, 0.018, 0.016], { rotation: [-0.18, 0, 0] });
  return g;
}

function makeInteriorCounter() {
  const g = group("interior_counter");
  box(g, "counter", "#eee5d8", [0, 0.42, 0], [1.55, 0.62, 0.58]);
  box(g, "top", "#f7f3e8", [0, 0.76, 0], [1.65, 0.08, 0.64]);
  box(g, "front_logo", "#b21f2d", [0, 0.46, 0.31], [0.42, 0.12, 0.025]);
  return g;
}

function makeMedicineShelf() {
  const g = group("medicine_shelf");
  box(g, "rack", "#7f8a82", [0, 0.75, 0], [0.62, 1.45, 0.18]);
  for (let row = 0; row < 4; row += 1) box(g, `shelf_${row}`, "#f6f7ef", [0, 0.22 + row * 0.32, 0.13], [0.68, 0.035, 0.12]);
  for (let i = 0; i < 12; i += 1) {
    box(g, `product_${i}`, i % 3 === 0 ? "#f7d88c" : i % 3 === 1 ? "#dcefff" : "#eef5f2", [-0.25 + (i % 4) * 0.16, 0.29 + Math.floor(i / 4) * 0.32, 0.24], [0.07, 0.14, 0.05]);
  }
  return g;
}

function makeSgkDesk() {
  const g = group("sgk_desk");
  box(g, "desk", "#d8e8ef", [0, 0.34, 0], [0.72, 0.46, 0.48]);
  box(g, "paper_stack", "#fffdf2", [-0.16, 0.62, 0.12], [0.2, 0.055, 0.16]);
  box(g, "folder", "#b21f2d", [0.15, 0.62, 0.12], [0.18, 0.04, 0.13]);
  return g;
}

function makeStorageRack() {
  const g = group("storage_rack");
  box(g, "frame", "#75817a", [0, 0.62, 0], [0.82, 1.2, 0.28]);
  for (const y of [0.26, 0.58, 0.9]) box(g, `shelf_${y}`, "#f3eee0", [0, y, 0.18], [0.86, 0.045, 0.22]);
  for (let i = 0; i < 5; i += 1) {
    const parcel = makeParcelBox(`rack_box_${i}`);
    parcel.position.set(-0.28 + (i % 3) * 0.28, 0.32 + Math.floor(i / 3) * 0.32, 0.26);
    parcel.scale.set(0.48, 0.48, 0.48);
    g.add(parcel);
  }
  return g;
}

async function exportGlb(asset) {
  const exporter = new GLTFExporter();
  const result = await exporter.parseAsync(assetScene(asset.name, asset.group), { binary: true });
  const outputPath = path.join(outDir, asset.file);
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, Buffer.from(result));
}

function addAsset(assets, category, name, groupObject) {
  assets.push({
    category,
    name,
    file: `${category}/${name}.glb`,
    group: groupObject
  });
}

function buildAssets() {
  const assets = [];
  const skinTones = ["#e4b58d", "#d59b77", "#c98662", "#f0c7a2", "#b87758"];
  const hairColors = ["#242331", "#1f1c18", "#5b3a2e", "#8a5b36", "#d0c0a8"];

  const playerOutfits = [
    { key: "red", top: "#b21f2d", accent: "#f7f1ec", pants: "#202a31" },
    { key: "white", top: "#f5f4ea", accent: "#b21f2d", pants: "#27333a" },
    { key: "black", top: "#20282a", accent: "#e0a13a", pants: "#171f24" }
  ];
  for (const gender of ["female", "male"]) {
    for (const outfit of playerOutfits) {
      for (const mask of [false, true]) {
        addAsset(
          assets,
          "players",
          `player_${gender}_${outfit.key}${mask ? "_mask" : ""}`,
          makeHuman({
            name: `player_${gender}_${outfit.key}${mask ? "_mask" : ""}`,
            gender,
            top: outfit.top,
            accent: outfit.accent,
            pants: outfit.pants,
            hair: gender === "female" ? "#302a3a" : "#20222a",
            hairStyle: gender === "female" ? "bob" : "short",
            skin: gender === "female" ? "#e4b58d" : "#d59b77",
            mask,
            bag: true,
            badge: true,
            skirt: gender === "female",
            height: gender === "male" ? 1.04 : 0.98
          })
        );
      }
    }
  }

  const customerPresets = [
    ["customer_01", "female", "#2f7a83", "#26313a", "bob", true, false],
    ["customer_02", "male", "#315f93", "#202a31", "short", false, true],
    ["customer_03", "female", "#6f5b94", "#2c3038", "covered", true, true],
    ["customer_04", "male", "#b87520", "#27343f", "short", false, false],
    ["customer_05", "female", "#5e765f", "#292f35", "long", false, true],
    ["customer_06", "male", "#8d4b55", "#202a31", "short", true, false],
    ["customer_07", "female", "#b14f6c", "#26313a", "bob", false, false],
    ["customer_08", "male", "#496b87", "#222b30", "covered", true, true],
    ["customer_09", "female", "#66743f", "#30333a", "long", true, false],
    ["customer_10", "male", "#7e5a3b", "#222a31", "short", false, true]
  ];
  customerPresets.forEach(([name, gender, top, pants, hairStyle, mask, bag], index) => {
    addAsset(
      assets,
      "customers",
      name,
      makeHuman({
        name,
        gender,
        top,
        accent: "#f2eadb",
        pants,
        hair: hairColors[index % hairColors.length],
        hairStyle,
        skin: skinTones[index % skinTones.length],
        mask,
        bag,
        skirt: gender === "female" && index % 2 === 0,
        height: gender === "male" ? 1.02 : 0.96
      })
    );
  });

  const staffRoles = [
    ["staff_01_counter", "female", "#b21f2d", "bob", false],
    ["staff_02_sgk", "male", "#f5f4ea", "short", true],
    ["staff_03_stock", "female", "#20282a", "covered", true],
    ["staff_04_dermo", "male", "#315f93", "short", false],
    ["staff_05_depot", "female", "#5e765f", "long", true],
    ["staff_06_counter", "male", "#b21f2d", "short", false],
    ["staff_07_sgk", "female", "#f5f4ea", "bob", false],
    ["staff_08_stock", "male", "#20282a", "covered", true],
    ["staff_09_dermo", "female", "#6f5b94", "long", false],
    ["staff_10_manager", "male", "#7e5a3b", "short", true]
  ];
  staffRoles.forEach(([name, gender, top, hairStyle, mask], index) => {
    addAsset(
      assets,
      "staff",
      name,
      makeHuman({
        name,
        gender,
        top,
        accent: top === "#f5f4ea" ? "#b21f2d" : "#f7f1ec",
        pants: "#243038",
        hair: hairColors[(index + 2) % hairColors.length],
        hairStyle,
        skin: skinTones[(index + 1) % skinTones.length],
        mask,
        bag: false,
        badge: true,
        clipboard: index % 3 === 1,
        skirt: gender === "female" && index % 2 === 0,
        height: gender === "male" ? 1.03 : 0.97
      })
    );
  });

  addAsset(assets, "streets", "street_base", makeStreetBase());
  addAsset(assets, "streets", "road_straight", makeRoadStraight());
  addAsset(assets, "streets", "road_corner", makeRoadCorner());
  addAsset(assets, "streets", "road_crosswalk", makeRoadCrosswalk());
  addAsset(assets, "streets", "sidewalk_tile", makeSidewalkTile());
  addAsset(assets, "streets", "small_planet_patch", makeSmallPlanetPatch());

  addAsset(assets, "buildings", "pharmacy_facade", makePharmacyFacade());
  addAsset(assets, "buildings", "depot_warehouse", makeDepotWarehouse());
  addAsset(assets, "buildings", "sgk_office", makeSgkOffice());
  addAsset(assets, "buildings", "bank_branch", makeBankBranch());
  addAsset(assets, "buildings", "apartment_block", makeSimpleBuilding({ name: "apartment_block", body: "#c9c4b6", windows: 8, height: 2.1, width: 1.35 }));
  addAsset(assets, "buildings", "cafe_corner", makeSimpleBuilding({ name: "cafe_corner", body: "#d9b6a8", roof: "#5c4c45", sign: "#fff1d0", windows: 3, height: 1.25, width: 1.25 }));
  addAsset(assets, "buildings", "clinic_building", makeSimpleBuilding({ name: "clinic_building", body: "#dbe7e5", roof: "#496068", sign: "#f6fbff", windows: 5, height: 1.55, width: 1.45 }));
  addAsset(assets, "buildings", "mall_block", makeSimpleBuilding({ name: "mall_block", body: "#d8d5cb", roof: "#33413d", sign: "#f4f0dc", windows: 9, height: 1.85, width: 1.8 }));
  addAsset(assets, "buildings", "district_health_office", makeSimpleBuilding({ name: "district_health_office", body: "#d2e1df", roof: "#476062", sign: "#f8fbfb", windows: 6, height: 1.65, width: 1.55 }));
  addAsset(assets, "buildings", "residential_market", makeSimpleBuilding({ name: "residential_market", body: "#e1d2bd", roof: "#47564c", sign: "#f8e9ba", windows: 4, height: 1.35, width: 1.5 }));

  addAsset(assets, "nature", "tree_round", makeTreeRound());
  addAsset(assets, "nature", "tree_tall", makeTreeTall());
  addAsset(assets, "nature", "tree_plane", makeTreePlane());
  addAsset(assets, "nature", "shrub", makeShrub());
  addAsset(assets, "nature", "flower_planter", makePlanter());
  addAsset(assets, "nature", "grass_patch", makeGrassPatch());

  addAsset(assets, "props", "street_props", makeStreetProps());
  addAsset(assets, "props", "delivery_truck", makeDeliveryTruck());
  addAsset(assets, "props", "lamp_post", makeLampPost());
  addAsset(assets, "props", "traffic_cone", makeTrafficCone());
  addAsset(assets, "props", "bench", makeBench());
  addAsset(assets, "props", "trash_bin", makeTrashBin());
  addAsset(assets, "props", "pharmacy_cross_sign", makePharmacyCrossSign());
  addAsset(assets, "props", "parcel_box", makeParcelBox());
  addAsset(assets, "props", "product_crate", makeProductCrate());
  addAsset(assets, "props", "pos_terminal", makePosTerminal());

  addAsset(assets, "interiors", "interior_counter", makeInteriorCounter());
  addAsset(assets, "interiors", "medicine_shelf", makeMedicineShelf());
  addAsset(assets, "interiors", "sgk_desk", makeSgkDesk());
  addAsset(assets, "interiors", "storage_rack", makeStorageRack());

  return assets;
}

async function main() {
  await mkdir(outDir, { recursive: true });
  const assets = buildAssets();

  for (const asset of assets) {
    await exportGlb(asset);
  }

  const categories = {};
  for (const asset of assets) {
    categories[asset.category] ??= {};
    categories[asset.category][asset.name] = `/assets/game/models/${asset.file}`;
  }

  await writeFile(
    path.join(process.cwd(), "public", "assets", "game", "asset-manifest.json"),
    `${JSON.stringify({
      assetSet: "pharmacy-world-v2",
      source: "scripts/generate-game-assets.mjs",
      counts: Object.fromEntries(Object.entries(categories).map(([category, models]) => [category, Object.keys(models).length])),
      categories,
      models: Object.fromEntries(assets.map((asset) => [`${asset.category}/${asset.name}`, `/assets/game/models/${asset.file}`]))
    }, null, 2)}\n`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
