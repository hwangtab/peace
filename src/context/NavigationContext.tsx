import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
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

    useEffect(() => {
        const handleStart = (url: string) => {
            if (url !== router.asPath) {
                previousPathRef.current = router.asPath;
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
    }, [router]);

    return (
        <NavigationContext.Provider value={{ previousPath, isNavigating }}>
            {children}
        </NavigationContext.Provider>
    );
};

export const useNavigationState = () => {
    const context = useContext(NavigationContext);
    if (context === undefined) {
        throw new Error('useNavigationState must be used within a NavigationProvider');
    }
    return context;
};
