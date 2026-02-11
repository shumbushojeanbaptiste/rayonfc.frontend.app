import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../../api";
import { toast } from "react-toastify";

const ResetPasswordToken = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Email is required");
      return;
    }

    try {
      setLoading(true);

      const res = await api.post("/api/accounts/pwd/reset/token", {
        email,
      });

      if (res.data?.success) {
        toast.success("Password reset token sent to your email");

        // 👉 redirect to reset-password page (or verification page)
        navigate(`/auth/reset-password?email=${encodeURIComponent(email)}`);
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
    <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-boxdark">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="p-10 bg-slate-100 dark:bg-black rounded-xl shadow-lg w-full max-w-md"
      >
        <h1 className="text-2xl font-bold mb-6 text-center dark:text-slate-300">
          Reset Your Password
        </h1>

        <p className="text-sm text-center mb-6 text-slate-500">
          Enter your email address and we’ll send you a reset code.
        </p>

        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div className="mb-6">
            <label className="block mb-2 text-sm font-medium dark:text-slate-300">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full rounded-lg border border-stroke bg-transparent py-3 px-4 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-slate-300"
              required
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white p-4 rounded-lg disabled:opacity-60"
          >
            {loading ? "Sending..." : "Send Reset Token"}
          </motion.button>

              <div className="mt-6 text-center">
                  <p>
                    Already have an account?{" "}
                    <Link to="/auth/signin" className="text-blue-900 dark:text-gray-200">
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
