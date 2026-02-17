import React, { useState } from "react";
import { motion } from "framer-motion";
import Breadcrumb from "../../components/Breadcrumbs/Breadcrumb";
import ProductCard from "../../components/Shop/ProductCard";
import CartDrawer from "../../components/Shop/CartDrawer";


export interface Product {
  id: number;
  name: string;
  price: number;
  discount?: number;
  image: string;
  bestSeller?: boolean;
}

const defaultProducts: Product[] = [
  {
    id: 1,
    name: "Official Jersey",
    price: 25000,
    discount: 10,
    bestSeller: true,
    image: "/product/im1.jpg",
  },
  {
    id: 2,
    name: "Training Kit",
    price: 18000,
    image: "/product/im2.jpg",
  },
  {
    id: 3,
    name: "Fan Scarf",
    price: 10000,
    discount: 15,
    image: "/product/im3.jpg",
  },
];

const Eshop: React.FC = () => {
  const [products] = useState<Product[]>(defaultProducts);
  const [cart, setCart] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlist, setWishlist] = useState<number[]>([]);

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddToCart = (product: Product) => {
    setCart((prev) => [...prev, product]);
    setCartOpen(true);
  };

  const toggleWishlist = (id: number) => {
    setWishlist((prev) =>
      prev.includes(id)
        ? prev.filter((w) => w !== id)
        : [...prev, id]
    );
  };

  return (
    <>
      <Breadcrumb pageName="E-Shop" />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-6 rounded-sm border border-stroke bg-white shadow-default dark:bg-boxdark dark:border-strokedark"
      >
        {/* SEARCH */}
        <div className="mb-6 flex justify-between items-center">
          <input
            type="text"
            placeholder="Search product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-lg border px-4 py-2 w-72"
          />

          <button
            onClick={() => setCartOpen(true)}
            className="bg-blue-900 text-white px-4 py-2 rounded-lg"
          >
            Cart ({cart.length})
          </button>
        </div>

        {/* PRODUCT GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={() => handleAddToCart(product)}
              onWishlist={() => toggleWishlist(product.id)}
              isWishlisted={wishlist.includes(product.id)}
            />
          ))}
        </div>
      </motion.div>

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        cart={cart}
      />
    </>
  );
};

export default Eshop;
