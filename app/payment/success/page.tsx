import SuccessPageContent from "@/app/payment/success/SuccessPageContent";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

import {Suspense} from "react";

export default function Page() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SuccessPageContent/>
        </Suspense>
    );
}
