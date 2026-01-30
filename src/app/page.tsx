import { auth, signIn } from "@/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md border-2 border-primary/20 shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-primary">CRM Fácil</CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            Gestión de clientes simple y segura.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <form
            action={async () => {
              "use server";
              await signIn("google");
            }}
          >
            <Button size="lg" className="w-full text-lg h-14" type="submit">
              Ingresar con Google
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
