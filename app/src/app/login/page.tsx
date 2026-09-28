import { signIn } from "@/auth";
import { Shell } from "@/components/shell";

export default async function Login({ searchParams }: { searchParams: Promise<{ sent?: string; next?: string }> }) {
  const sp = await searchParams;
  return (
    <Shell current="/settings"><main style={{ maxWidth: 480 }}>
      <h1>log in</h1>
      <p className="dim" style={{ marginTop: 8 }}>no passwords. we email you a link.</p>
      {sp.sent ? (
        <p className="ok" style={{ marginTop: 20 }}>check your inbox for the sign-in link. in development without a resend key, the link is printed in the server console.</p>
      ) : (
        <form className="stack" style={{ marginTop: 20 }} action={async (fd) => { "use server"; await signIn("resend", { email: String(fd.get("email")), redirectTo: sp.next ?? "/" }); }}>
          <div className="field"><label>email</label><input name="email" type="email" required placeholder="you@company.com" /></div>
          <button className="btn" type="submit">send magic link</button>
        </form>
      )}
    </main></Shell>
  );
}
