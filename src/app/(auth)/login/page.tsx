// src/app/(auth)/login/page.tsx
// Server bileşen: login'liyse profil'e yönlendirir
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import LoginForm from "./LoginForm";

export default async function LoginPage() {
  const cookieStore = await cookies();
  const hasAccess = cookieStore.get("access")?.value;
  if (hasAccess) redirect("/profile");
  return <LoginForm />;
}
