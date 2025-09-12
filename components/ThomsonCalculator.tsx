import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Settings, X, Copy, Trash2, ChevronDown, BookOpen, Edit3, Delete, ClipboardCopy, CornerDownLeft, ListPlus, Moon, Sun, Scaling, Sparkles, Award, BookText, ShieldAlert, Calculator, FileLock2, StickyNote, Edit, Plus, Crown, MessageSquare, Info, Landmark, NotebookText, ArrowLeft, ArrowRightCircle } from 'lucide-react';
import { FormattedDisplay, HistoryEntry, Operation, LanguageCode, LanguageOption, AppSettings, MemberIdData } from '../types';
import { CompendiumModal } from './QnAView';
import { MemberIdModal } from './MemberIdModal'; // New import
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

const LOCAL_STORAGE_HISTORY_KEY = 'bigNumberProCalculatorHistory';
const LOCAL_STORAGE_SETTINGS_KEY = 'bigNumberProCalculatorSettings';
const LOCAL_STORAGE_MEMBER_ID_KEY = 'dzaMemberIdData'; // New key
const MAX_INPUT_DIGITS = 20; // This primarily affects manual input length. Calculations can exceed this.

const PRE_SORTED_LANGUAGE_OPTIONS_CONFIG: Omit<LanguageOption, 'converter'>[] = [
  { code: 'ar' as const, name: 'Arabic', isApiBased: false },
  { code: 'ms' as const, name: 'Bahasa Malaysia', isApiBased: false },
  { code: 'zh-CN' as const, name: 'Chinese (Simplified)', isApiBased: false },
  { code: 'zh-TW' as const, name: 'Chinese (Traditional)', isApiBased: false },
  { code: 'fr' as const, name: 'French', isApiBased: false },
  { code: 'de' as const, name: 'German', isApiBased: false },
  { code: 'hi' as const, name: 'Hindi', isApiBased: false },
  { code: 'it' as const, name: 'Italian', isApiBased: false },
  { code: 'ja' as const, name: 'Japanese', isApiBased: false },
  { code: 'ko' as const, name: 'Korean', isApiBased: false },
  { code: 'pt' as const, name: 'Portuguese', isApiBased: false },
  { code: 'es' as const, name: 'Spanish', isApiBased: false },
  { code: 'th' as const, name: 'Thai', isApiBased: false },
  { code: 'vi' as const, name: 'Vietnamese', isApiBased: false },
];

const powersOfTenData = [
    { power: '10<sup>1</sup>', name: 'Ten' }, { power: '10<sup>2</sup>', name: 'Hundred' },
    { power: '10<sup>3</sup>', name: 'Thousand' }, { power: '10<sup>6</sup>', name: 'Million' },
    { power: '10<sup>9</sup>', name: 'Billion (Short Scale) / Milliard (Long Scale)' },
    { power: '10<sup>12</sup>', name: 'Trillion (Short Scale) / Billion (Long Scale)' },
    { power: '10<sup>15</sup>', name: 'Quadrillion (Short Scale) / Billiard (Long Scale)' },
    { power: '10<sup>18</sup>', name: 'Quintillion (Short Scale) / Trillion (Long Scale)' },
    { power: '10<sup>21</sup>', name: 'Sextillion' }, { power: '10<sup>24</sup>', name: 'Septillion' },
    { power: '10<sup>27</sup>', name: 'Octillion' }, { power: '10<sup>30</sup>', name: 'Nonillion' },
    { power: '10<sup>33</sup>', name: 'Decillion' }, { power: '10<sup>36</sup>', name: 'Undecillion' },
    { power: '10<sup>39</sup>', name: 'Duodecillion' }, { power: '10<sup>42</sup>', name: 'Tredecillion' },
    { power: '10<sup>45</sup>', name: 'Quattuordecillion' }, { power: '10<sup>48</sup>', name: 'Quindecillion' },
    { power: '10<sup>51</sup>', name: 'Sexdecillion' }, { power: '10<sup>54</sup>', name: 'Septendecillion' },
    { power: '10<sup>57</sup>', name: 'Octodecillion' }, { power: '10<sup>60</sup>', name: 'Novemdecillion' },
    { power: '10<sup>63</sup>', name: 'Vigintillion' }, { power: '10<sup>100</sup>', name: 'Googol' },
    { power: '10<sup>303</sup>', name: 'Centillion (Short Scale)' }, { power: '10<sup>googol</sup>', name: 'Googolplex' }
];

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

const userManualSections = [
    {
        title: "1. Introduction",
        content: <p>The SADAPA'A Calculator is designed to handle large numbers with ease, providing not only numerical results but also their word representations in English and a secondary language of your choice. It features a live calculation tape, comprehensive history, an integrated photo notes module, and convenient tools for quick number entry.</p>
    },
    {
        title: "2. The Interface at a Glance",
        content: (
            <ul className="list-disc list-outside space-y-1 pl-5">
                <li><strong>Display Area (Top Section):</strong>
                <ul className="list-circle list-outside space-y-1 pl-5 mt-1">
                    <li><strong>Calculation Tape:</strong> Shows a running log of your current calculation steps.</li>
                    <li><strong>Main Result Display:</strong> The primary display for numbers and results.</li>
                    <li><strong>English & Secondary Language Words:</strong> Provides number-to-word conversions.</li>
                </ul>
                </li>
                <li><strong>Keypad Area (Middle Section):</strong>
                <ul className="list-circle list-outside space-y-1 pl-5 mt-1">
                    <li><strong>Main Keypad:</strong> Contains number buttons, operators (`+`, `-`, `x`, `÷`), and functions (`AC`, `DEL`, `%`, `=`).</li>
                    <li><strong>Function Buttons:</strong> Includes `Settings`, the `,000` button for quick entry, and the `Suffixes` button for large number composition.</li>
                    <li><strong>Navigation Bar (Bottom):</strong> Allows you to switch between the three main modules of the app: the <code className="bg-slate-800 px-1.5 py-0.5 rounded text-cyan-300">Standard</code> calculator, the <code className="bg-slate-800 px-1.5 py-0.5 rounded text-cyan-300">Financial</code> module, and the <code className="bg-slate-800 px-1.5 py-0.5 rounded text-cyan-300">Notes</code> feature.</li>
                </ul>
                </li>
                <li><strong>History Panel (Bottom):</strong> View, manage, and reuse your standard calculation history.</li>
            </ul>
        )
    },
    {
        title: "3. Basic Operations",
        content: (
            <ul className="list-disc list-outside space-y-1 pl-5">
                <li><strong>Entering Numbers & Operations:</strong> Use the keypad as you would with a standard calculator. The calculation tape updates in real-time.</li>
                <li><strong>Equals (=):</strong> Tap `=` to complete a calculation. The result is displayed and the full calculation is saved to history.</li>
                <li><strong>All Clear (AC):</strong> Resets the calculator to its initial state.</li>
                <li><strong>Delete (DEL):</strong> Removes the last digit typed. Acts as a multi-level undo, stepping back through operations if tapped repeatedly. If used after a calculation is complete, it resets the calculator.</li>
            </ul>
        )
    },
    {
        title: "4. Special Input Buttons",
        content: (
            <ul className="list-disc list-outside space-y-2 pl-5">
                <li><strong>`,000` (Triple Zero):</strong> Appends "000" to the current number being typed for quick entry of large figures.</li>
                <li>
  <strong>% (Percent):</strong> Calculates percentages. Works on a single number (e.g., <code>50 %</code> -&gt; <code>0.50</code>) or as part of an expression (e.g., <code>100 + 10 %</code> -&gt; <code>110</code>).
</li>
            </ul>
        )
    },
    {
        title: "5. Suffixes Button (Composition Mode)",
        content: <p>The "Suffixes" button allows you to build large numbers additively (e.g., `3` + `Million` + `200` + `Thousand`). The `Calculation Tape` shows the composition steps, and the main display shows the running total. Finalize the composed number by pressing an operator or equals.</p>
    },
    {
        title: "6. Photo Notes Feature",
        content: (
            <>
                <p>The calculator includes an integrated Photo Notes feature to store visual information securely on your device. This is ideal for saving images of receipts, documents, or whiteboards related to your calculations.</p>
                <ul className="list-disc list-outside space-y-2 pl-5 mt-1">
                    <li>
                        <strong>Accessing Notes:</strong> Tap the <code className="bg-slate-800 px-1.5 py-0.5 rounded text-cyan-300">Notes</code> button in the navigation bar at the bottom of the main calculator to switch to the Notes view.
                    </li>
                    <li>
                        <strong>Creating a New Note:</strong>
                        <ul className="list-circle list-outside space-y-1 pl-5 mt-1">
                            <li>Tap the floating <Plus size={14} className="inline-block -mt-0.5" /> button at the bottom right.</li>
                            <li>You'll be prompted to select an image from your device's library.</li>
                            <li>Once a photo is selected, you can add descriptive text in the text area below the image.</li>
                            <li>Tap "Save Note" to store it. The photo and text are saved together in your device's local database (IndexedDB).</li>
                        </ul>
                    </li>
                    <li>
                        <strong>Managing Notes:</strong>
                        <ul className="list-circle list-outside space-y-1 pl-5 mt-1">
                            <li><strong>View Image:</strong> Tap on a note's image to view it in full screen. Tap again to close.</li>
                            <li><strong>Edit Note:</strong> Tap the pencil icon (<Edit size={14} className="inline-block -mt-0.5" />) on a note card to change its descriptive text.</li>
                            <li><strong>Delete Note:</strong> Tap the trash icon (<Trash2 size={14} className="inline-block -mt-0.5" />) to permanently delete a note. A confirmation will be required.</li>
                        </ul>
                    </li>
                    <li>
                        <strong>Returning to Calculator:</strong> Tap the "Back to Calculator" button at the top of the Notes view to return to the calculator interface.
                    </li>
                </ul>
            </>
        )
    },
    {
        title: "7. Financial Calculator Module",
        content: (
            <>
                <p>Beyond the standard calculator, the app includes a powerful Financial module designed for specialized calculations. Access it by tapping the <code className="bg-slate-800 px-1.5 py-0.5 rounded text-cyan-300">Financial</code> button in the navigation bar.</p>
                <ul className="list-disc list-outside space-y-2 pl-5 mt-1">
                    <li>
                        <strong>Suite of Calculators:</strong> The module provides a menu of dedicated calculators for various financial scenarios, including:
                        <ul className="list-circle list-outside space-y-1 pl-5 mt-1">
                            <li>Loan Calculator</li>
                            <li>Return on Investment (ROI)</li>
                            <li>Time Value of Money (TVM)</li>
                            <li>Compound Interest</li>
                            <li>Retirement Savings</li>
                            <li>Break-Even Point</li>
                            <li>Margin & Markup</li>
                            <li>Inflation Calculator</li>
                        </ul>
                    </li>
                    <li>
                        <strong>Multi-Language Support:</strong> The Financial module has its own language selector, allowing you to view all labels and results in your preferred language, independent of the standard calculator's settings.
                    </li>
                    <li>
                        <strong>Dedicated History:</strong> Each calculation performed in the Financial module is saved to its own separate history. You can view detailed summaries, copy results, or reuse the inputs from a past scenario to perform a new calculation.
                    </li>
                    <li>
                        <strong>Consistent Interface:</strong> Each financial calculator maintains a user-friendly interface with features like number-to-word conversions and suffix menus for easy entry of large monetary values.
                    </li>
                </ul>
            </>
        )
    },
    {
        title: "8. Settings",
        content: (
            <>
                <p>Access various customization options by tapping the "Settings" button (icon: <Settings size={14} className="inline-block -mt-0.5" />).</p>
                 <ul className="list-disc list-outside space-y-2 pl-5 mt-1">
                    <li><strong>Secondary Language:</strong> Choose a language for the secondary number-to-words display.</li>
                    <li><strong>Haptic Feedback:</strong> Toggle vibration for keypad interactions.</li>
                    <li><strong>Reference & Info:</strong> Access informational modals like this User Manual, Powers of 10, Disclaimer, and Privacy Policy.</li>
                </ul>
            </>
        )
    },
    {
        title: "9. Calculation History",
        content: <p>The calculator automatically saves a history of your completed calculations. You can view, reuse, copy, or delete entries from the history panel on the main screen.</p>
    },
    {
        title: "10. Understanding Errors",
        content: <p>If "Error" appears on the display, it usually indicates an invalid operation (like dividing by zero). Tap `AC` to reset.</p>
    }
];

