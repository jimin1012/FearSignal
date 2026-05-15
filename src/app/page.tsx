import { SignalDashboard } from "@/components/SignalDashboard";
import { buildSnapshot } from "@/lib/snapshot";

export const revalidate = 900; // 15분마다 재생성

export default async function Home() {
  const snapshot = await buildSnapshot(true);

  return <SignalDashboard initialSnapshot={snapshot} />;
}
