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

  const isStrongPassword = (password: string) => {
    const hasAlphabet = /[A-Za-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[^A-Za-z0-9]/.test(password);

    return (
      password.length >= 6 &&
      hasAlphabet &&
      hasNumber &&
      hasSpecialChar
    );
  };

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

    const emailOrPhone = email.trim();
    const verificationCode = code.trim();
    const userPassword = password.trim();

    if (!emailOrPhone || !verificationCode || !userPassword) {
      toast.error("All fields are required");
      return;
    }

    if (!isStrongPassword(userPassword)) {
      toast.error(
        "Password must be at least 6 characters and include a letter, number, and special character"
      );
      return;
    }

    try {
      setLoading(true);

      await api.post("/api/accounts/verify-email", {
        email: emailOrPhone,
        token: verificationCode,
        password: userPassword,
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
      <div className="flex h-screen items-center justify-center text-slate-300">
        <p>Loading verification…</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100 dark:bg-boxdark">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md rounded-xl bg-slate-100 p-10 shadow-lg dark:bg-black"
      >
        <h1 className="mb-6 text-center text-2xl font-bold dark:text-slate-300">
          Verify Your Account
        </h1>

        <form onSubmit={handleConfirm}>
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium dark:text-slate-300">
              Email or Phone
            </label>

            <input
              type="text"
              value={email}
              disabled
              className="w-full rounded-lg border border-stroke bg-gray-100 px-4 py-3 text-black dark:border-form-strokedark dark:bg-form-input dark:text-slate-300"
            />
          </div>

          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium dark:text-slate-300">
              Verification Code
            </label>

            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter verification code"
              className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 text-center text-black tracking-widest outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-slate-300"
              required
            />
          </div>

          <div className="mb-2">
            <label className="mb-2 block text-sm font-medium dark:text-slate-300">
              Create Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Example: Pass@123"
              className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-slate-300"
              required
            />
          </div>

          <p className="mb-6 text-xs text-slate-500 dark:text-slate-400">
            Password must be at least 6 characters and include a letter, number,
            and special character.
          </p>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-900 p-4 text-slate-200 disabled:opacity-60 dark:text-white"
          >
            {loading ? "Confirming..." : "Confirm & Activate Account"}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default Verify;