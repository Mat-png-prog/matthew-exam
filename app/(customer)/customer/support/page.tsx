import { validateRequest } from "@/auth";
import { redirect } from "next/navigation";
import { SupportForm } from "./SupportForm";
import { Toaster } from "sonner";

async function getUser() {
  const { user } = await validateRequest();
  if (!user) return null;
  
  return {
    displayName: `${user.firstName} ${user.lastName}`,
    maskedEmail: user.email.replace(/(.{2})(.*)(@.*)/, "$1***$3"),
    sessionId: user.id,
  };
}

export default async function SupportPage() {
  const user = await getUser();
  
  if (!user) {
    redirect('/login');
  }

  return (
    <>
      <Toaster richColors closeButton position="top-center" />
      <main className="container mx-auto px-4 my-auto">
        <div className="max-w-2xl mx-auto my-auto">
          <div className="bg-card rounded-lg shadow-sm p-6">
            <SupportForm user={user} />
          </div>
        </div>
      </main>
    </>
  );
}