import { WorkerCard } from "../worker-card";

export default function WorkerCardExample() {
  return (
    <div className="p-4">
      <WorkerCard
        id="1"
        nombreCompleto="Juan Pérez García"
        categoria="OFICIAL"
        dni="12345678A"
        fechaNacimiento="1985-03-15"
        onEdit={() => console.log("Editar trabajador")}
        onDelete={() => console.log("Eliminar trabajador")}
        onClick={() => console.log("Ver detalles")}
      />
    </div>
  );
}
