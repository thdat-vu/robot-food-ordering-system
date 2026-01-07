"use client";

import {useEffect} from "react";
import {TABLE_STORE} from "@/name-value-env";
import ThankYouScreen from "@/components/common/Thankyou_screen";

export default function page() {

    useEffect(() => {
        localStorage.removeItem(TABLE_STORE);
    }, []);


    return (
        <ThankYouScreen/>
    );
}
