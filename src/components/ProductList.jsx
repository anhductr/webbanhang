import React, { useState, useEffect, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Grid, Navigation } from 'swiper/modules';
import { IoIosArrowForward, IoIosArrowBack } from "react-icons/io";
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Dialog, DialogContent, Button, Pagination } from '@mui/material';
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

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 4; // 2 columns x 2 rows

    // Tạo mảng sản phẩm ảo để fill cho đủ bộ 4 cái 1 trang (tránh bị lòi sản phẩm trang cũ sang trang cuối)
    const displayProducts = [...products];
    const remainder = products.length % itemsPerPage;
    if (remainder !== 0) {
        for (let i = 0; i < (itemsPerPage - remainder); i++) {
            displayProducts.push({ isPlaceholder: true });
        }
    }
    const totalPages = Math.ceil(displayProducts.length / itemsPerPage);

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

    const handlePageChange = (event, value) => {
        setCurrentPage(value);
        if (swiperRef.current && swiperRef.current.swiper) {
            // Khóa cứng: Trang 1 nhảy về cột 0, Trang 2 nhảy về cột 2...
            swiperRef.current.swiper.slideTo((value - 1) * 2);
        }
    };

    return (
        <div className="p-4">
            <h2 className="text-lg font-bold mb-4 text-gray-800">Danh sách sản phẩm</h2>
            <div className="relative group/list">
                <Swiper
                    slidesPerView={2}
                    slidesPerGroup={2}
                    grid={{
                        rows: 2,
                        fill: 'row'
                    }}
                    spaceBetween={10}
                    modules={[Grid, Navigation]}
                    onSlideChange={(swiper) => {
                        // snapIndex là chỉ số cụm (trang) hiện tại, cực kỳ chính xác
                        const newPage = swiper.snapIndex + 1;
                        if (newPage !== currentPage) {
                            setCurrentPage(newPage);
                        }
                    }}
                    className="mySwiper w-full mb-6 !h-[660px]"
                    ref={swiperRef}
                >
                    {displayProducts.map((product, index) => {
                        if (product.isPlaceholder) {
                            return <SwiperSlide key={`empty-${index}`} className="!h-[310px] invisible" />;
                        }

                        const name = product['TÊN SẢN PHẨM'];
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
                        const imageSrc = product['ảnh'] || (code ? `/products/${code}.jpg` : null);

                        return (
                            <SwiperSlide key={index} className="!h-[310px]">
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
                                                className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105 mix-blend-multiply"
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
                                    </div>

                                    <div className="flex flex-col flex-grow p-4 pt-2 gap-2">
                                        <h3 className="text-sm font-medium text-[#1a1a1a] line-clamp-2 text-center min-h-[40px] font-anton tracking-wide" title={name}>
                                            {name || 'Sản phẩm mới'}
                                        </h3>

                                        <div className="flex justify-center items-center gap-2 text-sm">
                                            {hasDiscount && (
                                                <span className="text-gray-400 line-through decoration-gray-400 text-xs">
                                                    {originalPrice}
                                                </span>
                                            )}
                                            <span className="text-red-600 font-[600]">
                                                {price}
                                            </span>
                                        </div>

                                        {/* Add to Cart Button - always visible */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                addToCart(product);
                                                setShowCartSuccessModal(true);
                                            }}
                                            className="w-full bg-red-600 text-white py-2 rounded-full 
                                                hover:bg-red-700 active:scale-95
                                                transition-all duration-200
                                                inline-flex items-center justify-center gap-1 text-[11px] font-semibold
                                                shadow-md"
                                        >
                                            <BsFillCartCheckFill className="flex-shrink-0" size={11} />
                                            <span>Thêm vào giỏ</span>
                                        </button>
                                    </div>
                                </div>
                            </SwiperSlide>
                        )
                    })}
                </Swiper>
            </div>

            {/* MUI Pagination */}
            <div className="mt-8 flex justify-center">
                <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={handlePageChange}
                    color="error" // Uses the red theme
                    size="small"
                    siblingCount={1}
                    boundaryCount={1}
                    sx={{
                        '& .MuiPaginationItem-root': {
                            fontWeight: 'bold',
                        },
                        '& .Mui-selected': {
                            backgroundColor: '#dc2626 !important', // red-600
                        }
                    }}
                />
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
