import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Logo } from "./Logo";
import { Check, Loader2 } from "lucide-react";
import { API_URL } from "../config/api";

interface CatalogModule {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  imageUrl: string | null;
}

interface OnboardingProps {
  onComplete: (moduleId: string) => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [modules, setModules] = useState<CatalogModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedModule, setSelectedModule] = useState<string>("");

  useEffect(() => {
    fetch(`${API_URL}/api/modules/catalog`)
      .then(r => r.json())
      .then(data => {
        if (data.success && data.data.modules.length > 0) {
          setModules(data.data.modules);
          setSelectedModule(data.data.modules[0].id);
        }
      })
      .catch(err => console.error("Erro ao carregar módulos:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-5xl w-full">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <Logo size="xl" />
          </div>
          <h1 className="text-6xl font-bold text-white mb-4">
            Pare!
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Escolha o hábito que você deseja transformar. Sua jornada de autodisciplina começa agora.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-white" />
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {modules.map((module) => (
                <Card
                  key={module.id}
                  className={`p-6 cursor-pointer transition-all duration-300 hover:scale-105 ${
                    selectedModule === module.id
                      ? "ring-4 ring-white shadow-2xl"
                      : "hover:shadow-xl opacity-80"
                  }`}
                  onClick={() => setSelectedModule(module.id)}
                >
                  <div className="relative">
                    {selectedModule === module.id && (
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
                        <Check className="w-5 h-5 text-green-600" />
                      </div>
                    )}

                    <div
                      className="w-16 h-16 rounded-xl flex items-center justify-center mb-4 shadow-lg overflow-hidden"
                      style={{ backgroundColor: (module.color || "#8b5cf6") + "30" }}
                    >
                      {module.imageUrl ? (
                        <img src={module.imageUrl} alt={module.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-3xl">{module.icon || "⭐"}</span>
                      )}
                    </div>

                    <h3 className="font-bold text-xl mb-2">{module.name}</h3>
                    <p className="text-sm text-gray-600">{module.description}</p>
                  </div>
                </Card>
              ))}
            </div>

            <div className="text-center">
              <Button
                size="lg"
                disabled={!selectedModule}
                onClick={() => onComplete(selectedModule)}
                className="h-14 px-12 text-lg bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 shadow-2xl"
              >
                Começar Minha Jornada
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
