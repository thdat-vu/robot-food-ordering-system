import React, { useState, useEffect } from 'react';
import { ChevronDown, ArrowLeft, Menu } from 'lucide-react';

const ThankYouScreen = () => {
  const [mounted, setMounted] = useState(false);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [confetti, setConfetti] = useState([]);

  useEffect(() => {
    setMounted(true);
    
    // Generate confetti particles
    const particles = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 2 + Math.random() * 2,
      color: ['#10B981', '#F59E0B', '#EF4444', '#3B82F6'][Math.floor(Math.random() * 4)]
    }));
    setConfetti(particles);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white relative overflow-hidden">
      
      {confetti.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-2 h-2 rounded-full"
          style={{
            left: `${particle.left}%`,
            top: '-20px',
            backgroundColor: particle.color,
            animation: `fall ${particle.duration}s linear ${particle.delay}s infinite`,
            opacity: 0.8
          }}
        />
      ))}

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between p-4 pt-6">
        <button className="p-2 hover:bg-slate-800 rounded-full transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">Phở Hà Nội</h1>
        <button className="p-2 hover:bg-slate-800 rounded-full transition-colors">
          <Menu size={24} />
        </button>
      </div>

      {/* Main content */}
      <div className={`relative z-10 flex flex-col items-center px-6 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>


        {/* Success checkmark */}
        <div className="mb-6 animate-checkmark">
          <div className="w-20 h-20 rounded-full border-4 border-emerald-400 flex items-center justify-center bg-slate-800/50 backdrop-blur">
            <svg className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        {/* Thank you message */}
        <h2 className="text-3xl font-bold text-center mb-3">
          Cảm ơn quý khách
        </h2>
        <h3 className="text-3xl font-bold text-center mb-6">
          đã đặt hàng
        </h3>

        <p className="text-gray-300 text-center text-lg mb-8">
          Mã đơn hàng: <span className="text-emerald-400 font-bold">#DH240119</span>
        </p>

        {/* Divider */}
        <div className="w-full max-w-md h-px bg-slate-700 mb-6"></div>

        {/* Order Details Dropdown */}
        <button 
          onClick={() => setShowOrderDetails(!showOrderDetails)}
          className="w-full max-w-md flex items-center justify-between py-4 px-6 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors mb-6"
        >
          <span className="text-gray-300 text-lg">Chi tiết đơn hàng</span>
          <ChevronDown 
            size={24} 
            className={`text-gray-400 transition-transform duration-300 ${showOrderDetails ? 'rotate-180' : ''}`}
          />
        </button>

        {/* Order Details Content */}
        <div 
          className={`w-full max-w-md overflow-hidden transition-all duration-300 mb-8 ${
            showOrderDetails ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="bg-slate-800/50 rounded-lg p-6 space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-300">Phở bò tái</span>
              <span className="text-white font-semibold">x2</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Phở gà</span>
              <span className="text-white font-semibold">x1</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Chả giò</span>
              <span className="text-white font-semibold">x3</span>
            </div>
            <div className="h-px bg-slate-700 my-3"></div>
            <div className="flex justify-between text-lg">
              <span className="text-emerald-400 font-bold">Tổng cộng:</span>
              <span className="text-emerald-400 font-bold">285.000đ</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full max-w-md space-y-3 mb-8">
          <button className="w-full py-4 bg-pink-400 hover:bg-pink-500 rounded-full font-bold text-slate-900 text-lg transition-colors shadow-lg">
            Tiếp tục đặt món
          </button>
          
          <button className="w-full py-4 bg-transparent border-2 border-gray-500 hover:border-gray-400 rounded-full font-semibold text-gray-300 hover:text-white text-lg transition-colors">
            Theo dõi đơn hàng
          </button>
        </div>

        {/* Footer message */}
        <div className="text-center mb-8 space-y-2">
          <p className="text-emerald-400 font-semibold text-lg">
            🍜 Món ăn đang được chuẩn bị!
          </p>
          <p className="text-gray-400 text-sm">
            Thời gian dự kiến: 15-20 phút
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fall {
          0% {
            transform: translateY(-20px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }

        @keyframes celebration {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          25% {
            transform: translateY(-10px) rotate(-2deg);
          }
          75% {
            transform: translateY(-10px) rotate(2deg);
          }
        }

        @keyframes checkmark {
          0% {
            transform: scale(0) rotate(-45deg);
            opacity: 0;
          }
          50% {
            transform: scale(1.2) rotate(10deg);
          }
          100% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
        }

        @keyframes float-1 {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
          }
          50% {
            transform: translateY(-20px) translateX(10px);
          }
        }

        @keyframes float-2 {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
          }
          50% {
            transform: translateY(-25px) translateX(-10px);
          }
        }

        .animate-celebration {
          animation: celebration 3s ease-in-out infinite;
        }

        .animate-checkmark {
          animation: checkmark 0.6s ease-out;
        }

        .animate-float-1 {
          animation: float-1 3s ease-in-out infinite;
        }

        .animate-float-2 {
          animation: float-2 3.5s ease-in-out infinite;
          animation-delay: 0.5s;
        }
      `}</style>
    </div>
  );
};

export default ThankYouScreen;