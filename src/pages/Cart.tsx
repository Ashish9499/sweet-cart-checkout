import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '@/context/StoreContext';
import { CartItem } from '@/components/CartItem';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, ShoppingBag, Tag, Check, X, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

const Cart = () => {
  const navigate = useNavigate();
  const { cart, cartTotal, checkout, validateDiscountCode, discountCodes } = useStore();
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<{ code: string; percentage: number } | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const unusedCodes = discountCodes.filter(c => !c.used);

  const handleApplyDiscount = () => {
    if (!discountCode.trim()) return;

    setIsValidating(true);
    // Simulate API delay
    setTimeout(() => {
      const result = validateDiscountCode(discountCode);
      if (result.valid) {
        setAppliedDiscount({ code: discountCode.toUpperCase(), percentage: result.percentage });
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
      setIsValidating(false);
    }, 500);
  };

  const handleRemoveDiscount = () => {
    setAppliedDiscount(null);
    setDiscountCode('');
  };

  const handleCheckout = () => {
    const result = checkout(appliedDiscount?.code);
    if (result.success) {
      if (result.newDiscountCode) {
        toast.success(result.message, {
          duration: 8000,
          icon: <Sparkles className="h-5 w-5 text-accent" />,
        });
      } else {
        toast.success(result.message);
      }
      navigate('/checkout-success', { 
        state: { 
          order: result.order,
          newDiscountCode: result.newDiscountCode 
        } 
      });
    } else {
      toast.error(result.message);
    }
  };

  const discountAmount = appliedDiscount 
    ? (cartTotal * appliedDiscount.percentage) / 100 
    : 0;
  const finalTotal = cartTotal - discountAmount;

  if (cart.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold text-foreground mb-2">Your cart is empty</h2>
        <p className="text-muted-foreground mb-6">Looks like you haven't added anything yet.</p>
        <Button asChild>
          <Link to="/">Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft className="h-4 w-4" />
        Continue Shopping
      </Link>

      <div className="grid lg:grid-cols-3 gap-12">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <h1 className="text-2xl font-bold text-foreground mb-6">
            Shopping Cart ({cart.length} item{cart.length > 1 ? 's' : ''})
          </h1>
          <div className="divide-y divide-border">
            {cart.map((item) => (
              <CartItem key={item.product.id} item={item} />
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-card rounded-xl p-6 border border-border sticky top-24">
            <h2 className="text-lg font-semibold text-foreground mb-4">Order Summary</h2>

            {/* Available Codes */}
            {unusedCodes.length > 0 && !appliedDiscount && (
              <div className="mb-4 p-3 bg-accent/10 rounded-lg">
                <p className="text-sm font-medium text-foreground mb-2">
                  Your discount codes:
                </p>
                <div className="flex flex-wrap gap-2">
                  {unusedCodes.map((code) => (
                    <button
                      key={code.code}
                      onClick={() => setDiscountCode(code.code)}
                      className="text-xs bg-accent text-accent-foreground px-2 py-1 rounded font-mono hover:opacity-80 transition-opacity"
                    >
                      {code.code}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Discount Code Input */}
            <div className="mb-6">
              <label className="text-sm font-medium text-foreground mb-2 block">
                Discount Code
              </label>
              {appliedDiscount ? (
                <div className="flex items-center justify-between bg-success/10 text-success px-3 py-2 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    <span className="font-mono text-sm">{appliedDiscount.code}</span>
                    <span className="text-xs">(-{appliedDiscount.percentage}%)</span>
                  </div>
                  <button onClick={handleRemoveDiscount}>
                    <X className="h-4 w-4 hover:opacity-70" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={discountCode}
                      onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                      placeholder="Enter code"
                      className="pl-10 font-mono uppercase"
                    />
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleApplyDiscount}
                    disabled={isValidating || !discountCode.trim()}
                  >
                    Apply
                  </Button>
                </div>
              )}
            </div>

            {/* Price Breakdown */}
            <div className="space-y-3 border-t border-border pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-foreground">${cartTotal.toFixed(2)}</span>
              </div>
              {appliedDiscount && (
                <div className="flex justify-between text-sm text-success">
                  <span>Discount ({appliedDiscount.percentage}%)</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span className="text-foreground">Free</span>
              </div>
              <div className="flex justify-between text-lg font-semibold border-t border-border pt-3">
                <span>Total</span>
                <span>${finalTotal.toFixed(2)}</span>
              </div>
            </div>

            <Button 
              onClick={handleCheckout} 
              className="w-full mt-6" 
              size="lg"
            >
              Checkout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
