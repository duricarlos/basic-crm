'use client'

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash, Wand2, Save } from "lucide-react";
import { createBudget, searchPreviousItems } from "@/actions/budgets"; // Asumimos import
import { useRouter } from "next/navigation";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface BudgetItem {
  id: string; // Temp ID for React keys
  description: string;
  quantity: number;
  price: number;
}

export function BudgetForm({ clientId }: { clientId: string }) {
  const router = useRouter();
  const [items, setItems] = useState<BudgetItem[]>([
    { id: '1', description: '', quantity: 1, price: 0 }
  ]);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [activeSearchIndex, setActiveSearchIndex] = useState<number | null>(null);

  // Opciones de configuración
  const [title, setTitle] = useState("Presupuesto");
  const [header, setHeader] = useState("");
  const [footer, setFooter] = useState("Gracias por su confianza. Este presupuesto es válido por 15 días.");

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  };

  const addItem = () => {
    setItems([...items, { id: crypto.randomUUID(), description: '', quantity: 1, price: 0 }]);
  };

  const removeItem = (id: string) => {
    if (items.length === 1) return;
    setItems(items.filter(i => i.id !== id));
  };

  const updateItem = (id: string, field: keyof BudgetItem, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const handleDescriptionChange = async (index: number, value: string) => {
      updateItem(items[index].id, 'description', value);
      if (value.length > 2) {
          setActiveSearchIndex(index);
          const results = await searchPreviousItems(value);
          setSuggestions(results);
      } else {
          setSuggestions([]);
          setActiveSearchIndex(null);
      }
  };

  const selectSuggestion = (index: number, suggestion: any) => {
      const newItems = [...items];
      newItems[index].description = suggestion.description;
      newItems[index].price = suggestion.price;
      setItems(newItems);
      setSuggestions([]);
      setActiveSearchIndex(null);
  };

  const handleSave = async () => {
     setLoading(true);
     try {
         // Clean items before sending (remove temp ID)
         const cleanItems = items.map(({ description, quantity, price }) => ({ description, quantity, price }));
         await createBudget(clientId, cleanItems, calculateTotal(), { title, header, footer });
         router.push(`/dashboard/clients/${clientId}`);
         router.refresh();
     } catch (e) {
         console.error(e);
         alert("Error al guardar presupuesto");
     } finally {
         setLoading(false);
     }
  };

  return (
    <div className="space-y-6">
      
      {/* Configuración */}
      <Card className="border-2">
         <CardHeader>
            <CardTitle>Configuración del Documento</CardTitle>
         </CardHeader>
         <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
               <Label>Título del Documento</Label>
               <Input 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  className="bg-white"
               />
            </div>
             <div>
               <Label>Texto de Cabecera (Opcional)</Label>
               <Input 
                  value={header} 
                  onChange={(e) => setHeader(e.target.value)} 
                  placeholder="Ej: Proyecto Reforma Baño"
                  className="bg-white"
               />
            </div>
             <div className="md:col-span-2">
               <Label>Pie de Página / Condiciones</Label>
               <Input 
                  value={footer} 
                  onChange={(e) => setFooter(e.target.value)} 
                   className="bg-white"
               />
            </div>
         </CardContent>
      </Card>

      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-xl">Conceptos del Presupuesto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.map((item, index) => (
            <div key={item.id} className="grid grid-cols-12 gap-2 items-end bg-muted/20 p-3 rounded-lg">
              <div className="col-span-6 relative">
                <Label>Descripción</Label>
                <div className="relative">
                    <Input 
                        value={item.description}
                        onChange={(e) => handleDescriptionChange(index, e.target.value)}
                        placeholder="Ej: Diseño Web"
                        className="text-lg"
                        autoComplete="off"
                    />
                    {/* Autocomplete simple dropdown */}
                    {activeSearchIndex === index && suggestions.length > 0 && (
                        <div className="absolute z-10 w-full bg-popover border rounded-md shadow-md mt-1">
                             {suggestions.map((s, i) => (
                                 <div 
                                    key={i} 
                                    className="p-2 hover:bg-muted cursor-pointer flex justify-between"
                                    onClick={() => selectSuggestion(index, s)}
                                 >
                                     <span>{s.description}</span>
                                     <span className="font-bold">{s.price}$</span>
                                 </div>
                             ))}
                        </div>
                    )}
                </div>
              </div>
              <div className="col-span-2">
                <Label>Cant.</Label>
                <Input 
                    type="number" 
                    value={item.quantity}
                    onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value))}
                    className="text-lg"
                />
              </div>
              <div className="col-span-3">
                <Label>Precio ($)</Label>
                <Input 
                    type="number" 
                    value={item.price}
                    onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value))}
                    className="text-lg"
                />
              </div>
              <div className="col-span-1">
                 <Button variant="ghost" className="text-destructive" onClick={() => removeItem(item.id)}>
                    <Trash className="h-5 w-5" />
                 </Button>
              </div>
            </div>
          ))}
          
          <Button variant="outline" onClick={addItem} className="w-full border-dashed h-12 text-lg">
            <Plus className="mr-2 h-5 w-5" /> Agregar Concepto
          </Button>

        </CardContent>
        <CardFooter className="flex justify-between items-center bg-muted/40 p-6">
            <div className="text-right w-full">
                <p className="text-sm text-muted-foreground uppercase font-bold">Total Presupuesto</p>
                <p className="text-4xl font-extrabold text-primary">{calculateTotal().toLocaleString()} $</p>
            </div>
        </CardFooter>
      </Card>

      <div className="flex justify-end gap-4">
         <Button variant="outline" size="lg" className="h-14 px-8" onClick={() => router.back()}>Cancelar</Button>
         <Button size="lg" className="h-14 px-8 text-xl font-bold" onClick={handleSave} disabled={loading}>
            {loading ? "Generando..." : (
                <>
                <Save className="mr-2 h-6 w-6" /> Guardar y Generar PDF
                </>
            )}
         </Button>
      </div>
    </div>
  );
}
