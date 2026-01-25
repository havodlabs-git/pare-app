import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Eye, Smartphone, Cigarette, Wine, ShoppingCart, Plus, Check, Lock } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { useState } from "react";

interface Module {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  gradient: string;
  description: string;
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

const allModules: Module[] = [
  {
    id: "pornography",
    name: "Pornografia",
    icon: <Eye className="w-6 h-6" />,
    color: "text-red-600",
    gradient: "from-red-500 to-pink-600",
    description: "Supere o vício e recupere sua energia",
  },
  {
    id: "social_media",
    name: "Redes Sociais",
    icon: <Smartphone className="w-6 h-6" />,
    color: "text-blue-600",
    gradient: "from-blue-500 to-cyan-600",
    description: "Recupere seu tempo e foco",
  },
  {
    id: "smoking",
    name: "Cigarro",
    icon: <Cigarette className="w-6 h-6" />,
    color: "text-gray-600",
    gradient: "from-gray-500 to-slate-600",
    description: "Livre-se do tabagismo",
  },
  {
    id: "alcohol",
    name: "Álcool",
    icon: <Wine className="w-6 h-6" />,
    color: "text-amber-600",
    gradient: "from-amber-500 to-orange-600",
    description: "Controle o consumo",
  },
  {
    id: "shopping",
    name: "Compras Compulsivas",
    icon: <ShoppingCart className="w-6 h-6" />,
    color: "text-green-600",
    gradient: "from-green-500 to-emerald-600",
    description: "Desenvolva controle financeiro",
  },
];

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

  const availableModules = allModules.filter(m => !activeModules.includes(m.id));
  const activeModulesList = allModules.filter(m => activeModules.includes(m.id));
  const currentModule = allModules.find(m => m.id === currentModuleId);
  const canAddMore = activeModules.length < maxModules;

  const getPlanLimits = () => {
    switch (currentPlan) {
      case "free":
        return { max: 1, name: "Gratuito" };
      case "premium":
        return { max: 3, name: "Premium" };
      case "elite":
        return { max: 999, name: "Elite" };
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
              <div className={`w-8 h-8 bg-gradient-to-br ${currentModule.gradient} rounded-lg flex items-center justify-center text-white`}>
                {currentModule.icon}
              </div>
              <div className="text-left hidden lg:block">
                <p className="text-xs text-gray-500 leading-none">Módulo Ativo</p>
                <p className="text-sm font-semibold leading-tight">{currentModule.name}</p>
              </div>
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Alternar Módulo</DialogTitle>
              <DialogDescription>
                Escolha qual módulo você deseja acompanhar agora. Seus dados serão mantidos.
              </DialogDescription>
            </DialogHeader>

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
                    <div className={`w-12 h-12 bg-gradient-to-br ${module.gradient} rounded-xl flex items-center justify-center text-white`}>
                      {module.icon}
                    </div>
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

        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Módulo</DialogTitle>
            <DialogDescription>
              Você está no plano <strong>{planLimits.name}</strong> - {activeModules.length}/{planLimits.max} módulos ativos
            </DialogDescription>
          </DialogHeader>

          {!canAddMore ? (
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
                    <div className={`w-12 h-12 bg-gradient-to-br ${module.gradient} rounded-xl flex items-center justify-center text-white`}>
                      {module.icon}
                    </div>
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
        </DialogContent>
      </Dialog>

      {/* Module Count Badge */}
      <Badge variant="secondary" className="hidden sm:flex gap-1 text-xs">
        {activeModules.length}/{planLimits.max === 999 ? "∞" : planLimits.max}
      </Badge>
    </div>
  );
}
