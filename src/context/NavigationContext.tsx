import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';

interface NavigationContextType {
    previousPath: string | null;
    isNavigating: boolean;
    lastNavigatedYear: number | null;
    setLastNavigatedYear: (year: number | null) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const router = useRouter();
    const [previousPath, setPreviousPath] = useState<string | null>(null);
    const [isNavigating, setIsNavigating] = useState(false);
    const [lastNavigatedYear, setLastNavigatedYear] = useState<number | null>(null);

    useEffect(() => {
        const handleStart = (_url: string) => {
            if (_url !== router.asPath) {
                setIsNavigating(true);
            }
        };

        const handleComplete = () => {
            setPreviousPath(router.asPath);
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
        <NavigationContext.Provider value={{ previousPath, isNavigating, lastNavigatedYear, setLastNavigatedYear }}>
            {children}
        </NavigationContext.Provider>
    );
};

export const useNavigation = () => {
    const context = useContext(NavigationContext);
    if (context === undefined) {
        throw new Error('useNavigation must be used within a NavigationProvider');
    }
    return context;
};
