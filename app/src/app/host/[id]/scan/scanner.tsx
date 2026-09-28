"use client";
import { useEffect, useRef, useState } from "react";

type Result = { ok: boolean; message: string; name?: string; tier?: string };
export function Scanner({ eventId }: { eventId: string }) {
  const [pin, setPin] = useState("");
  const [code, setCode] = useState("");
  const [log, setLog] = useState<Result[]>([]);
  const [cam, setCam] = useState(false);
  const video = useRef<HTMLVideoElement>(null);
  const busy = useRef(false);

  async function check(c: string) {
    if (busy.current || !c) return; busy.current = true;
    const r = await fetch("/api/checkin", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ eventId, pin, code: c.trim() }) });
    const j = (await r.json()) as Result;
    setLog((l) => [j, ...l].slice(0, 20)); setCode("");
    setTimeout(() => (busy.current = false), 1200);
  }

  useEffect(() => {
    if (!cam) return;
    let stop = false; let stream: MediaStream | undefined;
    const Detector = (window as unknown as { BarcodeDetector?: new (o: { formats: string[] }) => { detect: (v: HTMLVideoElement) => Promise<{ rawValue: string }[]> } }).BarcodeDetector;
    (async () => {
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      if (video.current) { video.current.srcObject = stream; await video.current.play(); }
      if (!Detector) { setLog((l) => [{ ok: false, message: "this browser can't scan; type the code instead." }, ...l]); return; }
      const det = new Detector({ formats: ["qr_code"] });
      const tick = async () => { if (stop) return; try { const found = await det.detect(video.current!); if (found[0]?.rawValue) check(found[0].rawValue); } catch {} setTimeout(tick, 400); };
      tick();
    })();
    return () => { stop = true; stream?.getTracks().forEach((t) => t.stop()); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cam, pin]);

  return (
    <div className="stack" style={{ marginTop: 20 }}>
      <div className="field"><label>host pin</label><input value={pin} onChange={(e) => setPin(e.target.value)} inputMode="numeric" placeholder="4821" /></div>
      <div className="row"><button className="btn ghost" type="button" onClick={() => setCam((v) => !v)} disabled={!pin}>{cam ? "stop camera" : "scan with camera"}</button></div>
      {cam && <video ref={video} muted playsInline style={{ width: "100%", background: "#000", aspectRatio: "4/3" }} />}
      <form onSubmit={(e) => { e.preventDefault(); check(code); }} className="row" style={{ gap: 8 }}>
        <input className="keep" style={{ flex: 1, border: "1px solid #c6c5bf", background: "var(--bg)", padding: 12, font: "inherit" }} value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="LH-XXXXX-XXXXX" />
        <button className="btn" type="submit" disabled={!pin}>check in</button>
      </form>
      <div className="stack" style={{ gap: 6 }}>{log.map((r, i) => <div key={i} className={r.ok ? "ok" : "err"}>{r.ok ? "✓" : "✗"} {r.name ? `${r.name} · ${r.tier} · ` : ""}{r.message}</div>)}</div>
    </div>
  );
}
