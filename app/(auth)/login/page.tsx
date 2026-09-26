import { redirectIfAuthenticated } from "@/lib/auth/redirect-if-authenticated";
import LoginForm from "./login-form";

export const instant = false;

export default async function LoginPage() {
  await redirectIfAuthenticated();

  return <LoginForm />;
}
