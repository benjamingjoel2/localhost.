import { Resend } from "resend";

const from = process.env.EMAIL_FROM ?? "Localhost <onboarding@resend.dev>";

export async function sendMail(to: string | string[], subject: string, html: string) {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.log(`[mail:dev] to=${Array.isArray(to) ? to.join(",") : to} subject=${subject}\n${html}`);
    return;
  }
  const resend = new Resend(key);
  await resend.emails.send({ from, to, subject, html });
}
