import { X } from "lucide-react";

import { useNavigate } from "react-router-dom";
import { Product } from "../../pages/Shop/Eshop";

interface Props {
  open: boolean;
  onClose: () => void;
  cart: Product[];
}

const CartDrawer: React.FC<Props> = ({ open, onClose, cart }) => {
  const navigate = useNavigate();

  const total = cart.reduce((sum, item) => {
    const price = item.discount
      ? item.price - (item.price * item.discount) / 100
      : item.price;
    return sum + price;
  }, 0);

  return (
    <div className={`fixed top-0 right-0 h-full w-80 bg-white shadow-lg transform transition ${open ? "translate-x-0" : "translate-x-full"}`}>
      <div className="p-4 flex justify-between items-center border-b">
        <h3 className="font-bold">Cart</h3>
        <X onClick={onClose} className="cursor-pointer" />
      </div>

      <div className="p-4 space-y-3">
        {cart.map((item, i) => (
          <div key={i} className="flex justify-between text-sm">
            <span>{item.name}</span>
            <span>{item.price.toLocaleString()} RWF</span>
          </div>
        ))}
      </div>

      <div className="p-4 border-t">
        <div className="flex justify-between font-bold">
          <span>Total</span>
          <span>{total.toLocaleString()} RWF</span>
        </div>

        <button
          onClick={() => navigate("/checkout")}
          className="mt-4 w-full bg-blue-900 text-white p-2 rounded"
        >
          Checkout
        </button>
      </div>
    </div>
  );
};

export default CartDrawer;
