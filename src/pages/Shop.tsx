import { ProductCard } from '@/components/ProductCard';
import { products } from '@/data/products';
import { useStore } from '@/context/StoreContext';
import { Sparkles } from 'lucide-react';

const Shop = () => {
  const { orders, config, discountCodes } = useStore();
  
  const ordersUntilDiscount = config.nthOrderForDiscount - (orders.length % config.nthOrderForDiscount);
  const unusedCodes = discountCodes.filter(c => !c.used);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-secondary to-background py-16 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
            Thoughtfully Made
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
            Sustainable essentials crafted with intention. Each piece designed to last.
          </p>
          
          {/* Discount Banner */}
          <div className="inline-flex items-center gap-2 bg-accent/20 text-accent-foreground px-4 py-2 rounded-full text-sm font-medium">
            <Sparkles className="h-4 w-4 text-accent" />
            {unusedCodes.length > 0 ? (
              <span>You have {unusedCodes.length} discount code(s) available!</span>
            ) : (
              <span>
                {ordersUntilDiscount === config.nthOrderForDiscount 
                  ? `Every ${config.nthOrderForDiscount}rd order earns a ${config.discountPercentage}% discount!`
                  : `${ordersUntilDiscount} order${ordersUntilDiscount > 1 ? 's' : ''} until your next discount!`}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Shop;
