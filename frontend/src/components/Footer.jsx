import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-gray-50 to-gray-100 border-t border-gray-200 mt-10">
      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-wrap justify-between items-center gap-x-6 gap-y-1">
          <span className="text-sm font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Quiz Maker
          </span>
          <p className="text-gray-500 text-xs">
            AI quiz generation for tutors — generate, review, print.
          </p>
          <p className="text-gray-400 text-xs">
            © 2026 Nav Virdi —{' '}
            <a
              href="https://liberated.info"
              target="_blank"
              rel="noreferrer"
              className="text-gray-500 hover:text-indigo-600 transition-colors underline-offset-2 hover:underline"
            >
              Liberated.Info
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
