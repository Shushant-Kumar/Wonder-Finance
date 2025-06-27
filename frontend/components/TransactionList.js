import { useState, useMemo } from 'react';
import Link from "next/link";
import { formatCurrency, formatDate } from '../utils/formatters';

export default function TransactionList({ transactions = [], loading = false, className }) {
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [searchTerm, setSearchTerm] = useState('');

  // Define transaction type icons and colors
  const typeConfig = {
    income: {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
        </svg>
      ),
      bgColor: 'bg-green-100',
      textColor: 'text-green-800'
    },
    expense: {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 000 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
        </svg>
      ),
      bgColor: 'bg-red-100',
      textColor: 'text-red-800'
    },
    transfer: {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M8 5a1 1 0 100 2h5.586l-1.293 1.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L13.586 5H8zM12 15a1 1 0 100-2H6.414l1.293-1.293a1 1 0 10-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L6.414 15H12z" />
        </svg>
      ),
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-800'
    },
    investment: {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      ),
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-800'
    }
  };

  const filteredTransactions = useMemo(() => {
    if (!transactions || !Array.isArray(transactions)) return [];
    
    return transactions.filter(transaction => {
      // Apply type filter
      if (filter !== 'all' && transaction.transaction_type !== filter) {
        return false;
      }
      
      // Apply search filter (case insensitive)
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          transaction.category?.toLowerCase().includes(searchLower) ||
          transaction.description?.toLowerCase().includes(searchLower) ||
          transaction.amount?.toString().includes(searchLower)
        );
      }
      
      return true;
    }).sort((a, b) => {
      // Apply sorting
      if (sortBy === 'date') {
        const dateA = new Date(a.date || 0);
        const dateB = new Date(b.date || 0);
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      }
      
      if (sortBy === 'amount') {
        const amountA = a.amount || 0;
        const amountB = b.amount || 0;
        return sortOrder === 'asc' ? amountA - amountB : amountB - amountA;
      }
      
      if (sortBy === 'category') {
        const categoryA = (a.category || '').toLowerCase();
        const categoryB = (b.category || '').toLowerCase();
        return sortOrder === 'asc'
          ? categoryA.localeCompare(categoryB)
          : categoryB.localeCompare(categoryA);
      }
      
      return 0;
    });
  }, [transactions, filter, sortBy, sortOrder, searchTerm]);

  // Group transactions by date
  const groupedTransactions = useMemo(() => {
    if (!filteredTransactions.length) return {};
    
    const groups = {};
    
    filteredTransactions.forEach(transaction => {
      const date = transaction.date ? new Date(transaction.date) : new Date();
      const dateKey = date.toISOString().split('T')[0];
      
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      
      groups[dateKey].push(transaction);
    });
    
    return groups;
  }, [filteredTransactions]);

  // Filter options
  const filterOptions = [
    { value: 'all', label: 'All' },
    { value: 'income', label: 'Income' },
    { value: 'expense', label: 'Expense' },
    { value: 'transfer', label: 'Transfer' },
    { value: 'investment', label: 'Investment' }
  ];
  
  // Transaction skeleton for loading state
  const transactionSkeletons = Array(5).fill(0).map((_, idx) => (
    <div key={`skeleton-${idx}`} className="animate-pulse flex items-center px-4 py-3 border-b border-gray-100 last:border-0">
      <div className="h-10 w-10 rounded-md bg-gray-200 mr-3"></div>
      <div className="flex-grow">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      </div>
      <div className="w-20">
        <div className="h-5 bg-gray-200 rounded"></div>
      </div>
    </div>
  ));

  // Empty state component
  const EmptyState = () => (
    <div className="py-16 flex flex-col items-center justify-center text-center">
      <div className="bg-gray-100 p-4 rounded-full mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
      <p className="text-gray-500 mb-6">
        {searchTerm || filter !== 'all'
          ? "Try changing your filters or search term"
          : "Add your first transaction to get started"}
      </p>
      <Link 
        href="/transactions/add" 
        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
        </svg>
        Add Transaction
      </Link>
    </div>
  );

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Transactions</h2>
        
        {/* Filters and search */}
        <div className="mt-4 space-y-4 sm:flex sm:space-y-0 sm:space-x-4">
          <div className="relative rounded-md sm:w-1/3">
            <input
              type="text"
              className="w-full border-gray-300 rounded-md pl-10 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          
          <div className="sm:w-1/3 flex space-x-2 overflow-x-auto pb-2 sm:pb-0">
            {filterOptions.map(option => (
              <button
                key={option.value}
                className={`px-3 py-2 rounded-md text-sm whitespace-nowrap ${
                  filter === option.value
                    ? 'bg-blue-100 text-blue-800 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => setFilter(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
          
          <div className="sm:w-1/3">
            <select
              className="w-full border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field);
                setSortOrder(order);
              }}
            >
              <option value="date-desc">Latest first</option>
              <option value="date-asc">Oldest first</option>
              <option value="amount-desc">Highest amount</option>
              <option value="amount-asc">Lowest amount</option>
              <option value="category-asc">Category (A-Z)</option>
              <option value="category-desc">Category (Z-A)</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Transactions list */}
      <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
        {loading ? (
          <div className="divide-y divide-gray-100">{transactionSkeletons}</div>
        ) : filteredTransactions.length === 0 ? (
          <EmptyState />
        ) : (
          Object.keys(groupedTransactions).sort((a, b) => sortOrder === 'asc' ? a.localeCompare(b) : b.localeCompare(a)).map(date => (
            <div key={date}>
              <div className="bg-gray-50 px-4 py-2 sticky top-0 z-10">
                <h3 className="text-sm font-medium text-gray-500">{formatDate(date, 'medium')}</h3>
              </div>
              
              {groupedTransactions[date].map((transaction, idx) => {
                const config = typeConfig[transaction.transaction_type] || {
                  icon: null,
                  bgColor: 'bg-gray-100',
                  textColor: 'text-gray-800'
                };
                
                return (
                  <div 
                    key={transaction.id || idx} 
                    className="px-4 py-3 hover:bg-gray-50 transition-colors duration-150"
                  >
                    <div className="flex items-center">
                      <div className={`flex-shrink-0 w-10 h-10 rounded-md ${config.bgColor} ${config.textColor} flex items-center justify-center mr-3`}>
                        {config.icon}
                      </div>
                      
                      <div className="flex-grow">
                        <div className="flex justify-between">
                          <h4 className="text-sm font-medium text-gray-900">{transaction.category}</h4>
                          <span className={`text-sm font-medium ${
                            transaction.transaction_type === 'income' ? 'text-green-600' : 
                            transaction.transaction_type === 'expense' ? 'text-red-600' : ''
                          }`}>
                            {transaction.transaction_type === 'income' ? '+' : 
                             transaction.transaction_type === 'expense' ? '-' : ''}
                            {formatCurrency(transaction.amount)}
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-xs text-gray-500 truncate max-w-xs">
                            {transaction.description || 'No description'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDate(transaction.date, 'time')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
      </div>
      
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 sm:px-6 flex justify-between items-center">
        <Link
          href="/transactions"
          className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
        >
          View All Transactions
        </Link>
        
        <Link
          href="/transactions/add"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add Transaction
        </Link>
      </div>
    </div>
  );
}
