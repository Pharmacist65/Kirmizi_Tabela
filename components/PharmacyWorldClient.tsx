"use client";

import { lazy, Suspense, useEffect, useState } from "react";
import type { ModuleId } from "@/components/GameModules";
import type { GameState } from "@/game/types";

const LazyPharmacyWorld3D = lazy(() =>
  import("@/components/PharmacyWorld3D").then((module) => ({ default: module.PharmacyWorld3D }))
);

type PharmacyWorldClientProps = {
  state: GameState;
  activeModule: ModuleId;
  setupLocked: boolean;
  onSelectModule: (module: ModuleId) => void;
};

function PharmacyWorldLoader() {
  return (
    <section className="pharmacy-world is-loading">
      <div className="world-loader">
        <span>ECZANE</span>
        <strong>3D sahne hazırlanıyor</strong>
      </div>
    </section>
  );
}

export function PharmacyWorldClient(props: PharmacyWorldClientProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <PharmacyWorldLoader />;
  }

  return (
    <Suspense fallback={<PharmacyWorldLoader />}>
      <LazyPharmacyWorld3D {...props} />
    </Suspense>
  );
}
