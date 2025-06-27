import { useState, useEffect } from 'react';
import { formatCurrency } from '../utils/formatters';
import Link from 'next/link';

export default function BudgetOverview({ className }) {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBudgets = async () => {
      if (!process.env.NEXT_PUBLIC_BACKEND_URL) {
        setError('Backend URL not configured');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Not authenticated');
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/budgets`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch budgets');
        }
        
        const data = await response.json();
        setBudgets(data.budgets || []);
      } catch (err) {
        console.error('Error fetching budgets:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBudgets();
  }, []);

  // Helper function to determine budget status color
  const getBudgetStatusColor = (percentage) => {
    if (percentage >= 100) return 'bg-red-500'; // Over budget
    if (percentage >= 80) return 'bg-yellow-500'; // Approaching limit
    return 'bg-green-500'; // On track
  };

  // Budget progress bar component
  const BudgetProgressBar = ({ percentage }) => {
    const cappedPercentage = Math.min(percentage, 100); // Cap at 100% for visual display
    const statusColor = getBudgetStatusColor(percentage);

    return (
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div 
          className={`h-2.5 rounded-full ${statusColor}`} 
          style={{ width: `${cappedPercentage}%` }}
        ></div>
      </div>
    );
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow p-4 ${className}`}>
        <div className="flex justify-between items-center mb-4">
          <div className="h-6 bg-gray-200 rounded w-1/4 animate-pulse"></div>
          <div className="h-6 bg-gray-200 rounded w-1/6 animate-pulse"></div>
        </div>
        
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="flex justify-between mb-1">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
              <div className="h-2.5 bg-gray-200 rounded-full w-full"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow p-4 ${className}`}>
        <h3 className="text-lg font-semibold mb-2 text-gray-800">Budgets</h3>
        <div className="bg-red-50 text-red-700 p-3 rounded-md">
          <p>Error loading budgets: {error}</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (budgets.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow p-4 ${className}`}>
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Budgets</h3>
        <div className="text-center py-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No budgets set</h3>
          <p className="mt-1 text-sm text-gray-500">Create a budget to track your spending</p>
          <div className="mt-6">
            <Link
              href="/budgets/create"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Create Budget
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Normal state with budgets
  return (
    <div className={`bg-white rounded-lg shadow p-4 ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Monthly Budgets</h3>
        <Link
          href="/budgets"
          className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
        >
          Manage All
        </Link>
      </div>

      <div className="space-y-4">
        {budgets.map((budget) => {
          const percentUsed = budget.percentage_used || 0;
          return (
            <div key={budget.category} className="group">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700 transition-colors">
                  {budget.category}
                </span>
                <span className="text-sm text-gray-600">
                  {formatCurrency(budget.spent)} / {formatCurrency(budget.total_budget)}
                </span>
              </div>
              <div className="flex items-center">
                <div className="flex-grow">
                  <BudgetProgressBar percentage={percentUsed} />
                </div>
                <span className={`ml-2 text-xs font-medium ${
                  percentUsed >= 100 ? 'text-red-600' :
                  percentUsed >= 80 ? 'text-yellow-600' :
                  'text-green-600'
                }`}>
                  {percentUsed.toFixed(0)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-6 text-right">
        <Link
          href="/budgets/create"
          className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg className="-ml-0.5 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          New Budget
        </Link>
      </div>
    </div>
  );
}
