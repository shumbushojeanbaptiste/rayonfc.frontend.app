import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Breadcrumb from "../../components/Breadcrumbs/Breadcrumb";
import LogoDark from "../../images/logo/logo2.png";
import Logo from "../../images/logo/logo2.png";
import { motion } from "framer-motion";
import { Mail, Phone, Lock } from "lucide-react";
import api from "../../api";

const SignIn: React.FC = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEmail = (value: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  const isPhone = (value: string) => {
    const cleaned = value.replace(/\s/g, "");
    return /^\+?[0-9]{7,15}$/.test(cleaned);
  };

  const validate = () => {
    const newErrors: any = {};
    const emailOrPhone = email.trim();

    if (!emailOrPhone) {
      newErrors.email = "Email or phone is required";
    } else if (!isEmail(emailOrPhone) && !isPhone(emailOrPhone)) {
      newErrors.email =
        "Enter a valid email or phone number. Example: test@gmail.com or 0789479288";
    }

    if (!password.trim()) {
      newErrors.password = "Password is required";
    }

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError(null);

    const validation = validate();
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;

    setLoading(true);

    try {
      const emailOrPhone = email.trim();

      const response = await api.post("/api/accounts/login", {
        // Phone OR email is sent inside email field
        email: emailOrPhone,
        password,
      });

      const result = response.data;

      if (!result.success) {
        throw new Error(result.message || "Login failed");
      }

      localStorage.setItem("token", result.data.jwt);
      localStorage.setItem("user", JSON.stringify(result.data));

      navigate("/", { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const emailOrPhone = email.trim();
  const showPhoneIcon = emailOrPhone && !emailOrPhone.includes("@");

  return (
    <>
      <Breadcrumb pageName="Sign In" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark"
      >
        <div className="flex flex-wrap items-center">
          <div className="hidden w-full xl:block xl:w-1/2">
            <div className="py-17.5 px-26 text-center">
              <Link className="mb-5.5 inline-block" to="/">
                <img className="hidden dark:block" src={Logo} alt="Logo" />
                <img className="dark:hidden" src={LogoDark} alt="Logo" />
              </Link>

              <p className="2xl:px-20">
                Login using your email or phone and password
              </p>
            </div>
          </div>

          <div className="w-full border-stroke dark:border-strokedark xl:w-1/2 xl:border-l-2">
            <div className="w-full p-4 sm:p-12.5 xl:p-17.5">
              <h2 className="mb-9 text-2xl font-bold text-black dark:text-white">
                Sign In
              </h2>

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="mb-2.5 block font-medium text-black dark:text-white">
                    Email or Phone
                  </label>

                  <div className="relative">
                    <input
                      type="text"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setErrors({ ...errors, email: "" });
                      }}
                      required
                      placeholder="Enter your email or phone"
                      className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-12 pr-6 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                    />

                    {showPhoneIcon ? (
                      <Phone className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                    ) : (
                      <Mail className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                    )}
                  </div>

                  {errors.email && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.email}
                    </p>
                  )}
                </div>

                <div className="mb-6">
                  <label className="mb-2.5 block font-medium text-black dark:text-white">
                    Password
                  </label>

                  <div className="relative">
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setErrors({ ...errors, password: "" });
                      }}
                      required
                      placeholder="Enter your password"
                      className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-12 pr-6 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                    />

                    <Lock className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                  </div>

                  {errors.password && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.password}
                    </p>
                  )}
                </div>

                <div className="mb-6 text-right">
                  <Link
                    to="/auth/reset-token"
                    className="text-sm text-blue-900 hover:underline dark:text-blue-600"
                  >
                    Forgot password?
                  </Link>
                </div>

                {error && (
                  <div className="mb-4 rounded bg-red-100 p-3 text-red-600">
                    {error}
                  </div>
                )}

                <div className="mb-5">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-lg bg-blue-900 p-4 text-white hover:bg-opacity-90 disabled:opacity-50 dark:bg-blue-600"
                  >
                    {loading ? "Signing in..." : "Sign In"}
                  </motion.button>
                </div>

                <div className="mt-6 text-center">
                  <p>
                    Don’t have an account?{" "}
                    <Link
                      to="/auth/signup"
                      className="text-blue-900 dark:text-gray-200"
                    >
                      Sign Up
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default SignIn;