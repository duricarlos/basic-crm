import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { BudgetForm } from "@/components/budgets/budget-form";

export default async function NewBudgetPage({ params }: { params: Promise<{ clientId: string }> }) {
  const session = await auth();
  if (!session?.user) redirect("/");
  
  const { clientId } = await params;

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-primary">Crear Nuevo Presupuesto</h1>
      <p className="text-lg text-muted-foreground">Agrega los item al presupuesto, el sistema recordará los precios anteriores.</p>
      
      <BudgetForm clientId={clientId} />
    </div>
  );
}
