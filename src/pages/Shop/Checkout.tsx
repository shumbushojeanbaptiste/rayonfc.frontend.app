const Checkout = () => {
  return (
    <div className="p-10">
      <h2 className="text-2xl font-bold mb-6">Checkout</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <input placeholder="Full Name" className="border p-3 rounded" />
        <input placeholder="Phone Number" className="border p-3 rounded" />
        <input placeholder="Address" className="border p-3 rounded col-span-2" />
      </div>

      <button className="mt-6 bg-green-600 text-white px-6 py-3 rounded">
        Place Order
      </button>
    </div>
  );
};

export default Checkout;
