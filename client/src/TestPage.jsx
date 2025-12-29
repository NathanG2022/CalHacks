import React from 'react';
import HackerBackground from './components/HackerBackground';

const TestPage = () => {
  return (
    <div className="min-h-screen bg-black text-white relative">
      {/* Hacker Background */}
      <HackerBackground />
      
      {/* Test Content */}
      <div className="relative z-10 p-8">
        <h1 className="text-4xl font-bold text-white mb-4">
          Test Page - Background Should Be Visible
        </h1>
        <p className="text-gray-300 text-lg">
          If you can see this text and the animated background behind it, the system is working!
        </p>
        <div className="mt-8 p-4 bg-gray-900/80 backdrop-blur-sm border border-gray-700 rounded-lg">
          <h2 className="text-xl font-semibold text-white mb-2">Test Card</h2>
          <p className="text-gray-300">
            This card should be visible with proper contrast against the dark background.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TestPage;















