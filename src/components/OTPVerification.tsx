import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Logo } from "./Logo";
import { OTPInput } from "./OTPInput";
import { ArrowLeft, Mail, RefreshCw, CheckCircle2, Loader2 } from "lucide-react";
import { useToast } from "../context/ToastContext";
import api from "../services/api";

interface OTPVerificationProps {
  email: string;
  purpose?: "login" | "register" | "reset";
  onVerified: (data: { user: any; token: string }) => void;
  onBack: () => void;
  onResend?: () => void;
}

export function OTPVerification({
  email,
  purpose = "login",
  onVerified,
  onBack,
}: OTPVerificationProps) {
  const toast = useToast();
  const [code, setCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Countdown para reenvio
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  // Auto-verificar quando o código estiver completo
  useEffect(() => {
    if (code.length === 6 && !isVerifying) {
      handleVerify();
    }
  }, [code]);

  const handleVerify = async () => {
    if (code.length !== 6) {
      toast.error("Digite o código completo de 6 dígitos");
      return;
    }

    setIsVerifying(true);

    try {
      const response = await api.post("/otp/verify", {
        email,
        code,
        purpose,
      });

      if (response.data.success) {
        toast.success("Código verificado com sucesso!");
        onVerified(response.data.data);
      }
    } catch (error: any) {
      console.error("OTP verification error:", error);
      const message = error.response?.data?.message || error.message || "Erro ao verificar código";
      toast.error(message);
      setCode(""); // Limpar código em caso de erro
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;

    setIsResending(true);

    try {
      const response = await api.post("/otp/send", {
        email,
        purpose,
      });

      if (response.data.success) {
        toast.success("Novo código enviado para seu email!");
        setCountdown(60);
        setCanResend(false);
        setCode("");
      }
    } catch (error: any) {
      console.error("OTP resend error:", error);
      const message = error.response?.data?.message || error.message || "Erro ao reenviar código";
      toast.error(message);
    } finally {
      setIsResending(false);
    }
  };

  const maskedEmail = email.replace(/(.{2})(.*)(@.*)/, "$1***$3");

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="p-8 shadow-xl border-0 bg-white">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Mail className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Verifique seu email
            </h2>
            <p className="text-gray-600">
              Enviamos um código de 6 dígitos para
            </p>
            <p className="text-primary font-medium mt-1">{maskedEmail}</p>
          </div>

          {/* OTP Input */}
          <div className="mb-8">
            <OTPInput
              value={code}
              onChange={setCode}
              disabled={isVerifying}
              autoFocus
            />
          </div>

          {/* Verify Button */}
          <Button
            onClick={handleVerify}
            disabled={code.length !== 6 || isVerifying}
            className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90"
          >
            {isVerifying ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Verificando...
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-5 w-5" />
                Verificar Código
              </>
            )}
          </Button>

          {/* Resend Section */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500 mb-2">
              Não recebeu o código?
            </p>
            {canResend ? (
              <button
                onClick={handleResend}
                disabled={isResending}
                className="text-primary hover:text-primary/80 font-medium transition-colors flex items-center justify-center gap-2 mx-auto"
              >
                {isResending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Reenviando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    Reenviar código
                  </>
                )}
              </button>
            ) : (
              <p className="text-gray-400">
                Reenviar em <span className="font-medium text-gray-600">{countdown}s</span>
              </p>
            )}
          </div>

          {/* Back Button */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <button
              onClick={onBack}
              className="w-full flex items-center justify-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar para login
            </button>
          </div>
        </Card>

        {/* Footer */}
        <div className="mt-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Logo size="sm" />
            <span className="text-lg font-bold text-gray-900">Pare!</span>
          </div>
          <p className="text-sm text-gray-500">
            Transforme seus hábitos
          </p>
        </div>
      </div>
    </div>
  );
}
