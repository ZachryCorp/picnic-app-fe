import { SubmissionTableWrapper } from "@/components/submissions/submission-table-wrapper";
import { SignIn } from "@/components/auth/sign-in";
import { createFileRoute } from "@tanstack/react-router";
import { getSession, useSession } from "@/lib/auth-client";

export const Route = createFileRoute("/admin")({
  component: RouteComponent,
  loader: async () => {
    const { data: session } = await getSession();
    if (!session?.user) {
      return {
        user: null,
      };
    } else {
      return {
        user: session.user,
      };
    }
  },
});

function RouteComponent() {
  const { data: session } = useSession();

  return (
    <main className="flex flex-col py-8 container mx-auto justify-center space-y-8">
      <h1 className="text-2xl font-bold">Admin</h1>

      {/* TODO: add bang to flip logic once better auth cross site bug is fixed */}
      {session?.user ? <SignIn /> : <SubmissionTableWrapper />}
    </main>
  );
}
