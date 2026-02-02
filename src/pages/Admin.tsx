import { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingCart, 
  DollarSign, 
  Tag, 
  TrendingDown,
  RefreshCw,
  Copy,
  Check
} from 'lucide-react';
import { toast } from 'sonner';

const Admin = () => {
  const { getStats, generateDiscountCode, config, orders } = useStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const stats = getStats();

  const handleGenerateCode = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const result = generateDiscountCode();
      if (result.generated) {
        toast.success(result.message);
      } else {
        toast.info(result.message);
      }
      setIsGenerating(false);
    }, 500);
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success('Code copied to clipboard');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const ordersUntilDiscount = config.nthOrderForDiscount - (orders.length % config.nthOrderForDiscount);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Monitor store performance and manage discount codes
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Items Purchased
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {stats.totalItemsPurchased}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              ${stats.totalRevenue.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Discount Codes
            </CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {stats.discountCodes.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.discountCodes.filter(c => !c.used).length} unused
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Discounts Given
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              ${stats.totalDiscountsGiven.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Generate Code Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Generate Discount Code</CardTitle>
          <CardDescription>
            Discount codes are automatically generated every {config.nthOrderForDiscount} orders. 
            {orders.length > 0 && (
              <> Currently at order #{orders.length}. {ordersUntilDiscount} order(s) until next automatic code.</>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleGenerateCode} disabled={isGenerating}>
            {isGenerating ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Tag className="h-4 w-4 mr-2" />
            )}
            Generate Code
          </Button>
        </CardContent>
      </Card>

      {/* Discount Codes Table */}
      <Card>
        <CardHeader>
          <CardTitle>Discount Codes History</CardTitle>
          <CardDescription>
            All discount codes generated for the store
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stats.discountCodes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Tag className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No discount codes generated yet.</p>
              <p className="text-sm">Codes are generated automatically every {config.nthOrderForDiscount} orders.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Code</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Discount</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Created</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Order #</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground"></th>
                  </tr>
                </thead>
                <tbody>
                  {stats.discountCodes.map((code) => (
                    <tr key={code.code} className="border-b border-border last:border-0">
                      <td className="py-3 px-4">
                        <code className="font-mono text-sm bg-secondary px-2 py-1 rounded">
                          {code.code}
                        </code>
                      </td>
                      <td className="py-3 px-4 text-sm text-foreground">
                        {code.percentage}% off
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={code.used ? 'secondary' : 'default'}>
                          {code.used ? 'Used' : 'Active'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {new Date(code.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {code.orderId ? `#${code.orderId}` : '-'}
                      </td>
                      <td className="py-3 px-4">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => copyToClipboard(code.code)}
                          disabled={code.used}
                        >
                          {copiedCode === code.code ? (
                            <Check className="h-4 w-4 text-success" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Orders History */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>
            Last orders placed in the store
          </CardDescription>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ShoppingCart className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No orders yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Order #</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Items</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Subtotal</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Discount</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Total</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice().reverse().map((order) => (
                    <tr key={order.id} className="border-b border-border last:border-0">
                      <td className="py-3 px-4 font-medium">#{order.id}</td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {order.items.reduce((sum, item) => sum + item.quantity, 0)} items
                      </td>
                      <td className="py-3 px-4 text-sm text-foreground">
                        ${order.subtotal.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {order.discountCode ? (
                          <span className="text-success">
                            -{order.discountAmount.toFixed(2)} ({order.discountCode})
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm font-semibold text-foreground">
                        ${order.total.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Admin;
