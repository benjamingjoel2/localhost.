import { Scanner } from "./scanner";
import { Shell } from "@/components/shell";
import { currentUser } from "@/lib/session";
export default async function ScanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const user = await currentUser();
  return <Shell current="/host" user={user}><main style={{ maxWidth: 560 }}><h1>door</h1><p className="dim" style={{ marginTop: 6 }}>enter the host pin, then scan tickets or type codes.</p><Scanner eventId={id} /></main></Shell>;
}
