// ...existing code...

// Dummy data for testing
const dummyStockData = [
    { symbol: "AAPL", price: 150.25, change: 1.2 },
    { symbol: "GOOGL", price: 2800.5, change: -0.5 },
    { symbol: "AMZN", price: 3400.75, change: 2.1 },
];

// Function to fetch stock data (using dummy data for testing)
function fetchStockData() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (!Array.isArray(dummyStockData) || dummyStockData.length === 0) {
                return reject(new Error("No stock data available."));
            }
            resolve(dummyStockData);
        }, 500); // Simulate network delay
    });
}

// Export the function for use in other parts of the application
module.exports = { fetchStockData };

// ...existing code...