const IdLockReminderModal: React.FC<{ onConfirm: () => void; onCancel: () => void; }> = ({ onConfirm, onCancel }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-80 animate-fadeIn" role="dialog" aria-modal="true" aria-labelledby="reminder-title">
        <div className="bg-slate-700 p-6 rounded-xl shadow-2xl w-full max-w-md border border-yellow-500">
            <h3 id="reminder-title" className="text-xl font-semibold text-yellow-300">Important Notice</h3>
            <p className="text-slate-200 mt-4">
                Please be aware: The <strong>Full Name</strong>, <strong>Country</strong>, and <strong>Photo</strong> can only be changed <strong>one more time</strong> after this initial setup. After that, this information will be permanently locked.
            </p>
            <div className="flex justify-end gap-4 mt-6">
                <button onClick={onCancel} className="px-4 py-2 bg-slate-500 text-white rounded-md font-semibold hover:bg-slate-400">
                    Cancel
                </button>
                <button onClick={onConfirm} className="px-4 py-2 bg-sky-600 text-white rounded-md font-semibold hover:bg-sky-500">
                    Acknowledge & Proceed
                </button>
            </div>
        </div>
    </div>
);

const FinalEditReminderModal: React.FC<{ onConfirm: () => void; onCancel: () => void; }> = ({ onConfirm, onCancel }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-80 animate-fadeIn" role="dialog" aria-modal="true" aria-labelledby="final-edit-title">
        <div className="bg-slate-700 p-6 rounded-xl shadow-2xl w-full max-w-md border border-red-500">
            <h3 id="final-edit-title" className="text-xl font-semibold text-red-400">Final Edit Confirmation</h3>
            <p className="text-slate-200 mt-4">
                This is your <strong>final opportunity</strong> to edit your Name, Country, and Photo. After saving these changes, this information will be <strong>permanently locked</strong> and cannot be edited again.
            </p>
            <div className="flex justify-end gap-4 mt-6">
                <button onClick={onCancel} className="px-4 py-2 bg-slate-500 text-white rounded-md font-semibold hover:bg-slate-400">
                    Cancel
                </button>
                <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded-md font-semibold hover:bg-red-500">
                    Proceed to Final Edit
                </button>
            </div>
        </div>
    </div>
);

interface BigNumberProCalculatorProps {
  onNavigate: (view: 'financial' | 'notes') => void;
}

