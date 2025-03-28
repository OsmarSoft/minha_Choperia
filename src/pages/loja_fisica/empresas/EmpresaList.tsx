
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';

const EmpresaList = () => {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-brewery-dark-brown">Fornecedores</h1>
        <Link to="/loja-fisica/empresas/cadastro">
          <Button className="flex items-center gap-2">
            <Plus size={16} />
            Novo Fornecedor
          </Button>
        </Link>
      </div>
      
      <div className="bg-white rounded-lg p-6">
        <p className="text-gray-500 text-center py-8">
          Implementação futura: Lista de fornecedores
        </p>
      </div>
    </div>
  );
};

export default EmpresaList;
