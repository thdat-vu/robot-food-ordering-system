const ThankYouScreen = () => {
    return (
        <div className="min-h-screen bg-gradient-to-b from-orange-50 to-amber-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full text-center">
                <div className="flex justify-center mb-8">
                    <div
                        className="w-40 h-40 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-2xl">
                        <svg className="w-24 h-24 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path
                                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                            <path d="M12 6c-3.31 0-6 2.69-6 6h2c0-2.21 1.79-4 4-4s4 1.79 4 4h2c0-3.31-2.69-6-6-6z"/>
                            <circle cx="9" cy="13" r="1"/>
                            <circle cx="15" cy="13" r="1"/>
                            <path d="M12 17c1.66 0 3-1.34 3-3h-6c0 1.66 1.34 3 3 3z"/>
                        </svg>
                    </div>
                </div>

                <h1 className="text-4xl font-bold text-gray-800 mb-6">
                    Cảm Ơn Quý Khách!
                </h1>

                <p className="text-xl text-gray-600 leading-relaxed">
                    Chúng tôi rất vui được phục vụ bạn.<br/>
                    Hẹn gặp lại!
                </p>
            </div>
        </div>
    );
};

export default ThankYouScreen;