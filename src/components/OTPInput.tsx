import { useState, useRef, useEffect, KeyboardEvent, ClipboardEvent } from "react";
import { cn } from "../lib/utils";

interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
  className?: string;
}

export function OTPInput({
  length = 6,
  value,
  onChange,
  disabled = false,
  autoFocus = true,
  className,
}: OTPInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [focusedIndex, setFocusedIndex] = useState(0);

  // Inicializar refs
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, length);
  }, [length]);

  // Auto focus no primeiro input
  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus]);

  // Converter value em array de caracteres
  const valueArray = value.split("").slice(0, length);
  while (valueArray.length < length) {
    valueArray.push("");
  }

  const handleChange = (index: number, inputValue: string) => {
    // Apenas números
    const digit = inputValue.replace(/\D/g, "").slice(-1);
    
    const newValue = [...valueArray];
    newValue[index] = digit;
    onChange(newValue.join(""));

    // Mover para próximo input se digitou algo
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!valueArray[index] && index > 0) {
        // Se o campo está vazio, voltar para o anterior
        inputRefs.current[index - 1]?.focus();
        const newValue = [...valueArray];
        newValue[index - 1] = "";
        onChange(newValue.join(""));
      } else {
        // Limpar o campo atual
        const newValue = [...valueArray];
        newValue[index] = "";
        onChange(newValue.join(""));
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    
    if (pastedData) {
      onChange(pastedData.padEnd(length, "").slice(0, length));
      // Focar no último input preenchido ou no próximo vazio
      const focusIndex = Math.min(pastedData.length, length - 1);
      inputRefs.current[focusIndex]?.focus();
    }
  };

  const handleFocus = (index: number) => {
    setFocusedIndex(index);
    // Selecionar o conteúdo ao focar
    inputRefs.current[index]?.select();
  };

  return (
    <div className={cn("flex gap-2 justify-center", className)}>
      {valueArray.map((digit, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          onFocus={() => handleFocus(index)}
          disabled={disabled}
          className={cn(
            "w-12 h-14 text-center text-2xl font-bold rounded-lg border-2 transition-all duration-200",
            "focus:outline-none focus:ring-2 focus:ring-primary/20",
            digit
              ? "border-primary bg-primary/5 text-primary"
              : "border-gray-200 bg-white text-gray-900",
            focusedIndex === index && "border-primary ring-2 ring-primary/20",
            disabled && "opacity-50 cursor-not-allowed bg-gray-100"
          )}
          aria-label={`Dígito ${index + 1} de ${length}`}
        />
      ))}
    </div>
  );
}
