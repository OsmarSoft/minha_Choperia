

// src\pages\auth\RegisterForm.tsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/components/auth/useAuth';

const RegisterForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userType, setUserType] = useState<'online' | 'physical'>('online');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "As senhas não coincidem",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const success = await register(name, email, password, userType);
      
      if (success) {
        toast({
          title: "Registro realizado com sucesso",
          description: "Sua conta foi criada com sucesso!",
        });
        
        // Redirecionar com base no tipo de usuario
        if (userType === "physical") {
          console.log("Redirecionando para loja física");
          navigate("/loja-fisica");
        } else {
          console.log("Redirecionando para loja online");
          navigate("/loja");
        }
      } else {
        toast({
          variant: "destructive",
          title: "Falha no registro",
          description: "Este email já está em uso ou ocorreu um erro",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro ao criar sua conta",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-brewery-cream p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold text-brewery-dark-brown">Criar uma conta</CardTitle>
          <CardDescription>
            Preencha os campos abaixo para se registrar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                placeholder="Seu nome completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
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
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Tipo de Conta</Label>
              <RadioGroup value={userType} onValueChange={(value) => setUserType(value as 'online' | 'physical')} className="flex flex-col space-y-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="online" id="online" />
                  <Label htmlFor="online" className="cursor-pointer">Cliente Online</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="physical" id="physical" />
                  <Label htmlFor="physical" className="cursor-pointer">Funcionário (Loja Física)</Label>
                </div>
              </RadioGroup>
            </div>
            <Button type="submit" className="w-full bg-brewery-amber hover:bg-brewery-amber/90" disabled={loading}>
              {loading ? "Carregando..." : "Registrar"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center">
            Já tem uma conta?{' '}
            <Link to="/login" className="text-brewery-amber hover:underline">
              Entre aqui
            </Link>
          </div>
          <div className="text-sm text-center">
            <Link to="/" className="text-brewery-amber hover:underline">
              Voltar para a página inicial
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default RegisterForm;
