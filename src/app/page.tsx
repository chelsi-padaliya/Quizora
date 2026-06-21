import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ROUTES } from "@/constants";

export default async function HomePage() {
  const session = await auth();
  redirect(session ? ROUTES.dashboard : ROUTES.login);
}
