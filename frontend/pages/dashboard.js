import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import TransactionList from "../components/TransactionList";
import AISuggestion from "../components/AISuggestion";

export default function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [suggestion, setSuggestion] = useState("");
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [loadingSuggestion, setLoadingSuggestion] = useState(true);
  const [transactionError, setTransactionError] = useState("");
  const [suggestionError, setSuggestionError] = useState("");

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_BACKEND_URL) {
      console.error("NEXT_PUBLIC_BACKEND_URL is not defined");
      setTransactionError("Backend URL is not configured. Please contact support.");
      setSuggestionError("Backend URL is not configured. Please contact support.");
      return;
    }

    const fetchData = async (url, setData, setLoading, setError, abortSignal) => {
      try {
        setLoading(true);
        const response = await fetch(url, { signal: abortSignal });
        if (!response.ok) {
          throw new Error(`Failed to fetch data from ${url}`);
        }
        const data = await response.json();
        setData(data);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error(`Error fetching data from ${url}:`, err);
          setError("Unable to load data. Please try again later.");
        }
      } finally {
        setLoading(false);
      }
    };

    const transactionController = new AbortController();
    const suggestionController = new AbortController();

    fetchData(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/transactions`,
      setTransactions,
      setLoadingTransactions,
      setTransactionError,
      transactionController.signal
    );

    fetchData(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/ai/suggest`,
      (data) => setSuggestion(data.suggestion),
      setLoadingSuggestion,
      setSuggestionError,
      suggestionController.signal
    );

    return () => {
      transactionController.abort();
      suggestionController.abort();
    };
  }, []);

  return (
    <div>
      <Navbar />
      <div className="container mx-auto p-4" role="main">
        <h2 className="text-2xl font-semibold mb-4">Dashboard</h2>
        {transactionError && (
          <p className="text-red-500" role="alert">{transactionError}</p>
        )}
        {loadingTransactions ? (
          <p>Loading transactions...</p>
        ) : (
          <TransactionList transactions={transactions} />
        )}
        {suggestionError && (
          <p className="text-red-500" role="alert">{suggestionError}</p>
        )}
        {loadingSuggestion ? (
          <p>Loading AI suggestion...</p>
        ) : (
          <AISuggestion suggestion={suggestion} />
        )}
      </div>
    </div>
  );
}
