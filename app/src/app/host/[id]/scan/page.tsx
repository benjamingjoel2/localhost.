import { Scanner } from "./scanner";
export default async function ScanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <main className="wrap" style={{ maxWidth: 560 }}><h1>door</h1><p className="dim" style={{ marginTop: 6 }}>enter the host pin, then scan tickets or type codes.</p><Scanner eventId={id} /></main>;
}
