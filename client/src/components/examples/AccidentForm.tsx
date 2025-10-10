import { AccidentForm } from "../accident-form";

export default function AccidentFormExample() {
  return (
    <div className="p-4 max-w-2xl">
      <AccidentForm
        trabajadorId="1"
        onSubmit={(data) => console.log("Accidente registrado:", data)}
        isLoading={false}
      />
    </div>
  );
}
