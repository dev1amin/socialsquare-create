import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from './Logo';

interface AccountCreationFormProps {}

export default function AccountCreationForm({}: AccountCreationFormProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !email.includes('@')) {
      setError('Por favor, insira um email válido.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || 'https://carousel-api-sepia.vercel.app';
      const response = await fetch(`${apiBase}/api/auth/create-account-from-purchase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'accept': '*/*',
          'accept-language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
          'origin': window.location.origin,
          'referer': window.location.href,
          'sec-ch-ua': '"Chromium";v="134", "Not:A-Brand";v="24", "Google Chrome";v="134"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"Linux"',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'cross-site'
        },
        body: JSON.stringify({
          email: email.trim(),
          payment_id: 'testePlataform'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao criar conta');
      }

      console.log('Account creation response:', data);

      // Extract activation_token from response data
      if (data.success && data.data?.activation_token) {
        const activationToken = data.data.activation_token;
        console.log('Redirecting to onboard with token:', activationToken);
        navigate(`/onboard?token=${activationToken}`);
      } else if (data.token || data.activation_token || data.activationToken) {
        // Fallback: check for token at root level
        const token = data.token || data.activation_token || data.activationToken;
        console.log('Redirecting to onboard with token (fallback):', token);
        navigate(`/onboard?token=${token}`);
      } else {
        throw new Error('Token de ativação não encontrado na resposta');
      }

    } catch (err) {
      console.error('Error creating account:', err);
      setError(err instanceof Error ? err.message : 'Erro ao criar conta. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary flex flex-col">
      <div className="pt-12 pb-16 px-6">
        <Logo />
      </div>

      <div className="flex-1 flex flex-col px-6 max-w-sm mx-auto w-full">
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-gray-dark text-left">
              Criar Conta
            </h1>
            <p className="text-sm text-gray-medium mt-2">
              Digite seu email para começar
            </p>
          </div>

          <div className="mb-4">
            <label className="block text-sm text-gray-dark mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 text-sm text-gray-dark bg-white border border-[#E5E5E5] rounded-xl transition-all duration-200 focus:outline-none focus:border-primary hover:border-primary"
              placeholder="seu@email.com"
              required
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <div className="flex-1 min-h-0"></div>

          <div className="pt-4 pb-8">
            <div className="space-y-3">
              <button
                type="submit"
                disabled={isLoading || !email.trim()}
                className={`w-full py-4 px-6 rounded-xl font-medium text-white text-sm transition-all duration-200 ${
                  !isLoading && email.trim()
                    ? 'bg-primary hover:bg-[#5A54E3] active:scale-95'
                    : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                {isLoading ? 'Criando conta...' : 'Continuar'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}