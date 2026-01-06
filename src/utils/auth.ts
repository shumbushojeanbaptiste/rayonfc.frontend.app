export const getAuthUser = () => {
  const stored = localStorage.getItem("user");
  if (!stored) return null;

  try {
    const parsed = JSON.parse(stored);
    return parsed;
  } catch {
    return null;
  }
};
