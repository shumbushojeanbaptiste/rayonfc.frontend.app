import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../../api";
import { toast } from "react-toastify";

const ResetPasswordToken = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const isEmail = (value: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  const isPhone = (value: string) => {
    const cleaned = value.replace(/\s/g, "");
    return /^\+?[0-9]{7,15}$/.test(cleaned);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailOrPhone = email.trim();

    if (!emailOrPhone) {
      toast.error("Email or phone is required");
      return;
    }

    if (!isEmail(emailOrPhone) && !isPhone(emailOrPhone)) {
      toast.error("Enter a valid email or phone number");
      return;
    }

    try {
      setLoading(true);

      const res = await api.post("/api/accounts/pwd/reset/token", {
        // Backend still expects email field
        email: emailOrPhone,
      });

      if (res.data?.success) {
        toast.success("Password reset token sent successfully");

        navigate(
          `/auth/reset-password?email=${encodeURIComponent(emailOrPhone)}`
        );
      }
    } catch (error: any) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || "Failed to send reset token"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100 dark:bg-boxdark">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md rounded-xl bg-slate-100 p-10 shadow-lg dark:bg-black"
      >
        <h1 className="mb-6 text-center text-2xl font-bold dark:text-slate-300">
          Reset Your Password
        </h1>

        <p className="mb-6 text-center text-sm text-slate-500">
          Enter your email or phone number and we’ll send you a reset code.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium dark:text-slate-300">
              Email or Phone
            </label>

            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email or phone"
              className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-slate-300"
              required
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 p-4 text-white disabled:opacity-60"
          >
            {loading ? "Sending..." : "Send Reset Token"}
          </motion.button>

          <div className="mt-6 text-center">
            <p>
              Already have an account?{" "}
              <Link
                to="/auth/signin"
                className="text-blue-900 dark:text-gray-200"
              >
                Sign In
              </Link>
            </p>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ResetPasswordToken;