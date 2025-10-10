import { EpiForm } from "../epi-form";

export default function EpiFormExample() {
  return (
    <div className="p-4 max-w-2xl">
      <EpiForm
        trabajadorId="1"
        onSubmit={(data) => console.log("EPI registrado:", data)}
        isLoading={false}
      />
    </div>
  );
}
