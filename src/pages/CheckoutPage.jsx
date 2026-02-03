import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { IoIosArrowBack, IoMdCard, IoMdCash, IoMdQrScanner } from "react-icons/io";
import { Dialog, DialogContent, Button, CircularProgress } from '@mui/material';
import { BsFillCheckCircleFill, BsFillExclamationCircleFill } from "react-icons/bs";

const CheckoutPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { cartItems, clearCart } = useCart();
    const [selectedItems, setSelectedItems] = useState([]);

    // Order Form State
    const [receiverName, setReceiverName] = useState("");
    const [receiverPhone, setReceiverPhone] = useState("");
    const [addressLine, setAddressLine] = useState("");
    const [note, setNote] = useState("");

    const [province, setProvince] = useState(null);
    const [ward, setWard] = useState(null);

    const [provinces, setProvinces] = useState([]);
    const [wards, setWards] = useState([]);

    // Result Modal State
    const [showResultModal, setShowResultModal] = useState(false);
    const [resultMessage, setResultMessage] = useState("");
    const [isError, setIsError] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showQRModal, setShowQRModal] = useState(false);

    /* ===== load tỉnh, thành ===== */
    useEffect(() => {
        fetch("https://provinces.open-api.vn/api/v2/p/")
            .then(res => res.json())
            .then(setProvinces)
            .catch(err => console.error("Error loading provinces:", err));
    }, []);

    useEffect(() => {
        console.log(province);
    }, [province])

    /* ===== load phường, xã ===== */
    useEffect(() => {
        if (!province) {
            setWards([]);
            setWard(null);
            return;
        }
        fetch(`https://provinces.open-api.vn/api/v2/p/${province.code}?depth=2`)
            .then(res => res.json())
            .then(data => {
                setWards(data.wards || []);
                setWard(null);
            })
            .catch(err => console.error("Error loading wards:", err));
    }, [province]);

    // Payment Method State
    const [paymentMethod, setPaymentMethod] = useState('COD');

    useEffect(() => {
        // Retrieve selected IDs from navigation state
        const selectedIds = location.state?.selectedIds || [];

        if (selectedIds.length === 0) {
            // Redirect back to cart if no items selected
            navigate('/cart');
            return;
        }

        // Filter cart items to get only selected ones
        const items = cartItems.filter(item => selectedIds.includes(item['MÃ SP']));
        setSelectedItems(items);
    }, [location.state, cartItems, navigate]);


    const calculateSubtotal = () => {
        return selectedItems.reduce((total, item) => {
            const price = item['Giá sau chiết khấu'] || 0;
            return total + price * item.quantity;
        }, 0);
    };

    const formatVND = (value) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(value);
    };

    const shippingFee = 0; // Default or logic later
    const discount = 0; // Default or logic later
    const subtotal = calculateSubtotal();
    const total = subtotal + shippingFee - discount;

    const processSubmitOrder = async () => {
        const fullAddress = `${addressLine}, ${ward.name}, ${province.name}`;

        const paymentMethodMap = {
            'COD': 'Thanh toán khi nhận hàng (COD)',
            'TRANSFER': 'Chuyển khoản ngân hàng',
            'QR': 'Ví điện tử / QR Code'
        };

        setIsLoading(true);

        // Format product list as "Product Name x Quantity, ..."
        const productList = selectedItems
            .map(item => `${item['TÊN SẢN PHẨM']} x${item.quantity}`)
            .join(', ');

        const formData = new FormData();
        formData.append('entry.214513490', receiverName);
        formData.append('entry.634596298', receiverPhone);
        formData.append('entry.1032170464', fullAddress);
        formData.append(
            'entry.494103685',
            paymentMethodMap[paymentMethod] || paymentMethod
        );
        formData.append('entry.578693070', productList);
        formData.append('entry.1124475657', formatVND(total));
        formData.append('entry.1637574912', note);

        try {
            await fetch(
                'https://docs.google.com/forms/u/0/d/e/1FAIpQLSeBXL6GhIY6X4wNr3O16FL0qz8ZMWiaRmhcobjxRsNgM8ow4g/formResponse',
                {
                    method: 'POST',
                    mode: 'no-cors',
                    body: formData
                }
            );

            setIsLoading(false);
            setResultMessage('Đặt hàng thành công! Chúng tôi sẽ liên hệ sớm.');
            setIsError(false);
            setShowResultModal(true);
            clearCart(); // Clear the cart after success
        } catch (err) {
            setIsLoading(false);
            setResultMessage('Có lỗi xảy ra, vui lòng thử lại!');
            setIsError(true);
            setShowResultModal(true);
        }
    };

    const handleConfirmOrder = async () => {
        if (!receiverName || !receiverPhone || !addressLine || !province || !ward) {
            setResultMessage('Vui lòng điền đầy đủ thông tin giao hàng!');
            setIsError(true);
            setShowResultModal(true);
            return;
        }

        // Nếu là chuyển khoản hoặc QR thì hiện modal QR trước
        if (paymentMethod === 'TRANSFER' || paymentMethod === 'QR') {
            setShowQRModal(true);
        } else {
            // Nếu là COD thì gửi luôn
            processSubmitOrder();
        }
    };

    return (
        <div className="p-4 min-h-screen bg-gray-50 pb-32"> {/* Added pb-32 to prevent fixed bottom overlap */}
            <div className="flex items-center mb-6">
                <Link to="/cart" className="mr-4 text-gray-600">
                    <IoIosArrowBack size={24} />
                </Link>
                <h2 className="text-base font-bold text-gray-800">Thanh toán</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column: Products & Info */}
                <div className="space-y-6">
                    {/* B. Thông tin đặt hàng */}
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                        <h3 className="font-bold text-sm mb-3 text-gray-800 border-b pb-2">Thông tin giao hàng</h3>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Họ tên *</label>
                                <input
                                    type="text"
                                    value={receiverName}
                                    onChange={(e) => setReceiverName(e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded focus:ring-red-500 focus:border-red-500 text-xs"
                                    placeholder="Nhập họ tên người nhận"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Số điện thoại *</label>
                                <input
                                    type="tel"
                                    value={receiverPhone}
                                    onChange={(e) => setReceiverPhone(e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded focus:ring-red-500 focus:border-red-500 text-xs"
                                    placeholder="Nhập số điện thoại"
                                />
                            </div>

                            {/* Address Selection */}
                            <div className="flex flex-col gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Tỉnh / Thành *</label>
                                    <select
                                        className="w-full p-2 border border-gray-300 rounded focus:ring-red-500 focus:border-red-500 text-xs"
                                        value={province ? JSON.stringify(province) : ""}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setProvince(val ? JSON.parse(val) : null);
                                        }}
                                    >
                                        <option value="">Chọn Tỉnh/Thành</option>
                                        {provinces.map(p => (
                                            <option key={p.code} value={JSON.stringify(p)}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Phường / Xã *</label>
                                    <select
                                        className="w-full p-2 border border-gray-300 rounded focus:ring-red-500 focus:border-red-500 disabled:bg-gray-100 text-xs"
                                        value={ward ? JSON.stringify(ward) : ""}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setWard(val ? JSON.parse(val) : null);
                                        }}
                                        disabled={!province}
                                    >
                                        <option value="">Chọn Phường/Xã</option>
                                        {wards.map(w => (
                                            <option key={w.code} value={JSON.stringify(w)}>{w.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Địa chỉ cụ thể *</label>
                                <input
                                    type="text"
                                    value={addressLine}
                                    onChange={(e) => setAddressLine(e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded focus:ring-red-500 focus:border-red-500 text-xs"
                                    placeholder="Số nhà, tên đường"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Ghi chú</label>
                                <textarea
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    rows="1"
                                    className="w-full p-2 border border-gray-300 rounded focus:ring-red-500 focus:border-red-500 text-xs"
                                    placeholder="Lời nhắn cho shipper..."
                                ></textarea>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Payment & Totals */}
                <div className="space-y-6">
                    {/* A. Sản phẩm sẽ thanh toán */}
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                        <h3 className="font-bold text-sm mb-3 text-gray-800 border-b pb-2">Sản phẩm ({selectedItems.length})</h3>
                        <div className="space-y-4">
                            {selectedItems.map((item) => (
                                <div key={item['MÃ SP']} className="flex gap-3 items-center">
                                    <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                                        <img
                                            src={item['ảnh'] || `https://placehold.co/150?text=${item['MÃ SP']}`}
                                            alt={item['TÊN SẢN PHẨM']}
                                            className="w-full h-full object-cover mix-blend-multiply"
                                        />
                                    </div>
                                    <div className="flex-grow">
                                        <h4 className="text-xs font-medium text-gray-800 line-clamp-1">{item['TÊN SẢN PHẨM']}</h4>
                                        <div className="flex justify-between items-center mt-1">
                                            <p className="text-xs text-gray-500">SL: {item.quantity}</p>
                                            <div className="text-right">
                                                {item['GIÁ NIÊM YẾT'] > item['Giá sau chiết khấu'] && (
                                                    <p className="text-[10px] text-gray-400 line-through">
                                                        {formatVND(item['GIÁ NIÊM YẾT'] * item.quantity)}
                                                    </p>
                                                )}
                                                <p className="text-[11px] font-bold text-red-600">
                                                    {formatVND(item['Giá sau chiết khấu'] * item.quantity)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* C. Phương thức thanh toán */}
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                        <h3 className="font-bold text-sm mb-3 text-gray-800 border-b pb-2">Phương thức thanh toán</h3>
                        <div className="space-y-2">
                            <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                <input
                                    type="radio"
                                    name="payment"
                                    value="COD"
                                    checked={paymentMethod === 'COD'}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className="w-4 h-4 text-red-600 focus:ring-red-500"
                                />
                                <div className="ml-3 flex items-center">
                                    <IoMdCash className="text-gray-600 mr-2" size={20} />
                                    <span className="text-gray-800 font-medium text-xs">Thanh toán khi nhận hàng (COD)</span>
                                </div>
                            </label>

                            <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                <input
                                    type="radio"
                                    name="payment"
                                    value="TRANSFER"
                                    checked={paymentMethod === 'TRANSFER'}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className="w-4 h-4 text-red-600 focus:ring-red-500"
                                />
                                <div className="ml-3 flex items-center">
                                    <IoMdCard className="text-gray-600 mr-2" size={20} />
                                    <span className="text-gray-800 font-medium text-xs">Chuyển khoản ngân hàng</span>
                                </div>
                            </label>

                            <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                <input
                                    type="radio"
                                    name="payment"
                                    value="QR"
                                    checked={paymentMethod === 'QR'}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className="w-4 h-4 text-red-600 focus:ring-red-500"
                                />
                                <div className="ml-3 flex items-center">
                                    <IoMdQrScanner className="text-gray-600 mr-2" size={20} />
                                    <span className="text-gray-800 font-medium text-xs">Ví điện tử / QR Code</span>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* D. Tổng tiền cuối cùng */}
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                        <h3 className="font-bold text-sm mb-3 text-gray-800 border-b pb-2">Chi tiết thanh toán</h3>
                        <div className="space-y-2 text-xs text-gray-600">
                            <div className="flex justify-between">
                                <span>Tạm tính</span>
                                <span>{formatVND(subtotal)}</span>
                            </div>
                            {/* <div className="flex justify-between">
                                <span>Phí vận chuyển</span>
                                <span>{shippingFee === 0 ? 'Miễn phí' : formatVND(shippingFee)}</span>
                            </div> */}
                            <div className="border-t pt-2 mt-2 flex justify-between items-center">
                                <span className="font-bold text-gray-800 text-sm">Tổng</span>
                                <span className="font-bold text-red-600 text-[15px]">{formatVND(total)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sticky Bottom Actions */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
                <div className="mx-auto flex justify-center items-center gap-4">
                    <button
                        onClick={handleConfirmOrder}
                        className="w-full md:w-auto px-8 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors uppercase tracking-wide text-xs"
                    >
                        Xác nhận đặt hàng
                    </button>
                </div>
            </div>

            {/* QR Payment Modal */}
            <Dialog
                open={showQRModal}
                onClose={(event, reason) => {
                    if (reason === 'backdropClick' || reason === 'escapeKeyDown') {
                        return; // chặn đóng khi click ngoài hoặc bấm ESC
                    }
                    setShowQRModal(false);
                }}
                maxWidth="xs"
                PaperProps={{
                    style: {
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        padding: '24px',
                        textAlign: 'center',
                        width: '90%',
                        maxWidth: '400px',
                        margin: 'auto' // Đảm bảo căn giữa tuyệt đối
                    },
                }}
            >
                <DialogContent className="flex flex-col items-center justify-center p-0 overflow-hidden">
                    <h2 className="text-[16px] font-bold text-gray-800 mb-4 uppercase">
                        Quét mã thanh toán
                    </h2>
                    <div className="w-full aspect-square bg-gray-100 rounded-lg mb-6 flex items-center justify-center overflow-hidden border">
                        {/* Bác thay cái URL ảnh QR thật của bác vào đây nhé */}
                        <img
                            src="https://placehold.co/400x400?text=QR+CODE+THANH+TOAN"
                            alt="QR Payment"
                            className="w-full h-full object-contain"
                        />
                    </div>

                    <div className="bg-blue-50 p-3 rounded-lg w-full mb-6">
                        <p className="text-xs text-blue-700 leading-relaxed font-medium">
                            Vui lòng thanh toán theo thông tin mã QR phía trên sau đó nhấn xác nhận.
                        </p>
                    </div>

                    <div className="flex flex-col w-full gap-3">
                        <Button
                            onClick={() => {
                                setShowQRModal(false);
                                processSubmitOrder();
                            }}
                            variant="contained"
                            className="!bg-red-600 !text-white !py-3 !rounded-lg !font-bold !normal-case hover:!bg-red-700 !text-sm"
                        >
                            Xác nhận đã thanh toán
                        </Button>
                        <Button
                            onClick={() => setShowQRModal(false)}
                            variant="text"
                            className="!text-gray-500 !font-medium !normal-case !text-xs"
                        >
                            Quay lại
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Result Modal */}
            <Dialog
                open={showResultModal}
                onClose={(event, reason) => {
                    if (reason === 'backdropClick' || reason === 'escapeKeyDown') {
                        return; // chặn đóng khi click ngoài hoặc bấm ESC
                    }
                    setShowResultModal(false);
                }}
                maxWidth="xs"
                PaperProps={{
                    style: {
                        backgroundColor: 'rgba(56, 62, 66, 0.85)',
                        color: 'white',
                        borderRadius: '12px',
                        padding: '24px',
                        textAlign: 'center',
                        width: '90%',
                        maxWidth: '400px',
                        margin: 'auto'
                    },
                }}
            >
                <DialogContent className="flex flex-col items-center justify-center p-0 overflow-hidden">
                    <div className="mb-4 flex justify-center">
                        {isError ? (
                            <BsFillExclamationCircleFill className="text-[#ff5252] text-[50px]" />
                        ) : (
                            <BsFillCheckCircleFill className="text-[#00c853] text-[50px]" />
                        )}
                    </div>

                    <h2 className="text-[14px] font-medium text-white mb-6 leading-relaxed">
                        {resultMessage}
                    </h2>

                    <div className="flex justify-center">
                        {isError ? (
                            <Button
                                onClick={() => {
                                    setShowResultModal(false);
                                }}
                                variant="contained"
                                className="!bg-white !text-gray-800 !px-6 !py-2 !rounded-full !font-bold !normal-case hover:!bg-gray-100 !text-xs"
                            >
                                Tiếp tục bổ sung thông tin
                            </Button>

                        ) : (
                            <Button
                                onClick={() => {
                                    setShowResultModal(false);
                                    navigate('/thank-you');
                                }}
                                variant="contained"
                                className="!bg-white !text-gray-800 !px-6 !py-2 !rounded-full !font-bold !normal-case hover:!bg-gray-100 !text-xs"
                            >
                                Đóng
                            </Button>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Loading Modal */}
            <Dialog
                open={isLoading}
                maxWidth="xs"
                PaperProps={{
                    style: {
                        backgroundColor: 'rgba(56, 62, 66, 0.95)',
                        color: 'white',
                        borderRadius: '12px',
                        padding: '32px',
                        textAlign: 'center',
                        minWidth: '280px'
                    },
                }}
            >
                <DialogContent className="flex flex-col items-center justify-center p-0 overflow-hidden">
                    <CircularProgress
                        size={60}
                        thickness={4}
                        sx={{
                            color: 'white',
                            marginBottom: '20px'
                        }}
                    />
                    <h2 className="text-[14px] font-medium text-white">
                        Đang xử lý đơn hàng...
                    </h2>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default CheckoutPage;
