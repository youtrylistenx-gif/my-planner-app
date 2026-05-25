"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import DashboardCanvas from "./DashboardCanvas";

function DashboardInner() {
  const params = useSearchParams();
  const themeId = params.get("theme") ?? "rose";
  const featureIds = (params.get("features") ?? "big3").split(",").filter(Boolean);
  return <DashboardCanvas themeId={themeId} initialFeatureIds={featureIds} />;
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-rose-50">
        <div className="w-8 h-8 border-2 border-rose-300 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <DashboardInner />
    </Suspense>
  );
}
