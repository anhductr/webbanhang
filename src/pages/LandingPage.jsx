import React, { useEffect, useState } from 'react';
import Banner from '../components/Banner';
import ProductList from '../components/ProductList';
import { loadProducts } from '../utils/dataLoader';

const LandingPage = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const data = await loadProducts();
      setProducts(data);
    };

    fetchProducts();
  }, []);

  return (
    <div className="bg-gray-50 min-h-full pb-10">
      <Banner />
      <ProductList products={products} />
    </div>
  );
};

export default LandingPage;
