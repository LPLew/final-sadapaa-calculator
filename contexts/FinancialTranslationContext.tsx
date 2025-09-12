
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useMemo } from 'react';
import { translations, financialLanguageOptions } from '../utils/financial-translations';
import { LanguageCode } from '../types';
import { X } from 'lucide-react';
import {
    numberToWordsEnglish,
    numberToWordsMalay,
    numberToWordsChinese,
    numberToWordsChineseTraditional,
    numberToWordsSpanish,
    numberToWordsFrench,
    numberToWordsGerman,
    numberToWordsArabic,
    numberToWordsHindi,
    numberToWordsVietnamese,
    numberToWordsKorean,
    numberToWordsPortuguese,
    numberToWordsThai,
    numberToWordsItalian,
    numberToWordsJapanese
} from '../utils/number-converters';

const FINANCIAL_LANGUAGE_KEY = 'financialCalculatorUILanguage';

const converterMap: Record<string, (num: number) => string> = {
    'en': numberToWordsEnglish,
    'ms': numberToWordsMalay,
    'zh-CN': numberToWordsChinese,
    'zh-TW': numberToWordsChineseTraditional,
    'es': numberToWordsSpanish,
    'fr': numberToWordsFrench,
    'de': numberToWordsGerman,
    'ar': numberToWordsArabic,
    'hi': numberToWordsHindi,
    'vi': numberToWordsVietnamese,
    'ko': numberToWordsKorean,
    'pt': numberToWordsPortuguese,
    'th': numberToWordsThai,
    'it': numberToWordsItalian,
    'ja': numberToWordsJapanese,
};

interface FinancialTranslationContextType {
  language: LanguageCode;
  setLanguage: (language: LanguageCode) => void;
  t: (key: string, replacements?: Record<string, string | number>) => string;
  numberToWords: (num: number) => string;
}

const FinancialTranslationContext = createContext<FinancialTranslationContextType | undefined>(undefined);

export const FinancialTranslationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [language, setLanguageState] = useState<LanguageCode>('en');

    useEffect(() => {
        try {
            const storedLang = localStorage.getItem(FINANCIAL_LANGUAGE_KEY) as LanguageCode;
            if (storedLang && financialLanguageOptions.some(l => l.code === storedLang)) {
                setLanguageState(storedLang);
            }
        } catch (e) {
            console.error("Failed to read language from localStorage", e);
        }
    }, []);

    const setLanguage = useCallback((lang: LanguageCode) => {
        try {
            localStorage.setItem(FINANCIAL_LANGUAGE_KEY, lang);
            setLanguageState(lang);
        } catch (e) {
            console.error("Failed to save language to localStorage", e);
        }
    }, []);

    const t = useCallback((key: string, replacements?: Record<string, string | number>): string => {
        const defaultEnglishTranslations = translations.en || {};
        const langWithFallback = language in translations ? language : 'en';
        const translationSet = translations[langWithFallback] || defaultEnglishTranslations;
        
        let translatedString: string = (translationSet as any)[key] || defaultEnglishTranslations[key] || key;

        if (replacements) {
            Object.keys(replacements).forEach(placeholder => {
                const regex = new RegExp(`\\{${placeholder}\\}`, 'g');
                translatedString = translatedString.replace(regex, String(replacements[placeholder]));
            });
        }

        return translatedString;
    }, [language]);

    const numberToWords = useCallback((num: number): string => {
        const converter = converterMap[language] || numberToWordsEnglish;
        return converter(num);
    }, [language]);

    const value = { language, setLanguage, t, numberToWords };

    return (
        <FinancialTranslationContext.Provider value={value}>
            {children}
        </FinancialTranslationContext.Provider>
    );
};

export const useFinancialTranslations = () => {
    const context = useContext(FinancialTranslationContext);
    if (context === undefined) {
        throw new Error('useFinancialTranslations must be used within a FinancialTranslationProvider');
    }
    return context;
};

export const NumberToWordsDisplay: React.FC<{ value: string | number | null }> = ({ value }) => {
    const { numberToWords } = useFinancialTranslations();
    
    const text = useMemo(() => {
        if (value === null || value === '' || typeof value === 'undefined') {
            return '';
        }
        const numericValue = typeof value === 'string' ? parseFloat(value.replace(/,/g, '')) : value;
        if (isNaN(numericValue)) {
            return '';
        }
        return numberToWords(numericValue);
    }, [value, numberToWords]);

    if (!text) {
        return null;
    }

    return (
        <div className="text-base text-right text-yellow-300 mt-2 italic">
            {text}
        </div>
    );
};

