import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
import { BsFillCheckCircleFill, BsHeartFill } from "react-icons/bs";
import { IoIosArrowForward } from "react-icons/io";

const ThankYouPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 bg-white overflow-hidden relative">
            {/* Background Decorative Elements */}

            <div className="z-10 flex flex-col items-center w-full text-center">
                <div className="mb-8 relative animate-bounce">
                    <BsFillCheckCircleFill className="text-[#00c853] text-[80px] drop-shadow-lg" />
                    {/* <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow-md">
                        <BsHeartFill className="text-red-500 text-2xl" />
                    </div> */}
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-4 font-anton tracking-wide uppercase">
                    Cảm ơn bạn đã mua sắm!
                </h1>

                <div className="w-16 h-1 bg-red-600 mb-6 rounded-full mx-auto"></div>

                <p className="text-gray-600 mb-10 leading-relaxed px-4 text-sm md:text-base">
                    Đơn hàng của bạn đã được tiếp nhận thành công. <br />
                    Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất để xác nhận và giao hàng. <br />
                    Chúc bạn một ngày tràn đầy năng lượng và niềm vui!
                </p>

                <div className="flex flex-col w-full gap-4">
                    <Button
                        onClick={() => navigate('/')}
                        variant="contained"
                        className="!bg-red-600 !text-white !py-4 !rounded-full !font-bold !text-sm !normal-case hover:!bg-red-700 !transition-all !duration-300 shadow-xl hover:translate-y-[-2px] active:scale-95 group"
                    >
                        <span>Tiếp tục mua sắm</span>
                        <IoIosArrowForward className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>

                    <p className="text-xs text-gray-400 mt-4 italic">
                        Cần hỗ trợ? Liên hệ ngay với bộ phận chăm sóc khách hàng của chúng tôi.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ThankYouPage;
