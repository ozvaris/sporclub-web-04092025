// src/app/(auth)/register/page.tsx
// Server bileşen: login'liyse profil'e yönlendirir
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import RegisterForm from "./RegisterForm";

export default async function RegisterPage() {
  const cookieStore = await cookies();
  const hasAccess = cookieStore.get("access")?.value;
  if (hasAccess) redirect("/profile");
  return <RegisterForm />;
}
