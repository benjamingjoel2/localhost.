import Stripe from "stripe";

let client: Stripe | null = null;
export function stripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set; paid tickets are disabled.");
  if (!client) client = new Stripe(key);
  return client;
}
export const stripeEnabled = () => Boolean(process.env.STRIPE_SECRET_KEY);
