"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "am" | "en";

interface LanguageContextType {
    language: Language;
    toggleLanguage: () => void;
    setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguageState] = useState<Language>("am");

    useEffect(() => {
        // Read from localStorage on mount
        const storedLang = localStorage.getItem("language") as Language;
        if (storedLang === "en" || storedLang === "am") {
            setLanguageState(storedLang);
        }
    }, []);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem("language", lang);
    };

    const toggleLanguage = () => {
        setLanguageState((prev) => {
            const nextLang = prev === "am" ? "en" : "am";
            localStorage.setItem("language", nextLang);
            return nextLang;
        });
    };

    return (
        <LanguageContext.Provider value={{ language, toggleLanguage, setLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
}
