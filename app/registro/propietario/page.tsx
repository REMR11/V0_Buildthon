import { redirect } from "next/navigation";

// The homeowner flow lives at /onboarding — redirect transparently.
export default function PropietarioPage() {
  redirect("/onboarding");
}
