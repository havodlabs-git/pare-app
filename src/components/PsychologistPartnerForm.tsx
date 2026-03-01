import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Logo } from "./Logo";
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  FileText, 
  Briefcase,
  GraduationCap,
  Send,
  CheckCircle,
  Loader2
} from "lucide-react";
import api from "../services/api";

interface PsychologistPartnerFormProps {
  onBack: () => void;
}

export function PsychologistPartnerForm({ onBack }: PsychologistPartnerFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    crp: "",
    specialty: "",
    experience: "",
    motivation: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.phone || !formData.crp) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.post("/psychologist-partner/apply", formData);
      if (response.data.success) {
        setIsSubmitted(true);
      } else {
        alert(response.data.message || "Erro ao enviar solicitação");
      }
    } catch (error: any) {
      console.error("Error submitting form:", error);
      alert(error.message || "Erro ao enviar solicitação. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="p-8 bg-card border border-border shadow-sm max-w-md w-full text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Solicitação Enviada!
          </h2>
          <p className="text-muted-foreground mb-6">
            Obrigado pelo seu interesse em se tornar um psicólogo parceiro do Pare!
            Nossa equipe analisará sua solicitação e entrará em contato em breve.
          </p>
          <Button onClick={onBack} variant="outline" className="w-full">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para o Login
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card className="p-8 bg-card border border-border shadow-sm">
          <div className="mb-8">
            <button
              onClick={onBack}
              className="flex items-center text-muted-foreground hover:text-foreground transition-colors mb-6"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para o Login
            </button>

            <div className="flex items-center gap-4 mb-6">
              <Logo size="lg" />
              <div>
                <h1 className="text-2xl font-bold text-foreground tracking-tight">
                  Seja um Psicólogo Parceiro
                </h1>
                <p className="text-muted-foreground">
                  Junte-se à nossa rede de profissionais
                </p>
              </div>
            </div>

            <div className="bg-primary/10 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-foreground mb-2">
                Por que ser um parceiro Pare!?
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Acesso a uma base de pacientes em busca de ajuda profissional</li>
                <li>• Plataforma integrada para agendamentos e videochamadas</li>
                <li>• Flexibilidade de horários e atendimento remoto</li>
                <li>• Remuneração competitiva por sessão</li>
              </ul>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome completo *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Dr(a). João Silva"
                    className="pl-10 h-12 bg-secondary border-border"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-mail profissional *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    className="pl-10 h-12 bg-secondary border-border"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone/WhatsApp *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(11) 99999-9999"
                    className="pl-10 h-12 bg-secondary border-border"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="crp">Número do CRP *</Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="crp"
                    type="text"
                    placeholder="CRP 06/123456"
                    className="pl-10 h-12 bg-secondary border-border"
                    value={formData.crp}
                    onChange={(e) =>
                      setFormData({ ...formData, crp: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="specialty">Especialidade principal</Label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="specialty"
                    type="text"
                    placeholder="Ex: Terapia Cognitivo-Comportamental"
                    className="pl-10 h-12 bg-secondary border-border"
                    value={formData.specialty}
                    onChange={(e) =>
                      setFormData({ ...formData, specialty: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience">Anos de experiência</Label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="experience"
                    type="text"
                    placeholder="Ex: 5 anos"
                    className="pl-10 h-12 bg-secondary border-border"
                    value={formData.experience}
                    onChange={(e) =>
                      setFormData({ ...formData, experience: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="motivation">
                Por que você quer ser um parceiro Pare!?
              </Label>
              <textarea
                id="motivation"
                placeholder="Conte-nos um pouco sobre sua motivação e experiência com tratamento de vícios e compulsões..."
                className="w-full min-h-[120px] px-4 py-3 bg-secondary border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                value={formData.motivation}
                onChange={(e) =>
                  setFormData({ ...formData, motivation: e.target.value })
                }
              />
            </div>

            <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
              <p>
                Ao enviar este formulário, você concorda em ser contatado pela equipe
                do Pare! para verificação de credenciais e possível parceria.
                Seus dados serão tratados com confidencialidade.
              </p>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              size="lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-5 w-5" />
                  Enviar Solicitação
                </>
              )}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
