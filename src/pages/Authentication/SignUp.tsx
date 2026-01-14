import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Breadcrumb from "../../components/Breadcrumbs/Breadcrumb";
import LogoDark from '../../images/logo/logo2.png';
import Logo from '../../images/logo/logo2.png';
import { User, Mail } from "lucide-react";
import api from "../../api";

const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const [textFields, setTextFields] = useState({
    first_name: "",
    last_name: "",
    email: "",
  });

  const validate = () => {
    const newErrors: any = {};
    if (!textFields.first_name.trim()) newErrors.first_name = "First name is required";
    if (!textFields.last_name.trim()) newErrors.last_name = "Last name is required";
    if (!textFields.email.trim()) newErrors.email = "Email is required";
    return newErrors;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTextFields({ ...textFields, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validate();
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;

    try {
      setLoading(true);

      const payload = {
        first_name: textFields.first_name,
        last_name: textFields.last_name,
        email: textFields.email,
      };

      const res = await api.post("/api/accounts/new_account", payload);

      // ✅ Save JWT & user info to localStorage for persistent login
      if (res.data?.jwt && res.data?.user) {
        localStorage.setItem("token", res.data.jwt);
        localStorage.setItem("user", JSON.stringify(res.data.user));
      }

      // 👉 Redirect to Verify page after successful registration
      navigate(`/auth/verify?email=${encodeURIComponent(textFields.email)}`);
    } catch (error: any) {
      console.error(error);
      alert(error?.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const nameFields = [
    { label: "First Name", name: "first_name" },
    { label: "Last Name", name: "last_name" },
  ] as const;

  return (
    <>
      <Breadcrumb pageName="Sign Up" />

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
              <p className="2xl:px-20">Create your free account to get started.</p>
            </div>
          </div>

          <div className="w-full border-stroke dark:border-strokedark xl:w-1/2 xl:border-l-2">
            <div className="w-full p-4 sm:p-12.5 xl:p-17.5">
              <h2 className="mb-9 text-2xl font-bold text-black dark:text-white sm:text-title-xl2">
                Sign Up
              </h2>

              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-4">
                  {nameFields.map((field) => (
                    <div key={field.name}>
                      <div className="relative mb-2.5">
                        <input
                          type="text"
                          name={field.name}
                          value={textFields[field.name]}
                          onChange={handleChange}
                          className="peer w-full rounded-lg border border-stroke bg-transparent py-4 pl-12 pr-4 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                          required
                        />
                        <label className="floating-label">{field.label}</label>
                        <User className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                      </div>
                      {errors[field.name] && (
                        <p className="text-red-500 text-sm">{errors[field.name]}</p>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-4 mb-4">
                  <div className="relative">
                    <input
                      type="email"
                      name="email"
                      value={textFields.email}
                      onChange={handleChange}
                      className="peer w-full rounded-lg border border-stroke bg-transparent py-4 pl-12 pr-4 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                      required
                    />
                    <label className="floating-label">Email</label>
                    <Mail className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                  </div>
                  {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-950 text-white p-4 rounded-lg mt-4 disabled:opacity-60"
                >
                  {loading ? "Creating..." : "Create Account"}
                </motion.button>

                <div className="mt-6 text-center">
                  <p>
                    Already have an account?{" "}
                    <Link to="/auth/signin" className="text-gray-200">
                      Sign In
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

export default SignUp;
