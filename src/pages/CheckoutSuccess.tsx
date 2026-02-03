import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle, Sparkles, Copy } from 'lucide-react';
import { Order, DiscountCode } from '@/types/store';
import { toast } from 'sonner';

const CheckoutSuccess = () => {
  const location = useLocation();
  const { order, newDiscountCode } = (location.state as { order?: Order; newDiscountCode?: DiscountCode }) || {};

  const copyCode = () => {
    if (newDiscountCode) {
      navigator.clipboard.writeText(newDiscountCode.code);
      toast.success('Discount code copied to clipboard!');
    }
  };

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-md w-full text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success/10 mb-6">
          <CheckCircle className="h-8 w-8 text-success" />
        </div>

        <h1 className="text-3xl font-bold text-foreground mb-2">
          Order Confirmed!
        </h1>
        <p className="text-muted-foreground mb-6">
          Thank you for your purchase. Your order #{order?.id} has been placed successfully.
        </p>

        {order && (
          <div className="bg-card rounded-xl p-6 border border-border mb-6 text-left">
            <h3 className="font-semibold text-foreground mb-4">Order Details</h3>
            <div className="space-y-2 text-sm">
              {order.items.map((item) => (
                <div key={item.product.id} className="flex justify-between">
                  <span className="text-muted-foreground">
                    {item.product.name} × {item.quantity}
                  </span>
                  <span className="text-foreground">
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
              <div className="border-t border-border pt-2 mt-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground">${order.subtotal.toFixed(2)}</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-success">
                    <span>Discount ({order.discountCode})</span>
                    <span>-${order.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold text-lg mt-2">
                  <span>Total</span>
                  <span>${order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {newDiscountCode && (
          <div className="bg-accent/10 rounded-xl p-6 border border-accent/30 mb-6">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Sparkles className="h-5 w-5 text-accent" />
              <span className="font-semibold text-foreground">You earned a reward!</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Use this code on your next purchase for {newDiscountCode.percentage}% off:
            </p>
            <div className="flex items-center justify-center gap-2">
              <code className="bg-accent text-accent-foreground px-4 py-2 rounded-lg font-mono text-lg font-bold">
                {newDiscountCode.code}
              </code>
              <Button variant="ghost" size="icon" onClick={copyCode}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        <Button asChild>
          <Link to="/">Continue Shopping</Link>
        </Button>
      </div>
    </div>
  );
};

export default CheckoutSuccess;