export const BigNumberProCalculator: React.FC<BigNumberProCalculatorProps> = ({ onNavigate }) => {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<Operation>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const [showSettings, setShowSettings] = useState(false);
  const [selectedSecondaryLanguage, setSelectedSecondaryLanguage] = useState<LanguageCode>('zh-CN');
  const [showPowersOfTenModal, setShowPowersOfTenModal] = useState(false);
  const [showMultiplierMenu, setShowMultiplierMenu] = useState(false);
  const [hapticFeedbackEnabled, setHapticFeedbackEnabled] = useState(true);
  const [showUniquenessModal, setShowUniquenessModal] = useState(false);
  const [showUserManualModal, setShowUserManualModal] = useState(false);
  const [showDisclaimerModal, setShowDisclaimerModal] = useState(false);
  const [showPrivacyPolicyModal, setShowPrivacyPolicyModal] = useState(false); 
  const [showCompendium, setShowCompendium] = useState(false);
  const [showMemberIdModal, setShowMemberIdModal] = useState(false);
  const [showIdLockReminderModal, setShowIdLockReminderModal] = useState(false);
  const [showFinalEditReminderModal, setShowFinalEditReminderModal] = useState(false);
  const [memberIdData, setMemberIdData] = useState<MemberIdData | null>(null);


  const [currentSecondaryWords, setCurrentSecondaryWords] = useState('');
  const [secondaryError, setSecondaryError] = useState<string | null>(null);

  const [liveCalculationSteps, setLiveCalculationSteps] = useState<string[]>([]);
  const [pendingOperationDisplay, setPendingOperationDisplay] = useState<string | null>(null);
  const [newChainExpected, setNewChainExpected] = useState(true);

  // State for suffix composition mode
  const [currentComposedValue, setCurrentComposedValue] = useState<number>(0);
  const [isComposingWithSuffixes, setIsComposingWithSuffixes] = useState<boolean>(false);


  const isMounted = useRef(false);
  const settingsButtonRef = useRef<HTMLButtonElement>(null);
  const settingsPanelRef = useRef<HTMLDivElement>(null);
  const powersOfTenModalRef = useRef<HTMLDivElement>(null);
  const mainHistoryDisplayRef = useRef<HTMLDivElement>(null);
  const multiplierMenuRef = useRef<HTMLDivElement>(null); 
  const multiplierButtonRef = useRef<HTMLButtonElement>(null);
  const uniquenessModalRef = useRef<HTMLDivElement>(null); 
  const userManualModalRef = useRef<HTMLDivElement>(null);
  const disclaimerModalRef = useRef<HTMLDivElement>(null);
  const privacyPolicyModalRef = useRef<HTMLDivElement>(null); 

  const playVibrantClickSound = useCallback(() => {
    // Sound effect disabled by user request
  }, []);

  const triggerHapticFeedback = useCallback(() => {
    if (hapticFeedbackEnabled && navigator.vibrate) {
      navigator.vibrate(25); 
    }
  }, [hapticFeedbackEnabled]);

  const handleKeypadInteraction = useCallback(() => {
    triggerHapticFeedback();
  }, [triggerHapticFeedback]);

  const AVAILABLE_LANGUAGES: LanguageOption[] = React.useMemo(() => {
    const converterMap: Record<LanguageCode, (num: number) => string> = {
      'en': numberToWordsEnglish,
      'ar': numberToWordsArabic,
      'ms': numberToWordsMalay,
      'zh-CN': numberToWordsChinese,
      'zh-TW': numberToWordsChineseTraditional,
      'fr': numberToWordsFrench,
      'de': numberToWordsGerman,
      'hi': numberToWordsHindi,
      'it': numberToWordsItalian,
      'ja': numberToWordsJapanese,
      'ko': numberToWordsKorean,
      'pt': numberToWordsPortuguese,
      'es': numberToWordsSpanish,
      'th': numberToWordsThai,
      'vi': numberToWordsVietnamese,
    };
    return PRE_SORTED_LANGUAGE_OPTIONS_CONFIG
      .map(langConfig => ({ ...langConfig, converter: converterMap[langConfig.code] }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  useEffect(() => {
    isMounted.current = true;

    try {
        const storedIdRaw = localStorage.getItem(LOCAL_STORAGE_MEMBER_ID_KEY);
        if (storedIdRaw) {
            const parsedData = JSON.parse(storedIdRaw) as any;
            const oldRefContent = [parsedData.note1, parsedData.note2, parsedData.refNo].filter(Boolean).join('\n\n');
            const refText = parsedData.refText || oldRefContent || '';

            const migratedData: MemberIdData = {
                isSetupComplete: parsedData.isSetupComplete || false,
                country: parsedData.country || '',
                fullName: parsedData.fullName || '',
                photo: parsedData.photo || '',
                countryCode: parsedData.countryCode || '+60',
                mobileNo: parsedData.mobileNo || '',
                refText: refText,
                // Migration: old users who completed setup are locked (count=2). New users start at 0.
                editCount: parsedData.editCount ?? (parsedData.isSetupComplete ? 2 : 0),
            };

            setMemberIdData(migratedData);
        } else {
            // New user initialization
            setMemberIdData({ isSetupComplete: false, country: '', fullName: '', photo: '', countryCode: '+60', mobileNo: '', refText: '', editCount: 0 });
        }
    } catch (error) {
        console.error("Error loading or parsing Member ID data:", error);
        setMemberIdData({ isSetupComplete: false, country: '', fullName: '', photo: '', countryCode: '+60', mobileNo: '', refText: '', editCount: 0 });
    }

    let langToSet: LanguageCode = 'zh-CN';
    let hapticEnabledToSet: boolean = true;

    try {
      const storedSettingsRaw = localStorage.getItem(LOCAL_STORAGE_SETTINGS_KEY);
      if (storedSettingsRaw) {
        const settings: AppSettings = JSON.parse(storedSettingsRaw);
        if (settings) {
          if (typeof settings.selectedSecondaryLanguage === 'string' && AVAILABLE_LANGUAGES.some(l => l.code === settings.selectedSecondaryLanguage)) {
            langToSet = settings.selectedSecondaryLanguage;
          }
          if (typeof settings.hapticFeedbackEnabled === 'boolean') {
            hapticEnabledToSet = settings.hapticFeedbackEnabled;
          }
        }
      }
    } catch (error) {
      console.error("Error loading or parsing settings from localStorage:", error);
    }
    setSelectedSecondaryLanguage(langToSet);
    setHapticFeedbackEnabled(hapticEnabledToSet);

    try {
      const storedHistoryRaw = localStorage.getItem(LOCAL_STORAGE_HISTORY_KEY);
      if (storedHistoryRaw) {
        const parsedHistory = JSON.parse(storedHistoryRaw);
        if (Array.isArray(parsedHistory)) {
          const validHistory = parsedHistory.filter(item =>
            item &&
            typeof item.id === 'number' &&
            typeof item.expression === 'string' &&
            typeof item.result === 'string'
          ).map(item => {
            const numericResult = typeof item.numericResult === 'number' ? item.numericResult : parseFloat(String(item.result || '0').replace(/,/g, ''));
            const valueForHistoryWords = parseFloat(String(item.result || '0').replace(/,/g, ''));
            
            const fallbackSecondaryLangCode = selectedSecondaryLanguage; 
            const fallbackSecondaryLangOption = AVAILABLE_LANGUAGES.find(l => l.code === fallbackSecondaryLangCode);

            let resultEngWords = item.resultEnglishWords;
            let resultSecLangWords = item.resultSecondaryLanguageWords;

            resultEngWords = resultEngWords || numberToWordsEnglish(isNaN(valueForHistoryWords) ? NaN : valueForHistoryWords);
            resultSecLangWords = resultSecLangWords || (fallbackSecondaryLangOption?.converter ? fallbackSecondaryLangOption.converter(isNaN(valueForHistoryWords) ? NaN : valueForHistoryWords) : " ");


            return {
              ...item,
              numericResult: isNaN(numericResult) ? NaN : numericResult, // Store NaN for special strings
              timestamp: item.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
              resultEnglishWords: resultEngWords,
              resultSecondaryLanguageWords: resultSecLangWords,
              secondaryLanguageNameAtTimeOfHistory: item.secondaryLanguageNameAtTimeOfHistory || (fallbackSecondaryLangOption?.name || " "),
              secondaryLanguageCodeAtTimeOfHistory: item.secondaryLanguageCodeAtTimeOfHistory || fallbackSecondaryLangCode,
            };
          });
          setHistory(validHistory);
        } else {
          setHistory([]);
        }
      } else {
        setHistory([]);
      }
    } catch (error) {
      console.error("Error loading or parsing history from localStorage:", error);
      setHistory([]);
    }

    const handleClickOutside = (event: MouseEvent) => {
      const targetNode = event.target as Node;
      if (showSettings &&
          settingsPanelRef.current && !settingsPanelRef.current.contains(targetNode) &&
          settingsButtonRef.current && !settingsButtonRef.current.contains(targetNode)
         ) {
        setShowSettings(false);
      }
      
      if (showMultiplierMenu &&
          multiplierMenuRef.current && !multiplierMenuRef.current.contains(targetNode) && 
          multiplierButtonRef.current && !multiplierButtonRef.current.contains(targetNode) 
         ) {
        setShowMultiplierMenu(false);
      }
      if (showUniquenessModal && uniquenessModalRef.current && !uniquenessModalRef.current.contains(targetNode)) {
        setShowUniquenessModal(false);
      }
      if (showUserManualModal && userManualModalRef.current && !userManualModalRef.current.contains(targetNode)) {
        setShowUserManualModal(false);
      }
      if (showDisclaimerModal && disclaimerModalRef.current && !disclaimerModalRef.current.contains(targetNode)) {
        setShowDisclaimerModal(false);
      }
      if (showPrivacyPolicyModal && privacyPolicyModalRef.current && !privacyPolicyModalRef.current.contains(targetNode)) { 
        setShowPrivacyPolicyModal(false);
      }
      if (showPowersOfTenModal && powersOfTenModalRef.current && !powersOfTenModalRef.current.contains(targetNode)) {
        setShowPowersOfTenModal(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      isMounted.current = false;
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [AVAILABLE_LANGUAGES, numberToWordsEnglish, showSettings, showMultiplierMenu, showUniquenessModal, showUserManualModal, showDisclaimerModal, showPrivacyPolicyModal, showPowersOfTenModal]); 


  const handleSaveMemberId = (data: MemberIdData) => {
    try {
        localStorage.setItem(LOCAL_STORAGE_MEMBER_ID_KEY, JSON.stringify(data));
        setMemberIdData(data);
    } catch (error) {
        console.error("Error saving Member ID data:", error);
        // Optionally, show an error to the user
    }
  };

  useEffect(() => {
    if (!isMounted.current) return;
    try {
      const settings: AppSettings = {
        selectedSecondaryLanguage: selectedSecondaryLanguage,
        hapticFeedbackEnabled: hapticFeedbackEnabled,
      };
      localStorage.setItem(LOCAL_STORAGE_SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error("Error saving settings to localStorage:", error);
    }
  }, [selectedSecondaryLanguage, hapticFeedbackEnabled]);


  useEffect(() => {
    if (!isMounted.current && history.length === 0) return; 
    try {
      localStorage.setItem(LOCAL_STORAGE_HISTORY_KEY, JSON.stringify(history));
    } catch (error) { console.error("Error saving history to localStorage:", error); }
  }, [history]);


  useEffect(() => {
    if (!isMounted.current && display === '0' && selectedSecondaryLanguage === 'zh-CN') return;

    const langOption = AVAILABLE_LANGUAGES.find(l => l.code === selectedSecondaryLanguage);
    const rawDisplayValue = display.replace(/,/g, '');
    
    let numericValueForSecondaryConversion: number;

    if (rawDisplayValue === "Infinity") numericValueForSecondaryConversion = Infinity;
    else if (rawDisplayValue === "-Infinity") numericValueForSecondaryConversion = -Infinity;
    else if (rawDisplayValue === "Error" || rawDisplayValue === "NaN" || rawDisplayValue.includes("SADAPA'A")) numericValueForSecondaryConversion = NaN;
    else {
        const parsedNum = parseFloat(rawDisplayValue);
        if (isNaN(parsedNum)) {
            numericValueForSecondaryConversion = NaN;
        } else if (!isFinite(parsedNum)) { 
            numericValueForSecondaryConversion = parsedNum;
        } else {
            numericValueForSecondaryConversion = parsedNum;
        }
    }

    if (!langOption) {
      setCurrentSecondaryWords('Language not found');
      setSecondaryError('Selected language configuration is missing.');
      return;
    }
    setSecondaryError(null);
    if (langOption.converter) {
      try {
        const words = langOption.converter(numericValueForSecondaryConversion);
        setCurrentSecondaryWords(words);
      } catch (e: any) {
         setCurrentSecondaryWords('Conversion error');
         setSecondaryError(e.message || `Local conversion failed for ${langOption.name}.`);
      }
    } else {
        setCurrentSecondaryWords('Converter not available');
        setSecondaryError(`Converter function missing for ${langOption.name}.`);
    }
  }, [display, selectedSecondaryLanguage, AVAILABLE_LANGUAGES, setCurrentSecondaryWords, setSecondaryError]);


  useEffect(() => {
    const tapeElement = mainHistoryDisplayRef.current;
    if (tapeElement) {
      
      tapeElement.scrollTop = tapeElement.scrollHeight;

      
      if (tapeElement.lastElementChild) {
        
        setTimeout(() => {
          tapeElement.lastElementChild?.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }, 0);
      } else if (liveCalculationSteps.length > 0 || pendingOperationDisplay) {
        
        setTimeout(() => {
            tapeElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }, 0);
      }
    }
  }, [liveCalculationSteps, pendingOperationDisplay]);


 const formatDisplayValueInternal = useCallback((value: string | number): Omit<FormattedDisplay, 'secondaryLanguageName' | 'secondaryLanguageWords' | 'secondaryError'> => {
    const sValueRaw = String(value).trim();
    
    if (sValueRaw.includes("SADAPA'A")) {
        return { formatted: sValueRaw, englishWords: "A secret law has been invoked." };
    }

    if (sValueRaw === "Infinity" || sValueRaw === "+Infinity") return { formatted: "Infinity", englishWords: "Infinity" };
    if (sValueRaw === "-Infinity") return { formatted: "-Infinity", englishWords: "Negative Infinity" };
    if (sValueRaw === "NaN" || sValueRaw.toLowerCase() === "error") return { formatted: "Error", englishWords: "Error" };

    const sValue = sValueRaw.replace(/,/g, '');
    let numValue = parseFloat(sValue);

    if (isNaN(numValue)) {
        if (sValue === '0' || sValue === '-0') numValue = 0;
        else return { formatted: 'Error', englishWords: 'Error' };
    }

    let displayStringWithGrouping: string;
    const valueForWords = numValue;

    if (Math.abs(numValue) < 1e-6 && Math.abs(numValue) !== 0 && !isFinite(numValue) === false && !sValueRaw.toLowerCase().includes("infinity")) {
        displayStringWithGrouping = numValue.toExponential(2).replace("+", "");
    } else if (Math.abs(numValue) >= 1e21 || (String(sValueRaw).toLowerCase().includes('e') && isFinite(numValue))) {
        // Handle very large numbers or numbers already in scientific notation string form
        // Use toLocaleString to get a non-scientific string representation for integers
        let numStrDeExponentiated = numValue.toLocaleString('en-US', {
            notation: 'standard',
            maximumFractionDigits: 0, // For large integers, focus on integer part
            useGrouping: false
        });

        let integerPart = numStrDeExponentiated;
        // For these large numbers, we standardize to .00 for display consistency
        let decimalPartStr = '00';

        const groupingSign = integerPart.startsWith('-') ? '-' : '';
        const absIntegerPartRaw = integerPart.startsWith('-') ? integerPart.substring(1) : integerPart;
        const absIntegerPart = (absIntegerPartRaw === "0" && numStrDeExponentiated.startsWith("-")) ? "0" : absIntegerPartRaw;

        const groupedAbsIntegerPart = absIntegerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        displayStringWithGrouping = groupingSign + groupedAbsIntegerPart + '.' + decimalPartStr;
    } else if (!isFinite(numValue)) { // Handles Infinity, -Infinity that weren't caught by exact string match
         displayStringWithGrouping = numValue > 0 ? "Infinity" : "-Infinity";
    }
    else {
        // Standard formatting for numbers not extremely small or large.
        // This logic preserves user-entered precision and formats the integer part with commas.
        try {
            const sValueNoCommas = sValue.replace(/,/g, '');
            let [integerPart, decimalPart] = sValueNoCommas.split('.');

            const groupingSign = integerPart.startsWith('-') ? '-' : '';
            const absIntegerPartRaw = integerPart.startsWith('-') ? integerPart.substring(1) : integerPart;
            const absIntegerPart = (absIntegerPartRaw === "0" && sValueNoCommas.startsWith("-")) ? "0" : absIntegerPartRaw;

            const groupedAbsIntegerPart = absIntegerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            
            // Preserve user-entered precision. Do not add or remove decimal places.
            if (decimalPart !== undefined) {
                displayStringWithGrouping = groupingSign + groupedAbsIntegerPart + '.' + decimalPart;
            } else {
                // For integers, just show the grouped number without adding .00
                displayStringWithGrouping = groupingSign + groupedAbsIntegerPart;
            }

        } catch (e) {
            // Fallback for any unexpected errors from string manipulation
            let numStrDeExponentiated = numValue.toLocaleString('en-US', {
                notation: 'standard',
                maximumFractionDigits: 20,
                useGrouping: false
            });

            let [integerPart, decimalPartStr = ''] = numStrDeExponentiated.split('.');
            decimalPartStr = (decimalPartStr + "00").substring(0, 2);

            const groupingSign = integerPart.startsWith('-') ? '-' : '';
            const absIntegerPartRaw = integerPart.startsWith('-') ? integerPart.substring(1) : integerPart;
            const absIntegerPart = (absIntegerPartRaw === "0" && numStrDeExponentiated.startsWith("-")) ? "0" : absIntegerPartRaw;

            const groupedAbsIntegerPart = absIntegerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            displayStringWithGrouping = groupingSign + groupedAbsIntegerPart + '.' + decimalPartStr;
        }
    }

    const english = numberToWordsEnglish(valueForWords);
    return { formatted: displayStringWithGrouping, englishWords: english };
}, [numberToWordsEnglish]);


  const currentDisplayFormatted: FormattedDisplay = React.useMemo(() => ({
    ...formatDisplayValueInternal(display),
    secondaryLanguageName: AVAILABLE_LANGUAGES.find(l => l.code === selectedSecondaryLanguage)?.name || 'Unknown Language',
    secondaryLanguageWords: currentSecondaryWords,
    secondaryError: secondaryError,
  }), [display, formatDisplayValueInternal, selectedSecondaryLanguage, AVAILABLE_LANGUAGES, currentSecondaryWords, secondaryError]);

  const addHistoryEntry = (expressionSteps: string[], resultVal: number, resultStr: string) => {
    const expressionForStorage = expressionSteps.join('\n');
    const valueForHistoryWords = resultVal; 

    const currentSecondaryLangOption = AVAILABLE_LANGUAGES.find(l => l.code === selectedSecondaryLanguage);
    let secondaryLangName = currentSecondaryLangOption?.name || "Unknown";
    
    let englishWords: string;
    let secondaryLangWords: string;

    englishWords = numberToWordsEnglish(valueForHistoryWords);
    if (currentSecondaryLangOption && currentSecondaryLangOption.converter) {
      try {
        secondaryLangWords = currentSecondaryLangOption.converter(valueForHistoryWords);
      } catch (e) {
        secondaryLangWords = "Conversion Error";
        console.error(`Error converting to ${secondaryLangName} for history:`, e);
      }
    } else {
        secondaryLangWords = "N/A";
    }

    const newEntry: HistoryEntry = {
      id: Date.now(),
      expression: expressionForStorage,
      result: resultStr,
      resultEnglishWords: englishWords,
      resultSecondaryLanguageWords: secondaryLangWords,
      secondaryLanguageCodeAtTimeOfHistory: selectedSecondaryLanguage,
      secondaryLanguageNameAtTimeOfHistory: secondaryLangName,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      numericResult: isNaN(resultVal) ? NaN : resultVal,
    };
    setHistory(prevHistory => [newEntry, ...prevHistory].slice(0, 50));
  };
  
  const updatePendingOperationDisplayWithCurrentValue = (currentValStr: string, currentOp: Operation | null, currentPrevVal: number | null, isStillWaitingForOperand: boolean) => {
    if (currentOp && currentPrevVal !== null && !isStillWaitingForOperand) {
        const formattedPrev = formatDisplayValueInternal(currentPrevVal).formatted;
        const formattedCurrent = formatDisplayValueInternal(currentValStr).formatted;
        const opStr = currentOp === '÷' ? '÷' : currentOp === 'x' ? 'x' : currentOp;
        setPendingOperationDisplay(`${formattedPrev} ${opStr} ${formattedCurrent}`);
    }
  };

  const inputNumber = (numStr: string) => {
    handleKeypadInteraction();
    let currentDisplayVal = display; 
    let nextWaitingForOperand = waitingForOperand;
    
    if (newChainExpected && !isComposingWithSuffixes) {
        currentDisplayVal = (numStr === '.' ? '0.' : numStr);
        setLiveCalculationSteps([]);
        setPendingOperationDisplay(null);
        setNewChainExpected(false);
        nextWaitingForOperand = false;
        setPreviousValue(null);
        setOperation(null);
        setCurrentComposedValue(0);
        setIsComposingWithSuffixes(false);
    } else if (["Error", "Infinity", "-Infinity", "NaN"].includes(currentDisplayVal) || currentDisplayVal.includes("SADAPA'A")) {
        currentDisplayVal = (numStr === '.' ? '0.' : numStr);
        setLiveCalculationSteps([]); 
        setPendingOperationDisplay(null);
        nextWaitingForOperand = false;
        setNewChainExpected(false); 
        setCurrentComposedValue(0);
        setIsComposingWithSuffixes(false);
    } else if (waitingForOperand) {
      currentDisplayVal = (numStr === '.' ? '0.' : numStr);
      nextWaitingForOperand = false;
    } else {
      let rawNumericString = currentDisplayVal.replace(/,/g, '');
      if (rawNumericString.includes('.') && parseFloat(rawNumericString) % 1 === 0 && numStr !== '.') {
          // Allow typing after "X.00"
      }

      const currentActualDigits = rawNumericString.replace(/[.-]/g, '').length; 
      if (rawNumericString.includes('.') && numStr === '.') {  }
      else if (currentActualDigits >= MAX_INPUT_DIGITS && !rawNumericString.includes('e')) {  }
      else if (rawNumericString === '0' && numStr === '0' && !rawNumericString.includes('.')) {  }
      else if (rawNumericString === '0' && numStr !== '0' && !rawNumericString.includes('.') && numStr !== '.') { currentDisplayVal = numStr; }
      else if (rawNumericString === '0' && numStr === '.' ) { currentDisplayVal = '0.';}
      else {
          if (rawNumericString.match(/^0\.00$/) && numStr !== '.') {
            currentDisplayVal = numStr;
          } else if (rawNumericString.match(/^-0\.00$/) && numStr !== '.') {
            currentDisplayVal = "-" + numStr;
          }
          else {
            let tempUnformatted = display.replace(/,/g, '');
            if (tempUnformatted === "0" && numStr !== '.') tempUnformatted = ""; 
            if (tempUnformatted === "-0" && numStr !== '.') tempUnformatted = "-";
            
            if (tempUnformatted.match(/\.00$/) && numStr !== '.') {
                tempUnformatted = tempUnformatted.substring(0, tempUnformatted.length - 3);
            }
            currentDisplayVal = tempUnformatted + numStr;
          }
      }
    }
    setWaitingForOperand(nextWaitingForOperand);
    setDisplay(currentDisplayVal);
    updatePendingOperationDisplayWithCurrentValue(currentDisplayVal, operation, previousValue, nextWaitingForOperand);
  };

  const inputTripleZero = () => {
    handleKeypadInteraction();
    let nextDisplayVal = display;
    let nextWaitingForOperand = waitingForOperand;

    if (newChainExpected && !isComposingWithSuffixes) {
      inputNumber('0'); 
      return;
    }
    if (["Error", "Infinity", "-Infinity", "NaN"].includes(display) || display.includes("SADAPA'A")) {
      inputNumber('0'); // This will set display to '0' and update pending display if needed
      return;
    }
     if (waitingForOperand) { // If waiting for an operand, "000" starts a new number "0"
        nextDisplayVal = '0';
        nextWaitingForOperand = false;
    } else {
        const currentRawValue = display.replace(/,/g, ''); 
        if (currentRawValue === '0' || currentRawValue === '0.00') {
            nextDisplayVal = '0';
        } else {
            const appendZerosTo = (baseValue: string, zeros: string): string => {
                let temp = baseValue;
                let unformattedBase = baseValue.replace(/,/g, '');
                if (unformattedBase.match(/\.00$/)) { 
                    unformattedBase = unformattedBase.substring(0, unformattedBase.length - 3);
                }
                for (const zero of zeros) {
                    const currentDigitsOnly = unformattedBase.replace(/[.-]/g, '').length;
                    if (currentDigitsOnly < MAX_INPUT_DIGITS) {
                        unformattedBase += zero;
                    } else {
                        break;
                    }
                }
                return unformattedBase;
            }
            let baseForAppend = display.replace(/,/g, '');
            if (baseForAppend === "0" || baseForAppend === "0.00") baseForAppend = ""; 
            nextDisplayVal = appendZerosTo(baseForAppend, '000');
        }
    }
    setWaitingForOperand(nextWaitingForOperand);
    setDisplay(nextDisplayVal);
    updatePendingOperationDisplayWithCurrentValue(nextDisplayVal, operation, previousValue, nextWaitingForOperand);
};


  const inputDecimal = () => {
    handleKeypadInteraction();
    const currentRaw = display.replace(/,/g, '');
    let nextDisplayVal = display;
    let nextWaitingForOperand = waitingForOperand;

    if (!currentRaw.includes('.')) {
        if (currentRaw === "0" || currentRaw === "-0" || (newChainExpected && !isComposingWithSuffixes) || waitingForOperand || ["Error", "Infinity", "-Infinity", "NaN"].includes(display) || display.includes("SADAPA'A")) {
            nextDisplayVal = (currentRaw === "-0" ? "-0." : "0.");
             if (newChainExpected && !isComposingWithSuffixes) {
                setLiveCalculationSteps([]);
                setPendingOperationDisplay(null);
                setNewChainExpected(false);
                nextWaitingForOperand = false;
                setPreviousValue(null);
                setOperation(null);
                setCurrentComposedValue(0);
                setIsComposingWithSuffixes(false);
            } else if (["Error", "Infinity", "-Infinity", "NaN"].includes(display) || display.includes("SADAPA'A")){
                setLiveCalculationSteps([]);
                setPendingOperationDisplay(null);
                nextWaitingForOperand = false;
                setNewChainExpected(false);
                setCurrentComposedValue(0);
                setIsComposingWithSuffixes(false);
            } else if (waitingForOperand) {
                 nextWaitingForOperand = false;
            }
        } else {
            nextDisplayVal = currentRaw + '.';
        }
    }
    setWaitingForOperand(nextWaitingForOperand);
    setDisplay(nextDisplayVal);
    updatePendingOperationDisplayWithCurrentValue(nextDisplayVal, operation, previousValue, nextWaitingForOperand);
  };

  const clearAll = () => {
    handleKeypadInteraction();
    setDisplay('0'); 
    setPreviousValue(null); setOperation(null);
    setWaitingForOperand(false);
    setLiveCalculationSteps([]);
    setPendingOperationDisplay(null);
    setNewChainExpected(true);
    setCurrentComposedValue(0);
    setIsComposingWithSuffixes(false);
  };

  const deleteLast = () => {
    handleKeypadInteraction();

    // If a calculation was just completed (e.g., after '=' or '%'), DEL acts like AC.
    if (newChainExpected) {
        clearAll();
        return;
    }

    // Handle non-editable/terminal states first
    if (isComposingWithSuffixes) {
        clearAll(); return;
    }
    const currentRawDisplayNoComma = display.replace(/,/g, '');
    if (["Infinity", "-Infinity", "NaN", "Error"].includes(currentRawDisplayNoComma) || display.includes("SADAPA'A")) {
        clearAll(); return;
    }

    // Case 1: Active operation, and user is inputting/has inputted the second operand.
    if (operation && !waitingForOperand) {
        let currentSecondOperand = display.replace(/,/g, '');
        if (currentSecondOperand.length === 1 || (currentSecondOperand.startsWith('-') && currentSecondOperand.length === 2) || currentSecondOperand === "0." || currentSecondOperand === "-0.") {
            setDisplay('0');
            setWaitingForOperand(true);
            if (previousValue !== null) {
                 setPendingOperationDisplay(`${formatDisplayValueInternal(previousValue).formatted} ${operation === '÷' ? '÷' : operation === 'x' ? 'x' : operation}`);
            }
        } else {
            currentSecondOperand = currentSecondOperand.slice(0, -1);
            if (currentSecondOperand === "" || currentSecondOperand === "-") {
                currentSecondOperand = "0";
            }
            setDisplay(currentSecondOperand);
            updatePendingOperationDisplayWithCurrentValue(currentSecondOperand, operation, previousValue, false);
        }
        return;
    }

    // Case 2: Active operation, and calculator is waiting for the second operand.
    if (operation && waitingForOperand && previousValue !== null) {
        const valRestoredToDisplay = previousValue;
        setDisplay(formatDisplayValueInternal(valRestoredToDisplay).formatted);
        setOperation(null);
        setWaitingForOperand(false);
        setPendingOperationDisplay(null);

        if (liveCalculationSteps.length > 0) {
            const lastStep = liveCalculationSteps[liveCalculationSteps.length - 1];
            if (lastStep.includes(`= ${formatDisplayValueInternal(valRestoredToDisplay).formatted}`)) {
                setNewChainExpected(true);
            } else {
                setPreviousValue(null);
                setNewChainExpected(false);
            }
        } else {
            setPreviousValue(null);
            setNewChainExpected(false);
        }
        return;
    }

    // Case 3: No active operation. User is typing the first number, or a result is on display.
    if (!operation) {
        let currentFirstOperandOrResult = display.replace(/,/g, '');
        if (newChainExpected) {
            setPreviousValue(null);
            setNewChainExpected(false);
        }

        if (currentFirstOperandOrResult.length === 1 || (currentFirstOperandOrResult.startsWith('-') && currentFirstOperandOrResult.length === 2) || currentFirstOperandOrResult === "0." || currentFirstOperandOrResult === "-0.") {
            currentFirstOperandOrResult = '0';
        } else {
            currentFirstOperandOrResult = currentFirstOperandOrResult.slice(0, -1);
            if (currentFirstOperandOrResult === "" || currentFirstOperandOrResult === "-") {
                currentFirstOperandOrResult = "0";
            }
        }
        setDisplay(currentFirstOperandOrResult);
        setPreviousValue(null);
        setPendingOperationDisplay(null);
        return;
    }
  };


  const calculate = (val1: number, val2: number, op: Operation): number => {
    switch (op) {
      case '+': return val1 + val2; case '-': return val1 - val2;
      case 'x': return val1 * val2; case '÷': return val2 === 0 ? Infinity : val1 / val2;
      default: return val2; 
    }
  };

  const handleOperation = (newOp: Operation) => {
    handleKeypadInteraction();
    let operandForOperation: number;
    let tapeStepsForThisOperation: string[] = [];

    if (isComposingWithSuffixes) {
        let finalComposedValue = currentComposedValue;
        const valueOnDisplay = parseFloat(display.replace(/,/g, ''));

        if (!isNaN(valueOnDisplay) && valueOnDisplay !== currentComposedValue && display !== formatDisplayValueInternal(currentComposedValue).formatted) {
            tapeStepsForThisOperation.push(`+ ${formatDisplayValueInternal(valueOnDisplay).formatted} (from display)`);
            finalComposedValue += valueOnDisplay;
            tapeStepsForThisOperation.push(`= ${formatDisplayValueInternal(finalComposedValue).formatted} (Final Composed Value)`);
        }
        operandForOperation = finalComposedValue;
        setLiveCalculationSteps(prev => [...prev, ...tapeStepsForThisOperation]);
        setCurrentComposedValue(0);
        setIsComposingWithSuffixes(false);
    } else {
        operandForOperation = parseFloat(display.replace(/,/g, ''));
    }

    if (isNaN(operandForOperation) && display !== "Infinity" && display !== "-Infinity") {
        setDisplay("Error");
        setLiveCalculationSteps(prev => prev.length > 0 ? [...prev, "Error"] : ["Error"]);
        setPendingOperationDisplay(null);
        setPreviousValue(null); setOperation(null); setNewChainExpected(true);
        setCurrentComposedValue(0); setIsComposingWithSuffixes(false);
        return;
    }
    
    const formattedOperandForTape = formatDisplayValueInternal(operandForOperation).formatted;
    const currentOpSymbol = newOp === '÷' ? '÷' : newOp === 'x' ? 'x' : newOp;


    if (newChainExpected && previousValue !== null && operation === null && !isComposingWithSuffixes) {
        setPendingOperationDisplay(`${formatDisplayValueInternal(previousValue).formatted} ${currentOpSymbol}`);
        setOperation(newOp);
        setWaitingForOperand(true);
        setNewChainExpected(false);
        return;
    }


    if (operation && previousValue !== null && !waitingForOperand) {
      const result = calculate(previousValue, operandForOperation, operation);
      const resultStrForDisplay = formatDisplayValueInternal(result).formatted;
      const completedOpStr = operation === '÷' ? '÷' : operation === 'x' ? 'x' : operation;
      const completedStep = `${formatDisplayValueInternal(previousValue).formatted} ${completedOpStr} ${formattedOperandForTape} = ${resultStrForDisplay}`;

      setLiveCalculationSteps(prevSteps => [...prevSteps, completedStep]);
      setPendingOperationDisplay(`${resultStrForDisplay} ${currentOpSymbol}`);
      setDisplay(resultStrForDisplay); 
      setPreviousValue(result); 
    } else { 
      setPreviousValue(operandForOperation); 
      setPendingOperationDisplay(`${formattedOperandForTape} ${currentOpSymbol}`);
      if (newChainExpected || (liveCalculationSteps.length === 0 && pendingOperationDisplay === null && !isComposingWithSuffixes)) {
         setLiveCalculationSteps([]); 
      }
    }
    setOperation(newOp);
    setWaitingForOperand(true);
    setNewChainExpected(false);
  };

  const handleEquals = () => {
    handleKeypadInteraction();
    let finalOperand: number;
    let tapeStepsForEquals: string[] = [];

    if (isComposingWithSuffixes) {
        let valToFinalize = currentComposedValue;
        const valueOnDisplayIfAny = parseFloat(display.replace(/,/g, ''));

        if (!isNaN(valueOnDisplayIfAny) && valueOnDisplayIfAny !== currentComposedValue && display !== formatDisplayValueInternal(currentComposedValue).formatted) {
            tapeStepsForEquals.push(`+ ${formatDisplayValueInternal(valueOnDisplayIfAny).formatted} (from display)`);
            valToFinalize += valueOnDisplayIfAny;
            tapeStepsForEquals.push(`= ${formatDisplayValueInternal(valToFinalize).formatted} (Final Composed Value)`);
        }
        finalOperand = valToFinalize;
    } else {
        finalOperand = parseFloat(display.replace(/,/g, ''));
    }
    
    if (isNaN(finalOperand) && display !== "Infinity" && display !== "-Infinity") {
        setDisplay("Error");
        setLiveCalculationSteps(prev => prev.length > 0 ? [...prev, ...tapeStepsForEquals, "Error"] : ["Error"]);
        setPendingOperationDisplay(null);
        setOperation(null); setPreviousValue(null); setWaitingForOperand(false); setNewChainExpected(true);
        setCurrentComposedValue(0); setIsComposingWithSuffixes(false);
        return;
    }

    const currentOpStr = operation === '÷' ? '÷' : operation === 'x' ? 'x' : operation;
    const formattedPrevValForTape = previousValue !== null ? formatDisplayValueInternal(previousValue).formatted : '';
    const formattedCurrentValForTape = formatDisplayValueInternal(finalOperand).formatted;

    if (operation && previousValue !== null) {
      // Special SADAPA'A Law checks
      if (operation === 'x' && previousValue === 2 && finalOperand === 2) {
          const message = "SADAPA'A Law #1\n\"2 x 2 is more than 4 !\"";
          setDisplay(message);
          const finalStep = `2 x 2 = Special Law #1`;
          const newSteps = [...liveCalculationSteps, ...tapeStepsForEquals, finalStep];
          addHistoryEntry(newSteps, NaN, message);
          setPreviousValue(NaN);
          setLiveCalculationSteps(newSteps);
          setPendingOperationDisplay(null);
          setOperation(null);
          setWaitingForOperand(false);
          setNewChainExpected(true);
          setCurrentComposedValue(0);
          setIsComposingWithSuffixes(false);
          return;
      }

      if (operation === 'x' && previousValue === 4 && finalOperand === 4) {
          const message = "SADAPA'A Law #2\nYou decide !\nSADAPA'A Grant You The Power !";
          setDisplay(message);
          const finalStep = `4 x 4 = Special Law #2`;
          const newSteps = [...liveCalculationSteps, ...tapeStepsForEquals, finalStep];
          addHistoryEntry(newSteps, NaN, message);
          setPreviousValue(NaN);
          setLiveCalculationSteps(newSteps);
          setPendingOperationDisplay(null);
          setOperation(null);
          setWaitingForOperand(false);
          setNewChainExpected(true);
          setCurrentComposedValue(0);
          setIsComposingWithSuffixes(false);
          return;
      }
      
      const result = calculate(previousValue, finalOperand, operation);
      const resultStrForDisplay = formatDisplayValueInternal(result).formatted;
      
      const finalStep = `${formattedPrevValForTape} ${currentOpStr} ${formattedCurrentValForTape} = ${resultStrForDisplay}`;
      const newSteps = [...liveCalculationSteps, ...tapeStepsForEquals, finalStep];

      addHistoryEntry(newSteps, result, resultStrForDisplay);

      setDisplay(resultStrForDisplay); 
      setPreviousValue(result); 
      setLiveCalculationSteps(newSteps); 
      setPendingOperationDisplay(null); 
      setOperation(null); 
      setWaitingForOperand(false);
      setNewChainExpected(true); 

    } else if (previousValue === null && operation === null && !waitingForOperand && !newChainExpected) {
      const resultStrForDisplay = formatDisplayValueInternal(finalOperand).formatted;
      const step = tapeStepsForEquals.length > 0 ? `${resultStrForDisplay}` : `${resultStrForDisplay} = ${resultStrForDisplay}`; 
      const newSteps = [...liveCalculationSteps, ...tapeStepsForEquals, step];

      addHistoryEntry(newSteps, finalOperand, resultStrForDisplay);

      setDisplay(resultStrForDisplay);
      setPreviousValue(finalOperand); 
      setLiveCalculationSteps(newSteps);
      setPendingOperationDisplay(null);
      setWaitingForOperand(false);
      setNewChainExpected(true);
    }
    setCurrentComposedValue(0); 
    setIsComposingWithSuffixes(false);
  };

  const handlePercent = () => {
    handleKeypadInteraction();
    if (isComposingWithSuffixes) { 
        handleEquals(); 
    }

    const currentDisplayString = display.replace(/,/g, '');
    let B = parseFloat(currentDisplayString);

    if (isNaN(B) && display !== "Infinity" && display !== "-Infinity" && display !== "Error" && display !== "NaN") {
        setDisplay("Error");
        setLiveCalculationSteps(prev => prev.length > 0 ? [...prev, "Error"] : ["Error"]);
        setPendingOperationDisplay(null);
        setPreviousValue(null); setOperation(null); setNewChainExpected(true); return;
    }

    let result: number;
    let finalStepString = "";
    const formattedBForTape = formatDisplayValueInternal(B).formatted;

    if (operation && previousValue !== null && !waitingForOperand) { 
        const A = previousValue;
        const formattedAForTape = formatDisplayValueInternal(A).formatted;
        const currentOpStr = operation === '÷' ? '÷' : operation === 'x' ? 'x' : operation;
        const percentExpressionPart = `${formattedBForTape}%`; 

        let percentageOperand: number;
        if (operation === '+' || operation === '-') { 
            percentageOperand = (A * B) / 100;
        } else { 
            percentageOperand = B / 100;
        }
        result = calculate(A, percentageOperand, operation);
        const resultStringFormattedForDisplayAndTape = formatDisplayValueInternal(result).formatted;
        
        finalStepString = `${formattedAForTape} ${currentOpStr} ${percentExpressionPart} = ${resultStringFormattedForDisplayAndTape}`;

    } else { 
        result = B / 100;
        const resultStringFormattedForDisplayAndTape = formatDisplayValueInternal(result).formatted;
        finalStepString = `${formattedBForTape}% = ${resultStringFormattedForDisplayAndTape}`; 
    }

    const newSteps = [...liveCalculationSteps, finalStepString];
    const resultStrForDisplay = formatDisplayValueInternal(result).formatted;
    addHistoryEntry(newSteps, result, resultStrForDisplay);

    setDisplay(resultStrForDisplay);
    setPreviousValue(result); 
    setLiveCalculationSteps(newSteps);
    setPendingOperationDisplay(null);
    setOperation(null);
    setWaitingForOperand(false);
    setNewChainExpected(true);
  };

  const handleMultiplierSelect = (multiplierValue: number, suffixName: string) => {
    handleKeypadInteraction();
    const currentDisplaySanitized = display.replace(/,/g, '');
    let segmentInput = parseFloat(currentDisplaySanitized);

    if (isNaN(segmentInput) || ["Error", "Infinity", "-Infinity", "NaN"].includes(display) || (display === formatDisplayValueInternal('0').formatted && !isComposingWithSuffixes)) {
      if (isComposingWithSuffixes && (segmentInput === 0 || isNaN(segmentInput))) {
        segmentInput = 0; 
      } else {
        segmentInput = 1; 
      }
    }
    
    const term = segmentInput * multiplierValue;
    const newComposedTotal = currentComposedValue + term;

    const tapeSteps: string[] = [];
    if (segmentInput !== 0 || !isComposingWithSuffixes || currentComposedValue === 0) { 
      tapeSteps.push(`${formatDisplayValueInternal(segmentInput).formatted} × ${suffixName} = ${formatDisplayValueInternal(term).formatted}`);
    }
    if (currentComposedValue !== 0 && term !== 0) { 
        tapeSteps.push(`  (was ${formatDisplayValueInternal(currentComposedValue).formatted} + ${formatDisplayValueInternal(term).formatted})`);
    }
    tapeSteps.push(`Current Sum: ${formatDisplayValueInternal(newComposedTotal).formatted}`);
    
    setLiveCalculationSteps(prev => [...prev, ...tapeSteps]);
    
    setCurrentComposedValue(newComposedTotal);
    setDisplay(formatDisplayValueInternal(newComposedTotal).formatted); 
    
    setIsComposingWithSuffixes(true);
    setWaitingForOperand(true); 
    setNewChainExpected(false);
    setPreviousValue(null); 
    setOperation(null);
    setShowMultiplierMenu(false);
  };


  const useHistoryResult = (entry: HistoryEntry) => {
    const selectedNumericResult = entry.numericResult; 
    let selectedResultStrForDisplay: string;
    
    if(isNaN(selectedNumericResult)) {
        selectedResultStrForDisplay = entry.result;
    } else {
        selectedResultStrForDisplay = formatDisplayValueInternal(selectedNumericResult).formatted;
    }

    setCurrentComposedValue(0);
    setIsComposingWithSuffixes(false);

    if (operation && previousValue !== null && waitingForOperand) {
        if(isNaN(selectedNumericResult)) {
            setDisplay("Error");
            setLiveCalculationSteps(prev => [...prev, "Error"]);
            setPendingOperationDisplay(null);
            setPreviousValue(null); setOperation(null); setNewChainExpected(true);
            return;
        }
        
        const currentValueForCalc = selectedNumericResult; 
        const result = calculate(previousValue, currentValueForCalc, operation); 
        
        let resultStrForDisplay: string = formatDisplayValueInternal(result).formatted;


        const formattedPrevValForTape = formatDisplayValueInternal(previousValue).formatted;
        const formattedCurrentValForTape = entry.result; // Use the conceptual result from history for the tape
        const currentOpStr = operation === '÷' ? '÷' : operation === 'x' ? 'x' : operation;

        const finalStep = `${formattedPrevValForTape} ${currentOpStr} ${formattedCurrentValForTape} = ${resultStrForDisplay}`;
        const newSteps = [...liveCalculationSteps, finalStep];

        addHistoryEntry(newSteps, result, resultStrForDisplay);

        setDisplay(resultStrForDisplay);
        setPreviousValue(result); 
        setLiveCalculationSteps(newSteps);
        setPendingOperationDisplay(null);
        setOperation(null);
        setWaitingForOperand(false);
        setNewChainExpected(true);
    } else {
        
        setDisplay(selectedResultStrForDisplay);
        setPreviousValue(selectedNumericResult); 
        setOperation(null);
        setWaitingForOperand(false);
        setLiveCalculationSteps([`${selectedResultStrForDisplay}`]);
        setPendingOperationDisplay(null);
        setNewChainExpected(true); 
    }
  };

  const deleteHistoryEntry = (id: number) => {
    triggerHapticFeedback();
    setHistory(prevHistory => prevHistory.filter(entry => entry.id !== id));
  };

  const handleCopyHistoryEntry = useCallback(async (entry: HistoryEntry) => {
    triggerHapticFeedback();
    let textToCopy = `Calculation:\n${entry.expression}\nResult: ${entry.result}\nEnglish: ${entry.resultEnglishWords}`;

    if (entry.secondaryLanguageNameAtTimeOfHistory &&
        entry.secondaryLanguageNameAtTimeOfHistory.trim() !== "N/A" &&
        entry.secondaryLanguageNameAtTimeOfHistory.trim() !== "" &&
        entry.resultSecondaryLanguageWords &&
        entry.resultSecondaryLanguageWords.trim() !== "N/A" &&
        entry.resultSecondaryLanguageWords.trim() !== "" &&
        entry.resultSecondaryLanguageWords.trim().toLowerCase() !== "conversion error" &&
        entry.resultSecondaryLanguageWords.trim().toLowerCase() !== "language not found" &&
         entry.resultSecondaryLanguageWords.trim().toLowerCase() !== "converter not available"

      ) {
      textToCopy += `\n${entry.secondaryLanguageNameAtTimeOfHistory}: ${entry.resultSecondaryLanguageWords}`;
    }


    try {
      await navigator.clipboard.writeText(textToCopy);

      const copyButton = document.getElementById(`copy-history-${entry.id}`);
      const copyButtonTextSpan = copyButton?.querySelector('span');

      if (copyButton && copyButtonTextSpan) {
        const originalText = copyButtonTextSpan.textContent;
        copyButtonTextSpan.textContent = "Copied!";
        copyButton.classList.add('bg-green-600', 'hover:bg-green-500');
        copyButton.classList.remove('bg-sky-700', 'hover:bg-sky-600');


        setTimeout(() => {
          if (copyButtonTextSpan) {
             copyButtonTextSpan.textContent = "Copy to clipboard"; 
             copyButton.classList.remove('bg-green-600', 'hover:bg-green-500');
             copyButton.classList.add('bg-sky-700', 'hover:bg-sky-600');
          }
        }, 1500);
      }
    } catch (err) {
      console.error('Failed to copy history entry: ', err);
      
      alert('Failed to copy to clipboard. Your browser might not support this feature or permission was denied.');
    }
  }, [triggerHapticFeedback]);


  const buttonBaseClass = "font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 transition-colors duration-150 ease-in-out";
  const numButtonClass = `${buttonBaseClass} py-2.5 bg-slate-600 hover:bg-slate-500 text-white focus:ring-slate-400 text-3xl`;
  const opButtonClass = `${buttonBaseClass} py-2.5 bg-sky-600 hover:bg-sky-500 text-white focus:ring-sky-400 text-3xl`;
  const specialButtonClass = (color: string) => `${buttonBaseClass} py-2.5 ${color} text-white text-lg`;


  useEffect(() => {
    if (!isMounted.current) { 
        setDisplay(formatDisplayValueInternal('0').formatted);
    }
  
  }, []); 


  return (
    <div className="h-full bg-gray-900 text-gray-100 p-4 flex flex-col items-center overflow-y-auto overflow-x-hidden">
      <button 
        onClick={() => setShowCompendium(true)}
        className="w-full max-w-md mb-3 text-center border-2 border-yellow-400 bg-black rounded-lg p-2 hover:bg-slate-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:ring-offset-2 focus:ring-offset-gray-900"
        aria-label="Open DZA SADAPA'A Calculator Q&A Compendium"
      >
        <h1 className="text-lg font-bold text-yellow-300 flex items-center justify-center gap-x-2">
          <span>DZA</span>
          <Calculator size={22} className="text-sky-400 flex-shrink-0" />
          <span>SADAPA'A Calculator</span>
        </h1>
      </button>

      <div className="w-full max-w-md bg-slate-800 shadow-2xl rounded-xl p-4 sm:p-6 flex flex-col mb-4">
        
        <div className="bg-slate-700 p-4 rounded-lg shadow-inner mb-4 flex flex-col overflow-y-auto custom-scrollbar-tape h-[22rem]">
          
          <div
            ref={mainHistoryDisplayRef}
            className="h-[7rem] overflow-y-auto text-sm text-gray-300 text-left custom-scrollbar-tape p-1 border border-slate-600 rounded"
            aria-live="polite"
            aria-atomic="true"
            aria-label="Calculation tape"
          >
            {liveCalculationSteps.length > 0 ? (
              liveCalculationSteps.map((step, index) => (
                <div key={index} className="whitespace-pre-wrap break-all leading-tight text-[14px]">{step}</div>
              ))
            ) : (
              <div className="italic text-slate-400">Tape empty</div>
            )}
            {pendingOperationDisplay && (
              <div className="whitespace-pre-wrap break-all text-yellow-300 leading-tight">{pendingOperationDisplay}</div>
            )}
          </div>

          
          <div className="flex-grow min-h-0 overflow-y-auto custom-scrollbar-tape pt-2">
            <div
              className={`font-bold my-2 min-h-[3rem] lg:min-h-[3.75rem] flex items-center ${
                currentDisplayFormatted.formatted.includes("SADAPA'A")
                  ? 'justify-center text-center whitespace-pre-wrap p-2 text-2xl lg:text-3xl text-yellow-300 break-words'
                  : 'justify-end text-right text-[34px] lg:text-5xl text-white break-all'
              }`}
              aria-live="assertive"
              aria-label={`Current display: ${currentDisplayFormatted.formatted}`}
            >
              {currentDisplayFormatted.formatted}
            </div>
            <div className="text-[17px] text-right text-gray-300 min-h-[1em]">
              English: <span className="text-yellow-300 leading-tight">{currentDisplayFormatted.englishWords || <span className="italic text-slate-400">...</span>}</span>
            </div>
            <div className="text-[17px] text-right text-gray-300 min-h-[1em]">
              {currentDisplayFormatted.secondaryLanguageName}: <span className="text-green-400 leading-tight">{currentDisplayFormatted.secondaryLanguageWords || <span className="italic text-slate-400">...</span>}</span>
            </div>
            {currentDisplayFormatted.secondaryError &&
              <div className="text-xs text-red-400 mt-1 text-right">Error: {currentDisplayFormatted.secondaryError}</div>
            }
          </div>
        </div>
        
        <div className="flex-shrink-0"> 
          <div className="grid grid-cols-4 gap-2 mb-3">
             <button onClick={clearAll} className={`${specialButtonClass('bg-red-600 hover:bg-red-500 focus:ring-red-400')} col-span-2 w-full`}>AC</button>
            <button onClick={deleteLast} className={`${specialButtonClass('bg-amber-600 hover:bg-amber-500 focus:ring-amber-400')}`}>DEL</button>
            <button onClick={() => handleOperation('+')} className={opButtonClass} aria-label="Add">+</button>

            {['7', '8', '9'].map(num => <button key={num} onClick={() => inputNumber(num)} className={numButtonClass}>{num}</button>)}
            <button onClick={() => handleOperation('-')} className={opButtonClass} aria-label="Subtract">-</button>

            {['4', '5', '6'].map(num => <button key={num} onClick={() => inputNumber(num)} className={numButtonClass}>{num}</button>)}
            <button onClick={() => handleOperation('x')} className={opButtonClass} aria-label="Multiply">x</button>

            {['1', '2', '3'].map(num => <button key={num} onClick={() => inputNumber(num)} className={numButtonClass}>{num}</button>)}
            <button onClick={() => handleOperation('÷')} className={opButtonClass} aria-label="Divide">÷</button>

            <button onClick={() => inputNumber('0')} className={numButtonClass}>0</button>
            <button onClick={inputTripleZero} className={numButtonClass}>,000</button>
            <button onClick={inputDecimal} className={numButtonClass}>.</button>
            <button onClick={handleEquals} className={`${specialButtonClass('bg-green-600 hover:bg-green-500 focus:ring-green-400')} text-3xl`}>=</button>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-2 relative">
            <button onClick={handlePercent} className={`${opButtonClass} w-full`} aria-label="Percent">%</button>
            <button
              ref={settingsButtonRef}
              onClick={() => setShowSettings(!showSettings)}
              className={`${specialButtonClass('bg-purple-600 hover:bg-purple-500 focus:ring-purple-400')} w-full`}
              aria-expanded={showSettings}
              aria-controls="settings-modal"
            >
              Settings
            </button>
            <button
              ref={multiplierButtonRef}
              onClick={() => setShowMultiplierMenu(!showMultiplierMenu)}
              className={`${specialButtonClass('bg-indigo-600 hover:bg-indigo-500 focus:ring-indigo-400')} w-full`}
              aria-expanded={showMultiplierMenu}
              aria-controls="multiplier-menu-panel"
              aria-haspopup="dialog"
              title="Compose large numbers by adding suffixes (e.g., Million, Billion)."
              aria-label="Open suffixes menu to compose large numbers"
            >
              Suffixes
            </button>
          </div>
          
          <div className="grid grid-cols-3 gap-2 mb-4 relative">
            <button disabled className={`${specialButtonClass('bg-slate-700 cursor-not-allowed')} w-full flex items-center justify-center gap-1.5`}>
              <Calculator size={16} /> Standard
            </button>
            <button onClick={() => onNavigate('financial')} className={`${specialButtonClass('bg-teal-600 hover:bg-teal-500 focus:ring-teal-400')} w-full flex items-center justify-center gap-1.5`}>
              <Landmark size={16} /> Financial
            </button>
            <button onClick={() => onNavigate('notes')} className={`${specialButtonClass('bg-cyan-600 hover:bg-cyan-500 focus:ring-cyan-400')} w-full flex items-center justify-center gap-1.5`}>
              <NotebookText size={16} /> Notes
            </button>
          </div>

        </div>

        {showMultiplierMenu && (
          <div
            id="multiplier-menu-panel" 
            className="fixed inset-0 z-30 flex items-center justify-center p-4 bg-black bg-opacity-75 animate-fadeIn"
            role="dialog"
            aria-modal="true"
            aria-labelledby="multiplier-menu-title"
            onClick={() => setShowMultiplierMenu(false)} // Click on backdrop closes
          >
            <div
              ref={multiplierMenuRef} 
              className="bg-slate-700 p-4 sm:p-6 rounded-xl shadow-2xl w-full max-w-xs sm:max-w-sm max-h-[70vh] sm:max-h-[60vh] overflow-y-auto custom-scrollbar-tape border border-slate-600"
              onClick={(e) => e.stopPropagation()} 
            >
              <div className="flex justify-between items-center mb-4">
                <h4 id="multiplier-menu-title" className="text-lg sm:text-xl font-semibold text-indigo-300">Apply Suffix</h4>
                <button
                  onClick={() => setShowMultiplierMenu(false)}
                  className="text-slate-400 hover:text-slate-200 p-1 -mr-1 -mt-1 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  aria-label="Close suffixes menu"
                >
                  <X size={24} />
                </button>
              </div>
              <p className="text-sm text-slate-300 mb-4 -mt-2">
                Quickly build large numbers. Enter a value (e.g., 50), then select 'Million' to add 50,000,000 to your total. Continue adding terms to compose your final number.
              </p>
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
                              onClick={() => handleMultiplierSelect(suffix.value, suffix.name)}
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
        )}

        <div className="space-y-4 flex-shrink-0"> 
            <div 
              id="history-panel-content" 
              className="bg-slate-700 p-4 rounded-lg shadow-md mt-2 animate-fadeIn"
            >
                <div className="flex justify-between items-center mb-3">
                    <h3 className="text-xl font-semibold text-amber-300">Calculation History ({history.length})</h3>
                    {history.length > 0 &&
                      <button
                        onClick={() => { triggerHapticFeedback(); setHistory([]); }}
                        className="px-3 py-1.5 bg-red-700 hover:bg-red-600 text-white text-xs rounded-md flex items-center"
                        aria-label="Clear all history entries"
                      >
                        <Trash2 size={14} className="mr-1.5"/> Clear History
                      </button>
                    }
                </div>
                {history.length === 0 ? (
                  <p className="text-slate-400 italic">No history yet.</p>
                ) : (
                  <>
                    <ul className="list-none p-0 m-0 space-y-3">
                        {history.map(entry => (
                            <li key={entry.id} className="p-3 bg-slate-600 rounded-md text-sm">
                                <div className="font-mono text-gray-200 whitespace-pre-wrap break-all text-[15px]">
                                  {entry.expression.split('\n').map((line, i) => <div key={i}>{line}</div>)}
                                </div>
                                <div className="flex items-start mt-1"> 
                                  <div className="min-w-0 flex-1">
                                    <span className="font-bold text-amber-300 text-[17px] break-all">Result: {entry.result}</span>
                                  </div>
                                  <button
                                    onClick={() => { triggerHapticFeedback(); useHistoryResult(entry); }}
                                    className="ml-2 flex-shrink-0 px-2 py-1 text-[14px] bg-sky-600 hover:bg-sky-500 rounded"
                                    aria-label={`Use result from history entry: ${entry.result}`}
                                  >
                                    Use Result
                                  </button>
                                </div>
                                <div className="text-[14px] text-slate-300 mt-1">
                                  English: <span className="text-yellow-300 leading-tight">{entry.resultEnglishWords || <span className="italic text-slate-400">...</span>}</span>
                                </div>
                                {(entry.secondaryLanguageNameAtTimeOfHistory && entry.secondaryLanguageNameAtTimeOfHistory.trim() !== "N/A" && entry.secondaryLanguageNameAtTimeOfHistory.trim() !== "") && (
                                  <div className="text-[14px] text-slate-300 mt-1">
                                    {entry.secondaryLanguageNameAtTimeOfHistory}: <span className="text-green-400 leading-tight">{entry.resultSecondaryLanguageWords || <span className="italic text-slate-400">...</span>}</span>
                                  </div>
                                )}
                                <div className="text-xs text-slate-400 mt-1">{entry.timestamp}</div>
                                <div className="mt-2 flex justify-end space-x-2">
                                  <button
                                    id={`copy-history-${entry.id}`}
                                    onClick={() => handleCopyHistoryEntry(entry)}
                                    className="px-2 py-1 text-[14px] bg-sky-700 hover:bg-sky-600 text-white rounded flex items-center transition-colors duration-150"
                                    aria-label={`Copy history entry to clipboard: ${entry.expression.split('\n')[0]}`}
                                  >
                                    <ClipboardCopy size={12} className="mr-1" />
                                    <span>Copy to clipboard</span>
                                  </button>
                                  <button
                                    onClick={() => deleteHistoryEntry(entry.id)}
                                    className="px-2 py-1 text-[14px] bg-red-600 hover:bg-red-500 text-white rounded flex items-center"
                                    aria-label={`Delete history entry: ${entry.expression.split('\n')[0]}`}
                                  >
                                    <Trash2 size={12} className="mr-1" /> Delete
                                  </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                  </>
                )}
            </div>
        </div>
      </div>
      
      {showCompendium && <CompendiumModal onClose={() => setShowCompendium(false)} />}
      
      {showIdLockReminderModal && (
        <IdLockReminderModal 
            onConfirm={() => {
                setShowIdLockReminderModal(false);
                setShowMemberIdModal(true);
            }}
            onCancel={() => setShowIdLockReminderModal(false)}
        />
      )}
      
      {showFinalEditReminderModal && (
        <FinalEditReminderModal
            onConfirm={() => {
                setShowFinalEditReminderModal(false);
                setShowMemberIdModal(true);
            }}
            onCancel={() => setShowFinalEditReminderModal(false)}
        />
      )}

      {showMemberIdModal && memberIdData && (
        <MemberIdModal 
            data={memberIdData}
            onSave={handleSaveMemberId}
            onClose={() => setShowMemberIdModal(false)}
        />
      )}

      {/* Modals Section */}
      {showSettings && (
        <div
          id="settings-modal"
          className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black bg-opacity-75 animate-fadeIn"
          role="dialog"
          aria-modal="true"
          aria-labelledby="settings-modal-title"
          onClick={() => setShowSettings(false)}
        >
          <div
            ref={settingsPanelRef}
            className="bg-slate-700 p-6 rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto custom-scrollbar-tape border border-slate-600"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6 sticky top-0 bg-slate-700 pt-1 pb-3 z-10 px-6 -mx-6 border-b border-slate-600">
              <h3 id="settings-modal-title" className="text-3xl font-semibold text-sky-300 flex items-center">
                <Settings size={22} className="mr-2 text-sky-400" /> Settings
              </h3>
              <button
                onClick={() => setShowSettings(false)}
                className="text-slate-400 hover:text-slate-200 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-sky-400"
                aria-label="Close settings"
              >
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div className="mb-4">
                <label htmlFor="secondaryLanguage" className="block text-2xl font-medium text-gray-300">Secondary Language:</label>
                <select
                  id="secondaryLanguage"
                  value={selectedSecondaryLanguage}
                  onChange={(e) => setSelectedSecondaryLanguage(e.target.value as LanguageCode)}
                  className="w-full p-2.5 bg-slate-600 border border-slate-500 text-white rounded-md focus:ring-sky-500 focus:border-sky-500 text-sm"
                >
                  {AVAILABLE_LANGUAGES.map(lang => (
                    <option key={lang.code} value={lang.code}>{lang.name}</option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <span className="block mb-1 text-2xl font-medium text-gray-300">Haptic Feedback</span>
                <button
                  onClick={() => setHapticFeedbackEnabled(!hapticFeedbackEnabled)}
                  className={`w-full px-4 py-2.5 border border-slate-500 text-white rounded-md focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-700 text-sm transition-colors ${
                    hapticFeedbackEnabled
                      ? 'bg-green-600 hover:bg-green-500 focus:ring-green-400'
                      : 'bg-slate-500 hover:bg-slate-400 focus:ring-slate-300'
                  }`}
                >
                  {hapticFeedbackEnabled ? 'ON' : 'OFF'}
                </button>
              </div>
              
              <div className="mb-4">
                <span className="block mb-1 text-2xl font-medium text-gray-300">Member ID</span>
                 <button
                    onClick={() => {
                        triggerHapticFeedback();
                        if (memberIdData && !memberIdData.isSetupComplete) {
                            setShowIdLockReminderModal(true);
                        } else if (memberIdData && memberIdData.isSetupComplete && memberIdData.editCount < 2) {
                            setShowFinalEditReminderModal(true);
                        } else {
                            setShowMemberIdModal(true);
                        }
                    }}
                    className="w-full px-4 py-2.5 border border-slate-500 bg-yellow-600 hover:bg-yellow-500 text-white rounded-md focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-slate-700 flex items-center justify-center text-sm transition-colors"
                  >
                    <Award size={16} className="mr-1.5" /> DZA Group Member ID
                  </button>
              </div>

              <div className="mb-4">
                <span className="block mb-1 text-2xl font-medium text-gray-300">Reference & Info</span>
                <div className="space-y-2">
                  <button
                    onClick={() => { setShowUniquenessModal(true); triggerHapticFeedback();}}
                    className="w-full px-4 py-2.5 border border-slate-500 bg-teal-600 hover:bg-teal-500 text-white rounded-md focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 focus:ring-offset-slate-700 flex items-center justify-center text-sm transition-colors"
                    aria-expanded={showUniquenessModal}
                    aria-controls="uniqueness-modal"
                  >
                    <Info size={16} className="mr-1.5" /> About This Calculator
                  </button>
                  <button
                      onClick={() => {setShowPowersOfTenModal(true); triggerHapticFeedback();}}
                      className="w-full px-4 py-2.5 border border-slate-500 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-slate-700 flex items-center justify-center text-sm transition-colors"
                      aria-expanded={showPowersOfTenModal}
                      aria-controls="powers-of-ten-modal"
                    >
                      <BookOpen size={16} className="mr-1.5"/> Powers&nbsp;of&nbsp;10
                  </button>
                  <button
                    onClick={() => { setShowUserManualModal(true); triggerHapticFeedback();}}
                    className="w-full px-4 py-2.5 border border-slate-500 bg-cyan-600 hover:bg-cyan-500 text-white rounded-md focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-700 flex items-center justify-center text-sm transition-colors"
                    aria-expanded={showUserManualModal}
                    aria-controls="user-manual-modal"
                  >
                    <BookText size={16} className="mr-1.5" /> User Manual
                  </button>
                  <button
                    onClick={() => { setShowDisclaimerModal(true); triggerHapticFeedback();}}
                    className="w-full px-4 py-2.5 border border-slate-500 bg-rose-600 hover:bg-rose-500 text-white rounded-md focus:ring-2 focus:ring-rose-400 focus:ring-offset-2 focus:ring-offset-slate-700 flex items-center justify-center text-sm transition-colors"
                    aria-expanded={showDisclaimerModal}
                    aria-controls="disclaimer-modal"
                  >
                    <ShieldAlert size={16} className="mr-1.5" /> Disclaimer
                  </button>
                   <button
                    onClick={() => { setShowPrivacyPolicyModal(true); triggerHapticFeedback();}}
                    className="w-full px-4 py-2.5 border border-slate-500 bg-lime-600 hover:bg-lime-500 text-white rounded-md focus:ring-2 focus:ring-lime-400 focus:ring-offset-2 focus:ring-offset-slate-700 flex items-center justify-center text-sm transition-colors"
                    aria-expanded={showPrivacyPolicyModal}
                    aria-controls="privacy-policy-modal"
                  >
                    <FileLock2 size={16} className="mr-1.5" /> Privacy Policy
                  </button>
                </div>
              </div>
            </div>
            <div className="mt-8 pt-4 border-t border-slate-600 flex justify-between items-start text-xs text-slate-400">
              <div className="text-left">
                <p className="font-semibold text-slate-300 mb-1">Inspired by;</p>
                <p className="flex items-center gap-1.5">
                  <Crown size={14} className="text-yellow-400" />
                  <span>Dato' Mohd. Zahari BinA Wang</span>
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-slate-300 mb-1">Engineered by;</p>
                <p className="flex items-center gap-1.5 justify-end">
                  <Calculator size={14} className="text-sky-400" />
                  <span>Thomson Lew</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      {showPowersOfTenModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75 animate-fadeIn"
          onClick={() => setShowPowersOfTenModal(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="powers-of-ten-modal-title"
        >
          <div
            ref={powersOfTenModalRef}
            className="bg-slate-700 p-6 rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto custom-scrollbar-tape border border-slate-600"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4 sticky top-0 bg-slate-700 pt-1 pb-3 z-10 px-6 -mx-6 border-b border-slate-600">
              <h3 id="powers-of-ten-modal-title" className="text-2xl font-semibold text-indigo-300 flex items-center">
                <BookOpen size={22} className="mr-2 text-indigo-400" /> Powers of Ten Reference
              </h3>
              <button
                onClick={() => setShowPowersOfTenModal(false)}
                className="text-slate-400 hover:text-slate-200"
                aria-label="Close powers of ten modal"
              >
                <X size={24} />
              </button>
            </div>
            <ul className="list-none p-0 m-0 text-sm">
              {powersOfTenData.map(p => (
                <li key={p.name} className="py-1.5 border-b border-slate-500 last:border-b-0">
                  <span dangerouslySetInnerHTML={{__html: p.power}} className="font-mono text-sky-300"></span>: <span className="text-gray-200">{p.name}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      
      {showUniquenessModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75 animate-fadeIn"
          onClick={() => setShowUniquenessModal(false)} 
          role="dialog"
          aria-modal="true"
          aria-labelledby="uniqueness-modal-title"
        >
          <div
            ref={uniquenessModalRef}
            className="bg-slate-700 p-6 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto custom-scrollbar-tape border border-slate-600"
            onClick={(e) => e.stopPropagation()} 
          >
            <div className="flex justify-between items-center mb-4 sticky top-0 bg-slate-700 pt-1 pb-3 z-10 px-6 -mx-6 border-b border-slate-600">
              <h3 id="uniqueness-modal-title" className="text-2xl font-semibold text-teal-300 flex items-center">
                <Info size={22} className="mr-2 text-teal-400" /> About This Calculator
              </h3>
              <button
                onClick={() => setShowUniquenessModal(false)}
                className="text-slate-400 hover:text-slate-200"
                aria-label="Close about this calculator modal"
              >
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4 text-sm text-slate-200 leading-relaxed">
              <p>The SADAPA'A Calculator is a specialized tool engineered primarily for the members and operations of the DZA Group. It transcends standard calculation by integrating features that directly support the Group's vision of global economic transformation and its humanitarian objectives. This makes it fundamentally different from any other calculator available.</p>
              <ul className="list-none space-y-3 pl-1">
                <li className="flex items-start">
                  <span className="text-teal-400 mr-2 mt-0.5 text-lg">⭐</span>
                  <div>
                    <strong className="text-teal-300">Purpose-Built for the DZA Group:</strong> A key feature is the integrated <strong>Member ID setup</strong>, designed for organizational recognition and to foster a unified identity within the DZA ecosystem. The calculator's features are tailored to align with the Group's core mission, as outlined in the DZA Q&A Compendium.
                  </div>
                </li>
                 <li className="flex items-start">
                  <span className="text-teal-400 mr-2 mt-0.5 text-lg">💹</span>
                  <div>
                    <strong className="text-teal-300">Comprehensive Financial Suite:</strong> Seamlessly switch to a powerful Financial module containing a suite of specialized calculators for Loan Analysis, Compound Interest, ROI, Retirement Savings, Break-Even Points, Margin/Markup, and more. This module is designed to empower members in making informed decisions aligned with the Group's financial principles.
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-teal-400 mr-2 mt-0.5 text-lg">🚀</span>
                  <div>
                    <strong className="text-teal-300">Engineered for Macroeconomics:</strong> Go beyond basic input. Our unique <strong>`,000` button</strong> and the <strong>Suffixes Menu</strong> allow you to compose massive figures (Trillions, Quadrillions, and beyond) with unprecedented speed. This is essential for handling the large-scale numbers involved in DZA's 'Iron Corridor Economy', FDI, and humanitarian grant calculations.
                  </div>
                </li>
                 <li className="flex items-start">
                  <span className="text-teal-400 mr-2 mt-0.5 text-lg">🌐</span>
                  <div>
                    <strong className="text-teal-300">Global Communication Powerhouse:</strong> Instantly see numbers converted to words in English <strong>AND</strong> your chosen secondary language. This is invaluable for DZA Group's international dealings, ensuring clarity and accuracy when filling out critical documents like bank cheques, legal forms, and financial agreements across diverse linguistic regions.
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-teal-400 mr-2 mt-0.5 text-lg">📋</span>
                  <div>
                    <strong className="text-teal-300">Smarter, Actionable History:</strong> Don't just view past calculations. <strong>Instantly reuse any history result</strong> by tapping "Use Result". This dynamically incorporates the chosen value into your current calculation. You can also <strong>copy detailed summaries</strong> (expression, result, and multi-language word conversions) to your clipboard, perfectly formatted for notes, messages, or records.
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-teal-400 mr-2 mt-0.5 text-lg">🔒</span>
                  <div>
                    <strong className="text-teal-300">Secure & Offline by Design:</strong> All your calculations, history, Member ID data, and even your <strong>integrated photo notes</strong> are stored securely and <strong>locally on your device</strong>. The application is fully functional offline, ensuring your sensitive financial and personal information remains private, secure, and accessible anytime, anywhere.
                  </div>
                </li>
                 <li className="flex items-start">
                  <span className="text-teal-400 mr-2 mt-0.5 text-lg">📖</span>
                  <div>
                    <strong className="text-teal-300">Intuitive & Educational:</strong> With a clean live calculation tape, an integrated <strong>Powers of Ten reference table</strong>, and a user-friendly interface, this calculator helps you not only calculate but also understand numbers better.
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      
      {showUserManualModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75 animate-fadeIn"
          onClick={() => setShowUserManualModal(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="user-manual-modal-title"
        >
          <div
            ref={userManualModalRef}
            className="bg-slate-700 p-6 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar-tape border border-slate-600"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6 sticky top-0 bg-slate-700 pt-1 pb-3 z-10 px-6 -mx-6 border-b border-slate-600">
              <h2 id="user-manual-modal-title" className="text-2xl font-semibold text-cyan-300 flex items-center">
                <BookText size={28} className="mr-3 text-cyan-400" /> SADAPA'A Calculator - User Manual
              </h2>
              <button
                onClick={() => setShowUserManualModal(false)}
                className="text-slate-400 hover:text-slate-200"
                aria-label="Close user manual"
              >
                <X size={28} />
              </button>
            </div>
            <div className="space-y-4 text-sm text-slate-200 leading-relaxed">
              <p className="mb-6">Welcome to the SADAPA'A Calculator! This guide will help you get the most out of its powerful features.</p>

              {userManualSections.map((section, index) => {
                const scheme = manualColorSchemes[index % manualColorSchemes.length];
                return (
                    <section key={index} className={`p-4 rounded-lg border ${scheme.bg} ${scheme.border} ${scheme.hoverBg} transition-colors duration-300`}>
                        <h3 className={`text-xl font-semibold mb-3 ${scheme.title}`}>{section.title}</h3>
                        <div className="text-slate-300 space-y-2 prose prose-sm max-w-none prose-strong:text-white prose-li:marker:text-slate-400 prose-code:text-cyan-300 prose-code:bg-slate-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded">
                            {section.content}
                        </div>
                    </section>
                );
              })}

              <p className="text-center font-semibold mt-8 pt-4 border-t border-slate-600">We hope you enjoy using the SADAPA'A Calculator!</p>
            </div>
          </div>
        </div>
      )}

      
      {showDisclaimerModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75 animate-fadeIn"
          onClick={() => setShowDisclaimerModal(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="disclaimer-modal-title"
        >
          <div
            ref={disclaimerModalRef}
            className="bg-slate-700 p-6 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar-tape border border-slate-600"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6 sticky top-0 bg-slate-700 pt-1 pb-3 z-10 px-6 -mx-6 border-b border-slate-600">
              <h2 id="disclaimer-modal-title" className="text-2xl font-semibold text-rose-300 flex items-center">
                <ShieldAlert size={28} className="mr-3 text-rose-400" /> Disclaimer & Terms of Use
              </h2>
              <button
                onClick={() => setShowDisclaimerModal(false)}
                className="text-slate-400 hover:text-slate-200"
                aria-label="Close disclaimer"
              >
                <X size={28} />
              </button>
            </div>
            <div className="space-y-5 text-sm text-slate-200 leading-relaxed">
              <p>Please read this disclaimer and terms of use carefully before using the SADAPA'A Calculator application ("Application"). Your acquisition (whether by purchase or otherwise) and use of this Application signify your unconditional acceptance of the terms outlined below.</p>

              <section>
                <h3 className="text-xl font-semibold text-yellow-400 mb-2">1. Public Notice Regarding Intended Use</h3>
                <p>This Application is designed and intended primarily for the internal use of members, affiliates, and stakeholders of the DZA Group. It contains features and informational content, such as the DZA Q&A Compendium, that are specific to the Group's operations and mission.</p>
                <p className="mt-2">While this Application is made available on public platforms for the convenience of our members, its use by the general public is not encouraged. Any information pertaining to the DZA Group contained herein is for internal reference only. Non-members of the DZA Group shall not construe this information as a public statement, offering, or solicitation of any kind. Furthermore, non-members shall not use this information in any manner, adversarial or otherwise, against the DZA Group, its affiliates, or its members. Use of this application by non-members is at their own discretion and risk, and they should disregard any DZA-specific content.</p>
                <p className="mt-2">
                  <strong>For Public Users:</strong> If you are interested solely in the advanced calculation features (such as large number computation and financial tools) without the DZA-specific content, we recommend purchasing the "Big Number Pro" application, available from the same author on mobile application stores.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-rose-400 mb-2">2. Accuracy of Information</h3>
                <p>The SADAPA'A Calculator is provided for informational and convenience purposes. While we strive to ensure the accuracy of the calculations and data, we make no warranties or guarantees regarding their completeness, reliability, or suitability for any particular purpose. Users are advised to verify any critical information with independent sources before relying on it.</p>
              </section>
              
              <section>
                <h3 className="text-xl font-semibold text-rose-400 mb-2">3. User Data, Privacy, and Content</h3>
                 <ul className="list-disc list-outside space-y-1 pl-5 mt-2">
                    <li><strong>Local Storage Only:</strong> All your data, including calculation history, settings, and any content created within the Photo Notes feature, is stored exclusively on your local device.</li>
                    <li><strong>No Data Transmission:</strong> This Application does not collect, store, or transmit any of your personal data or usage analytics to us or any third parties. Your information remains private to you.</li>
                    <li><strong>User Responsibility:</strong> You are solely responsible for the content you create and store using the Photo Notes feature. Please ensure you have the necessary rights to any images you use.</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-rose-400 mb-2">4. No Liability</h3>
                <p>In no event shall the developers, distributors, or the DZA Group be liable for any direct, indirect, incidental, special, or consequential damages arising out of the use or inability to use this Application. You assume full responsibility and risk for your use of the Application.</p>
              </section>
              
              <section>
                <h3 className="text-xl font-semibold text-rose-400 mb-2">5. Reservation of Rights and Changes</h3>
                <p>We reserve the absolute right to modify, amend, or add any information within this Application, including its features and this disclaimer, at any time and without prior notice. Your continued use of the Application after any such changes constitutes your acceptance of the new terms.</p>
              </section>

              <p className="mt-4 font-bold text-center">By acquiring and using the SADAPA'A Calculator, you acknowledge that you have read, understood, and agree to be bound by these terms and conditions.</p>
            </div>
          </div>
        </div>
      )}

      
      {showPrivacyPolicyModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75 animate-fadeIn"
          onClick={() => setShowPrivacyPolicyModal(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="privacy-policy-modal-title"
        >
          <div
            ref={privacyPolicyModalRef}
            className="bg-slate-700 p-6 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar-tape border border-slate-600"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6 sticky top-0 bg-slate-700 pt-1 pb-3 z-10 px-6 -mx-6 border-b border-slate-600">
              <h2 id="privacy-policy-modal-title" className="text-2xl font-semibold text-lime-300 flex items-center">
                <FileLock2 size={28} className="mr-3 text-lime-400" /> Privacy Policy
              </h2>
              <button
                onClick={() => setShowPrivacyPolicyModal(false)}
                className="text-slate-400 hover:text-slate-200"
                aria-label="Close privacy policy"
              >
                <X size={28} />
              </button>
            </div>
            <div className="space-y-5 text-sm text-slate-200 leading-relaxed">
                <p><strong>Last Updated:</strong> July 26, 2024</p>
                <p>Welcome to the SADAPA'A Calculator ("Application", "we", "us", "our"). We are committed to protecting your privacy. This Privacy Policy explains how we handle information within our Application.</p>

              <section>
                <h3 className="text-xl font-semibold text-lime-400 mb-2">1. Information We Do Not Collect or Transmit</h3>
                <p>The SADAPA'A Calculator is designed with your privacy as a priority. We <strong>do not</strong> collect, store on external servers, share, or transmit any personally identifiable information or sensitive personal data from you.</p>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-lime-400 mb-2">2. Information Stored Locally on Your Device</h3>
                <p>To provide a seamless and personalized experience, the Application stores certain data <strong>only on your local device</strong> using your browser's built-in storage capabilities (LocalStorage for settings, IndexedDB for notes). This data is not sent to us or any third parties. This locally stored data includes:</p>
                 <ul className="list-disc list-outside space-y-1 pl-5 mt-2">
                    <li><strong>Calculation History:</strong> A log of your past calculations, including expressions, results, and their word representations.</li>
                    <li><strong>User Settings:</strong> Your preferences, such as the selected secondary language and haptic feedback settings.</li>
                    <li><strong>Photo Notes:</strong> Images and accompanying text that you choose to save within the application. This data is stored in your device's local IndexedDB database for your retrieval and management.</li>
                </ul>
                <p className="mt-2">This information remains on your device and is under your control. You can clear your calculation history and delete individual notes within the Application at any time. Uninstalling the Application or clearing your browser's site data will permanently remove all locally stored information.</p>
              </section>
              
              <section>
                <h3 className="text-xl font-semibold text-lime-400 mb-2">3. How Locally Stored Information is Used</h3>
                <p>The information stored on your device is used solely to:</p>
                 <ul className="list-disc list-outside space-y-1 pl-5 mt-2">
                    <li>Provide you with access to your past calculations and saved photo notes.</li>
                    <li>Allow you to reuse results from your history in new calculations.</li>
                    <li>Remember your preferred settings for subsequent uses of the Application.</li>
                    <li>Enable the core functionality of the calculator and the integrated notes feature.</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-lime-400 mb-2">4. Security of Local Data</h3>
                <p>We take reasonable measures to help protect the information stored locally on your device within the Application's context. However, the security of this data also depends on the overall security of your device and the measures you take to protect it.</p>
              </section>
              
              <section>
                <h3 className="text-xl font-semibold text-lime-400 mb-2">5. Children's Privacy</h3>
                <p>The Application is not intended for use by children under the age of 13. We do not knowingly collect any personal information.</p>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-lime-400 mb-2">6. Changes to This Privacy Policy</h3>
                <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy within the Application.</p>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-lime-400 mb-2">7. Contact Us</h3>
                <p>If you have any questions about this Privacy Policy, please refer to the contact information provided on the application store listing page where you obtained this Application.</p>
              </section>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};