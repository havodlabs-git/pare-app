import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Plus, Check, Lock, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { useState, useEffect } from "react";
import { API_URL } from "../config/api";

interface CatalogModule {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  imageUrl: string | null;
  requiredPlan: string;
}

interface ModuleSelectorProps {
  activeModules: string[];
  currentModuleId: string;
  maxModules: number;
  currentPlan: "free" | "premium" | "elite";
  onAddModule: (moduleId: string) => void;
  onSwitchModule: (moduleId: string) => void;
  onUpgradePlan: () => void;
}

// Componente de ícone do módulo — usa imagem se disponível, senão emoji
function ModuleIcon({ module, size = "md" }: { module: CatalogModule; size?: "sm" | "md" | "lg" }) {
  const sizeClass = size === "sm" ? "w-8 h-8" : size === "lg" ? "w-16 h-16" : "w-12 h-12";
  const textSize = size === "sm" ? "text-lg" : size === "lg" ? "text-3xl" : "text-2xl";
  return (
    <div
      className={`${sizeClass} rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden`}
      style={{ backgroundColor: (module.color || "#8b5cf6") + "25" }}
    >
      {module.imageUrl ? (
        <img src={module.imageUrl} alt={module.name} className="w-full h-full object-cover" />
      ) : (
        <span className={textSize}>{module.icon || "⭐"}</span>
      )}
    </div>
  );
}

// Hook para buscar o catálogo de módulos do backend
function useModuleCatalog() {
  const [catalog, setCatalog] = useState<CatalogModule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/modules/catalog`)
      .then(r => r.json())
      .then(data => {
        if (data.success) setCatalog(data.data.modules);
      })
      .catch(err => console.error("Erro ao carregar catálogo de módulos:", err))
      .finally(() => setLoading(false));
  }, []);

  return { catalog, loading };
}

export function ModuleSelector({
  activeModules,
  currentModuleId,
  maxModules,
  currentPlan,
  onAddModule,
  onSwitchModule,
  onUpgradePlan,
}: ModuleSelectorProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSwitchDialogOpen, setIsSwitchDialogOpen] = useState(false);
  const { catalog, loading } = useModuleCatalog();

  const availableModules = catalog.filter(m => !activeModules.includes(m.id));
  const activeModulesList = catalog.filter(m => activeModules.includes(m.id));
  const currentModule = catalog.find(m => m.id === currentModuleId);
  const canAddMore = activeModules.length < maxModules;

  const getPlanLimits = () => {
    switch (currentPlan) {
      case "free":    return { max: 1,   name: "Gratuito" };
      case "premium": return { max: 3,   name: "Premium" };
      case "elite":   return { max: 999, name: "Elite" };
    }
  };
  const planLimits = getPlanLimits();

  return (
    <div className="flex items-center gap-3">
      {/* Current Module Display */}
      {currentModule && (
        <Dialog open={isSwitchDialogOpen} onOpenChange={setIsSwitchDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="h-10 gap-2 hover:bg-gray-50">
              <ModuleIcon module={currentModule} size="sm" />
              <div className="text-left hidden lg:block">
                <p className="text-xs text-gray-500 leading-none">Módulo Ativo</p>
                <p className="text-sm font-semibold leading-tight">{currentModule.name}</p>
              </div>
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle>Alternar Módulo</DialogTitle>
              <DialogDescription>
                Escolha qual módulo você deseja acompanhar agora. Seus dados serão mantidos.
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto pr-1 -mr-1 scrollbar-thin" style={{ maxHeight: 'calc(85vh - 140px)' }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {activeModulesList.map((module) => (
                <Card
                  key={module.id}
                  className={`p-4 cursor-pointer transition-all hover:shadow-lg ${
                    module.id === currentModuleId
                      ? "ring-2 ring-purple-500 bg-purple-50"
                      : "hover:bg-gray-50"
                  }`}
                  onClick={() => {
                    onSwitchModule(module.id);
                    setIsSwitchDialogOpen(false);
                  }}
                >
                  <div className="flex items-start gap-3">
                    <ModuleIcon module={module} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{module.name}</h3>
                        {module.id === currentModuleId && (
                          <Badge className="bg-purple-500 text-white text-xs">Ativo</Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-600">{module.description}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Add Module Button */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-dashed hover:bg-purple-50 hover:border-purple-300"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Adicionar</span>
          </Button>
        </DialogTrigger>

        <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Adicionar Novo Módulo</DialogTitle>
            <DialogDescription>
              Você está no plano <strong>{planLimits.name}</strong> - {activeModules.length}/{planLimits.max === 999 ? "∞" : planLimits.max} módulos ativos
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto pr-1 -mr-1 scrollbar-thin" style={{ maxHeight: 'calc(85vh - 140px)' }}>
          {loading ? (
            <div className="py-12 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
            </div>
          ) : !canAddMore ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
                <Lock className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-xl font-semibold">Limite de módulos atingido</h3>
              <p className="text-gray-600">
                Você atingiu o limite de {maxModules} {maxModules === 1 ? "módulo" : "módulos"} do plano {planLimits.name}.
              </p>
              <p className="text-sm text-gray-500">
                Faça upgrade para adicionar mais módulos e acompanhar múltiplos hábitos simultaneamente.
              </p>
              <Button
                onClick={() => {
                  setIsAddDialogOpen(false);
                  onUpgradePlan();
                }}
                className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
              >
                Ver Planos Premium
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {availableModules.map((module) => (
                <Card
                  key={module.id}
                  className="p-4 cursor-pointer transition-all hover:shadow-lg hover:bg-gray-50"
                  onClick={() => {
                    onAddModule(module.id);
                    setIsAddDialogOpen(false);
                  }}
                >
                  <div className="flex items-start gap-3">
                    <ModuleIcon module={module} />
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{module.name}</h3>
                      <p className="text-xs text-gray-600 mb-2">{module.description}</p>
                      <Button size="sm" className="w-full text-xs h-8">
                        Adicionar Módulo
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}

              {availableModules.length === 0 && (
                <div className="col-span-2 py-8 text-center text-gray-500">
                  <Check className="w-12 h-12 mx-auto mb-3 text-green-500" />
                  <p>Você já adicionou todos os módulos disponíveis!</p>
                </div>
              )}
            </div>
          )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Module Count Badge */}
      <Badge variant="secondary" className="hidden sm:flex gap-1 text-xs">
        {activeModules.length}/{planLimits.max === 999 ? "∞" : planLimits.max}
      </Badge>
    </div>
  );
}
