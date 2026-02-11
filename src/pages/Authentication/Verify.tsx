import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../../api";
import { toast } from "react-toastify";

const Verify = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get("email");

    if (!emailParam) {
      toast.error("Invalid verification link");
      navigate("/auth/signup");
      return;
    }

    setEmail(emailParam);
    setInitialized(true);
  }, [navigate]);

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !code || !password) {
      toast.error("All fields are required");
      return;
    }

    try {
      setLoading(true);

      await api.post("/api/accounts/verify-email", {
        email,
        token: code,
        password,
      });

      toast.success("Account verified successfully!");
      navigate("/auth/signin");
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  if (!initialized) {
    return (
      <div className="flex items-center justify-center h-screen text-slate-300">
        <p>Loading verification…</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-boxdark">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="p-10 bg-slate-100 dark:bg-black rounded-xl shadow-lg w-full max-w-md"
      >
        <h1 className="text-2xl font-bold mb-6 text-center dark:text-slate-300">
          Verify Your Account
        </h1>

        <form onSubmit={handleConfirm}>
          {/* Email */}
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium dark:text-slate-300">
              Email
            </label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full rounded-lg border border-stroke bg-gray-100 py-3 px-4 text-black dark:border-form-strokedark dark:bg-form-input dark:text-slate-300"
            />
          </div>

          {/* Verification Code */}
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium dark:text-slate-300">
              Verification Code
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter code sent to your email"
              className="w-full rounded-lg border border-stroke bg-transparent py-3 px-4 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-slate-300 text-center tracking-widest"
              required
            />
          </div>

          {/* Password */}
          <div className="mb-6">
            <label className="block mb-2 text-sm font-medium dark:text-slate-300">
              Create Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-stroke bg-transparent py-3 px-4 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-slate-300"
              required
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full bg-blue-900 text-slate-200 dark:text-black p-4 rounded-lg disabled:opacity-60"
          >
            {loading ? "Confirming..." : "Confirm & Activate Account"}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default Verify;
