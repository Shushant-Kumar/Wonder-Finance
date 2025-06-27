import { useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import Image from 'next/image';

export default function Home() {
  const [videoPlaying, setVideoPlaying] = useState(false);

  const features = [
    {
      title: "AI-Powered Insights",
      description: "Get personalized financial advice based on your spending patterns and goals",
      icon: "💡"
    },
    {
      title: "Real-time Market Data",
      description: "Track stocks, cryptocurrencies, and other investments with real-time updates",
      icon: "📈"
    },
    {
      title: "Smart Budget Planning",
      description: "Create and manage budgets with AI-assisted recommendations",
      icon: "💰"
    },
    {
      title: "Investment Portfolio",
      description: "Track your investments and get personalized recommendations",
      icon: "📊"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Head>
        <title>Wonder Finance | AI-Powered Financial Management</title>
        <meta name="description" content="Manage your finances smartly with AI-powered insights from Wonder Finance" />
      </Head>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-teal-500 to-blue-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="md:flex items-center justify-between">
            <div className="md:w-1/2 md:pr-12">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Your Finances, <span className="text-yellow-300">Reimagined</span>
              </h1>
              <p className="text-xl mb-8 max-w-md">
                Wonder Finance combines AI-powered insights with comprehensive financial tools to help you manage, save, and invest smarter.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link href="/register" className="px-8 py-3 bg-white text-blue-600 font-medium rounded-lg text-center hover:bg-blue-50 transition duration-200">
                  Get Started Free
                </Link>
                <Link href="/learn-more" className="px-8 py-3 bg-transparent border-2 border-white text-white font-medium rounded-lg text-center hover:bg-white/10 transition duration-200">
                  Learn More
                </Link>
              </div>
            </div>
            <div className="md:w-1/2 mt-12 md:mt-0">
              <div className="relative w-full h-64 md:h-96 rounded-lg overflow-hidden shadow-2xl">
                <Image 
                  src="/dashboard-preview.jpg" 
                  alt="Wonder Finance Dashboard Preview"
                  layout="fill"
                  objectFit="cover"
                  className="rounded-lg"
                  priority
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <button 
                    onClick={() => setVideoPlaying(true)}
                    className="bg-white/90 hover:bg-white text-blue-600 rounded-full p-4 transition duration-200"
                    aria-label="Play demo video"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0]">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-[60px] relative block">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" 
                  className="fill-gray-50"></path>
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-800">Powerful Financial Tools</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-blue-50 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-800">What Our Users Say</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/*
              {
                quote: "Wonder Finance has transformed how I manage my money. The AI recommendations are spot on!",
                author: "Priya S.",
                role: "Product Manager"
              },
              {
                quote: "I've increased my savings by 30% since I started using the budgeting tools. Incredible results.",
                author: "Rajat M.",
                role: "Software Engineer"
              },
              {
                quote: "The investment portfolio tracking is brilliant. I can finally see all my assets in one place.",
                author: "Anjali K.",
                role: "Financial Analyst"
              }
            */}
            {['Priya S.', 'Rajat M.', 'Anjali K.'].map((author, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md p-8 relative">
                <div className="text-5xl text-blue-200 absolute top-4 left-4">"</div>
                <p className="text-gray-700 relative z-10 mb-6">{`"${author} has transformed how I manage my money. The AI recommendations are spot on!"`}</p>
                <div>
                  <p className="font-semibold text-gray-800">{author}</p>
                  <p className="text-gray-500 text-sm">{`"${author} role"`}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-800">Ready to take control of your finances?</h2>
          <p className="text-xl mb-10 text-gray-600">Join thousands of users who are already managing their finances smarter with Wonder Finance.</p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link href="/dashboard" className="px-8 py-4 bg-blue-600 text-white font-medium rounded-lg text-center hover:bg-blue-700 transition duration-200">
              Go to Dashboard
            </Link>
            <Link href="/register" className="px-8 py-4 bg-gray-200 text-gray-800 font-medium rounded-lg text-center hover:bg-gray-300 transition duration-200">
              Create Account
            </Link>
          </div>
        </div>
      </section>

      {/* Video Modal */}
      {videoPlaying && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/75 p-4" onClick={() => setVideoPlaying(false)}>
          <div className="relative max-w-4xl w-full aspect-video bg-black rounded-lg overflow-hidden">
            <iframe 
              src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1" 
              className="absolute inset-0 w-full h-full"
              title="Wonder Finance Demo"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
              onClick={(e) => e.stopPropagation()}
            ></iframe>
            <button 
              className="absolute top-4 right-4 bg-black/50 hover:bg-black text-white p-2 rounded-full"
              onClick={(e) => {
                e.stopPropagation();
                setVideoPlaying(false);
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
