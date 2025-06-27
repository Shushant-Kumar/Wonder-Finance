const { fetchStockData } = require('./stockService');

if (typeof fetchStockData !== 'function') {
    console.error("fetchStockData is not a valid function. Please check the implementation.");
    process.exit(1);
}

fetchStockData().then((data) => {
    console.log("Dummy Stock Data:", data);
}).catch((error) => {
    console.error("Error fetching stock data:", error.message || error);
});
