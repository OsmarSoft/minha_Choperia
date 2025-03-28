
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <div className="relative w-full h-full">
          {/* Overlay */}
          <div className="absolute inset-0 bg-brewery-dark/60 z-10"></div>
          
          {/* Background Image */}
          <img 
            src="https://images.unsplash.com/photo-1584225064785-c62a8b43d148?q=80&w=2074&auto=format&fit=crop"
            alt="Cerveja sendo servida" 
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 h-full flex items-center relative z-10 py-20 md:py-0">
        <div className="max-w-3xl">
          <motion.span 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-block px-3 py-1 bg-brewery-amber/90 text-white text-xs sm:text-sm font-medium rounded-full mb-4 sm:mb-6"
          >
            Desde 2010
          </motion.span>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-brewery font-bold text-white mb-4 sm:mb-6 leading-tight"
          >
            Cerveja Artesanal <br />
            <span className="text-brewery-amber">de Qualidade Superior</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-base sm:text-lg text-white/90 mb-6 sm:mb-8 max-w-xl"
          >
            Descubra o sabor autêntico das nossas cervejas artesanais, produzidas com ingredientes selecionados e técnicas tradicionais que resultam em uma experiência única.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="flex flex-wrap gap-3 sm:gap-4"
          >
            <Link to="/menu" className="btn-primary inline-flex items-center text-sm sm:text-base">
              Ver Menu
              <ArrowRight size={16} className="ml-2" />
            </Link>
            
            <Link to="/sobre" className="btn-outline bg-transparent inline-flex items-center border-white text-white hover:bg-white/10 text-sm sm:text-base">
              Nossa História
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Beer bubbles animation (decorative) */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden">
        {[...Array(6)].map((_, index) => (
          <div 
            key={index}
            className="beer-bubble"
            style={{
              width: `${Math.random() * 15 + 5}px`,
              height: `${Math.random() * 15 + 5}px`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${Math.random() * 3 + 3}s`
            }}
          ></div>
        ))}
      </div>
    </section>
  );
};

export default Hero;
