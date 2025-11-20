'use client'
import {use, useCallback, useEffect} from 'react'
import Profile from "@/app/features/components/Profile";
import {useDeviceToken} from "@/hooks/context/deviceTokenContext";
import {TOKEN_Bro_VALUE} from "@/name-value-env";
import {tokenAuthentic} from "@/unit/unit";

export default function Page({params}: { params: Promise<{ tableId: string }> }) {
    const {deviceToken, setDeviceToken} = useDeviceToken();
    const {tableId} = use(params)

    const initializeDeviceToken = useCallback(async () => {
        const storedToken: string | null = localStorage.getItem(TOKEN_Bro_VALUE);

        if (!storedToken) {
            try {
                const temp = await tokenAuthentic();
                console.log(temp);

                if (temp) {
                    setDeviceToken(temp);
                    localStorage.setItem(TOKEN_Bro_VALUE, temp);
                }
            } catch (error) {
                console.error("Error authenticating token:", error);
            }
        } else {
            setDeviceToken(storedToken);
        }
    }, [deviceToken]);

    useEffect(() => {
        initializeDeviceToken();
    }, []);



    return (
        <Profile id={tableId}/>
    )
}