export const instant = false;

import { redirectIfAuthenticated } from "@/lib/auth/redirect-if-authenticated";
import SignupForm from "./signup-form";

export default async function SignupPage() {
  await redirectIfAuthenticated();

  return <SignupForm />;
}
