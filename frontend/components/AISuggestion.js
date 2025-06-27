import { useState } from 'react';
import Link from "next/link";
import { motion, AnimatePresence } from 'framer-motion';

export default function AISuggestion({ suggestion, className, isLoading = false }) {
  const [expanded, setExpanded] = useState(false);
  const [liked, setLiked] = useState(false);
  
  // If there's no suggestion or loading is true, show a skeleton
  if (isLoading || !suggestion) {
    return (
      <div className={`bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 shadow-sm ${className}`}>
        <div className="flex items-center mb-2">
          <div className="h-8 w-8 bg-blue-200 rounded-full animate-pulse"></div>
          <div className="h-4 w-36 bg-blue-200 ml-2 rounded animate-pulse"></div>
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-blue-100 rounded w-full animate-pulse"></div>
          <div className="h-4 bg-blue-100 rounded w-5/6 animate-pulse"></div>
          <div className="h-4 bg-blue-100 rounded w-4/6 animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 shadow-sm ${className}`}
    >
      <div className="flex items-center mb-3">
        <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold ml-3 text-gray-800">AI Financial Insight</h3>
      </div>
      
      <AnimatePresence>
        <motion.div
          initial={false}
          animate={{ height: expanded ? 'auto' : '4.5rem' }}
          className="relative overflow-hidden"
        >
          <p className="text-gray-700 leading-relaxed">
            {suggestion}
          </p>
          
          {!expanded && suggestion.length > 150 && (
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-blue-50/90 to-transparent"></div>
          )}
        </motion.div>
      </AnimatePresence>
      
      <div className="mt-4 flex justify-between items-center">
        <div className="flex space-x-2">
          <button 
            onClick={() => setLiked(!liked)}
            className={`flex items-center px-2 py-1 rounded-md text-sm ${liked ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
            aria-label={liked ? "Unlike this suggestion" : "Like this suggestion"}
          >
            {liked ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
              </svg>
            )}
            {liked ? 'Helpful' : 'Like'}
          </button>
          
          {suggestion.length > 150 && (
            <button 
              onClick={() => setExpanded(!expanded)}
              className="flex items-center px-2 py-1 rounded-md text-sm text-gray-600 hover:text-blue-600"
              aria-expanded={expanded}
              aria-label={expanded ? "Show less" : "Read more"}
            >
              {expanded ? 'Show less' : 'Read more'}
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className={`h-5 w-5 ml-1 transform transition-transform ${expanded ? 'rotate-180' : ''}`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          )}
        </div>
        
        <Link 
          href="/ai-advisor"
          className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
        >
          Get More Advice
        </Link>
      </div>
    </motion.div>
  );
}
