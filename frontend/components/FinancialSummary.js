import { useState, useEffect } from 'react';
import { formatCurrency } from '../utils/formatters';
import { Doughnut } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';

// Register Chart.js components
Chart.register(ArcElement, Tooltip, Legend);

export default function FinancialSummary({ className }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  useEffect(() => {
    const fetchSummary = async () => {
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

        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/transactions/analysis?period=${selectedPeriod}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch financial summary');
        }
        
        const data = await response.json();
        setSummary(data);
      } catch (err) {
        console.error('Error fetching financial summary:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSummary();
  }, [selectedPeriod]);

  // Prepare chart data from top spending categories
  const prepareChartData = () => {
    if (!summary || !summary.top_spending_categories) {
      return { labels: [], datasets: [] };
    }
    
    const labels = summary.top_spending_categories.map(([category]) => category);
    const values = summary.top_spending_categories.map(([, amount]) => amount);
    
    return {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: [
            'rgba(54, 162, 235, 0.8)',
            'rgba(255, 99, 132, 0.8)',
            'rgba(255, 206, 86, 0.8)',
            'rgba(75, 192, 192, 0.8)',
            'rgba(153, 102, 255, 0.8)',
          ],
          borderColor: [
            'rgba(54, 162, 235, 1)',
            'rgba(255, 99, 132, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };
  };
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          boxWidth: 15,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw || 0;
            return `${label}: ${formatCurrency(value)}`;
          }
        }
      }
    }
  };
  
  // Summarize the data
  const calculateTotals = () => {
    if (!summary || !summary.monthly_spending) {
      return { income: 0, expenses: 0, savings: 0 };
    }
    
    // In a real implementation, we would get this from the API
    // For now let's create mock data
    let income = 0;
    let expenses = 0;
    
    // Sum up the expenses from top spending categories
    if (summary.top_spending_categories) {
      expenses = summary.top_spending_categories.reduce((total, [, amount]) => total + amount, 0);
    }
    
    // Mock income (in reality should come from the API)
    income = expenses * 1.3; // Just for demonstration
    
    return {
      income,
      expenses,
      savings: income - expenses
    };
  };
  
  const totals = calculateTotals();

  // Loading skeleton
  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow p-4 ${className}`}>
        <div className="flex justify-between items-center mb-4">
          <div className="h-6 bg-gray-200 rounded w-1/4 animate-pulse"></div>
          <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-3 border rounded-lg animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
        
        <div className="h-64 bg-gray-100 rounded animate-pulse"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow p-4 ${className}`}>
        <h3 className="text-lg font-semibold mb-2 text-gray-800">Financial Summary</h3>
        <div className="bg-red-50 text-red-700 p-3 rounded-md">
          <p>Error loading financial summary: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow p-4 ${className}`}>
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-lg font-semibold text-gray-800">Financial Summary</h3>
        <select
          className="border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
        >
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
        </select>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
          <p className="text-sm text-blue-700 mb-1">Income</p>
          <p className="text-xl font-semibold text-blue-900">{formatCurrency(totals.income)}</p>
        </div>
        
        <div className="p-4 bg-red-50 rounded-lg border border-red-100">
          <p className="text-sm text-red-700 mb-1">Expenses</p>
          <p className="text-xl font-semibold text-red-900">{formatCurrency(totals.expenses)}</p>
        </div>
        
        <div className="p-4 bg-green-50 rounded-lg border border-green-100">
          <p className="text-sm text-green-700 mb-1">Savings</p>
          <p className="text-xl font-semibold text-green-900">{formatCurrency(totals.savings)}</p>
        </div>
      </div>
      
      {/* Spending Chart */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">Top Spending Categories</h4>
        <div className="h-64">
          {summary && summary.top_spending_categories && summary.top_spending_categories.length > 0 ? (
            <Doughnut data={prepareChartData()} options={chartOptions} />
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-50 rounded-md">
              <p className="text-gray-500">No spending data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
