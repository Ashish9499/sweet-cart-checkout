import React, { createContext, useContext, useState, useCallback } from 'react';
import { Product, CartItem, DiscountCode, Order, StoreStats, StoreConfig } from '@/types/store';

interface StoreContextType {
  // Cart
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartItemCount: number;

  // Orders & Discounts
  orders: Order[];
  discountCodes: DiscountCode[];
  config: StoreConfig;

  // APIs
  validateDiscountCode: (code: string) => { valid: boolean; percentage: number; message: string };
  checkout: (discountCode?: string) => { success: boolean; order?: Order; newDiscountCode?: DiscountCode; message: string };
  
  // Admin APIs
  generateDiscountCode: () => { generated: boolean; code?: DiscountCode; message: string };
  getStats: () => StoreStats;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const generateCodeString = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'SAVE';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [discountCodes, setDiscountCodes] = useState<DiscountCode[]>([]);
  const [config] = useState<StoreConfig>({
    nthOrderForDiscount: 3, // Every 3rd order gets a discount
    discountPercentage: 10, // 10% discount
  });

  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const addToCart = useCallback((product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const validateDiscountCode = useCallback((code: string): { valid: boolean; percentage: number; message: string } => {
    const discountCode = discountCodes.find(
      (dc) => dc.code === code.toUpperCase() && !dc.used
    );

    if (!discountCode) {
      return { valid: false, percentage: 0, message: 'Invalid or already used discount code.' };
    }

    return {
      valid: true,
      percentage: discountCode.percentage,
      message: `Discount code valid! ${discountCode.percentage}% off your order.`,
    };
  }, [discountCodes]);

  const checkout = useCallback((discountCode?: string): { success: boolean; order?: Order; newDiscountCode?: DiscountCode; message: string } => {
    if (cart.length === 0) {
      return { success: false, message: 'Cart is empty.' };
    }

    let discountAmount = 0;
    let appliedCode: string | undefined;

    // Validate discount code if provided
    if (discountCode) {
      const validation = validateDiscountCode(discountCode);
      if (validation.valid) {
        discountAmount = (cartTotal * validation.percentage) / 100;
        appliedCode = discountCode.toUpperCase();

        // Mark code as used
        setDiscountCodes((prev) =>
          prev.map((dc) =>
            dc.code === appliedCode ? { ...dc, used: true } : dc
          )
        );
      } else {
        return { success: false, message: validation.message };
      }
    }

    const orderId = orders.length + 1;
    const order: Order = {
      id: orderId,
      items: [...cart],
      subtotal: cartTotal,
      discountCode: appliedCode,
      discountAmount,
      total: cartTotal - discountAmount,
      createdAt: new Date(),
    };

    setOrders((prev) => [...prev, order]);
    clearCart();

    // Check if this order qualifies for a new discount code
    let newDiscountCode: DiscountCode | undefined;
    if (orderId % config.nthOrderForDiscount === 0) {
      newDiscountCode = {
        code: generateCodeString(),
        percentage: config.discountPercentage,
        used: false,
        createdAt: new Date(),
        orderId,
      };
      setDiscountCodes((prev) => [...prev, newDiscountCode!]);
    }

    return {
      success: true,
      order,
      newDiscountCode,
      message: newDiscountCode
        ? `Order placed successfully! 🎉 You've earned a ${config.discountPercentage}% discount code: ${newDiscountCode.code}`
        : 'Order placed successfully!',
    };
  }, [cart, cartTotal, orders.length, config, validateDiscountCode, clearCart]);

  // Admin API: Generate discount code manually if conditions are met
  const generateDiscountCode = useCallback((): { generated: boolean; code?: DiscountCode; message: string } => {
    const nextOrderNumber = orders.length + 1;
    const ordersUntilDiscount = config.nthOrderForDiscount - (orders.length % config.nthOrderForDiscount);

    if (ordersUntilDiscount === config.nthOrderForDiscount && orders.length > 0) {
      // Last order was a qualifying order, can generate
      const code: DiscountCode = {
        code: generateCodeString(),
        percentage: config.discountPercentage,
        used: false,
        createdAt: new Date(),
      };
      setDiscountCodes((prev) => [...prev, code]);
      return {
        generated: true,
        code,
        message: `New discount code generated: ${code.code} (${code.percentage}% off)`,
      };
    }

    return {
      generated: false,
      message: `Cannot generate code. ${ordersUntilDiscount} more order(s) needed until next discount eligibility.`,
    };
  }, [orders.length, config]);

  // Admin API: Get store statistics
  const getStats = useCallback((): StoreStats => {
    const totalItemsPurchased = orders.reduce(
      (sum, order) => sum + order.items.reduce((s, item) => s + item.quantity, 0),
      0
    );
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const totalDiscountsGiven = orders.reduce((sum, order) => sum + order.discountAmount, 0);

    return {
      totalItemsPurchased,
      totalRevenue,
      discountCodes: [...discountCodes],
      totalDiscountsGiven,
    };
  }, [orders, discountCodes]);

  return (
    <StoreContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartItemCount,
        orders,
        discountCodes,
        config,
        validateDiscountCode,
        checkout,
        generateDiscountCode,
        getStats,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = (): StoreContextType => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
