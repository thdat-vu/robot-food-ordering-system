"use client"

import React, {createContext, ReactNode, useContext, useState, useCallback, useMemo} from "react";

interface deviceToken {
    deviceToken: string;
    setDeviceToken: (deviceToken: string) => void;
    clearDeviceToken: () => void;
}

export const DeviceTokenContext = createContext<deviceToken | undefined>(undefined);

export const useDeviceToken = () => {
    const context = useContext(DeviceTokenContext);
    if (!context) {
        throw new Error("deviceTokenContext must be used inside deviceTokenContext");
    }
    return context;
}

export function DeviceTokenProvider({children}: { children: ReactNode }) {
    const [token, setToken] = useState<string>('');

    const setDeviceToken = useCallback((deviceToken: string) => {
        setToken(deviceToken);
    }, []);

    const clearDeviceToken = useCallback(() => {
        setToken('');
    }, []);

    const value: deviceToken = useMemo(() => ({
        deviceToken: token,
        setDeviceToken,
        clearDeviceToken,
    }), [token, setDeviceToken, clearDeviceToken]);

    return <DeviceTokenContext.Provider value={value}>{children}</DeviceTokenContext.Provider>;
}