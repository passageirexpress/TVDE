import React, { useState, useEffect } from 'react';
import { CreditCard, Lock, Loader2, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../lib/utils';

interface VivaPaymentFormProps {
  amount: number;
  orderCode: string;
  companyId: string;
  planId: string;
  onSuccess: (transactionId: string) => void;
  onCancel?: () => void;
}

// Extend Window interface for VivaCheckout
declare global {
  interface Window {
    VivaCheckout: any;
  }
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
  const [isPolling, setIsPolling] = useState(false);

  useEffect(() => {
    // Load Viva Wallet Checkout script
    const scriptId = 'viva-checkout-script';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://www.vivapayments.com/web/checkout/js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isPolling) {
      interval = setInterval(async () => {
        try {
          const response = await fetch(`/api/viva/verify-payment?orderCode=${orderCode}&companyId=${companyId}&planId=${planId}`);
          const result = await response.json();

          if (result.success) {
            setIsPolling(false);
            onSuccess(orderCode); // Pass orderCode as transactionId for now
          }
        } catch (err) {
          console.error("Erro ao verificar pagamento:", err);
        }
      }, 5000); // Check every 5 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPolling, orderCode, companyId, planId, onSuccess]);

  const handleOpenCheckout = () => {
    setLoading(true);
    setError(null);

    try {
      if (typeof window.VivaCheckout !== 'undefined') {
        window.VivaCheckout.setup({
          ref: orderCode,
          onResult: function(response: any) {
            // This callback might not always fire depending on the payment method,
            // so we still rely on polling as a fallback/primary verification method.
            console.log("VivaCheckout result:", response);
          }
        }).request();
        
        // Start polling for payment success while the modal is open
        setIsPolling(true);
      } else {
        // Fallback if script fails to load
        const checkoutUrl = `https://www.vivapayments.com/web/checkout?ref=${orderCode}`;
        window.location.href = checkoutUrl;
      }
    } catch (err: any) {
      setError(err.message || "Erro ao abrir a página de pagamento.");
    } finally {
      setLoading(false);
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

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-sm flex items-start gap-3 border border-red-100">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {isPolling ? (
        <div className="space-y-6 text-center py-4">
          <div className="w-16 h-16 bg-sidebar/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-8 h-8 text-sidebar animate-spin" />
          </div>
          <div>
            <h4 className="font-bold text-lg mb-2">A aguardar pagamento...</h4>
            <p className="text-sm text-gray-500">
              Conclua o pagamento na janela segura que foi aberta. 
              Esta página será atualizada automaticamente assim que o pagamento for confirmado.
            </p>
          </div>
          <button 
            type="button"
            onClick={handleOpenCheckout}
            className="text-sm text-sidebar font-bold hover:underline flex items-center justify-center gap-2 mx-auto"
          >
            <CreditCard className="w-4 h-4" />
            Reabrir janela de pagamento
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-blue-50 text-blue-700 p-4 rounded-2xl text-sm flex items-start gap-3 border border-blue-100">
            <Lock className="w-5 h-5 shrink-0 mt-0.5" />
            <p>
              O pagamento será processado de forma segura numa janela integrada da Viva Wallet.
            </p>
          </div>

          <button 
            type="button"
            onClick={handleOpenCheckout}
            disabled={loading}
            className="w-full bg-sidebar text-white py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-black transition-all shadow-lg shadow-sidebar/20 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Lock className="w-5 h-5" />
                Pagar com Viva Wallet
              </>
            )}
          </button>
        </div>
      )}

      {onCancel && (
        <button 
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="w-full mt-4 py-4 rounded-2xl font-bold text-xs text-gray-400 uppercase tracking-widest hover:bg-gray-50 transition-all disabled:opacity-50"
        >
          Cancelar
        </button>
      )}
    </div>
  );
}
