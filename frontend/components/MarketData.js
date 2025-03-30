import { useEffect, useState } from "react";

export default function MarketData() {
  const [stockPrice, setStockPrice] = useState(null);
  const [cryptoPrice, setCryptoPrice] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async (url, setData) => {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch data");
        const data = await res.json();
        setData(data.price);
      } catch (err) {
        console.error(err);
        setError("Failed to load market data.");
      }
    };

    fetchData(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/stock/TCS.BSE`, setStockPrice);
    fetchData(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/crypto/bitcoin`, setCryptoPrice);
  }, []);

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-2">Market Prices</h3>
      {error ? (
        <p className="text-red-500" role="alert">{error}</p>
      ) : (
        <>
          <p>📈 TCS Stock: ₹{stockPrice || "Loading..."}</p>
          <p>🪙 Bitcoin: ${cryptoPrice || "Loading..."}</p>
        </>
      )}
    </div>
  );
}
