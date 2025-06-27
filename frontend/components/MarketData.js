import { useEffect, useState } from "react";
import { Line } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { formatCurrency } from '../utils/formatters';

// Register Chart.js components
Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function MarketData({ className }) {
  const [stockData, setStockData] = useState(null);
  const [cryptoData, setCryptoData] = useState(null);
  const [trendingAssets, setTrendingAssets] = useState([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState('1d');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_BACKEND_URL) {
      console.error("NEXT_PUBLIC_BACKEND_URL is not defined");
      setError("Backend URL is not configured. Please contact support.");
      setLoading(false);
      return;
    }

    const fetchMarketData = async () => {
      setLoading(true);
      try {
        // Fetch stock data
        const stockRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/market/stock/AAPL`);
        if (!stockRes.ok) throw new Error(`Failed to fetch stock data: ${stockRes.statusText}`);
        const stockJson = await stockRes.json();
        setStockData(stockJson);

        // Fetch crypto data
        const cryptoRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/market/crypto/bitcoin`);
        if (!cryptoRes.ok) throw new Error(`Failed to fetch crypto data: ${cryptoRes.statusText}`);
        const cryptoJson = await cryptoRes.json();
        setCryptoData(cryptoJson);

        // Fetch trending assets
        const trendingRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/market/trending`);
        if (!trendingRes.ok) throw new Error(`Failed to fetch trending assets: ${trendingRes.statusText}`);
        const trendingJson = await trendingRes.json();
        setTrendingAssets([
          ...trendingJson.trending_stocks?.slice(0, 3) || [],
          ...trendingJson.trending_crypto?.slice(0, 3) || []
        ]);

        setError("");
      } catch (err) {
        console.error("Error fetching market data:", err.message);
        setError("Failed to load market data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchMarketData();
    
    // Refresh data every 5 minutes
    const intervalId = setInterval(fetchMarketData, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);

  // Mock historical data for charts
  const generateChartData = (basePrice, volatility, days) => {
    const dates = [];
    const prices = [];
    const today = new Date();
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      dates.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
      
      // Generate a random price movement based on volatility
      const randomChange = (Math.random() - 0.5) * volatility;
      const newPrice = i === days ? basePrice : prices[prices.length - 1] * (1 + randomChange);
      prices.push(parseFloat(newPrice.toFixed(2)));
    }
    
    return { dates, prices };
  };

  const renderStockChart = () => {
    if (!stockData) return null;
    
    const basePrice = parseFloat(stockData.price);
    const { dates, prices } = generateChartData(basePrice, 0.01, selectedTimeframe === '1d' ? 1 : selectedTimeframe === '1w' ? 7 : 30);
    
    const chartData = {
      labels: dates,
      datasets: [
        {
          label: stockData.symbol,
          data: prices,
          borderColor: 'rgb(53, 162, 235)',
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
          tension: 0.2,
        }
      ]
    };
    
    const options = {
      responsive: true,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `${context.dataset.label}: ${formatCurrency(context.raw, 'USD')}`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          }
        }
      }
    };
    
    return <Line data={chartData} options={options} height={selectedTimeframe === '1d' ? 80 : 120} />;
  };

  const renderCryptoChart = () => {
    if (!cryptoData) return null;
    
    const basePrice = cryptoData.price_usd;
    const { dates, prices } = generateChartData(basePrice, 0.03, selectedTimeframe === '1d' ? 1 : selectedTimeframe === '1w' ? 7 : 30);
    
    const chartData = {
      labels: dates,
      datasets: [
        {
          label: 'Bitcoin',
          data: prices,
          borderColor: 'rgb(255, 159, 64)',
          backgroundColor: 'rgba(255, 159, 64, 0.5)',
          tension: 0.2,
        }
      ]
    };
    
    const options = {
      responsive: true,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `${context.dataset.label}: ${formatCurrency(context.raw, 'USD')}`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          }
        }
      }
    };
    
    return <Line data={chartData} options={options} height={selectedTimeframe === '1d' ? 80 : 120} />;
  };

  const timeframeButtons = [
    { value: '1d', label: '1D' },
    { value: '1w', label: '1W' },
    { value: '1m', label: '1M' }
  ];

  return (
    <div className={`bg-white rounded-lg shadow-md p-4 ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Market Overview</h2>
        <div className="flex space-x-2">
          {timeframeButtons.map(button => (
            <button
              key={button.value}
              onClick={() => setSelectedTimeframe(button.value)}
              className={`px-2 py-1 text-xs font-medium rounded ${
                selectedTimeframe === button.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {button.label}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <div className="bg-red-50 p-4 rounded-md">
          <p className="text-red-800" role="alert">{error}</p>
        </div>
      ) : loading ? (
        <div className="space-y-4">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-1">
              <h3 className="font-medium text-gray-700">
                AAPL <span className="text-xs text-gray-500">Apple Inc.</span>
              </h3>
              {stockData && (
                <div className="flex items-center">
                  <span className="text-lg font-semibold">{formatCurrency(stockData.price, 'USD')}</span>
                  <span className={`ml-2 text-sm ${parseFloat(stockData.change_percent) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {stockData.change_percent}
                  </span>
                </div>
              )}
            </div>
            {renderStockChart()}
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <h3 className="font-medium text-gray-700">
                BTC <span className="text-xs text-gray-500">Bitcoin</span>
              </h3>
              {cryptoData && (
                <div className="flex items-center">
                  <span className="text-lg font-semibold">{formatCurrency(cryptoData.price_usd, 'USD')}</span>
                  <span className={`ml-2 text-sm ${cryptoData.change_24h_percent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {cryptoData.change_24h_percent?.toFixed(2)}%
                  </span>
                </div>
              )}
            </div>
            {renderCryptoChart()}
          </div>

          {trendingAssets.length > 0 && (
            <div className="pt-4 border-t border-gray-100">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Trending Assets</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {trendingAssets.map((asset, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <div className="font-medium">{asset.symbol || asset.name}</div>
                    <div className="text-sm text-gray-500">{asset.name || asset.symbol}</div>
                    <div className={`text-sm font-medium ${
                      (asset.changesPercentage || asset.price_change_percentage_24h) >= 0
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}>
                      {(asset.changesPercentage || asset.price_change_percentage_24h || 0).toFixed(2)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
