import React from 'react';
import { FaCartShopping } from "react-icons/fa6";
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const MainLayout = ({ children }) => {
  const { cartItems } = useCart();

  return (
    <div className="min-h-screen max-w-[480px] mx-auto bg-white flex flex-col shadow-2xl relative">
      <header className="p-4 bg-white border-b border-gray-100 flex items-center justify-between sticky top-0 z-50">
        <Link to="/" className="text-xl font-medium font-anton text-[#fec341]">Phúc Lâm</Link>
        <Link to="/cart" className="p-2 text-gray-600 hover:bg-gray-100 rounded-full relative">
          <FaCartShopping size={20} />
          {cartItems.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {cartItems.length}
            </span>
          )}
        </Link>
      </header>
      <main className="flex-grow overflow-y-auto">
        {children}
      </main>
      {/* <footer className="p-4 bg-gray-50 border-t border-gray-100 text-center text-sm text-gray-500">
        <p>&copy; 2026 AppName</p>
      </footer> */}
    </div>
  );
};

export default MainLayout;
