
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Store, Settings, Users, Trash2, ArrowRight, Award, Beer, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";
import { useState, useEffect } from "react";
import { useAuth } from '@/components/auth/useAuth';
import Hero from '@/components/Hero';
import BeerCard, { Beer as BeerType } from '@/components/BeerCard';
import { getAllUsers } from '@/api/usuarios/usuarioService'; // Certifique-se de que esta função está implementada

// Sample featured beers
const featuredBeers: BeerType[] = [
  {
    id: 1,
    name: "Pilsen Clássica",
    style: "Pilsner",
    description: "Uma cerveja leve e refrescante com notas de malte e lúpulo equilibradas. Perfeita para os dias quentes.",
    abv: 4.8,
    ibu: 20,
    image: "https://images.unsplash.com/photo-1566633806327-68e152aaf26d?q=80&w=2070&auto=format&fit=crop",
    price: 22.90,
    rating: 4.7
  },
  {
    id: 2,
    name: "Amber Red",
    style: "Amber Ale",
    description: "Uma cerveja âmbar com notas carameladas, corpo médio e amargor equilibrado. Aromática e saborosa.",
    abv: 5.5,
    ibu: 25,
    image: "https://images.unsplash.com/photo-1563804447887-21f1ad0928ba?q=80&w=1974&auto=format&fit=crop",
    price: 24.90,
    rating: 4.5
  },
  {
    id: 3,
    name: "IPA Tropical",
    style: "IPA",
    description: "Uma IPA com notas tropicais, cítricas e amargor pronunciado. Para os apreciadores de cervejas mais intensas.",
    abv: 6.2,
    ibu: 55,
    image: "https://images.unsplash.com/photo-1618183479302-1e0aa382c36b?q=80&w=1974&auto=format&fit=crop",
    price: 26.90,
    rating: 4.8
  }
];

