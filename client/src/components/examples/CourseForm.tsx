import { CourseForm } from "../course-form";

export default function CourseFormExample() {
  return (
    <div className="p-4 max-w-2xl">
      <CourseForm
        trabajadorId="1"
        onSubmit={(data) => console.log("Curso registrado:", data)}
        isLoading={false}
      />
    </div>
  );
}
