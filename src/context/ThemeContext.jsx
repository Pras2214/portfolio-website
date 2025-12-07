import React, { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    // Static elegant theme - no dynamic changes
    const [theme] = useState({
        name: 'paper',
        colors: {
            bg: '#f7f5f3',
            text: '#1a1a1a',
            accent: '#333333',
            subtle: '#888888'
        }
    });

    useEffect(() => {
        const root = document.documentElement;
        root.style.setProperty('--bg-color', theme.colors.bg);
        root.style.setProperty('--text-color', theme.colors.text);
        root.style.setProperty('--accent-color', theme.colors.accent);
        root.style.setProperty('--subtle-color', theme.colors.subtle);
    }, [theme]);

    // Dummy function to prevent errors in components that might still call it
    const cycleTheme = () => { };

    return (
        <ThemeContext.Provider value={{ theme, cycleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};
