import { redirect } from "next/navigation";

// Root path redirects to dashboard (which handles auth redirect if needed)
export default function Home() {
  redirect("/dashboard");
}
