import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, ArrowLeft, Star } from "lucide-react";
import Breadcrumb from "../../components/Breadcrumbs/Breadcrumb";
import { Product } from "./Eshop";
import { useCart } from "./context/CartContext";
import CartDrawer from "../../components/Shop/CartDrawer";

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

const ProductDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const product = defaultProducts.find(p => p.id === Number(id));

  const [quantity, setQuantity] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  if (!product) return <div className="p-10">Product not found</div>;

  const finalPrice = product.discount
    ? product.price - (product.price * product.discount) / 100
    : product.price;

  const totalPrice = finalPrice * quantity;

  const images = [
    product.image,
    product.image,
    product.image,
  ];

  const relatedProducts = defaultProducts.filter(p => p.id !== product.id);

  return (
    <>
      <Breadcrumb pageName={product.name} />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-6 rounded-sm border bg-white dark:bg-boxdark"
      >
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-6 text-sm"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

          {/* 🖼 IMAGE GALLERY */}
          <div>
            <img
              src={images[activeImage]}
              className="rounded-xl w-full h-96 object-cover"
              alt=""
            />

            <div className="flex gap-3 mt-4">
              {images.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  onClick={() => setActiveImage(index)}
                  className={`h-20 w-20 object-cover rounded cursor-pointer border ${
                    activeImage === index ? "border-blue-900" : ""
                  }`}
                />
              ))}
            </div>
          </div>

          {/* DETAILS */}
          <div>
            {product.bestSeller && (
              <span className="bg-red-600 text-white px-3 py-1 text-xs rounded">
                🔥 Best Seller
              </span>
            )}

            <h2 className="text-3xl font-bold mt-4">{product.name}</h2>

            {/* ⭐ RATING */}
            <div className="flex items-center gap-1 mt-3">
              {[1,2,3,4,5].map((star) => (
                <Star key={star} size={18} fill="gold" stroke="none" />
              ))}
              <span className="text-sm text-gray-500">(24 reviews)</span>
            </div>

            {/* 📦 STOCK */}
            <p className="mt-3 text-green-600 font-medium">
              In Stock
            </p>

            {/* PRICE */}
            <div className="mt-6">
              {product.discount && (
                <p className="line-through text-gray-400">
                  {product.price.toLocaleString()} RWF
                </p>
              )}
              <p className="text-2xl font-bold">
                {finalPrice.toLocaleString()} RWF
              </p>
            </div>

            {/* QUANTITY */}
            <div className="mt-4 flex gap-4 items-center">
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity(q => q + 1)}>+</button>
            </div>

            <p className="mt-2 font-semibold">
              Total: {totalPrice.toLocaleString()} RWF
            </p>

            {/* ACTIONS */}
            <div className="flex gap-4 mt-6">
              <button
                onClick={() => {
                  addToCart(product, quantity);
                  setCartOpen(true);
                }}
                className="flex-1 bg-blue-900 text-white py-3 rounded-lg"
              >
                Add to Cart
              </button>

              <button
                onClick={() => setWishlisted(!wishlisted)}
                className="border p-3 rounded-lg"
              >
                <Heart fill={wishlisted ? "red" : "none"} />
              </button>
            </div>
          </div>
        </div>

        {/* 🔄 RELATED PRODUCTS */}
        <div className="mt-14">
          <h3 className="text-xl font-bold mb-6">Related Products</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedProducts.map(p => (
              <div key={p.id} className="border rounded-xl p-4">
                <img src={p.image} className="h-40 w-full object-cover rounded" />
                <h4 className="mt-3 font-semibold">{p.name}</h4>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        cart={useCart().cart}
      />
    </>
  );
};

export default ProductDetails;
