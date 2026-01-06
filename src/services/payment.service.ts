import api from "../api";
import { getAuthUser } from "../utils/auth";

const getAuthHeaders = () => {
  const user = getAuthUser();
  if (!user || !user.jwt) return {};
  return { Authorization: `Bearer ${user.jwt}` };
};

export interface BuyVideoPayload {
  user_id: number;
  payment_method: number;
  amount: number;
  video_id: number;
}

export const buyVideo = async (payload: BuyVideoPayload) => {
  return api.post("/api/payments/buy-video", payload, { headers: getAuthHeaders() });
};

export interface InitDepositPayload {
  user_id: number;
  payment_methods: number;
  amount: number;
  phone: string;
  currency: number;
}

export const initDeposit = async (payload: InitDepositPayload) => {
  return api.post("/api/payments/init-deposit", payload, { headers: getAuthHeaders() });
};

export interface CheckStatusPayload {
  phone: string;
  ref: string;
}

export const checkStatus = async (payload: CheckStatusPayload) => {
  return api.post("/api/payments/check-status", payload, { headers: getAuthHeaders() });
};

export interface TestCallbackPayload {
  ref: string;
  status: string;
}

export const testCallback = async (payload: TestCallbackPayload) => {
  return api.post("/api/payments/callback", payload, { headers: getAuthHeaders() });
};
