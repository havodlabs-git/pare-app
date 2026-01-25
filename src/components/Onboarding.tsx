import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Logo } from "./Logo";
import { Eye, Hand, Smartphone, Cigarette, Wine, ShoppingCart, Check } from "lucide-react";

interface Module {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  gradient: string;
  description: string;
}

const modules: Module[] = [
  {
    id: "pornography",
    name: "Pornografia",
    icon: <Eye className="w-8 h-8" />,
    color: "text-red-600",
    gradient: "from-red-500 to-pink-600",
    description: "Supere o vício e recupere sua energia e foco",
  },
  {
    id: "social_media",
    name: "Redes Sociais",
    icon: <Smartphone className="w-8 h-8" />,
    color: "text-blue-600",
    gradient: "from-blue-500 to-cyan-600",
    description: "Recupere seu tempo e foco das distrações digitais",
  },
  {
    id: "smoking",
    name: "Cigarro",
    icon: <Cigarette className="w-8 h-8" />,
    color: "text-gray-600",
    gradient: "from-gray-500 to-slate-600",
    description: "Livre-se do tabagismo e melhore sua saúde",
  },
  {
    id: "alcohol",
    name: "Álcool",
    icon: <Wine className="w-8 h-8" />,
    color: "text-amber-600",
    gradient: "from-amber-500 to-orange-600",
    description: "Controle o consumo e recupere sua claridade mental",
  },
  {
    id: "shopping",
    name: "Compras Compulsivas",
    icon: <ShoppingCart className="w-8 h-8" />,
    color: "text-green-600",
    gradient: "from-green-500 to-emerald-600",
    description: "Desenvolva controle financeiro e consumo consciente",
  },
];

interface OnboardingProps {
  onComplete: (moduleId: string) => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [selectedModule, setSelectedModule] = useState<string>("pornography");

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
                
                <div className={`w-16 h-16 bg-gradient-to-br ${module.gradient} rounded-xl flex items-center justify-center mb-4 shadow-lg`}>
                  <div className="text-white">
                    {module.icon}
                  </div>
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
            onClick={() => onComplete(selectedModule)}
            className="h-14 px-12 text-lg bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 shadow-2xl"
          >
            Começar Minha Jornada
          </Button>
        </div>
      </div>
    </div>
  );
}