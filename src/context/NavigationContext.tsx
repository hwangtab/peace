import React, { createContext, useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/router';

interface NavigationContextType {
    previousPath: string | null;
    isNavigating: boolean;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const router = useRouter();
    const [previousPath, setPreviousPath] = useState<string | null>(null);
    const [isNavigating, setIsNavigating] = useState(false);
    const previousPathRef = useRef<string | null>(null);
    const asPathRef = useRef(router.asPath);

    // router.asPath 를 ref 에 동기화 — listener effect 는 [router.events] 만 의존하므로
    // 클로저가 stale 해지는 것을 방지.
    useEffect(() => {
        asPathRef.current = router.asPath;
    }, [router.asPath]);

    useEffect(() => {
        const handleStart = (url: string) => {
            if (url !== asPathRef.current) {
                previousPathRef.current = asPathRef.current;
                setIsNavigating(true);
            }
        };

        const handleComplete = () => {
            setPreviousPath(previousPathRef.current);
            setIsNavigating(false);
        };

        const handleError = () => {
            setIsNavigating(false);
        };

        router.events.on('routeChangeStart', handleStart);
        router.events.on('routeChangeComplete', handleComplete);
        router.events.on('routeChangeError', handleError);

        return () => {
            router.events.off('routeChangeStart', handleStart);
            router.events.off('routeChangeComplete', handleComplete);
            router.events.off('routeChangeError', handleError);
        };
    }, [router.events]);

    const value = useMemo(() => ({ previousPath, isNavigating }), [previousPath, isNavigating]);

    return (
        <NavigationContext.Provider value={value}>
            {children}
        </NavigationContext.Provider>
    );
};