interface User {
  id: string;
  name: string;
  email: string;
  userType?: string;
}

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const location = useLocation();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) {
      console.log('Index: Ainda carregando autenticação...');
      return; // Não faz nada enquanto está carregando
    }

    console.log('Index: Usuário atual:', user, 'Localização:', location.pathname);
    if (user && location.pathname === '/') {
      if (user.userType === 'physical') {
        console.log('Index: Redirecionando usuário físico para /loja-fisica');
        navigate('/loja-fisica');
      } else if (user.userType === 'online') {
        console.log('Index: Redirecionando usuário online para /loja');
        navigate('/loja');
      }
    }
  }, [user, isLoading, navigate, location.pathname]);

  // Check if user is logged in - if so, redirect to their appropriate area
  useEffect(() => {
    if (user) {
      if (user.userType === "physical") {
        navigate("/loja-fisica");
        console.log("Usuário logado como funcionário da loja física:", user);
      }
      else if (user.userType === "online") {
        navigate("/loja");
        console.log("Usuário logado como cliente online:", user);
      }
    }
  }, [user, navigate]);

  /*
  useEffect(() => {
    const storedUsers = localStorage.getItem('users');
    if (storedUsers) {
      setUsers(JSON.parse(storedUsers));
    }
  }, []);
  */
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersFromApi = await getAllUsers(); // Busca os usuários da API
        setUsers(usersFromApi); // Atualiza o estado com os usuários retornados
      } catch (error) {
        console.error('Erro ao buscar usuários:', error);
      }
    };
  
    fetchUsers();
  }, []);

  const handleDeleteUser = (userToDelete: User) => {
    const updatedUsers = users.filter(user => user.id !== userToDelete.id);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    setUsers(updatedUsers);
    toast({
      title: "Usuário excluído",
      description: `O usuário ${userToDelete.name} foi excluído com sucesso.`,
      duration: 2000, // Reduzindo para 2 segundos (2000ms)
        // Adicionando um progress indicator através de HTML
        action: (
          <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700 mt-2">
            <div className="bg-green-600 h-1.5 rounded-full animate-[progress_2s_ease-in-out]"></div>
          </div>
        ),
      });
  };

  const cards = [
    {
      title: "Área da Loja",
      description: "Acesse nossa loja online para ver produtos e fazer pedidos.",
      icon: Store,
      onClick: () => navigate("/login", { state: { userType: "online" } }),
      bgColor: "bg-gradient-to-br from-orange-200 to-orange-400",
      iconColor: "text-orange-600",
    },
    {
      title: "Área da Loja Física",
      description: "Gerencie produtos, estoque, mesas e mais.",
      icon: Settings,
      onClick: () => navigate("/login", { state: { userType: "physical" } }),
      bgColor: "bg-gradient-to-br from-blue-200 to-blue-400",
      iconColor: "text-blue-600",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <Hero />

      {/* Featured Beers Section */}
      <section id="content" className="section-padding bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <motion.h2 /* ... */>
              Nossas Cervejas em Destaque
            </motion.h2>
            {/* Restante do conteúdo mantido */}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredBeers.map((beer, index) => (
              <BeerCard key={beer.id} beer={beer} index={index} />
            ))}
          </div>
          {/* Restante do conteúdo mantido */}
        </div>
      </section>

      {/* Features Section */}
      <section className="section-padding bg-brewery-dark">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center p-8 bg-brewery-brown/50 rounded-xl backdrop-blur-sm glass-card"
            >
              <div className="w-16 h-16 mx-auto bg-brewery-amber rounded-full flex items-center justify-center mb-4">
                <Beer size={28} className="text-white" />
              </div>
              <h3 className="text-xl font-brewery font-bold text-white mb-3">Ingredientes Premium</h3>
              <p className="text-brewery-cream/70">
                Selecionamos cuidadosamente os melhores maltes, lúpulos e leveduras para nossas cervejas.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-center p-8 bg-brewery-brown/50 rounded-xl backdrop-blur-sm glass-card"
            >
              <div className="w-16 h-16 mx-auto bg-brewery-amber rounded-full flex items-center justify-center mb-4">
                <Clock size={28} className="text-white" />
              </div>
              <h3 className="text-xl font-brewery font-bold text-white mb-3">Tradição Cervejeira</h3>
              <p className="text-brewery-cream/70">
                Seguimos métodos tradicionais de produção, respeitando o tempo de maturação ideal para cada estilo.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-center p-8 bg-brewery-brown/50 rounded-xl backdrop-blur-sm glass-card"
            >
              <div className="w-16 h-16 mx-auto bg-brewery-amber rounded-full flex items-center justify-center mb-4">
                <Award size={28} className="text-white" />
              </div>
              <h3 className="text-xl font-brewery font-bold text-white mb-3">Premiada</h3>
              <p className="text-brewery-cream/70">
                Nossas cervejas são reconhecidas e premiadas em diversos festivais e competições nacionais.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Access Cards Section */}
      <section className="section-padding bg-brewery-cream">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-3xl md:text-4xl font-brewery font-bold text-brewery-dark mb-4"
            >
              Acesse Nossa Plataforma
            </motion.h2>
            <motion.div 
              initial={{ opacity: 0, width: 0 }}
              whileInView={{ opacity: 1, width: "80px" }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="h-1 bg-brewery-amber mx-auto mb-6"
            ></motion.div>
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-brewery-dark/70 max-w-2xl mx-auto"
            >
              Escolha como deseja acessar nossa plataforma
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {cards.map((card, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
              >
                <Card
                  className={`cursor-pointer transform transition-all duration-300 hover:scale-105 ${card.bgColor} border-2 border-brewery-brown/10 hover:border-brewery-brown/20`}
                  onClick={card.onClick}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center justify-center text-2xl text-brewery-brown">
                      <card.icon className={`mr-2 h-8 w-8 ${card.iconColor}`} />
                      {card.title}
                    </CardTitle>
                    <CardDescription className="text-brewery-brown/80">
                      {card.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex justify-center">
                    <p className="text-sm text-brewery-brown/60">
                      Clique para acessar
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding relative">
        <div className="absolute inset-0 z-0">
          <div className="relative w-full h-full">
            <div className="absolute inset-0 bg-brewery-dark/70 z-10"></div>
            <img 
              src="https://images.unsplash.com/photo-1530904613557-b405de3a6915?q=80&w=2070&auto=format&fit=crop" 
              alt="Cervejaria" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <div className="container mx-auto relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-3xl md:text-4xl font-brewery font-bold text-white mb-6"
            >
              Visite Nossa Cervejaria
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-brewery-cream/90 mb-8"
            >
              Conheça nosso processo de fabricação, deguste nossas cervejas direto da fonte e aproveite uma experiência única em um ambiente acolhedor.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <a href="/contato" className="btn-primary">Agendar Visita</a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Registered Users Section (Admin View) */}
      {users.length > 0 && (
        <section className="section-padding bg-white">
          <div className="container mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="max-w-4xl mx-auto"
            >
              <Card className="bg-white shadow-lg border-brewery-amber/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-brewery-dark font-bold">
                    <Users className="h-6 w-6 text-brewery-amber" />
                    Usuários Cadastrados
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {users.length === 0 ? (
                    <p className="text-center text-gray-700 font-medium">
                      Nenhum usuário cadastrado
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {users.map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center justify-between p-4 bg-white rounded-lg shadow"
                        >
                          <div>
                            <p className="font-semibold text-brewery-dark-brown">{user.name}</p>
                            <p className="text-sm text-gray-600">{user.email}</p>
                            <p className="text-xs text-gray-500">
                              {user.userType === "physical" ? "Funcionário (Loja Física)" : "Cliente Online"}
                            </p>
                          </div>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="icon">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir o usuário {user.name}? Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteUser(user)}>
                                  Confirmar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Index;


