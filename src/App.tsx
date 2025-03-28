
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "./components/auth/useAuth";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { ScrollToTop } from "./components/ui/scroll-to-top";

// Layout Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Public Pages
import Index from "./pages/Index";
import Menu from "./pages/Menu";
import Sobre from "./pages/Sobre";
import Contato from "./pages/Contato";
import NotFound from "./pages/NotFound";

// Auth Pages
import LoginForm from "./pages/auth/LoginForm";
import RegisterForm from "./pages/auth/RegisterForm";
import ForgotPassword from "./pages/auth/ForgotPassword";

// Context Providers
import { CarrinhoProvider } from '@/components/loja/carrinhoApi'
import { FavoritosProvider } from "@/components/loja/favoritosApi";
import { AvaliacoesProvider } from '@/components/loja/avaliacoesApi';

// Loja Física
import LayoutLojaFisica from "./components/barra_navegacao/layout_loja_fisica";
import LojaFisicaIndex from "./pages/loja_fisica/Index";
import EmpresaList from "./pages/loja_fisica/empresas/EmpresaList";
import EmpresaCadastro from "./pages/loja_fisica/empresas/EmpresaCadastro";
import EmpresaDetail from "./pages/loja_fisica/empresas/EmpresaDetail";
import ListarProdutos from "./pages/loja_fisica/produto/ListarProdutos";
import EstoqueList from "./pages/loja_fisica/estoque/EstoqueList";
import CategoriaList from "./pages/loja_fisica/categoria/CategoriaList";
import MesasPage from "./pages/loja_fisica/mesas/MesasPage";
import MesaDetalhes from "./pages/loja_fisica/mesas/MesaDetalhes";
import PedidosRecebidos from "./pages/loja_fisica/pedidos/PedidosRecebidos";
import PedidosOnline from "./pages/loja_fisica/pedidos/PedidosOnline";

// Loja Online
import LayoutDaLoja from "./components/barra_navegacao/layout_da_loja";
import Loja from "./pages/loja/Loja";
import Produtos from "./pages/loja/Produtos";
import Historico from "./pages/loja/Historico";
import Favoritos from "./pages/loja/Favoritos";
import Avaliacoes from "./pages/loja/Avaliacoes";
import Checkout from "./pages/loja/Checkout";
import PedidoConfirmado from "./pages/loja/PedidoConfirmado";
import ProdutoDetalhe from "./pages/loja/ProdutoDetalhe";

// Chame a função para redefinir o localStorage
//import { resetLocalStorage } from './data/produto_storage';
//resetLocalStorage();

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <AuthProvider>
        <CarrinhoProvider>
          <FavoritosProvider>
            <AvaliacoesProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <ScrollToTop />
                  <div className="flex flex-col min-h-screen">
                    <Navbar />
                    <main className="flex-grow pt-16">
                      <Routes>
                        {/* Public Routes */}
                        <Route path="/" element={<Index />} />
                        <Route path="/menu" element={<Menu />} />
                        <Route path="/sobre" element={<Sobre />} />
                        <Route path="/contato" element={<Contato />} />
                        
                        {/* Authentication Routes */}
                        <Route path="/login" element={<LoginForm />} />
                        <Route path="/register" element={<RegisterForm />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        
                        {/* Loja Física Routes (Protected) */}
                        <Route path="/loja-fisica" element={
                          <ProtectedRoute requiredUserType="physical">
                            <LayoutLojaFisica />
                          </ProtectedRoute>
                        }>
                          <Route index element={<LojaFisicaIndex />} />
                          <Route path="produtos" element={<ListarProdutos />} />
                          <Route path="produtos/:slug" element={<ListarProdutos />} />
                          <Route path="empresas" element={<EmpresaList />} />
                          <Route path="empresas/cadastro" element={<EmpresaCadastro />} />
                          <Route path="empresas/:id" element={<EmpresaDetail />} />
                          <Route path="estoque" element={<EstoqueList />} />
                          <Route path="mesas" element={<MesasPage />} />
                          <Route path="mesas/:slug" element={<MesaDetalhes />} />
                          <Route path="categorias" element={<CategoriaList />} />
                          <Route path="pedidos-online" element={<PedidosOnline />} />
                          <Route path="pedidos-recebidos" element={<PedidosRecebidos />} />
                        </Route>
                        
                        {/* Loja Online Routes (Protected) */}
                        <Route path="/loja" element={
                          <ProtectedRoute requiredUserType="online">
                            <LayoutDaLoja>
                              <Loja />
                            </LayoutDaLoja>
                          </ProtectedRoute>
                        } />
                        <Route path="/produtos" element={
                          <ProtectedRoute requiredUserType="online">
                            <LayoutDaLoja>
                              <Produtos />
                            </LayoutDaLoja>
                          </ProtectedRoute>
                        } />
                        <Route path="/produto/:slug" element={
                          <ProtectedRoute requiredUserType="online">
                            <LayoutDaLoja>
                              <ProdutoDetalhe />
                            </LayoutDaLoja>
                          </ProtectedRoute>
                        } />
                        <Route path="/historico" element={
                          <ProtectedRoute requiredUserType="online">
                            <LayoutDaLoja>
                              <Historico />
                            </LayoutDaLoja>
                          </ProtectedRoute>
                        } />
                        <Route path="/favoritos" element={
                          <ProtectedRoute requiredUserType="online">
                            <LayoutDaLoja>
                              <Favoritos />
                            </LayoutDaLoja>
                          </ProtectedRoute>
                        } />
                        <Route path="/avaliacoes" element={
                          <ProtectedRoute requiredUserType="online">
                            <LayoutDaLoja>
                              <Avaliacoes />
                            </LayoutDaLoja>
                          </ProtectedRoute>
                        } />
                        
                        {/* Checkout Routes */}
                        <Route path="/checkout" element={
                          <ProtectedRoute requiredUserType="online">
                            <LayoutDaLoja>
                              <Checkout />
                            </LayoutDaLoja>
                          </ProtectedRoute>
                        } />
                        <Route path="/pedido-confirmado" element={
                          <ProtectedRoute requiredUserType="online">
                            <LayoutDaLoja>
                              <PedidoConfirmado />
                            </LayoutDaLoja>
                          </ProtectedRoute>
                        } />

                        {/* Not Found Route */}
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </main>
                    <Footer />
                  </div>
                </BrowserRouter>
              </TooltipProvider>
            </AvaliacoesProvider>
          </FavoritosProvider>
        </CarrinhoProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
