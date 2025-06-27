<div align="center">

# ✨ Wonder Finance ✨


[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white)](https://openai.com/)

**AI-Powered Financial Management for Everyone**

[Features](#key-features) • 
[Demo](#live-demo) • 
[Installation](#installation) • 
[Tech Stack](#tech-stack) • 
[API Documentation](#api-documentation) • 
[Contributing](#contributing)

</div>

---

## 📌 Overview

Wonder Finance transforms how you manage money with AI-powered insights, comprehensive tracking tools, and real-time market data. Take control of your financial future with smart budgeting, intelligent savings recommendations, and personalized investment guidance.

<div align="center">
  <img src="frontend/public/dashboard-preview.jpg" alt="Wonder Finance Dashboard" width="80%" />
</div>

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| 🤖 **AI Financial Advisor** | Personalized financial advice based on your spending patterns and goals |
| 📊 **Smart Transaction Management** | Effortlessly track and categorize income, expenses, and investments |
| 💰 **Intelligent Budget Planning** | Create and manage budgets with AI-assisted recommendations |
| 📈 **Investment Portfolio Tracker** | Monitor your investments with real-time market data and performance analytics |
| 📱 **Responsive Design** | Seamless experience across desktop, tablet, and mobile devices |
| 🔮 **Predictive Analysis** | Forecast future financial scenarios based on your current habits |

## 🚀 Live Demo

Check out our [live demo](https://wonder-finance.example.com) to see Wonder Finance in action.

*Demo credentials:*  
Email: `demo@wonderfinance.com`  
Password: `demo123`

## 📦 Tech Stack

### Backend
- [FastAPI](https://fastapi.tiangolo.com/) - High-performance Python framework
- [MongoDB](https://www.mongodb.com/) - NoSQL database for flexible data storage
- JWT Authentication - Secure user authentication
- [OpenAI API](https://openai.com/) - AI-powered financial insights

### Frontend
- [Next.js](https://nextjs.org/) - React framework for production
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Chart.js](https://www.chartjs.org/) - Beautiful, animated financial charts
- [Framer Motion](https://www.framer.com/motion/) - Fluid UI animations

## 💻 Installation

### Prerequisites

- Node.js (v14+)
- Python (v3.8+)
- MongoDB
- API keys for OpenAI, Alpha Vantage, and News API

### Quick Start

Clone the repository and set up development environment:

```bash
# Clone the repository
git clone https://github.com/yourusername/wonder-finance.git
cd wonder-finance
```

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env with your API keys and configuration

# Start the backend server
uvicorn main:app --reload
```

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Start the development server
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

## 🗂️ Project Structure

```
wonder-finance/
├── backend/
│   ├── routes/           # API endpoints organized by feature
│   │   ├── ai.py         # AI suggestion endpoints
│   │   ├── budget.py     # Budget management endpoints
│   │   ├── market.py     # Stock and crypto market data
│   │   ├── news.py       # Financial news endpoints
│   │   ├── transactions.py # Transaction management
│   │   └── users.py      # User authentication and profiles
│   ├── models.py         # Pydantic data models
│   ├── utils.py          # Shared utility functions
│   ├── database.py       # MongoDB configuration
│   └── main.py           # FastAPI application entry point
├── frontend/
│   ├── components/       # Reusable React components
│   │   ├── dashboard/    # Dashboard-specific components
│   │   ├── charts/       # Chart components
│   │   └── forms/        # Form components
│   ├── pages/            # Next.js page routes
│   ├── styles/           # Global CSS and Tailwind config
│   ├── utils/            # Frontend utility functions
│   │   └── formatters.js # Date and currency formatters
│   └── public/           # Static assets
└── docs/                 # Documentation files
```

## 📚 API Documentation

With the backend running, access interactive API documentation:

- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

### Key Endpoints

| Endpoint | Description |
|----------|-------------|
| `POST /users/register` | Create new user account |
| `POST /users/login` | Authenticate user and get token |
| `GET /transactions` | List user transactions with filtering |
| `POST /transactions` | Add new transaction |
| `GET /budgets` | Get user's budget information |
| `GET /market/stock/{symbol}` | Get stock price data |
| `GET /market/crypto/{symbol}` | Get cryptocurrency price data |
| `GET /ai/suggest` | Get personalized financial advice |

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

1. **Fork the Repository**
   - Create your feature branch: `git checkout -b feature/amazing-feature`

2. **Make Your Changes**
   - Write clean, documented code
   - Add or update tests as necessary

3. **Submit Your Changes**
   - Commit your changes: `git commit -m 'Add some amazing feature'`
   - Push to your branch: `git push origin feature/amazing-feature`
   - Open a Pull Request with detailed description

Please follow our [code of conduct](CODE_OF_CONDUCT.md) and [contribution guidelines](CONTRIBUTING.md).

## 🛠️ Development

```bash
# Run backend tests
cd backend
pytest

# Run frontend tests
cd frontend
npm run test

# Lint code
npm run lint
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenAI for their powerful AI API
- Alpha Vantage for financial data
- All our open-source dependencies and contributors

---

<div align="center">

**Made with ❤️ by the Wonder Finance Team**

[GitHub](https://github.com/yourusername/wonder-finance) • 
[Report Bug](https://github.com/yourusername/wonder-finance/issues) • 
[Request Feature](https://github.com/yourusername/wonder-finance/issues)

</div>
