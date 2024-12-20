"use client";
import React, { createContext, ReactNode, useContext, useState } from 'react';

interface PracticeModeContextProps {
    activeChar: string | null;
    setActiveChar: (char: string | null) => void;
}

const PracticeModeContext = createContext<PracticeModeContextProps | undefined>(undefined);

export const PracticeModeProvider: React.FC<{ children: ReactNode; }> = ({ children }) => {
    const [activeChar, setActiveChar] = useState<string | null>(null);



    return (
        <PracticeModeContext.Provider value={{ activeChar, setActiveChar }}>
            {children}
        </PracticeModeContext.Provider>
    );
};

export const usePracticeMode = (): PracticeModeContextProps => {
    const context = useContext(PracticeModeContext);
    if (!context) {
        throw new Error('usePracticeMode must be used within a PracticeModeProvider');
    }
    return context;
};