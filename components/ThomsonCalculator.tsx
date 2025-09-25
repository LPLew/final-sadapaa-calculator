import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Calculator, History, Settings, Trash2, Copy, Languages, User, BookOpen, X } from 'lucide-react';
import { useTranslations } from '../hooks/useTranslations';
import { HistoryEntry, Operation, FormattedDisplay, AppSettings, LanguageCode, LanguageOption, MemberIdData } from '../types';
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
import { MemberIdModal } from './MemberIdModal';
import { CompendiumModal } from './QnAView';

const LOCAL_STORAGE_SETTINGS_KEY = 'bigNumberProCalculatorSettings';
const LOCAL_STORAGE_HISTORY_KEY = 'bigNumberProCalculatorHistory';
const LOCAL_STORAGE_MEMBER_ID_KEY = 'bigNumberProCalculatorMemberId';

const languageOptions: LanguageOption[] = [
  { code: 'en', name: 'English', isApiBased: false, converter: numberToWordsEnglish },
  { code: 'ms', name: 'Bahasa Malaysia', isApiBased: false, converter: numberToWordsMalay },
  { code: 'zh-CN', name: '中文 (简体)', isApiBased: false, converter: numberToWordsChinese },
  { code: 'zh-TW', name: '中文 (繁體)', isApiBased: false, converter: numberToWordsChineseTraditional },
  { code: 'es', name: 'Español', isApiBased: false, converter: numberToWordsSpanish },
  { code: 'fr', name: 'Français', isApiBased: false, converter: numberToWordsFrench },
  { code: 'de', name: 'Deutsch', isApiBased: false, converter: numberToWordsGerman },
  { code: 'ar', name: 'العربية', isApiBased: false, converter: numberToWordsArabic },
  { code: 'hi', name: 'हिन्दी', isApiBased: false, converter: numberToWordsHindi },
  { code: 'vi', name: 'Tiếng Việt', isApiBased: false, converter: numberToWordsVietnamese },
  { code: 'ko', name: '한국어', isApiBased: false, converter: numberToWordsKorean },
  { code: 'pt', name: 'Português', isApiBased: false, converter: numberToWordsPortuguese },
  { code: 'th', name: 'ไทย', isApiBased: false, converter: numberToWordsThai },
  { code: 'it', name: 'Italiano', isApiBased: false, converter: numberToWordsItalian },
  { code: 'ja', name: '日本語', isApiBased: false, converter: numberToWordsJapanese },
];

const defaultSettings: AppSettings = {
  selectedSecondaryLanguage: 'ms',
  hapticFeedbackEnabled: true,
};

const defaultMemberIdData: MemberIdData = {
  isSetupComplete: false,
  country: '',
  fullName: '',
  photo: '',
  countryCode: '+60',
  mobileNo: '',
  refText: '',
  editCount: 0,
};

interface BigNumberProCalculatorProps {
  onNavigate: (view: 'financial' | 'notes') => void;
}

