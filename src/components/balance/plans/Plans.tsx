import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import api from "../../../api";
import SubscribePlanModal from "../../SubscribePlanModal";

interface Plan {
  plan_id: number;
  name: string;
  price: string;
  duration_days: number;
  description: string;
  status: number;
}

interface SubscriptionData {
  subscription_status: string;
  plan: number;
  remaining_days: number;
  end_date: string;
  available_plans: Plan[];
}

const Plans: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscriptionData, setSubscriptionData] =
    useState<SubscriptionData | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [timeLeft, setTimeLeft] = useState("");
  const [isExpired, setIsExpired] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const fetchPlans = async () => {
    try {
      if (token) {
        const response = await api.get(
          "/api/accessible/subscription-status"
        );

        if (response.data.success) {
          const data = response.data.data;
          setSubscriptionData(data);
          setPlans(data.available_plans);
        }
      } else {
        const response = await api.get("/api/settings/planList");

        if (response.data.success) {
          setPlans(
            response.data.data.filter((p: Plan) => p.status === 1)
          );
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

  // ------------------------------------------
  // LIVE COUNTDOWN (with seconds)
  // ------------------------------------------
  useEffect(() => {
    if (!subscriptionData?.end_date) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(subscriptionData.end_date).getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft("Expired");
        setIsExpired(true);
        clearInterval(interval);
        fetchPlans(); // auto refresh when expired
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor(
        (diff % (1000 * 60 * 60)) / (1000 * 60)
      );
      const seconds = Math.floor(
        (diff % (1000 * 60)) / 1000
      );

      setTimeLeft(
        `${hours}h ${minutes}m ${seconds}s remaining`
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [subscriptionData]);

  const isPopular = (name: string) =>
    name.toLowerCase() === "monthly";

  const formatDateTime = (date: string) => {
    const d = new Date(date);
    return d.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleSelectPlan = (plan: Plan) => {
    if (!token) {
      navigate("/auth/signin", { state: { from: "/plans" } });
      return;
    }

    setSelectedPlan(plan);
  };

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
          {plans.map((plan) => {
            const isCurrent =
              subscriptionData?.subscription_status === "active" &&
              subscriptionData?.plan === plan.plan_id;

            const endTime = subscriptionData
              ? new Date(subscriptionData.end_date).getTime()
              : 0;

            const diff = endTime - new Date().getTime();

            const lessThanSixHours =
              diff > 0 && diff < 6 * 60 * 60 * 1000;

            const lessThanOneHour =
              diff > 0 && diff < 60 * 60 * 1000;

            const lessThanTwoHours =
              diff > 0 && diff < 2 * 60 * 60 * 1000;

            const totalDays = plan.duration_days;
            const remaining =
              subscriptionData?.remaining_days || 0;

            const progressPercent =
              totalDays > 0
                ? ((totalDays - remaining) / totalDays) * 100
                : 0;

            return (
              <motion.div
                key={plan.plan_id}
                whileHover={{ y: -5 }}
                className={`relative rounded-xl border p-8 shadow-md transition-all
                  ${
                    isCurrent
                      ? "border-green-600 bg-green-50 dark:bg-boxdark-2"
                      : isPopular(plan.name)
                      ? "border-blue-600 bg-white dark:bg-boxdark-2 scale-105"
                      : "border-stroke bg-white dark:bg-boxdark"
                  }
                `}
              >
                {isCurrent && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-green-600 text-white text-xs px-4 py-1 rounded-full">
                    CURRENT PLAN
                  </div>
                )}

                <h3 className="text-xl font-semibold capitalize text-black dark:text-white">
                  {plan.name}
                </h3>

                {isCurrent && subscriptionData && (
                  <>
                    <div
                      className={`text-sm mt-2 ${
                        lessThanSixHours
                          ? "text-red-600 font-semibold"
                          : "text-green-700"
                      } ${
                        lessThanOneHour
                          ? "animate-pulse"
                          : ""
                      }`}
                    >
                      Expires on{" "}
                      {formatDateTime(
                        subscriptionData.end_date
                      )}
                      <br />
                      {timeLeft}
                    </div>

                    <div className="mt-4">
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{
                            width: `${progressPercent}%`,
                          }}
                          transition={{ duration: 0.8 }}
                          className={`h-2 ${
                            lessThanSixHours
                              ? "bg-red-600"
                              : "bg-green-600"
                          }`}
                        />
                      </div>
                    </div>

                    {/* Renew Button when < 2 hours */}
                    {lessThanTwoHours && !isExpired && (
                      <button
                        onClick={() =>
                          handleSelectPlan(plan)
                        }
                        className="mt-4 w-full rounded-lg py-2 bg-red-600 text-white font-semibold"
                      >
                        Renew Now
                      </button>
                    )}
                  </>
                )}

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
                  className={`mt-8 w-full rounded-lg py-3 text-white transition
                    ${
                      isCurrent
                        ? "bg-green-600"
                        : "bg-blue-600 hover:bg-blue-700"
                    }
                  `}
                >
                  {!token
                    ? "Sign in to Choose"
                    : isCurrent
                    ? "Active"
                    : "Change Plan"}
                </button>
              </motion.div>
            );
          })}
        </div>
      )}

      {selectedPlan && (
        <SubscribePlanModal
          plan={selectedPlan}
          onClose={() => setSelectedPlan(null)}
          onSuccess={() => {
            setSelectedPlan(null);
            fetchPlans();
          }}
        />
      )}
    </div>
  );
};

export default Plans;
