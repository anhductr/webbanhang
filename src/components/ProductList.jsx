import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Grid, Navigation } from 'swiper/modules';
import { IoIosArrowForward, IoIosArrowBack } from "react-icons/io";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Dialog, DialogContent, Button } from '@mui/material';
import { BsFillCartCheckFill } from "react-icons/bs";

import 'swiper/css';
import 'swiper/css/grid';
import 'swiper/css/pagination';

const ProductList = ({ products }) => {
    if (!products || products.length === 0) {
        return <div className="text-center p-4">Loading products...</div>;
    }
    const swiperRef = useRef(null);
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const [showCartSuccessModal, setShowCartSuccessModal] = useState(false);

    useEffect(() => {
        let timer;
        if (showCartSuccessModal) {
            timer = setTimeout(() => {
                setShowCartSuccessModal(false);
            }, 5000);
        }
        return () => clearTimeout(timer);
    }, [showCartSuccessModal]);

    const handleViewCart = () => {
        setShowCartSuccessModal(false);
        navigate('/cart');
    };


    return (
        <div className="p-4">
            <h2 className="text-lg font-bold mb-4 text-gray-800">Danh sách sản phẩm</h2>
            <div className="relative group/list">
                <Swiper
                    slidesPerView={2}
                    grid={{
                        rows: 2,
                        fill: 'row'
                    }}
                    spaceBetween={10}
                    // pagination={{
                    //     clickable: true,
                    // }}
                    modules={[Grid, Navigation]}
                    navigation={{
                        nextEl: '.swiper-button-next-custom',
                        prevEl: '.swiper-button-prev-custom',
                    }}
                    className="mySwiper h-full w-full"
                    ref={swiperRef}
                >
                    {products.map((product, index) => {
                        // Map JSON keys
                        const name = product['TÊN SẢN PHẨM'];

                        // Format price as VND currency
                        const formatVND = (value) => {
                            if (typeof value === 'number') {
                                return new Intl.NumberFormat('vi-VN', {
                                    style: 'currency',
                                    currency: 'VND',
                                }).format(value);
                            }
                            return value || 'Liên hệ';
                        };

                        const price = formatVND(product['Giá sau chiết khấu']);
                        const originalPrice = formatVND(product['GIÁ NIÊM YẾT']);
                        const hasDiscount = product['GIÁ NIÊM YẾT'] && product['GIÁ NIÊM YẾT'] > product['Giá sau chiết khấu'];
                        const code = product['MÃ SP'] || '';

                        // Image strategy
                        const imageSrc = product['ảnh'] || (code ? `/products/${code}.jpg` : null);

                        return (
                            <SwiperSlide key={index} className="!h-[300px]">
                                <div
                                    className="bg-[#f5f5f5] flex flex-col justify-between h-full group relative"
                                >
                                    <div className="w-full aspect-square overflow-hidden relative">
                                        {hasDiscount && (
                                            <div className="absolute top-2 left-2 z-10 bg-[#bd081c] text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wide">
                                                Giảm giá
                                            </div>
                                        )}
                                        {imageSrc ? (
                                            <img
                                                src={imageSrc}
                                                alt={name}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 mix-blend-multiply"
                                                onError={(e) => {
                                                    if (e.target.dataset.errorHandled) return;
                                                    e.target.dataset.errorHandled = true;
                                                    e.target.src = 'https://placehold.co/150?text=No+Image';
                                                }}
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-gray-400 text-xs text-center p-2">
                                                {code}
                                            </div>
                                        )}

                                        {/* Add to Cart Button - appears on hover */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                addToCart(product);
                                                setShowCartSuccessModal(true);
                                            }}
                                            className="absolute bottom-2 left-1/2 -translate-x-1/2 
                                                bg-red-600 text-white px-3 py-2 rounded-full 
                                                opacity-0 group-hover:opacity-100 
                                                transform translate-y-2 group-hover:translate-y-0
                                                transition-all duration-300 ease-out
                                                hover:bg-red-700 active:scale-95
                                                flex items-center gap-1 text-[11px] font-semibold
                                                shadow-lg z-20"
                                        >
                                            <BsFillCartCheckFill size={20} />
                                            Thêm vào giỏ
                                        </button>
                                    </div>

                                    <div className="flex flex-col flex-grow p-4 pt-2">
                                        <h3 className="text-sm font-medium text-[#1a1a1a] line-clamp-2 mb-2 text-center min-h-[40px] font-anton tracking-wide" title={name}>
                                            {name || 'Sản phẩm mới'}
                                        </h3>

                                        <div className="mt-auto flex flex-wrap justify-center items-center gap-2 text-sm">
                                            {hasDiscount && (
                                                <span className="text-gray-400 line-through decoration-gray-400 text-xs">
                                                    {originalPrice}
                                                </span>
                                            )}
                                            <span className="text-red-600 font-[600]">
                                                {price}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </SwiperSlide>
                        )
                    })}
                </Swiper>
                <button
                    onClick={() => swiperRef.current?.swiper?.slidePrev()}
                    className="swiper-button-prev-custom absolute left-2 top-1/2 -translate-y-1/2 z-10 
                        w-10 h-10 rounded-full !bg-black/40 !text-white flex items-center justify-center 
                        opacity-0 group-hover/list:opacity-100 transition-all duration-300 backdrop-blur-sm shadow-lg border border-white/10 hover:!bg-black/60
                        [&.swiper-button-disabled]:invisible [&.swiper-button-disabled]:opacity-0"
                >
                    <IoIosArrowBack size={24} />
                </button>

                <button
                    onClick={() => swiperRef.current?.swiper?.slideNext()}
                    className="swiper-button-next-custom absolute right-2 top-1/2 -translate-y-1/2 z-10 
                        w-10 h-10 rounded-full !bg-black/40 !text-white flex items-center justify-center 
                        opacity-0 group-hover/list:opacity-100 transition-all duration-300 backdrop-blur-sm shadow-lg border border-white/10 hover:!bg-black/60
                        [&.swiper-button-disabled]:invisible [&.swiper-button-disabled]:opacity-0"
                >
                    <IoIosArrowForward size={24} />
                </button>
            </div>

            <Dialog
                open={showCartSuccessModal}
                onClose={() => setShowCartSuccessModal(false)}
                maxWidth="xs"
                PaperProps={{
                    style: {
                        backgroundColor: 'rgba(56, 62, 66, 0.7)',
                        color: 'white',
                        borderRadius: '12px',
                        padding: '20px',
                        textAlign: 'center',
                        minWidth: '200px'
                    },
                }}
            >
                <DialogContent className="flex flex-col items-center justify-center p-0 overflow-hidden">
                    <div className="mb-4 flex justify-center">
                        {/* Green shopping cart icon */}
                        <BsFillCartCheckFill className="text-[#00c853] text-[50px]" />
                    </div>

                    <h2 className="text-[15px] font-bold text-white mb-6">
                        Sản phẩm đã được thêm vào giỏ hàng
                    </h2>

                    <div className="flex justify-center">
                        <Button
                            onClick={handleViewCart}
                            variant="contained"
                            className="!bg-white !text-gray-800 !px-4 !py-2 !rounded-full !font-medium !normal-case hover:!bg-gray-100"
                        >
                            Xem giỏ hàng
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ProductList;