export const BigNumberProCalculator: React.FC<BigNumberProCalculatorProps> = ({ onNavigate }) => {
  const { t } = useTranslations();
  
  // Core calculator state
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<string | null>(null);
  const [operation, setOperation] = useState<Operation>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [isNewCalculation, setIsNewCalculation] = useState(true);
  
  // UI state
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showMemberIdModal, setShowMemberIdModal] = useState(false);
  const [showCompendiumModal, setShowCompendiumModal] = useState(false);
  
  // Data state
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [memberIdData, setMemberIdData] = useState<MemberIdData>(defaultMemberIdData);
  
  // Refs
  const displayRef = useRef<HTMLDivElement>(null);

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem(LOCAL_STORAGE_HISTORY_KEY);
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }

      const storedSettings = localStorage.getItem(LOCAL_STORAGE_SETTINGS_KEY);
      if (storedSettings) {
        setSettings({ ...defaultSettings, ...JSON.parse(storedSettings) });
      }

      const storedMemberIdData = localStorage.getItem(LOCAL_STORAGE_MEMBER_ID_KEY);
      if (storedMemberIdData) {
        setMemberIdData({ ...defaultMemberIdData, ...JSON.parse(storedMemberIdData) });
      }
    } catch (error) {
      console.error('Error loading data from localStorage:', error);
    }
  }, []);

  // Save data to localStorage when state changes
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_HISTORY_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('Error saving history to localStorage:', error);
    }
  }, [history]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings to localStorage:', error);
    }
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_MEMBER_ID_KEY, JSON.stringify(memberIdData));
    } catch (error) {
      console.error('Error saving member ID data to localStorage:', error);
    }
  }, [memberIdData]);

  // Haptic feedback
  const triggerHapticFeedback = useCallback(() => {
    if (settings.hapticFeedbackEnabled && 'vibrate' in navigator) {
      navigator.vibrate(50);
    }
  }, [settings.hapticFeedbackEnabled]);

  // Number formatting and conversion
  const formatDisplay = useCallback((value: string): FormattedDisplay => {
    const numericValue = parseFloat(value);
    
    if (isNaN(numericValue)) {
      return {
        formatted: value,
        englishWords: 'Invalid Number',
        secondaryLanguageName: '',
        secondaryLanguageWords: 'Invalid Number',
        secondaryError: null,
      };
    }

    const formatted = numericValue.toLocaleString('en-US', {
      maximumFractionDigits: 10,
      useGrouping: true,
    });

    const englishWords = numberToWordsEnglish(numericValue);
    
    const secondaryLanguageOption = languageOptions.find(
      lang => lang.code === settings.selectedSecondaryLanguage
    );
    
    let secondaryLanguageWords = '';
    let secondaryError: string | null = null;
    
    if (secondaryLanguageOption?.converter) {
      try {
        secondaryLanguageWords = secondaryLanguageOption.converter(numericValue);
      } catch (error) {
        secondaryError = 'Conversion error';
        secondaryLanguageWords = 'Error';
      }
    }

    return {
      formatted,
      englishWords,
      secondaryLanguageName: secondaryLanguageOption?.name || '',
      secondaryLanguageWords,
      secondaryError,
    };
  }, [settings.selectedSecondaryLanguage]);

  // Calculator operations
  const inputNumber = useCallback((num: string) => {
    triggerHapticFeedback();
    
    if (waitingForOperand) {
      setDisplay(num);
      setWaitingForOperand(false);
      setIsNewCalculation(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
      setIsNewCalculation(false);
    }
  }, [display, waitingForOperand, triggerHapticFeedback]);

  const inputDecimal = useCallback(() => {
    triggerHapticFeedback();
    
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
    } else if (display.indexOf('.') === -1) {
      setDisplay(display + '.');
    }
    setIsNewCalculation(false);
  }, [display, waitingForOperand, triggerHapticFeedback]);

  const clear = useCallback(() => {
    triggerHapticFeedback();
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
    setIsNewCalculation(true);
  }, [triggerHapticFeedback]);

  const performOperation = useCallback((nextOperation: Operation) => {
    triggerHapticFeedback();
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(display);
    } else if (operation) {
      const currentValue = previousValue || '0';
      const newValue = calculate(currentValue, display, operation);

      if (newValue !== null) {
        const newDisplay = String(newValue);
        setDisplay(newDisplay);
        setPreviousValue(newDisplay);
        
        // Add to history
        const expression = `${formatDisplay(currentValue).formatted} ${operation} ${formatDisplay(display).formatted}`;
        const resultFormatted = formatDisplay(newDisplay);
        
        const historyEntry: HistoryEntry = {
          id: Date.now(),
          expression,
          result: resultFormatted.formatted,
          resultEnglishWords: resultFormatted.englishWords,
          resultSecondaryLanguageWords: resultFormatted.secondaryLanguageWords,
          secondaryLanguageCodeAtTimeOfHistory: settings.selectedSecondaryLanguage,
          secondaryLanguageNameAtTimeOfHistory: resultFormatted.secondaryLanguageName,
          timestamp: new Date().toLocaleTimeString(),
          numericResult: newValue,
        };
        
        setHistory(prev => [historyEntry, ...prev.slice(0, 99)]);
      }
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
    setIsNewCalculation(false);
  }, [display, previousValue, operation, triggerHapticFeedback, formatDisplay, settings.selectedSecondaryLanguage]);

  const calculate = useCallback((firstOperand: string, secondOperand: string, operation: Operation): number | null => {
    const prev = parseFloat(firstOperand);
    const current = parseFloat(secondOperand);

    if (isNaN(prev) || isNaN(current)) return null;

    switch (operation) {
      case '+':
        return prev + current;
      case '-':
        return prev - current;
      case 'x':
        return prev * current;
      case '÷':
        return current !== 0 ? prev / current : null;
      case '%':
        return prev % current;
      default:
        return current;
    }
  }, []);

  const equals = useCallback(() => {
    triggerHapticFeedback();
    
    if (operation && previousValue !== null) {
      const newValue = calculate(previousValue, display, operation);
      
      if (newValue !== null) {
        const newDisplay = String(newValue);
        
        // Add to history
        const expression = `${formatDisplay(previousValue).formatted} ${operation} ${formatDisplay(display).formatted}`;
        const resultFormatted = formatDisplay(newDisplay);
        
        const historyEntry: HistoryEntry = {
          id: Date.now(),
          expression,
          result: resultFormatted.formatted,
          resultEnglishWords: resultFormatted.englishWords,
          resultSecondaryLanguageWords: resultFormatted.secondaryLanguageWords,
          secondaryLanguageCodeAtTimeOfHistory: settings.selectedSecondaryLanguage,
          secondaryLanguageNameAtTimeOfHistory: resultFormatted.secondaryLanguageName,
          timestamp: new Date().toLocaleTimeString(),
          numericResult: newValue,
        };
        
        setHistory(prev => [historyEntry, ...prev.slice(0, 99)]);
        setDisplay(newDisplay);
      }
      
      setPreviousValue(null);
      setOperation(null);
      setWaitingForOperand(true);
      setIsNewCalculation(true);
    }
  }, [operation, previousValue, display, calculate, triggerHapticFeedback, formatDisplay, settings.selectedSecondaryLanguage]);

  // UI handlers
  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      triggerHapticFeedback();
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  }, [triggerHapticFeedback]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    triggerHapticFeedback();
  }, [triggerHapticFeedback]);

  const updateSettings = useCallback((newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const saveMemberIdData = useCallback((data: MemberIdData) => {
    setMemberIdData(data);
    setShowMemberIdModal(false);
  }, []);

  // Memoized display formatting
  const displayFormatted = useMemo(() => formatDisplay(display), [display, formatDisplay]);

  // Button component
  const Button: React.FC<{
    onClick: () => void;
    className?: string;
    children: React.ReactNode;
    disabled?: boolean;
  }> = ({ onClick, className = '', children, disabled = false }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`h-16 rounded-lg font-semibold text-lg transition-all duration-150 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </button>
  );

  return (
    <div className="h-full bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <header className="flex-shrink-0 p-4 flex items-center justify-between bg-gray-800 shadow-lg">
        <div className="flex items-center gap-3">
          <Calculator className="text-sky-400" size={24} />
          <h1 className="text-xl font-bold text-yellow-300">SADAPA'A Calculator</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCompendiumModal(true)}
            className="p-2 rounded-lg bg-amber-600 hover:bg-amber-500 transition-colors"
            title="Q&A Compendium"
          >
            <BookOpen size={20} />
          </button>
          <button
            onClick={() => setShowMemberIdModal(true)}
            className="p-2 rounded-lg bg-purple-600 hover:bg-purple-500 transition-colors"
            title="Member ID"
          >
            <User size={20} />
          </button>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="p-2 rounded-lg bg-blue-600 hover:bg-blue-500 transition-colors"
            title="History"
          >
            <History size={20} />
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-lg bg-gray-600 hover:bg-gray-500 transition-colors"
            title="Settings"
          >
            <Settings size={20} />
          </button>
        </div>
      </header>

      {/* Navigation */}
      <div className="flex-shrink-0 p-4 bg-gray-800 border-t border-gray-700">
        <div className="flex gap-2">
          <button
            onClick={() => onNavigate('financial')}
            className="flex-1 py-3 px-4 bg-green-600 hover:bg-green-500 rounded-lg font-semibold transition-colors"
          >
            Financial Tools
          </button>
          <button
            onClick={() => onNavigate('notes')}
            className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold transition-colors"
          >
            Notes
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="flex-shrink-0 p-4 bg-gray-800 border-t border-gray-700">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Languages size={16} className="inline mr-2" />
                Secondary Language for Number Words
              </label>
              <select
                value={settings.selectedSecondaryLanguage}
                onChange={(e) => updateSettings({ selectedSecondaryLanguage: e.target.value as LanguageCode })}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              >
                {languageOptions.map(option => (
                  <option key={option.code} value={option.code}>
                    {option.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-300">
                Haptic Feedback
              </label>
              <input
                type="checkbox"
                checked={settings.hapticFeedbackEnabled}
                onChange={(e) => updateSettings({ hapticFeedbackEnabled: e.target.checked })}
                className="w-5 h-5"
              />
            </div>
          </div>
        </div>
      )}

      {/* History Panel */}
      {showHistory && (
        <div className="flex-shrink-0 max-h-64 overflow-y-auto bg-gray-800 border-t border-gray-700">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">History</h3>
              {history.length > 0 && (
                <button
                  onClick={clearHistory}
                  className="p-2 text-red-400 hover:text-red-300 transition-colors"
                  title="Clear History"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
            {history.length === 0 ? (
              <p className="text-gray-400 text-center py-4">No calculations yet</p>
            ) : (
              <div className="space-y-2">
                {history.map((entry) => (
                  <div key={entry.id} className="p-3 bg-gray-700 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm text-gray-300">{entry.expression}</p>
                        <p className="font-mono text-lg text-white">{entry.result}</p>
                        <p className="text-xs text-yellow-300 italic">{entry.resultEnglishWords}</p>
                        <p className="text-xs text-blue-300 italic">
                          {entry.secondaryLanguageNameAtTimeOfHistory}: {entry.resultSecondaryLanguageWords}
                        </p>
                        <p className="text-xs text-gray-400">{entry.timestamp}</p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(entry.result)}
                        className="p-2 text-gray-400 hover:text-white transition-colors"
                        title="Copy Result"
                      >
                        <Copy size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Display */}
      <div className="flex-shrink-0 p-6 bg-gray-800">
        <div
          ref={displayRef}
          className="text-right p-4 bg-gray-900 rounded-lg border-2 border-gray-700"
        >
          <div className="text-4xl font-mono text-white mb-2 break-all">
            {displayFormatted.formatted}
          </div>
          <div className="text-sm text-yellow-300 italic mb-1">
            {displayFormatted.englishWords}
          </div>
          <div className="text-sm text-blue-300 italic">
            {displayFormatted.secondaryLanguageName}: {displayFormatted.secondaryLanguageWords}
          </div>
          {displayFormatted.secondaryError && (
            <div className="text-xs text-red-400 mt-1">
              {displayFormatted.secondaryError}
            </div>
          )}
        </div>
      </div>

      {/* Calculator Buttons */}
      <div className="flex-grow p-4">
        <div className="grid grid-cols-4 gap-3 h-full">
          {/* Row 1 */}
          <Button onClick={clear} className="bg-red-600 hover:bg-red-500 text-white">
            C
          </Button>
          <Button onClick={() => performOperation('%')} className="bg-orange-600 hover:bg-orange-500 text-white">
            %
          </Button>
          <Button onClick={() => performOperation('÷')} className="bg-orange-600 hover:bg-orange-500 text-white">
            ÷
          </Button>
          <Button onClick={() => performOperation('x')} className="bg-orange-600 hover:bg-orange-500 text-white">
            ×
          </Button>

          {/* Row 2 */}
          <Button onClick={() => inputNumber('7')} className="bg-gray-700 hover:bg-gray-600 text-white">
            7
          </Button>
          <Button onClick={() => inputNumber('8')} className="bg-gray-700 hover:bg-gray-600 text-white">
            8
          </Button>
          <Button onClick={() => inputNumber('9')} className="bg-gray-700 hover:bg-gray-600 text-white">
            9
          </Button>
          <Button onClick={() => performOperation('-')} className="bg-orange-600 hover:bg-orange-500 text-white">
            −
          </Button>

          {/* Row 3 */}
          <Button onClick={() => inputNumber('4')} className="bg-gray-700 hover:bg-gray-600 text-white">
            4
          </Button>
          <Button onClick={() => inputNumber('5')} className="bg-gray-700 hover:bg-gray-600 text-white">
            5
          </Button>
          <Button onClick={() => inputNumber('6')} className="bg-gray-700 hover:bg-gray-600 text-white">
            6
          </Button>
          <Button onClick={() => performOperation('+')} className="bg-orange-600 hover:bg-orange-500 text-white">
            +
          </Button>

          {/* Row 4 */}
          <Button onClick={() => inputNumber('1')} className="bg-gray-700 hover:bg-gray-600 text-white">
            1
          </Button>
          <Button onClick={() => inputNumber('2')} className="bg-gray-700 hover:bg-gray-600 text-white">
            2
          </Button>
          <Button onClick={() => inputNumber('3')} className="bg-gray-700 hover:bg-gray-600 text-white">
            3
          </Button>
          <Button onClick={equals} className="bg-sky-600 hover:bg-sky-500 text-white row-span-2">
            =
          </Button>

          {/* Row 5 */}
          <Button onClick={() => inputNumber('0')} className="bg-gray-700 hover:bg-gray-600 text-white col-span-2">
            0
          </Button>
          <Button onClick={inputDecimal} className="bg-gray-700 hover:bg-gray-600 text-white">
            .
          </Button>
        </div>
      </div>

      {/* Modals */}
      {showMemberIdModal && (
        <MemberIdModal
          data={memberIdData}
          onSave={saveMemberIdData}
          onClose={() => setShowMemberIdModal(false)}
        />
      )}

      {showCompendiumModal && (
        <CompendiumModal onClose={() => setShowCompendiumModal(false)} />
      )}
    </div>
  );
};