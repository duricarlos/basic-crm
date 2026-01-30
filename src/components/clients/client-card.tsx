'use client'

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Phone, Mail, FileText, Clock, Archive, ArrowRight, ArrowLeft, ExternalLink } from "lucide-react";
import { updateClientStatus } from "@/actions/clients";
import { useState } from "react";
import Link from "next/link";

interface ClientCardProps {
  client: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    description: string | null;
    status: "new" | "in_progress" | "cancelled" | null;
    updatedAt: Date | null;
  }
}

export function ClientCard({ client }: ClientCardProps) {
  const [loading, setLoading] = useState(false);

  const handleStatusChange = async (newStatus: "new" | "in_progress" | "cancelled") => {
    setLoading(true);
    await updateClientStatus(client.id, newStatus);
    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new": return "bg-blue-100 text-blue-800 border-blue-200";
      case "in_progress": return "bg-orange-100 text-orange-800 border-orange-200";
      case "cancelled": return "bg-gray-100 text-gray-800 border-gray-200";
      default: return "bg-gray-100";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "new": return "Nuevo";
      case "in_progress": return "En Proceso";
      case "cancelled": return "Cancelado";
      default: return status;
    }
  };

  return (
    <Card className="border-2 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 border-2 border-primary/10">
              <AvatarFallback className="bg-primary/5 text-primary text-xl font-bold">
                {client.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <Link href={`/dashboard/clients/${client.id}`} className="hover:underline flex items-center gap-2 group">
                <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">
                  {client.name}
                </CardTitle>
                <ExternalLink className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
              </Link>
              <Badge variant="outline" className={`mt-1 text-sm font-semibold border-2 ${getStatusColor(client.status || 'new')}`}>
                {getStatusLabel(client.status || 'new')}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pb-3">
        {client.email && (
          <div className="flex items-center gap-2 text-lg text-muted-foreground">
            <Mail className="h-5 w-5" />
            <span className="truncate">{client.email}</span>
          </div>
        )}
        {client.phone && (
          <div className="flex items-center gap-2 text-lg text-muted-foreground">
            <Phone className="h-5 w-5" />
            <span>{client.phone}</span>
          </div>
        )}
        {client.description && (
            <div className="flex items-start gap-2 text-base text-muted-foreground bg-muted/50 p-2 rounded-md">
                <FileText className="h-5 w-5 mt-0.5 shrink-0" />
                <p className="line-clamp-2">{client.description}</p>
            </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-3 pt-2 border-t bg-muted/20">
         <Link href={`/dashboard/clients/${client.id}`} className="w-full">
            <Button variant="default" className="w-full font-bold text-lg h-12">
               Ver Ficha / Gestionar
            </Button>
         </Link>
         
         {/* Acciones segun estado */}
         <div className="flex gap-2 w-full">
            {client.status === 'new' && (
                <Button 
                    variant="outline" 
                    className="flex-1 border-2 border-orange-200 hover:bg-orange-50 text-orange-700 font-bold"
                    onClick={() => handleStatusChange('in_progress')}
                    disabled={loading}
                >
                    Iniciar Proceso <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
            )}

            {client.status === 'in_progress' && (
                <>
                <Button 
                    variant="outline" 
                    className="flex-1 border-2"
                    onClick={() => handleStatusChange('new')}
                    disabled={loading}
                >
                   <ArrowLeft className="mr-2 h-5 w-5" /> Volver
                </Button>
                <Button 
                    variant="ghost" 
                    className="px-3 text-destructive hover:bg-destructive/10"
                    onClick={() => handleStatusChange('cancelled')}
                    disabled={loading}
                >
                   <Archive className="h-5 w-5" />
                </Button>
                </>
            )}

             {client.status === 'cancelled' && (
                <Button 
                    variant="outline" 
                    className="w-full border-2"
                    onClick={() => handleStatusChange('new')}
                    disabled={loading}
                >
                   Reactivar Cliente
                </Button>
            )}

         </div>
      </CardFooter>
    </Card>
  );
}
