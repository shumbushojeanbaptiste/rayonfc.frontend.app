import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { Product } from "../../pages/Shop/Eshop";

interface Props {
  product: Product;
  onAddToCart: () => void;
  onWishlist: () => void;
  isWishlisted: boolean;
}

const ProductCard: React.FC<Props> = ({
  product,
  onAddToCart,
  onWishlist,
  isWishlisted,
}) => {
  const finalPrice = product.discount
    ? product.price - (product.price * product.discount) / 100
    : product.price;

  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      className="relative border rounded-xl overflow-hidden shadow-sm"
    >
      {/* 🔗 CLICKABLE PRODUCT IMAGE + NAME */}
      <Link to={`/shop/${product.id}`}>
        <img
          src={product.image}
          alt={product.name}
          className="h-48 w-full object-cover"
        />
      </Link>

      <div className="p-4">
        <Link to={`/shop/${product.id}`}>
          <h3 className="font-semibold hover:text-blue-900 cursor-pointer">
            {product.name}
          </h3>
        </Link>

        {product.discount && (
          <p className="text-sm line-through text-gray-400">
            {product.price.toLocaleString()} RWF
          </p>
        )}

        <p className="font-bold text-blue-900">
          {finalPrice.toLocaleString()} RWF
        </p>

        <button
          onClick={onAddToCart}
          className="mt-3 w-full bg-blue-900 text-white p-2 rounded"
        >
          Add to Cart
        </button>

        <button
          onClick={onWishlist}
          className="absolute bottom-2 right-2 bg-white p-2 rounded-full shadow"
        >
          <Heart size={16} fill={isWishlisted ? "red" : "none"} />
        </button>
      </div>
    </motion.div>
  );
};

export default ProductCard;
