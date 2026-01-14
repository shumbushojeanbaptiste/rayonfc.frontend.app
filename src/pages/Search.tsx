// src/pages/Search.tsx
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

const Search = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const query = params.get("q") || "";

  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query) return;
    setLoading(true);

    // Replace this with your API call
    fetch(`/api/search?q=${encodeURIComponent(query)}`)
      .then((res) => res.json())
      .then((data) => setResults(data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [query]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Search Results</h1>
      <p className="mb-4">Showing results for: <strong>{query}</strong></p>

      {loading && <p>Loading...</p>}
      {!loading && results.length === 0 && <p>No results found.</p>}

      <ul>
        {results.map((item: any, index: number) => (
          <li key={index} className="mb-2 border-b pb-2">
            {item.title || JSON.stringify(item)}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Search;
