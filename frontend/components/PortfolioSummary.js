import { useState, useEffect } from 'react';
import { formatCurrency, formatPercentage } from '../utils/formatters';
import Link from 'next/link';

export default function PortfolioSummary({ className }) {
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalValue, setTotalValue] = useState(0);
  const [totalGain, setTotalGain] = useState(0);

  useEffect(() => {
    const fetchPortfolio = async () => {
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

        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/market/portfolio`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch portfolio data');
        }
        
        const data = await response.json();
        setPortfolio(data.portfolio || []);
        
        // Calculate totals
        if (data.portfolio && data.portfolio.length) {
          const value = data.portfolio.reduce((sum, asset) => sum + (asset.current_value || 0), 0);
          const gain = data.portfolio.reduce((sum, asset) => sum + (asset.profit_loss || 0), 0);
          setTotalValue(value);
          setTotalGain(gain);
        }
      } catch (err) {
        console.error('Error fetching portfolio:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPortfolio();
  }, []);

  // Loading skeleton
  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow p-4 ${className}`}>
        <div className="flex justify-between items-center mb-4">
          <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse"></div>
          <div className="h-6 bg-gray-200 rounded w-1/6 animate-pulse"></div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-3 border rounded-lg animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
          </div>
          <div className="p-3 border rounded-lg animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
        
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center p-3 animate-pulse">
              <div className="w-8 h-8 rounded-full bg-gray-200 mr-3"></div>
              <div className="flex-grow">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
              </div>
              <div>
                <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-12"></div>
              </div>
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
        <h3 className="text-lg font-semibold mb-2 text-gray-800">Investment Portfolio</h3>
        <div className="bg-red-50 text-red-700 p-3 rounded-md">
          <p>Error loading portfolio: {error}</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (portfolio.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow p-4 ${className}`}>
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Investment Portfolio</h3>
        <div className="text-center py-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No investments yet</h3>
          <p className="mt-1 text-sm text-gray-500">Start building your investment portfolio</p>
          <div className="mt-6">
            <Link
              href="/investments/add"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add Investment
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Normal state with portfolio data
  return (
    <div className={`bg-white rounded-lg shadow p-4 ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Investment Portfolio</h3>
        <Link
          href="/investments"
          className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
        >
          View All
        </Link>
      </div>
      
      {/* Portfolio summary */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
          <p className="text-xs text-gray-500 mb-1">Total Value</p>
          <p className="text-xl font-semibold text-gray-900">{formatCurrency(totalValue)}</p>
        </div>
        
        <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
          <p className="text-xs text-gray-500 mb-1">Total Gain/Loss</p>
          <p className={`text-xl font-semibold ${totalGain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {totalGain >= 0 ? '+' : ''}{formatCurrency(totalGain)}
          </p>
        </div>
      </div>
      
      {/* Portfolio assets list */}
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {portfolio.map((asset, idx) => (
          <div 
            key={idx}
            className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors duration-150"
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
              asset.asset_type === 'stock' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              {asset.asset_type === 'stock' ? 'S' : 'C'}
            </div>
            
            <div className="flex-grow">
              <h4 className="text-sm font-medium text-gray-900">{asset.symbol}</h4>
              <p className="text-xs text-gray-500">{asset.quantity} {asset.asset_type === 'stock' ? 'shares' : 'coins'}</p>
            </div>
            
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{formatCurrency(asset.current_value)}</p>
              <p className={`text-xs ${asset.profit_loss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {asset.profit_loss >= 0 ? '▲' : '▼'} {formatPercentage(Math.abs(asset.profit_loss_percent))}
              </p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 text-right">
        <Link
          href="/investments/add"
          className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg className="-ml-0.5 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add Investment
        </Link>
      </div>
    </div>
  );
}
