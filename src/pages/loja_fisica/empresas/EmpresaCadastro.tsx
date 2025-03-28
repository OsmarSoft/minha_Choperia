
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const EmpresaCadastro = () => {
  return (
    <div>
      <div className="flex items-center mb-6">
        <Link to="/loja-fisica/empresas">
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowLeft size={16} />
            Voltar
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-brewery-dark-brown ml-2">
          Cadastrar Novo Fornecedor
        </h1>
      </div>
      
      <div className="bg-white rounded-lg p-6">
        <p className="text-gray-500 text-center py-8">
          Implementação futura: Formulário de cadastro de fornecedores
        </p>
      </div>
    </div>
  );
};

export default EmpresaCadastro;
