'use client'

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Send, CheckCircle, AlertCircle } from "lucide-react";
import { sendTestReminder } from "@/actions/testing";

export function TestReminderButton({ clientId }: { clientId: string }) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleTest = async () => {
    setLoading(true);
    setStatus('idle');
    try {
      const result = await sendTestReminder(clientId);
      if (result.success) {
        setStatus('success');
        setTimeout(() => setStatus('idle'), 3000); // Reset after 3s
      } else {
        setStatus('error');
        alert("Error al enviar: " + result.error);
      }
    } catch (e) {
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
        variant="secondary" 
        onClick={handleTest} 
        disabled={loading}
        className="w-full mt-2 border-2 border-dashed border-gray-300 hover:border-gray-400"
    >
        {status === 'success' ? (
            <><CheckCircle className="mr-2 h-5 w-5 text-green-600" /> Enviado, revisa tu correo</>
        ) : status === 'error' ? (
            <><AlertCircle className="mr-2 h-5 w-5 text-red-600" /> Error al enviar</>
        ) : (
            <><Send className="mr-2 h-5 w-5" /> Enviar Recordatorio de Prueba</>
        )}
    </Button>
  );
}
