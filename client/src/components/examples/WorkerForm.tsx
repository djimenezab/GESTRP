import { WorkerForm } from "../worker-form";

export default function WorkerFormExample() {
  return (
    <div className="p-4 max-w-2xl">
      <WorkerForm
        onSubmit={(data) => console.log("Formulario enviado:", data)}
        isLoading={false}
      />
    </div>
  );
}
