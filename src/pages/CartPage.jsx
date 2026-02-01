import React from 'react';
import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import { IoIosArrowBack, IoMdTrash, IoIosAdd, IoIosRemove } from "react-icons/io";

const CartPage = () => {
    const navigate = useNavigate();
    const { cartItems, removeFromCart, updateQuantity } = useCart();
    // Default to no selected items (or all selected, but user requested 'tick to show')
    const [selectedItems, setSelectedItems] = React.useState(new Set());

    const toggleSelection = (id) => {
        const newSelected = new Set(selectedItems);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedItems(newSelected);
    };

    const toggleSelectAll = () => {
        if (selectedItems.size === cartItems.length) {
            // If all selected, deselect all
            setSelectedItems(new Set());
        } else {
            // Select all
            const allIds = new Set(cartItems.map(item => item['MÃ SP']));
            setSelectedItems(allIds);
        }
    };

    const calculateTotal = () => {
        return cartItems.reduce((total, item) => {
            if (selectedItems.has(item['MÃ SP'])) {
                const price = item['Giá sau chiết khấu'] || 0;
                return total + price * item.quantity;
            }
            return total;
        }, 0);
    };

    const formatVND = (value) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(value);
    };

    const handleDeleteSelected = () => {
        // Remove all selected items from cart
        selectedItems.forEach(id => {
            removeFromCart(id);
        });
        // Clear selection after deletion
        setSelectedItems(new Set());
    };

    return (
        <div className="p-4 min-h-screen bg-gray-50">
            <div className="flex items-center mb-4">
                <Link to="/" className="mr-4 text-gray-600">
                    <IoIosArrowBack size={24} />
                </Link>
                <h2 className="text-xl font-bold text-gray-800">Giỏ hàng ({cartItems.length})</h2>
            </div>

            {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[50vh] text-gray-500">
                    <p className="mb-4">Giỏ hàng trống</p>
                    <Link to="/" className="px-6 py-2 bg-black text-white rounded-full">
                        Tiếp tục mua sắm
                    </Link>
                </div>
            ) : (
                <div className="space-y-4 pb-24">
                    {/* Select All Checkbox */}
                    <div className="bg-white p-3 rounded-lg shadow-sm flex items-center justify-between">
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                checked={selectedItems.size === cartItems.length && cartItems.length > 0}
                                onChange={toggleSelectAll}
                                className="w-5 h-5 accent-red-600 border-gray-300 rounded cursor-pointer mr-3"
                            />
                            <span className="text-sm font-semibold text-gray-700">
                                Chọn tất cả ({cartItems.length})
                            </span>
                        </div>
                        {selectedItems.size > 0 && (
                            <button
                                onClick={handleDeleteSelected}
                                className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white text-xs font-semibold rounded-full hover:bg-red-700 transition-colors"
                            >
                                <IoMdTrash size={16} />
                                Xóa ({selectedItems.size})
                            </button>
                        )}
                    </div>

                    {cartItems.map((item) => (
                        <div key={item['MÃ SP']} className="bg-white p-3 rounded-lg shadow-sm flex gap-3 items-center">
                            <input
                                type="checkbox"
                                checked={selectedItems.has(item['MÃ SP'])}
                                onChange={() => toggleSelection(item['MÃ SP'])}
                                className="w-5 h-5 accent-red-600 border-gray-300 rounded cursor-pointer mr-2"
                            />
                            <div className="w-20 h-20 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                                <img
                                    src={item['ảnh'] || `https://placehold.co/150?text=${item['MÃ SP']}`}
                                    alt={item['TÊN SẢN PHẨM']}
                                    className="w-full h-full object-cover mix-blend-multiply"
                                />
                            </div>
                            <div className="flex-grow flex flex-col justify-between">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-800 line-clamp-2 font-anton tracking-wide">{item['TÊN SẢN PHẨM']}</h3>
                                    <p className="text-xs text-gray-500 mt-1">Mã: {item['MÃ SP']}</p>
                                </div>
                                <div className="flex items-center justify-between mt-2">
                                    <div className="flex flex-col">
                                        {item['GIÁ NIÊM YẾT'] && item['GIÁ NIÊM YẾT'] > item['Giá sau chiết khấu'] && (
                                            <p className="text-xs text-gray-400 line-through mb-0.5">{formatVND(item['GIÁ NIÊM YẾT'])}</p>
                                        )}
                                        <p className="text-red-600 font-bold">{formatVND(item['Giá sau chiết khấu'])}</p>
                                    </div>
                                    <div className="flex items-center border border-gray-200 rounded">
                                        <button
                                            onClick={() => updateQuantity(item['MÃ SP'], item.quantity - 1)}
                                            className="p-1 hover:bg-gray-100 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                            disabled={item.quantity <= 1}
                                        >
                                            <IoIosRemove size={16} />
                                        </button>
                                        <span className="px-3 text-sm font-medium text-gray-800">{item.quantity || 1}</span>
                                        <button
                                            onClick={() => updateQuantity(item['MÃ SP'], item.quantity + 1)}
                                            className="p-1 hover:bg-gray-100 text-gray-600"
                                        >
                                            <IoIosAdd size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => removeFromCart(item['MÃ SP'])}
                                className="text-gray-400 hover:text-red-500 self-start"
                            >
                                <IoMdTrash size={20} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {selectedItems.size > 0 && cartItems.length > 0 && (
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 max-w-[480px] mx-auto">
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-gray-600">Tổng cộng:</span>
                        <span className="text-xl font-bold text-red-600">{formatVND(calculateTotal())}</span>
                    </div>
                    <button
                        onClick={() => navigate('/checkout', { state: { selectedIds: Array.from(selectedItems) } })}
                        className="w-full py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors"
                    >
                        Thanh toán ({selectedItems.size})
                    </button>
                </div>
            )}
        </div>
    );
};

export default CartPage;
