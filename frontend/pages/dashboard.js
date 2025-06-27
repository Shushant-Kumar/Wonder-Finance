import { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Navbar from "../components/Navbar";
import TransactionList from "../components/TransactionList";
import AISuggestion from "../components/AISuggestion";
import MarketData from "../components/MarketData";
import FinancialSummary from "../components/FinancialSummary";
import BudgetOverview from "../components/BudgetOverview";
import PortfolioSummary from "../components/PortfolioSummary";
import NotificationCenter from "../components/NotificationCenter";

export default function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [suggestion, setSuggestion] = useState("");
  const [loading, setLoading] = useState({
    transactions: true,
    suggestion: true,
  });
  const [errors, setErrors] = useState({});
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login?redirect=/dashboard');
      return;
    }
    
    setIsAuthenticated(true);

    if (!process.env.NEXT_PUBLIC_BACKEND_URL) {
      console.error("NEXT_PUBLIC_BACKEND_URL is not defined");
      setErrors({
        ...errors,
        general: "Backend URL is not configured. Please contact support."
      });
      return;
    }

    const fetchData = async () => {
      // Fetch recent transactions
      try {
        const transactionsResponse = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/transactions?limit=10`, 
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        
        if (!transactionsResponse.ok) {
          throw new Error(`Failed to fetch transactions: ${transactionsResponse.statusText}`);
        }
        
        const transactionsData = await transactionsResponse.json();
        setTransactions(transactionsData.transactions || []);
      } catch (err) {
        console.error('Error fetching transactions:', err);
        setErrors({
          ...errors,
          transactions: "Unable to load transactions. Please try again."
        });
      } finally {
        setLoading(prev => ({
          ...prev,
          transactions: false
        }));
      }

      // Fetch AI suggestion
      try {
        const suggestionResponse = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/ai/suggest`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        
        if (!suggestionResponse.ok) {
          throw new Error(`Failed to fetch AI suggestion: ${suggestionResponse.statusText}`);
        }
        
        const suggestionData = await suggestionResponse.json();
        setSuggestion(suggestionData.suggestion || "");
      } catch (err) {
        console.error('Error fetching AI suggestion:', err);
        setErrors({
          ...errors,
          suggestion: "Unable to load AI suggestion. Please try again."
        });
      } finally {
        setLoading(prev => ({
          ...prev,
          suggestion: false
        }));
      }
    };

    fetchData();
  }, []);

  if (!isAuthenticated) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="p-4 bg-white rounded-lg shadow-md">
        <p className="text-gray-600">Checking authentication...</p>
      </div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Dashboard | Wonder Finance</title>
        <meta name="description" content="Your personal finance dashboard with AI-powered insights" />
      </Head>

      <Navbar />

      <main className="pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Page header with user welcome and notification */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Financial Dashboard</h1>
            <p className="text-gray-500">Welcome back! Here's your financial overview.</p>
          </div>
          <NotificationCenter />
        </div>

        {errors.general && (
          <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6" role="alert">
            {errors.general}
          </div>
        )}

        {/* Top row: Financial summary + AI suggestion */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
          <div className="xl:col-span-2">
            <FinancialSummary />
          </div>
          <div className="xl:col-span-1">
            <AISuggestion 
              suggestion={suggestion}
              isLoading={loading.suggestion}
              className="h-full"
            />
          </div>
        </div>

        {/* Middle row: Budget overview + Market data */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <BudgetOverview />
          <MarketData />
        </div>

        {/* Bottom row: Transactions + Portfolio */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TransactionList 
            transactions={transactions}
            loading={loading.transactions}
            className="h-full"
          />
          <PortfolioSummary />
        </div>
      </main>

      {/* Simple footer */}
      <footer className="py-4 text-center text-sm text-gray-500 border-t border-gray-200">
        <p>© {new Date().getFullYear()} Wonder Finance. All rights reserved.</p>
      </footer>
    </div>
  );
}
