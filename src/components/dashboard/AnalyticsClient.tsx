"use client";

import dynamic from "next/dynamic";

// Studio runs in the browser only, so skip server rendering.
const StudioView = dynamic(() => import("./StudioView"), {
  ssr: false,
  loading: () => <p>Loading analytics...</p>,
});

export default function AnalyticsClient() {
  return <StudioView />;
}