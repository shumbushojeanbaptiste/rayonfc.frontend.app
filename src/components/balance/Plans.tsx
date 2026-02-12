import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import SubscribePlanModal from "../../components/SubscribePlanModal";

interface Plan {
  plan_id: number;
  name: string;
  price: string;
  duration_days: number;
  description: string;
  status: number;
}

const Plans: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // ------------------------------------------
  // FETCH PLANS
  // ------------------------------------------
  const fetchPlans = async () => {
    try {
      if (token) {
        const response = await api.get("/api/accessible/subscription-status");

        if (response.data.success) {
          setSubscriptionStatus(response.data.data.subscription_status);
          setPlans(response.data.data.available_plans);
        }
      } else {
        const response = await api.get("/api/settings/planList");

        if (response.data.success) {
          setPlans(response.data.data.filter((p: Plan) => p.status === 1));
        }
      }
    } catch (error) {
      console.error("Failed to fetch plans");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, [token]);

  const isPopular = (name: string) =>
    name.toLowerCase() === "monthly";

  // ------------------------------------------
  // HANDLE PLAN CLICK
  // ------------------------------------------
  const handleSelectPlan = (plan: Plan) => {
    if (!token) {
      navigate("/auth/signin", { state: { from: "/plans" } });
      return;
    }

    if (subscriptionStatus === "active") {
      return;
    }

    setSelectedPlan(plan); // 🔥 Open modal instead of navigating
  };

  // ------------------------------------------
  // RENDER
  // ------------------------------------------
  return (
    <div className="py-16 px-6 bg-gray-50 dark:bg-boxdark min-h-screen">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-black dark:text-white">
          Choose Your Plan
        </h1>
        <p className="text-gray-500 mt-2">
          Flexible pricing that fits your needs
        </p>
      </div>

      {loading ? (
        <div className="text-center text-lg dark:text-white">
          Loading plans...
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {plans.map((plan) => (
            <motion.div
              key={plan.plan_id}
              whileHover={{ y: -5 }}
              className={`relative rounded-xl border p-8 shadow-md transition-all
                ${
                  isPopular(plan.name)
                    ? "border-blue-600 bg-white dark:bg-boxdark-2 scale-105"
                    : "border-stroke bg-white dark:bg-boxdark"
                }
              `}
            >
              {isPopular(plan.name) && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs px-4 py-1 rounded-full">
                  MOST POPULAR
                </div>
              )}

              <h3 className="text-xl font-semibold capitalize text-black dark:text-white">
                {plan.name}
              </h3>

              <p className="text-gray-500 text-sm mt-2">
                {plan.description}
              </p>

              <div className="mt-6">
                <span className="text-3xl font-bold text-black dark:text-white">
                  {Number(plan.price).toLocaleString()} RWF
                </span>
                <span className="text-gray-400 text-sm ml-1">
                  / {plan.duration_days} days
                </span>
              </div>

              <ul className="mt-6 space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li>✔ Full Access</li>
                <li>✔ Premium Content</li>
                <li>✔ Cancel Anytime</li>
              </ul>

              <button
                onClick={() => handleSelectPlan(plan)}
                disabled={subscriptionStatus === "active"}
                className={`mt-8 w-full rounded-lg py-3 text-white transition
                  ${
                    isPopular(plan.name)
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-gray-800 hover:bg-black"
                  }
                  ${
                    subscriptionStatus === "active"
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }
                `}
              >
                {!token
                  ? "Sign in to Choose"
                  : subscriptionStatus === "active"
                  ? "Already Subscribed"
                  : "Choose Plan"}
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* 🔥 SUBSCRIBE MODAL */}
      {selectedPlan && (
        <SubscribePlanModal
          plan={selectedPlan}
          onClose={() => setSelectedPlan(null)}
          onSuccess={() => {
            setSelectedPlan(null);
            fetchPlans(); // refresh subscription status
          }}
        />
      )}
    </div>
  );
};

export default Plans;
