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
