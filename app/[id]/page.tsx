"use client";

import {useRouter} from "next/navigation";
import {useGetTable} from "@/hooks/customHooks/useTableHooks";
import {use, useEffect, useState, useCallback, useRef} from "react";
import {useTableContext} from "@/hooks/context/Context";
import {useDeviceToken} from "@/hooks/context/deviceTokenContext";
import {TABLE_STORE, TOKEN_Bro_VALUE} from "@/name-value-env";
import {tokenAuthentic} from "@/unit/unit";
import {Table} from "@/entites/respont/Table";
import {MobileDialog} from "@/components/common/MobileDialog";
import {ErroTable} from "@/api/TableApi";
import {ENDPOINT} from "@/api-endpoint-env";
import {addProduction} from "@/store/ShoppingCart";
import {Frame1} from "@/app/[id]/Frame1";
import {Frame2} from "@/app/[id]/Frame2";
import {Frame3} from "@/app/[id]/Frame3";
import {FaCamera} from "react-icons/fa";
import {DialogComponation} from "@/components/common/Dialog";
import {Loader2} from "lucide-react"; // Import loading icon

const checkTable = (obj: any): obj is Table => {
    return obj && typeof obj.id === "string" && typeof obj.name === "string";
}

const isInWebView = (): boolean => {
    const userAgent = navigator.userAgent.toLowerCase();
    const webViewIndicators = [
        'wv', 'fbav', 'instagram', 'line', 'micromessenger',
        'snapchat', 'twitter', 'tiktok', 'zalo',
    ];
    const isWebView = webViewIndicators.some(indicator => userAgent.includes(indicator));
    const isAndroidWebView = userAgent.includes('android') && userAgent.includes('wv') && !userAgent.includes('chrome');
    const isIOSWebView = userAgent.includes('iphone') && !userAgent.includes('safari') && userAgent.includes('mobile');
    return isWebView || isAndroidWebView || isIOSWebView;
};

const openInBrowser = (url: string): void => {
    const newWindow = window.open(url, '_blank');
    if (!newWindow) {
        const link = document.createElement('a');
        link.href = url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    const userAgent = navigator.userAgent.toLowerCase();
    setTimeout(() => {
        if (userAgent.includes('fbav') || userAgent.includes('instagram') || userAgent.includes('line')) {
            window.location.href = url;
        } else if (!userAgent.includes('micromessenger')) {
            window.location.href = url;
        }
    }, 100);
};

const getWebViewAppName = (): string => {
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes('fbav')) return 'Facebook';
    if (userAgent.includes('instagram')) return 'Instagram';
    if (userAgent.includes('line')) return 'Line';
    if (userAgent.includes('micromessenger')) return 'WeChat';
    if (userAgent.includes('snapchat')) return 'Snapchat';
    if (userAgent.includes('twitter')) return 'Twitter';
    if (userAgent.includes('tiktok')) return 'TikTok';
    if (userAgent.includes('zalo')) return 'Zalo';
    return 'App';
};

