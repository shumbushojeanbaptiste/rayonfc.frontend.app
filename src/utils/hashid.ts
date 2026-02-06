import Hashids from "hashids";

const hashids = new Hashids(
  "your-secret-salt", // 🔐 keep this constant
  10                  // min length
);

export const encodeId = (id: number) => {
  return hashids.encode(id);
};

export const decodeId = (hash: string) => {
  const decoded = hashids.decode(hash);
  return decoded.length ? decoded[0] : null;
};

export const encodeVideoId = (id: number | string) => {
  return btoa(id.toString())
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
};

export const decodeVideoId = (hash: string) => {
  const padded = hash.replace(/-/g, "+").replace(/_/g, "/");
  return atob(padded);
};
