import { SignalDashboard } from "@/components/SignalDashboard";
import { buildSnapshot } from "@/lib/snapshot";

export const dynamic = "force-dynamic";

export default async function Home() {
  const snapshot = await buildSnapshot(true);

  return <SignalDashboard initialSnapshot={snapshot} />;
}
