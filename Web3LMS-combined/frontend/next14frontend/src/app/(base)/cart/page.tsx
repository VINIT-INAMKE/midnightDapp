"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "@/providers/CartProvider";
import {
  Trash2,
  ArrowRight,
  ShoppingCart,
  Home,
  User,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import apiInstance from "@/utils/axios";
import CartId from "@/views/plugins/CartId";
import Toast from "@/views/plugins/Toast";
import Swal from "sweetalert2";
import UserData from "@/views/plugins/UserData";

interface CartItem {
  id: string;
  price: number;
  course: {
    title: string;
    image: string;
  };
}

interface CartStats {
  price?: number;
  tax?: number;
  total?: number;
}

interface BioData {
  full_name: string;
  email: string;
  country: string;
}

const Cart = () => {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartStats, setCartStats] = useState<CartStats>({});
  const [loading, setLoading] = useState(true);
  const { refreshCart } = useCart();
  const [bioData, setBioData] = useState<BioData>({
    full_name: "",
    email: "",
    country: "",
  });
  const userId = UserData()?.user_id || 0;

  const fetchCartItems = useCallback(async () => {
    try {
      const [cartRes, statsRes] = await Promise.all([
        apiInstance.get<CartItem[]>(`course/cart-list/${CartId()}/`),
        apiInstance.get<CartStats>(`cart/stats/${CartId()}/`),
      ]);
      setCart(cartRes.data);
      setCartStats(statsRes.data);
      await refreshCart();
    } catch (error) {
      console.error("Error fetching cart:", error);
    } finally {
      setLoading(false);
    }
  }, [refreshCart]);

  const handleRemoveItem = async (itemId: string) => {
    try {
      await apiInstance.delete(
        `course/cart-item-delete/${CartId()}/${itemId}/`
      );
      setCart((prev) => prev.filter((item) => item.id !== itemId));
      await fetchCartItems();
      Toast().fire({ title: "Removed From Cart", icon: "success" });
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  const handleBioDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBioData({
      ...bioData,
      [e.target.name]: e.target.value,
    });
  };

  const createOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bioData.full_name || !bioData.email || !bioData.country) {
      Toast().fire({
        icon: "warning",
        title: "Please fill all required fields",
      });
      return;
    }
    const cartId = CartId();
    if (!cartId) {
      Swal.fire({ icon: "error", title: "Cart ID not found" });
      return;
    }

    if (!userId) {
      Swal.fire({ icon: "error", title: "User authentication required" });
      return;
    }

    const formData = new FormData();
    formData.append("full_name", bioData.full_name);
    formData.append("email", bioData.email);
    formData.append("country", bioData.country);
    formData.append("cart_id", cartId);
    formData.append("user_id", userId.toString());

    try {
      const response = await apiInstance.post<{ order_oid: string }>(
        "order/create-order/",
        formData
      );
      router.push(`/checkout/${response.data.order_oid}`);
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Order creation failed",
      });
    }
  };

  useEffect(() => {
    fetchCartItems();
  }, [fetchCartItems]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-7xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8 space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Your Shopping Cart</h1>
          <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground flex items-center transition-colors">
              <Home className="h-4 w-4 mr-1" />
              Home
            </Link>
            <span>/</span>
            <span className="text-foreground">Cart</span>
          </nav>
        </div>

        <form onSubmit={createOrder}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Profile Section */}
              <Card className="bg-card backdrop-blur-sm rounded-xl shadow-lg border border-border">
                <CardHeader className="text-lg font-semibold border-b border-border">
                  <div className="flex items-center space-x-2 text-foreground">
                    <User className="h-5 w-5" />
                    <span>Personal Information</span>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-foreground" htmlFor="full_name">Full Name *</Label>
                      <Input
                        id="full_name"
                        name="full_name"
                        value={bioData.full_name}
                        onChange={handleBioDataChange}
                        placeholder="Enter your full name"
                        className="border-input bg-background focus:ring-secondary"
                        required
                      />
                    </div>

                    <div>
                      <Label className="text-foreground" htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        name="email"
                        value={bioData.email}
                        onChange={handleBioDataChange}
                        placeholder="your.email@example.com"
                        className="border-input bg-background focus:ring-secondary"
                        required
                      />
                    </div>

                    <div>
                      <Label className="text-foreground" htmlFor="country">Country *</Label>
                      <Input
                        id="country"
                        name="country"
                        value={bioData.country}
                        onChange={handleBioDataChange}
                        placeholder="Enter your country"
                        className="border-input bg-background focus:ring-secondary"
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Cart Items */}
              <Card className="bg-card backdrop-blur-sm rounded-xl shadow-lg border border-border">
                <CardHeader className="text-lg font-semibold border-b border-border text-foreground">
                  Your Courses ({cart.length})
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  {loading ? (
                    Array(3)
                      .fill(0)
                      .map((_, i) => (
                        <div
                          key={i}
                          className="flex items-center space-x-4 p-4"
                        >
                          <Skeleton className="h-20 w-28 rounded-lg bg-muted" />
                          <div className="space-y-2 flex-1">
                            <Skeleton className="h-4 w-[200px] bg-muted" />
                            <Skeleton className="h-4 w-[100px] bg-muted" />
                          </div>
                          <Skeleton className="h-10 w-10 rounded-full bg-muted" />
                        </div>
                      ))
                  ) : cart.length === 0 ? (
                    <Alert className="bg-muted/30 border-border">
                      <AlertDescription className="text-center py-8">
                        <div className="space-y-4">
                          <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground" />
                          <p className="text-muted-foreground">Your cart is empty</p>
                          <Button asChild variant="outline" className="border-secondary text-secondary hover:bg-secondary/10">
                            <Link href="/courses" className="space-x-2">
                              <span>Browse Courses</span>
                              <ArrowRight className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </AlertDescription>
                    </Alert>
                  ) : (
                    cart.map((item) => (
                      <div
                        key={item.id}
                        className="group flex items-center justify-between p-4 hover:bg-muted/30 rounded-lg transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="relative h-20 w-28 rounded-lg overflow-hidden border border-border">
                            <Image
                              src={item.course.image}
                              alt={item.course.title}
                              fill
                              className="object-cover"
                              placeholder="blur"
                              blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkqAcAAIUAgUW0RjgAAAAASUVORK5CYII="
                            />
                          </div>
                          <div>
                            <h3 className="font-medium text-foreground hover:text-secondary transition-colors">
                              {item.course.title}
                            </h3>
                            <Badge variant="outline" className="mt-2 border-secondary/50 text-secondary">
                              ₹ {item.price}
                            </Badge>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => handleRemoveItem(item.id)}
                          type="button"
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Order Summary */}
            <div className="space-y-6">
              <Card className="sticky top-6 bg-card backdrop-blur-sm rounded-xl shadow-lg border border-border">
                <CardHeader className="text-lg font-semibold border-b border-border text-foreground">
                  Order Summary
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal:</span>
                    <span className="font-medium text-foreground">
                      ₹ {cartStats.price?.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Tax:</span>
                    <span className="font-medium text-foreground">
                      ₹ {cartStats.tax?.toFixed(2)}
                    </span>
                  </div>
                  <Separator className="my-4 bg-border" />
                  <div className="flex justify-between font-semibold text-foreground">
                    <span>Total:</span>
                    <span className="text-secondary text-xl">
                      ₹ {cartStats.total?.toFixed(2)}
                    </span>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                  <Button
                    type="submit"
                    className="w-full h-12 text-lg bg-primary text-primary-foreground hover:bg-primary/90 shadow-md transition-all"
                  >
                    Complete Checkout
                  </Button>
                  <p className="text-sm text-center text-muted-foreground">
                    Secure payment processing powered by blockchain technology
                  </p>
                </CardFooter>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Cart;