const largeNumberSuffixes = [
  { name: "Thousand(s)", value: 1000, colorClass: "text-white" },
  { name: "Tens of Thousands", value: 10000, colorClass: "text-yellow-300" },
  { name: "Hundreds of Thousands", value: 100000, colorClass: "text-red-400" },
  { name: "Million(s)", value: 1000000, colorClass: "text-white" },
  { name: "Tens of Millions", value: 10000000, colorClass: "text-yellow-300" },
  { name: "Hundreds of Millions", value: 100000000, colorClass: "text-red-400" },
  { name: "Billion(s)", value: 1000000000, colorClass: "text-white" },
  { name: "Tens of Billions", value: 10000000000, colorClass: "text-yellow-300" },
  { name: "Hundreds of Billions", value: 100000000000, colorClass: "text-red-400" },
  { name: "Trillion(s)", value: 1000000000000, colorClass: "text-white" },
  { name: "Tens of Trillions", value: 10000000000000, colorClass: "text-yellow-300" },
  { name: "Hundreds of Trillions", value: 100000000000000, colorClass: "text-red-400" },
  { name: "Quadrillion(s)", value: 1000000000000000, colorClass: "text-white" },
  { name: "Tens of Quadrillions", value: 10000000000000000, colorClass: "text-yellow-300" },
  { name: "Hundreds of Quadrillions", value: 100000000000000000, colorClass: "text-red-400" },
  { name: "Quintillion(s)", value: 1000000000000000000, colorClass: "text-white" },
  { name: "Tens of Quintillions", value: 10000000000000000000, colorClass: "text-yellow-300" },
  { name: "Hundreds of Quintillions", value: 100000000000000000000, colorClass: "text-red-400" },
  { name: "Sextillion(s)", value: 1000000000000000000000, colorClass: "text-white" },
  { name: "Tens of Sextillions", value: 10000000000000000000000, colorClass: "text-yellow-300" },
  { name: "Hundreds of Sextillions", value: 100000000000000000000000, colorClass: "text-red-400" },
  { name: "Septillion(s)", value: 1000000000000000000000000, colorClass: "text-white" },
  { name: "Tens of Septillions", value: 10000000000000000000000000, colorClass: "text-yellow-300" },
];

const manualColorSchemes = [
    { bg: 'bg-sky-900/40', border: 'border-sky-700', title: 'text-sky-300', hoverBg: 'hover:bg-sky-900/70' },
    { bg: 'bg-teal-900/40', border: 'border-teal-700', title: 'text-teal-300', hoverBg: 'hover:bg-teal-900/70' },
    { bg: 'bg-indigo-900/40', border: 'border-indigo-700', title: 'text-indigo-300', hoverBg: 'hover:bg-indigo-900/70' },
    { bg: 'bg-amber-900/40', border: 'border-amber-700', title: 'text-amber-300', hoverBg: 'hover:bg-amber-900/70' },
    { bg: 'bg-rose-900/40', border: 'border-rose-700', title: 'text-rose-300', hoverBg: 'hover:bg-rose-900/70' },
    { bg: 'bg-lime-900/40', border: 'border-lime-700', title: 'text-lime-300', hoverBg: 'hover:bg-lime-900/70' },
    { bg: 'bg-fuchsia-900/40', border: 'border-fuchsia-700', title: 'text-fuchsia-300', hoverBg: 'hover:bg-fuchsia-900/70' },
    { bg: 'bg-cyan-900/40', border: 'border-cyan-700', title: 'text-cyan-300', hoverBg: 'hover:bg-cyan-900/70' },
];

export const SuffixesMenu: React.FC<{
    show: boolean;
    onClose: () => void;
    onSelect: (multiplier: number) => void;
}> = ({ show, onClose, onSelect }) => {
    const menuRef = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        if (show) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [show, onClose]);

    if (!show) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75 animate-fadeIn"
            onClick={onClose}
        >
            <div
                ref={menuRef}
                className="bg-slate-700 p-4 sm:p-6 rounded-xl shadow-2xl w-full max-w-xs sm:max-w-sm max-h-[70vh] sm:max-h-[60vh] overflow-y-auto custom-scrollbar-tape border border-slate-600"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4">
                    <h4 className="text-lg sm:text-xl font-semibold text-indigo-300">Apply Suffix</h4>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-200 p-1 -mr-1 -mt-1 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        aria-label="Close suffixes menu"
                    >
                        <X size={24} />
                    </button>
                </div>
                <div className="space-y-3" role="menu">
                  {
                    [
                      { title: "Thousands", suffixes: largeNumberSuffixes.slice(0, 3) },
                      { title: "Millions", suffixes: largeNumberSuffixes.slice(3, 6) },
                      { title: "Billions", suffixes: largeNumberSuffixes.slice(6, 9) },
                      { title: "Trillions", suffixes: largeNumberSuffixes.slice(9, 12) },
                      { title: "Quadrillions", suffixes: largeNumberSuffixes.slice(12, 15) },
                      { title: "Quintillions", suffixes: largeNumberSuffixes.slice(15, 18) },
                      { title: "Sextillions", suffixes: largeNumberSuffixes.slice(18, 21) },
                      { title: "Septillions", suffixes: largeNumberSuffixes.slice(21, 23) }
                    ].map((group, index) => {
                      const scheme = manualColorSchemes[index % manualColorSchemes.length];
                      return (
                        <div key={group.title} className={`border rounded-lg p-3 ${scheme.bg} ${scheme.border} ${scheme.hoverBg} transition-colors duration-300`}>
                          <h5 className={`text-base font-semibold mb-2 pl-1 ${scheme.title}`}>{group.title}</h5>
                          <div className="space-y-1">
                            {group.suffixes.map(suffix => (
                              <button
                                key={suffix.name}
                                onClick={() => onSelect(suffix.value)}
                                className={`w-full text-left px-3 py-2 text-lg hover:bg-slate-600/50 active:bg-slate-500/50 rounded-md focus:bg-slate-600/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent focus:ring-white/50 ${suffix.colorClass} transition-colors duration-150`}
                                role="menuitem"
                              >
                                {suffix.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })
                  }
                </div>
            </div>
        </div>
    );
};