export default function Home({params}: { params: Promise<{ id: string }> }) {
    const {id} = use(params);
    const router = useRouter();
    const {setTable} = useTableContext();
    const deviceTokenContext = useDeviceToken();
    const {run} = useGetTable();

    const scannerRef = useRef<any>(null);
    const hasFetchedRef = useRef<boolean>(false);
    const isInitializingRef = useRef<boolean>(false);

    const [step, setStep] = useState<number>(1);
    const [scannerOpen, setScannerOpen] = useState(false);
    const [scannedResult, setScannedResult] = useState<string>("");
    const [data, setData] = useState<Table>();
    const [loading, setLoading] = useState<boolean>(true);
    const [isFetchingData, setIsFetchingData] = useState<boolean>(false);
    const [showWebViewPrompt, setShowWebViewPrompt] = useState<boolean>(false);
    const [hasRedirected, setHasRedirected] = useState<boolean>(false);
    const [webViewApp, setWebViewApp] = useState<string>('');
    const [errlog, setErrlog] = useState<{
        status: boolean,
        message: string,
        title: string
    }>();
    const [open, setOpen] = useState<boolean>(false);
    const [shouldShowErrorDialog, setShouldShowErrorDialog] = useState<boolean>(false);
    const [hasTableError, setHasTableError] = useState<boolean>(false);

    useEffect(() => {
        const handleWebViewCheck = () => {
            if (!hasRedirected && isInWebView()) {
                const appName = getWebViewAppName();
                setWebViewApp(appName);

                if (navigator.userAgent.toLowerCase().includes('micromessenger')) {
                    setShowWebViewPrompt(true);
                    setLoading(false);
                    return;
                }

                const targetUrl = `${ENDPOINT}/${id}`;
                console.log('WebView detected, redirecting to browser:', targetUrl);

                openInBrowser(targetUrl);
                setHasRedirected(true);

                setTimeout(() => {
                    if (!document.hidden) {
                        setShowWebViewPrompt(true);
                        setLoading(false);
                    }
                }, 2000);

                return;
            }

            setLoading(false);
        };

        handleWebViewCheck();
    }, [id, hasRedirected]);

    // Initialize device token
    useEffect(() => {
        const initToken = async () => {
            if (isInitializingRef.current || showWebViewPrompt || hasRedirected || loading || isInWebView()) {
                return;
            }

            isInitializingRef.current = true;

            const storedToken = localStorage.getItem(TOKEN_Bro_VALUE);

            if (!storedToken) {
                try {
                    const temp = await tokenAuthentic();
                    console.log("New token:", temp);

                    if (temp) {
                        deviceTokenContext.setDeviceToken(temp);
                        localStorage.setItem(TOKEN_Bro_VALUE, temp);
                    }
                } catch (error) {
                    console.error("Error authenticating token:", error);
                }
            } else {
                deviceTokenContext.setDeviceToken(storedToken);
            }
        };

        initToken();
    }, [showWebViewPrompt, hasRedirected, loading]);

    // ✅ Load table data with loading state
    useEffect(() => {
        const loadData = async () => {
            if (hasFetchedRef.current || showWebViewPrompt || hasRedirected || isInWebView()) {
                return;
            }

            const key = localStorage.getItem(TOKEN_Bro_VALUE);

            if (!key || !id) {
                return;
            }

            hasFetchedRef.current = true;
            setIsFetchingData(true);

            console.log("Fetching table data...");

            try {
                const result: Table | ErroTable = await run(id, key);

                if (checkTable(result)) {
                    setData(result);
                    localStorage.removeItem(TABLE_STORE);
                    addProduction<Table>(TABLE_STORE, result);
                    setErrlog(undefined);
                    setShouldShowErrorDialog(false);
                    setHasTableError(false);
                    console.log("Table loaded successfully:", result);
                } else if (result && typeof result === 'object' && 'status' in result && 'message' in result) {
                    const errorResult = result as ErroTable;

                    setErrlog({
                        title: "Lỗi",
                        status: false,
                        message: result.message
                    });

                    setErrlog({
                        title: "Cảnh Báo",
                        status: errorResult.status,
                        message: errorResult.message
                    });
                    setData(undefined);
                    setShouldShowErrorDialog(false);
                    setHasTableError(true);
                }
            } catch (error) {
                console.error('Error loading table data:', error);
                setErrlog({
                    title: "Lỗi",
                    status: false,
                    message: "Không thể tải dữ liệu bàn"
                });
                setData(undefined);
                setShouldShowErrorDialog(false);
                setHasTableError(true);
            } finally {
                setIsFetchingData(false); // ✅ Kết thúc loading
            }
        };

        loadData();
    }, []);
    //id, showWebViewPrompt, hasRedirected

    // Set table context effect
    useEffect(() => {
        if (data && checkTable(data)) {
            setTable(id, data.status, data.name);
        }
    }, [data, id, setTable]);

    // QR Scanner effect
    useEffect(() => {
        if (!scannerOpen || typeof window === 'undefined') {
            return;
        }

        let timeoutId: NodeJS.Timeout;

        import('html5-qrcode').then(({Html5QrcodeScanner}) => {
            timeoutId = setTimeout(() => {
                try {
                    scannerRef.current = new Html5QrcodeScanner(
                        "qr-reader",
                        {
                            fps: 10,
                            qrbox: {width: 250, height: 250},
                            aspectRatio: 1.0,
                            disableFlip: false,
                        },
                        false
                    );

                    scannerRef.current.render(
                        (decodedText: string) => {
                            console.log("QR Code scanned:", decodedText);
                            setScannedResult(decodedText);

                            if (scannerRef.current) {
                                scannerRef.current.clear().catch(console.error);
                                scannerRef.current = null;
                            }

                            setScannerOpen(false);
                            handleQRCodeScanned(decodedText);
                        },
                        (error: any) => {
                            // Lỗi quét
                        }
                    );
                } catch (error) {
                    console.error("Error initializing scanner:", error);
                }
            }, 100);
        });

        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            if (scannerRef.current) {
                scannerRef.current.clear().catch(console.error);
                scannerRef.current = null;
            }
        };
    }, [scannerOpen]);

    // Handle QR code scanned
    const handleQRCodeScanned = async (result: string) => {
        try {
            console.log("Processing QR result:", result);

            const currentDeviceToken = deviceTokenContext.deviceToken;

            if (!currentDeviceToken) {
                setErrlog({
                    title: "Lỗi",
                    status: false,
                    message: "Không tìm thấy Device ID. Vui lòng thử lại!"
                });
                setShouldShowErrorDialog(true);
                setOpen(true);
                return;
            }

            let shareUrl: string;

            if (result.endsWith('?newDeviceId=') || result.endsWith('&newDeviceId=')) {
                shareUrl = `${result}${currentDeviceToken}`;
            } else if (result.includes('?')) {
                shareUrl = result.replace(/\?$/, '&') + `newDeviceId=${currentDeviceToken}`;
            } else {
                shareUrl = `${result}?newDeviceId=${currentDeviceToken}`;
            }

            console.log("Full share URL:", shareUrl);

            const response = await fetch(shareUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const responseData = await response.json();
            console.log("API Response:", responseData);

            if (responseData.statusCode === 200 || responseData.statusCode === '200') {
                setErrlog({
                    title: "Thành công",
                    status: true,
                    message: responseData.message || "Chuyển đổi thiết bị thành công!"
                });
                setShouldShowErrorDialog(true);
                setOpen(true);

                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            } else {
                throw new Error(responseData.message || "Có lỗi xảy ra khi xử lý QR code");
            }

        } catch (error: any) {
            console.error("Error processing QR code:", error);
            setErrlog({
                title: "Lỗi",
                status: false,
                message: error.message || "Lỗi khi xử lý QR code. Vui lòng thử lại!"
            });
            setShouldShowErrorDialog(true);
            setOpen(true);
        }
    };

    // Handlers
    const handleOpenScanner = () => {
        setScannerOpen(true);
        setScannedResult("");
    };

    const handleCloseScanner = () => {
        if (scannerRef.current) {
            scannerRef.current.clear().catch(console.error);
            scannerRef.current = null;
        }
        setScannerOpen(false);
    };

    const handleChangePage = useCallback(() => {
        if (data) {
            router.push(`/productions/${data.id}`);
        }
    }, [data, router]);

    const handleCloseDialog = useCallback(() => {
        setOpen(false);
        setShouldShowErrorDialog(false);
    }, []);

    const handleTryAgainBrowser = useCallback(() => {
        const targetUrl = `${ENDPOINT}/${id}`;
        openInBrowser(targetUrl);
    }, [id]);

    const handleContinueInWebView = useCallback(() => {
        setShowWebViewPrompt(false);
        setHasRedirected(false);
        setLoading(false);
    }, []);

    const nextStep = () => {
        if (isFetchingData) return;
        else
            setStep((prev) => prev + 1);
    };

    const skip = () => {
        if (isFetchingData) {
            return;
        } else {
            if (data && !hasTableError) {
                handleChangePage();
            } else if (hasTableError && errlog) {
                setShouldShowErrorDialog(true);
                setOpen(true);
            } else {
                setErrlog({
                    title: "Cảnh Báo",
                    status: false,
                    message: "Bàn không còn hiệu lực. Vui lòng quét lại QR code!"
                });
                setShouldShowErrorDialog(true);
                setOpen(true);
            }
        }
    };

    // WebView Prompt UI
    if (showWebViewPrompt) {
        const isWeChat = webViewApp === 'WeChat';

        return (
            <div className="w-full flex flex-col justify-center items-center min-h-screen bg-cover bg-center p-4"
                 style={{backgroundImage: `url('/img.png')`}}>
                <div className="bg-white bg-opacity-95 rounded-lg p-6 max-w-md text-center shadow-lg">
                    <div className="text-6xl mb-4">🌐</div>
                    <h2 className="text-xl font-bold mb-4 text-gray-800">
                        {isWeChat ? 'Vui lòng mở trong trình duyệt' : 'Đang chuyển sang trình duyệt...'}
                    </h2>

                    {isWeChat ? (
                        <div className="text-left text-gray-600 mb-6 space-y-2">
                            <p className="font-semibold text-center mb-3">Hướng dẫn mở trong trình duyệt:</p>
                            <p>1. Nhấn vào nút <strong>"..."</strong> ở góc trên bên phải</p>
                            <p>2. Chọn <strong>"Mở bằng trình duyệt"</strong></p>
                            <p>3. Hoặc copy link và mở trong Chrome/Safari</p>
                        </div>
                    ) : (
                        <div className="text-gray-600 mb-6">
                            <p>Chúng tôi đang cố gắng mở trang web trong trình duyệt mặc định của bạn để có trải nghiệm
                                tốt nhất.</p>
                            <p className="text-sm mt-2 text-gray-500">
                                Hiện tại bạn đang sử dụng WebView trong app <strong>{webViewApp}</strong>
                            </p>
                        </div>
                    )}

                    <div className="space-y-3">
                        {!isWeChat && (
                            <button
                                onClick={handleTryAgainBrowser}
                                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Thử lại - Mở trong trình duyệt
                            </button>
                        )}

                        <button
                            onClick={handleContinueInWebView}
                            className="w-full bg-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                        >
                            Tiếp tục trong {webViewApp}
                        </button>
                    </div>

                    {!isWeChat && (
                        <div className="mt-4 text-xs text-gray-500">
                            <p><strong>Link:</strong> {`${ENDPOINT}/${id}`}</p>
                            <p className="mt-1">Bạn có thể copy link này và mở trong trình duyệt</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    if (loading) {
        return <Frame1 onNext={nextStep} onSkip={skip}/>;
    }

    return (
        <>
            {/* ✅ Loading Overlay */}
            {isFetchingData && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100]">
                    <div className="bg-white rounded-2xl p-8 flex flex-col items-center gap-4 shadow-2xl">
                        <Loader2 className="w-12 h-12 text-blue-600 animate-spin"/>
                        <p className="text-lg font-semibold text-gray-800">Đang tải dữ liệu...</p>
                        <p className="text-sm text-gray-600">Vui lòng đợi trong giây lát</p>
                    </div>
                </div>
            )}

            <button
                onClick={handleOpenScanner}
                className="fixed top-4 left-4 z-50 bg-green-600 hover:bg-green-700
                text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 active:scale-95"
                aria-label="Quét QR Code"
            >
                <FaCamera className="text-2xl"/>
            </button>

            {isFetchingData ? (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100]">
                    <div className="bg-white rounded-2xl p-8 flex flex-col items-center gap-4 shadow-2xl">
                        <Loader2 className="w-12 h-12 text-blue-600 animate-spin"/>
                        <p className="text-lg font-semibold text-gray-800">Đang tải dữ liệu...</p>
                        <p className="text-sm text-gray-600">Vui lòng đợi trong giây lát</p>
                    </div>
                </div>
            ) : (
                <div className="flex justify-center items-center h-screen bg-gray-100">
                    {step === 1 && <Frame1 onNext={nextStep} onSkip={skip} isLoading={false}/>}
                    {step === 2 && <Frame2 onNext={nextStep} onSkip={skip} isLoading={false}/>}
                    {step === 3 && <Frame3 onNext={nextStep} onSkip={skip} isLoading={false}/>}
                </div>
            )}


            {errlog && shouldShowErrorDialog && (
                <MobileDialog
                    isOpen={open}
                    onClose={handleCloseDialog}
                    status={errlog.status ? "success" : "error"}
                    message={errlog.message}
                />
            )}

            {scannerOpen && (
                <DialogComponation
                    isOpen={scannerOpen}
                    onClose={handleCloseScanner}
                >
                    <div className="p-4">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-center flex-1">
                                Quét QR Code
                            </h2>
                        </div>

                        <p className="text-sm text-gray-600 text-center mb-4">
                            Đưa mã QR vào khung hình để chuyển đổi thiết bị
                        </p>

                        <div id="qr-reader" className="w-full rounded-lg overflow-hidden"></div>

                        {deviceTokenContext.deviceToken && (
                            <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                                <p className="text-xs text-blue-800">
                                    <strong>Device ID:</strong> {deviceTokenContext.deviceToken.substring(0, 20)}...
                                </p>
                            </div>
                        )}

                        {scannedResult && (
                            <div className="mt-2 p-3 bg-green-100 rounded-lg">
                                <p className="text-sm text-green-800">
                                    <strong>Đã quét:</strong> {scannedResult.substring(0, 50)}...
                                </p>
                            </div>
                        )}

                        <button
                            onClick={handleCloseScanner}
                            className="mt-4 w-full bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 transition-colors font-semibold"
                        >
                            Đóng
                        </button>
                    </div>
                </DialogComponation>
            )}
        </>
    );
}