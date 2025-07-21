import {useState} from "react";

type Prop<
    F extends (...args: any[]) => Promise<any>,
    D = Awaited<ReturnType<F>>,
    E = any
> = {
    data: D | null;
    loading: boolean;
    error: E;
    run: (...args: Parameters<F>) => Promise<void>;
    reset: () => void;
};

export function useApiHandler<
    F extends (...args: any[]) => Promise<any>,
    D = Awaited<ReturnType<F>>,
    E = any
>(apiFunc: F): Prop<F, D, E> {
    const [data, setData] = useState<D | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<E>(null as any);

    const run = async (...args: Parameters<F>): Promise<void> => {
        setLoading(true);
        setError(null as any);
        try {
            const result = await apiFunc(...args);
            setData(result);
        } catch (err) {
            setError(err as E);
        } finally {
            setLoading(false);
        }
    };

    const reset = () => {
        setData(null);
        setError(null as any);
        setLoading(false);
    };

    return {data, loading, error, run, reset};
}