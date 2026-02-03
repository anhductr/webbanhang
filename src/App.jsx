import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import LandingPage from './pages/LandingPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import ThankYouPage from './pages/ThankYouPage'
import { CartProvider } from './context/CartContext'


function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <MainLayout>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/thank-you" element={<ThankYouPage />} />
          </Routes>
        </MainLayout>
      </CartProvider>
    </BrowserRouter>
  )
}

export default App
