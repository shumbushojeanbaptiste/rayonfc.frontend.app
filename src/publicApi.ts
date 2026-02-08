import axios from "axios";

export const publicApi = axios.create({
  baseURL: "https://olee.maafricapay.com",
  timeout: 60000,
});
