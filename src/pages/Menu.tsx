//src\pages\Menu.tsx
import { useEffect, useState } from 'react';
import BeerCard, { Beer } from '@/components/BeerCard';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';

// Sample beer catalog
const allBeers: Beer[] = [
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
  },
  {
    id: 4,
    name: "Weiss Banana",
    style: "Hefeweizen",
    description: "Cerveja de trigo com aromas característicos de banana e cravo. Refrescante e encorpada.",
    abv: 5.2,
    ibu: 15,
    image: "https://images.unsplash.com/photo-1600788886242-5c96aabe3757?q=80&w=2070&auto=format&fit=crop",
    price: 23.90,
    rating: 4.3
  },
  {
    id: 5,
    name: "Porter Café",
    style: "Porter",
    description: "Cerveja escura com notas de café, chocolate e caramelo. Corpo médio e final seco.",
    abv: 6.0,
    ibu: 30,
    image: "https://images.unsplash.com/photo-1518099074172-2e47ee6cfdc0?q=80&w=2069&auto=format&fit=crop",
    price: 25.90,
    rating: 4.6
  },
  {
    id: 6,
    name: "Stout Imperial",
    style: "Imperial Stout",
    description: "Cerveja preta, encorpada, com intensos aromas de chocolate, café e caramelo. Para momentos especiais.",
    abv: 8.5,
    ibu: 45,
    image: "https://images.unsplash.com/photo-1523567830207-96731740fa71?q=80&w=1974&auto=format&fit=crop",
    price: 29.90,
    rating: 4.9
  },
  {
    id: 7,
    name: "Belgian Blonde",
    style: "Belgian Ale",
    description: "Cerveja dourada de alta fermentação com aromas frutados e condimentados. Refrescante e complexa.",
    abv: 6.5,
    ibu: 22,
    image: "https://images.unsplash.com/photo-1567696911980-2eed69a46042?q=80&w=1974&auto=format&fit=crop",
    price: 27.90,
    rating: 4.4
  },
  {
    id: 8,
    name: "Session IPA",
    style: "Session IPA",
    description: "Uma IPA mais leve, com menor teor alcoólico, mantendo o aroma e sabor característicos do lúpulo.",
    abv: 4.2,
    ibu: 40,
    image: "https://images.unsplash.com/photo-1587582816472-81e94768469a?q=80&w=1965&auto=format&fit=crop",
    price: 21.90,
    rating: 4.2
  },
  {
    id: 9,
    name: "Sour Framboesa",
    style: "Berliner Weisse",
    description: "Cerveja ácida com adição de framboesas. Refrescante, com acidez pronunciada e final frutado.",
    abv: 3.8,
    ibu: 8,
    image: "https://images.unsplash.com/photo-1614086138969-5800227ac33c?q=80&w=1974&auto=format&fit=crop",
    price: 28.90,
    rating: 4.7
  }
];

// Beer styles for filtering
const beerStyles = [...new Set(allBeers.map(beer => beer.style))];

const Menu = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('');
  const [filteredBeers, setFilteredBeers] = useState(allBeers);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Filter beers based on search term and selected style
  useEffect(() => {
    let result = allBeers;
    
    if (searchTerm) {
      result = result.filter(beer => 
        beer.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        beer.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedStyle) {
      result = result.filter(beer => beer.style === selectedStyle);
    }
    
    setFilteredBeers(result);
  }, [searchTerm, selectedStyle]);

  return (
    <div className="bg-brewery-cream pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="mb-16 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl font-brewery font-bold text-brewery-dark mb-4"
          >
            Nosso Cardápio
          </motion.h1>
          <motion.div 
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "80px" }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="h-1 bg-brewery-amber mx-auto mb-6"
          ></motion.div>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-brewery-dark/70 max-w-2xl mx-auto"
          >
            Explore nossa seleção de cervejas artesanais, produzidas com os melhores ingredientes e técnicas tradicionais.
          </motion.p>
        </div>

        {/* Filters */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-10 flex flex-col md:flex-row justify-between gap-6"
        >
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Search size={18} className="text-brewery-dark/50" />
            </div>
            <input
              type="text"
              placeholder="Buscar cervejas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-3 w-full border border-brewery-brown/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-brewery-amber/50 bg-white"
            />
          </div>

          <div className="flex-1 max-w-xs">
            <select
              value={selectedStyle}
              onChange={(e) => setSelectedStyle(e.target.value)}
              className="w-full p-3 border border-brewery-brown/20 rounded-lg appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-brewery-amber/50"
            >
              <option value="">Todos os estilos</option>
              {beerStyles.map(style => (
                <option key={style} value={style}>{style}</option>
              ))}
            </select>
          </div>
        </motion.div>

        {/* Results */}
        {filteredBeers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredBeers.map((beer, index) => (
              <BeerCard key={beer.id} beer={beer} index={index} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-xl font-brewery font-semibold text-brewery-dark mb-2">Nenhuma cerveja encontrada</h3>
            <p className="text-brewery-dark/70">Tente ajustar seus filtros ou buscar outro termo.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Menu;

