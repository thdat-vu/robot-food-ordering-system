"use client";

import React, {
    createContext,
    ReactNode,
    useContext,
    useState,
    useCallback,
    useMemo,
    useEffect
} from "react";

interface DeviceToken {
    deviceToken: string | null;
    setDeviceToken: (token: string) => void;
    clearDeviceToken: () => void;
}

export const DeviceTokenContext = createContext<DeviceToken | undefined>(undefined);

export const useDeviceToken = () => {
    const context = useContext(DeviceTokenContext);
    if (!context) {
        throw new Error("useDeviceToken must be used inside DeviceTokenProvider");
    }
    return context;
};

export function DeviceTokenProvider({children}: { children: ReactNode }) {
    const [deviceToken, setDeviceTokenState] = useState<string | null>(null);

    // 🔥 Load token từ localStorage khi Context mount
    useEffect(() => {
        const saved = localStorage.getItem("device_token");
        if (saved) {
            setDeviceTokenState(saved);
        }
    }, []);

    const setDeviceToken = useCallback((token: string) => {
        setDeviceTokenState(token);
        localStorage.setItem("device_token", token);
    }, []);

    const clearDeviceToken = useCallback(() => {
        setDeviceTokenState(null);
        localStorage.removeItem("device_token");
    }, []);

    const value = useMemo(
        () => ({
            deviceToken,
            setDeviceToken,
            clearDeviceToken,
        }),
        [deviceToken, setDeviceToken, clearDeviceToken]
    );

    return (
        <DeviceTokenContext.Provider value={value}>
            {children}
        </DeviceTokenContext.Provider>
    );
}
