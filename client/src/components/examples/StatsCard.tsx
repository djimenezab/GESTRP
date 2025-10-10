import { StatsCard } from "../stats-card";
import { Users } from "lucide-react";

export default function StatsCardExample() {
  return (
    <div className="p-4">
      <StatsCard
        title="Total Trabajadores"
        value={48}
        icon={Users}
        description="Personal activo"
      />
    </div>
  );
}
