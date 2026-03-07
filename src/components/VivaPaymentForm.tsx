import React, { useState } from 'react';
import { CreditCard, Lock, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn, formatCurrency } from '../lib/utils';

interface VivaPaymentFormProps {
  amount: number;
  orderCode: string;
  companyId: string;
  planId: string;
  onSuccess: (transactionId: string) => void;
  onCancel?: () => void;
}

export default function VivaPaymentForm({ 
  amount, 
  orderCode, 
  companyId, 
  planId, 
  onSuccess, 
  onCancel 
}: VivaPaymentFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cardData, setCardData] = useState({
    number: '',
    expirationMonth: '',
    expirationYear: '',
    cvv: '',
    holderName: ''
  });

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/viva/process-native', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderCode,
          companyId,
          planId,
          card: {
            number: cardData.number.replace(/\s/g, ''),
            expirationMonth: parseInt(cardData.expirationMonth),
            expirationYear: parseInt(cardData.expirationYear),
            cvv: cardData.cvv,
            holderName: cardData.holderName
          }
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.details || result.message || 'Erro ao processar pagamento');
      }

      if (result.success) {
        onSuccess(result.transactionId);
      } else {
        throw new Error(result.message || 'Pagamento não autorizado');
      }
    } catch (err: any) {
      const errorMessage = err.message === 'Failed to fetch'
        ? 'Erro de conexão com o servidor. O serviço de pagamentos pode estar temporariamente indisponível.'
        : err.message;
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length > 0) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  return (
    <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 max-w-md w-full mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-sidebar" />
          Pagamento Seguro
        </h3>
        <div className="px-3 py-1 bg-gray-100 rounded-full text-[10px] font-bold text-gray-500 uppercase tracking-widest">
          Viva Wallet
        </div>
      </div>

      <div className="mb-6 p-4 bg-gray-50 rounded-2xl border border-gray-100">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">Total a pagar:</span>
          <span className="text-xl font-black text-sidebar">{formatCurrency(amount)}</span>
        </div>
        <p className="text-[10px] text-gray-400 mt-1">Referência: {orderCode}</p>
      </div>

      <form onSubmit={handleProcessPayment} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Nome no Cartão</label>
          <input 
            type="text" 
            required
            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-sidebar/10"
            placeholder="NOME COMO NO CARTÃO"
            value={cardData.holderName}
            onChange={e => setCardData({...cardData, holderName: e.target.value.toUpperCase()})}
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Número do Cartão</label>
          <div className="relative">
            <input 
              type="text" 
              required
              maxLength={19}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-sidebar/10"
              placeholder="0000 0000 0000 0000"
              value={cardData.number}
              onChange={e => setCardData({...cardData, number: formatCardNumber(e.target.value)})}
            />
            <CreditCard className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-1">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Mês</label>
            <input 
              type="text" 
              required
              maxLength={2}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-sidebar/10 text-center"
              placeholder="MM"
              value={cardData.expirationMonth}
              onChange={e => setCardData({...cardData, expirationMonth: e.target.value.replace(/\D/g, '')})}
            />
          </div>
          <div className="col-span-1">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Ano</label>
            <input 
              type="text" 
              required
              maxLength={4}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-sidebar/10 text-center"
              placeholder="AAAA"
              value={cardData.expirationYear}
              onChange={e => setCardData({...cardData, expirationYear: e.target.value.replace(/\D/g, '')})}
            />
          </div>
          <div className="col-span-1">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">CVV</label>
            <div className="relative">
              <input 
                type="text" 
                required
                maxLength={4}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-sidebar/10 text-center"
                placeholder="123"
                value={cardData.cvv}
                onChange={e => setCardData({...cardData, cvv: e.target.value.replace(/\D/g, '')})}
              />
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-300" />
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2 text-red-600 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <div className="pt-4 flex flex-col gap-3">
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-sidebar text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-all shadow-lg shadow-sidebar/20 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                Pagar Agora
                <CheckCircle2 className="w-5 h-5" />
              </>
            )}
          </button>
          
          {onCancel && (
            <button 
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="w-full py-3 text-gray-400 text-xs font-bold hover:text-gray-600 transition-colors"
            >
              Cancelar e Voltar
            </button>
          )}
        </div>
      </form>

      <div className="mt-6 flex items-center justify-center gap-4 opacity-30 grayscale">
        <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-4" />
        <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6" />
        <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-4" />
      </div>
    </div>
  );
}
