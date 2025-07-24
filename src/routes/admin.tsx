import { SubmissionTableWrapper } from "@/components/submissions/submission-table-wrapper";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <main className="flex flex-col py-8 container mx-auto justify-center space-y-8">
      <h1 className="text-2xl font-bold">Admin</h1>
      <SubmissionTableWrapper />
    </main>
  );
}
