"use client";

import dynamic from "next/dynamic";
import { GameBootLoader } from "@/components/GameBootLoader";

const DynamicRebootGame = dynamic(() => import("@/components/RebootGame").then((module) => module.RebootGame), {
  ssr: false,
  loading: () => <GameBootLoader />
});

export function GameClient() {
  return <DynamicRebootGame />;
}
