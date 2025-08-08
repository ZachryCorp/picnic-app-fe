import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: RouteComponent,
}) as any;

function RouteComponent() {
  return (
    <div className="container mx-auto flex flex-col items-center gap-4">
      {/* <MultiStepForm /> */}
      <h1>Site under construction 🚧</h1>
    </div>
  );
}
