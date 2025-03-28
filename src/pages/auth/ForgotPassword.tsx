// src\pages\auth\ForgotPassword.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      toast({
        title: "Email enviado",
        description: "Verifique sua caixa de entrada para redefinir sua senha",
      });
    }, 1500);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-brewery-cream p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold text-brewery-dark-brown">Esqueceu sua senha?</CardTitle>
          <CardDescription>
            {!submitted 
              ? "Enviaremos um link para redefinir sua senha" 
              : "Enviamos um link para redefinir sua senha"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  placeholder="seu@email.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-brewery-amber hover:bg-brewery-amber/90" disabled={loading}>
                {loading ? "Enviando..." : "Enviar link de redefinição"}
              </Button>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <p className="text-green-600">
                Um email foi enviado para {email} com as instruções para redefinir sua senha.
              </p>
              <p className="text-sm text-gray-600">
                Se não receber o email em alguns minutos, verifique sua pasta de spam ou tente novamente.
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link to="/login" className="text-brewery-amber hover:underline inline-flex items-center">
            <ArrowLeft size={16} className="mr-2" />
            Voltar para o login
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ForgotPassword;
