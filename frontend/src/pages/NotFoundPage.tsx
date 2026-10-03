import React from 'react';
import { Link } from 'react-router-dom';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-6xl font-extrabold text-primary">404</h1>
      <p className="mt-4 text-xl text-charcoal">Page not found</p>
      <Link to="/" className="mt-6 px-6 py-2.5 bg-primary text-white font-medium rounded-pill hover:bg-primary-deep transition">
        Return Home
      </Link>
    </div>
  );
};

export default NotFoundPage;
