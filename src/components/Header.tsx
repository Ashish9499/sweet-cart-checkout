import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Settings } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { Badge } from '@/components/ui/badge';

export const Header = () => {
  const { cartItemCount } = useStore();
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold tracking-tight text-foreground">
            UniBloxzon
          </span>
        </Link>

        <nav className="flex items-center space-x-6">
          <Link
            to="/"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              location.pathname === '/' ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            Shop
          </Link>
          <Link
            to="/admin"
            className={`flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-primary ${
              location.pathname === '/admin' ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <Settings className="h-4 w-4" />
            Admin
          </Link>
          <Link
            to="/cart"
            className="relative flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-primary"
          >
            <ShoppingBag className="h-5 w-5" />
            {cartItemCount > 0 && (
              <Badge
                variant="default"
                className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
              >
                {cartItemCount}
              </Badge>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
};
