
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

export interface Beer {
  id: number;
  name: string;
  style: string;
  description: string;
  abv: number;
  ibu: number;
  image: string;
  price: number;
  rating: number;
}

interface BeerCardProps {
  beer: Beer;
  index: number;
}

const BeerCard: React.FC<BeerCardProps> = ({ beer, index }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 + 0.1 }}
      className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 card-hover h-full flex flex-col"
    >
      <div className="h-36 sm:h-40 md:h-48 overflow-hidden">
        <img 
          src={beer.image} 
          alt={beer.name}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
        />
      </div>
      
      <div className="p-4 sm:p-6 flex-grow flex flex-col">
        <div className="mb-3 sm:mb-4">
          <span className="inline-block px-2 py-1 bg-brewery-amber/10 text-brewery-amber text-xs font-medium rounded-full mb-2">
            {beer.style}
          </span>
          <h3 className="text-lg sm:text-xl font-brewery font-bold text-brewery-dark mb-1">{beer.name}</h3>
          <div className="flex items-center mb-2">
            <div className="flex text-yellow-500 mr-1">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  size={14} 
                  fill={i < Math.floor(beer.rating) ? "currentColor" : "none"} 
                  className={i < Math.floor(beer.rating) ? "text-yellow-500" : "text-gray-300"}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600">{beer.rating.toFixed(1)}</span>
          </div>
        </div>
        
        <p className="text-sm text-gray-600 mb-4 line-clamp-3 flex-grow">{beer.description}</p>
        
        <div className="flex justify-between items-center mt-auto">
          <div className="flex space-x-3 text-xs text-gray-500">
            <span>ABV: {beer.abv}%</span>
            <span>IBU: {beer.ibu}</span>
          </div>
          <div className="text-brewery-amber font-bold">
            R$ {beer.price.toFixed(2)}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default BeerCard;
