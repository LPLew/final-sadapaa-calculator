
export type LanguageCode =
  | 'en'      // English (Primary, always local)
  | 'ms'      // Bahasa Malaysia (Malay)
  | 'zh-CN'   // Chinese (Simplified) (Local Secondary Option)
  | 'es'      // Spanish (Local Secondary Option)
  | 'fr'      // French (Local Secondary Option)
  | 'de'      // German (Local Secondary Option)
  | 'zh-TW'   // Chinese (Traditional) (Local Secondary Option)
  | 'ar'      // Arabic (Local Secondary Option)
  | 'hi'      // Hindi (Local Secondary Option)
  | 'vi'      // Vietnamese (Local Secondary Option)
  | 'ko'      // Korean (Local Secondary Option)
  | 'pt'      // Portuguese (Local Secondary Option)
  | 'th'      // Thai (Local Secondary Option)
  | 'it'      // Italian (Local Secondary Option)
  | 'ja'      // Japanese (Local Secondary Option)
  // Add more language codes as needed
  ;

export interface LanguageOption {
  code: LanguageCode;
  name: string;
  isApiBased: boolean; // Kept for structure, but all are false now for word conversion
  converter?: (num: number) => string; // Simplified: All local converters are synchronous
}

export interface FormattedDisplay {
  formatted: string;
  englishWords: string;
  secondaryLanguageName: string;
  secondaryLanguageWords: string;
  secondaryError: string | null;
}

export interface HistoryEntry {
  id: number;
  expression: string;
  result: string;
  resultEnglishWords: string;
  resultSecondaryLanguageWords: string; // New: Stores words for the secondary language
  secondaryLanguageCodeAtTimeOfHistory: LanguageCode; // New: Stores the code of the secondary lang at time of entry
  secondaryLanguageNameAtTimeOfHistory: string; // New: Stores the name of the secondary lang at time of entry
  timestamp: string;
  numericResult: number; // Actual numeric value of the result
}

export type Operation = '+' | '-' | 'x' | '÷' | '%' | null;

export interface AppSettings {
  selectedSecondaryLanguage: LanguageCode;
  hapticFeedbackEnabled: boolean;
}

export interface Folder {
    id: number;
    name: string;
    createdAt: Date;
}

export interface Note {
  id: number;
  folderId: number;
  photo: Blob | null;
  text: string;
  createdAt: Date;
}

export interface GalleryPhoto {
  noteId: number;
  photo: Blob;
  imageUrl: string;
  noteText: string;
}

// --- NEW: Types for Financial Calculator History ---
export type FinancialCalcType = 'loan' | 'roi' | 'tvm' | 'compound' | 'retirement' | 'breakeven' | 'margin' | 'inflation';

export interface FinancialHistoryEntry {
    id: number;
    timestamp: string;
    calculatorType: FinancialCalcType;
    calculatorNameKey: string; // The translation key for the calculator name

    // Data for re-populating calculator inputs
    rawInputs: { [key: string]: string };

    // Data for displaying in the history list
    displayInputs: { labelKey: string; value: string; valueSuffixKey?: string; }[];
    displayResults: { labelKey: string; value: string; words: string; isPrimary?: boolean; labelReplacements?: { [key: string]: string | number } }[];
}

// --- NEW: Types for Member ID Card ---
export interface MemberIdData {
  isSetupComplete: boolean;
  country: string;
  fullName: string;
  photo: string; // Base64 data URL
  countryCode: string;
  mobileNo: string;
  refText: string;
  editCount: number; // New: 0 for initial setup, 1 after first save, 2 for locked.
}