'use client';

import * as React from 'react';
import PhoneInput from 'react-phone-number-input/input';
import { cn } from '@/lib/utils';
import BrazilianFlag from '../icons/brazilian-flag';

export interface PhoneInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value?: string;
  onChange?: (value: string | undefined) => void;
}

const BrazilianPhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ className, onChange, value, ...props }, ref) => {
    const handleChange = (newValue: string | undefined) => {
      // Sempre adiciona +55 se não estiver presente
      if (newValue && !newValue.startsWith('+55')) {
        newValue = '+55' + newValue.replace(/\D/g, '');
      }
      onChange?.(newValue);
    };

    const formatDisplayValue = (phoneValue: string | undefined) => {
      if (!phoneValue) return '';
      
      // Remove +55 para exibição
      const cleanNumber = phoneValue.replace('+55', '').replace(/\D/g, '');
      
      // Formata como (XX) XXXXX-XXXX
      if (cleanNumber.length >= 11) {
        return `(${cleanNumber.slice(0, 2)}) ${cleanNumber.slice(2, 7)}-${cleanNumber.slice(7, 11)}`;
      } else if (cleanNumber.length >= 7) {
        return `(${cleanNumber.slice(0, 2)}) ${cleanNumber.slice(2, 7)}-${cleanNumber.slice(7)}`;
      } else if (cleanNumber.length >= 2) {
        return `(${cleanNumber.slice(0, 2)}) ${cleanNumber.slice(2)}`;
      }
      return cleanNumber;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      // Remove tudo exceto números
      const numbersOnly = inputValue.replace(/\D/g, '');
      
      // Limita a 11 dígitos (DDD + 9 dígitos)
      const limitedNumbers = numbersOnly.slice(0, 11);
      
      // Adiciona +55 para o valor interno
      const fullNumber = limitedNumbers ? `+55${limitedNumbers}` : undefined;
      
      handleChange(fullNumber);
    };

    return (
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
          <span className="text-2xl">
            <BrazilianFlag className="size-8" />
          </span>
          <span className="text-sm text-muted-foreground">+55</span>
        </div>
        <input
          type="tel"
          className={cn(
            'flex h-10 w-full rounded-md border border-input bg-background pl-20 pr-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            className
          )}
          placeholder="(11) 99999-9999"
          value={formatDisplayValue(value)}
          onChange={handleInputChange}
          ref={ref}
          {...props}
        />
      </div>
    );
  }
);

BrazilianPhoneInput.displayName = 'BrazilianPhoneInput';

export { BrazilianPhoneInput };