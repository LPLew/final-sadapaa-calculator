

import React, { useState, useMemo, useEffect } from 'react';
import { Percent, DollarSign, PackagePlus, RefreshCw, ListPlus } from 'lucide-react';
import { useFinancialTranslations } from '../contexts/FinancialTranslationContext';
import { NumberToWordsDisplay, SuffixesMenu } from '../contexts/FinancialTranslationContext';
import { useFinancialHistory } from '../contexts/FinancialHistoryContext';
import { FinancialHistoryView } from './FinancialHistoryView';


const ROICalculator: React.FC = () => {
    const { t, numberToWords } = useFinancialTranslations();
    const { addHistoryEntry, entryToReuse, consumeEntryToReuse } = useFinancialHistory();
    const [initialInvestment, setInitialInvestment] = useState('');
    const [finalValue, setFinalValue] = useState('');
    const [showSuffixesMenu, setShowSuffixesMenu] = useState(false);
    type SuffixTarget = 'initial' | 'final';
    const [suffixTarget, setSuffixTarget] = useState<SuffixTarget | null>(null);
    
    useEffect(() => {
        if (entryToReuse && entryToReuse.calculatorType === 'roi') {
            setInitialInvestment(entryToReuse.rawInputs.initialInvestment || '');
            setFinalValue(entryToReuse.rawInputs.finalValue || '');
            consumeEntryToReuse();
        }
    }, [entryToReuse, consumeEntryToReuse]);
    
    const handleInputChange = (setter: (value: string) => void, value: string) => {
        const valueWithoutCommas = value.replace(/,/g, '');
    
        if (/^-?\d*\.?\d*$/.test(valueWithoutCommas) || valueWithoutCommas === '' || valueWithoutCommas === '-') {
            const [integer, decimal] = valueWithoutCommas.split('.');
            const formattedInteger = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            const formattedValue = decimal !== undefined ? `${formattedInteger}.${decimal}` : formattedInteger;
            setter(formattedValue);
        }
    };
    
    const { roi, netProfit, error } = useMemo(() => {
        const initial = parseFloat(initialInvestment.replace(/,/g, ''));
        const final = parseFloat(finalValue.replace(/,/g, ''));

        if (isNaN(initial) || isNaN(final)) {
            return { roi: null, netProfit: null, error: null };
        }
        
        if (initial === 0) {
            return { roi: null, netProfit: null, error: t('roi_error_initial_zero') };
        }

        const profit = final - initial;
        const calculatedRoi = (profit / initial) * 100;
        
        return { roi: calculatedRoi, netProfit: profit, error: null };

    }, [initialInvestment, finalValue, t]);
    
    const handleSuffixClick = (target: SuffixTarget) => {
        setSuffixTarget(target);
        setShowSuffixesMenu(true);
    };

    const handleMultiplierSelect = (multiplier: number) => {
        if (!suffixTarget) return;
        const setter = suffixTarget === 'initial' ? setInitialInvestment : setFinalValue;
        const value = suffixTarget === 'initial' ? initialInvestment : finalValue;
        const currentValue = parseFloat(String(value).replace(/,/g, '')) || 1;
        handleInputChange(setter, String(currentValue * multiplier));
        setShowSuffixesMenu(false);
    };

    const formatCurrency = (num: number | null) => {
        if (num === null) return '$ ...';
        return num.toLocaleString(undefined, { style: 'currency', currency: 'USD' });
    };

    const formatPercent = (num: number | null) => {
        if (num === null) return '... %';
        return `${num.toFixed(2)}%`;
    };
    
    const handleSaveHistory = () => {
        if (error || roi === null || netProfit === null) return;
        addHistoryEntry({
            calculatorType: 'roi',
            calculatorNameKey: 'roi_title',
            rawInputs: { initialInvestment, finalValue },
            displayInputs: [
                { labelKey: 'roi_initial_investment', value: formatCurrency(parseFloat(initialInvestment.replace(/,/g, ''))) },
                { labelKey: 'roi_final_value', value: formatCurrency(parseFloat(finalValue.replace(/,/g, ''))) }
            ],
            displayResults: [
                { labelKey: 'roi_net_profit', value: formatCurrency(netProfit), words: numberToWords(netProfit) },
                { labelKey: 'roi_return_on_investment', value: formatPercent(roi), words: numberToWords(roi), isPrimary: true },
            ]
        });
    };
    
    const isSavable = !error && roi !== null;

    return (
        <>
            <div className="text-center mb-6">
                <Percent className="mx-auto text-green-400 mb-2" size={40} />
                <h1 className="text-2xl font-bold text-white">{t('roi_title')}</h1>
                <p className="text-base text-slate-400">{t('roi_subtitle')}</p>
            </div>

            <div className="bg-slate-800 p-4 rounded-lg shadow-lg space-y-6">
                <div>
                    <label htmlFor="initial-investment" className="block text-base font-medium text-slate-300 mb-1">{t('roi_initial_investment')}</label>
                    <div className="flex items-center gap-2">
                        <div className="relative grow">
                            <DollarSign size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                id="initial-investment"
                                type="text"
                                inputMode="decimal"
                                value={initialInvestment}
                                onChange={(e) => handleInputChange(setInitialInvestment, e.target.value)}
                                placeholder={`${t('common_eg')} 10,000`}
                                className="w-full h-14 px-4 pl-10 bg-slate-700 border-2 border-slate-600 rounded-md focus:ring-sky-500 focus:border-sky-500 transition-colors text-lg font-mono text-right text-white"
                            />
                        </div>
                        <button onClick={() => handleSuffixClick('initial')} className="h-14 w-14 flex-shrink-0 bg-indigo-600 hover:bg-indigo-500 rounded-md flex items-center justify-center" aria-label="Open suffixes menu for initial investment">
                           <PackagePlus size={20}/>
                        </button>
                    </div>
                    <NumberToWordsDisplay value={initialInvestment} />
                </div>
                 <div>
                    <label htmlFor="final-value" className="block text-base font-medium text-slate-300 mb-1">{t('roi_final_value')}</label>
                     <div className="flex items-center gap-2">
                        <div className="relative grow">
                            <DollarSign size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                id="final-value"
                                type="text"
                                inputMode="decimal"
                                value={finalValue}
                                onChange={(e) => handleInputChange(setFinalValue, e.target.value)}
                                placeholder={`${t('common_eg')} 12,500`}
                                className="w-full h-14 px-4 pl-10 bg-slate-700 border-2 border-slate-600 rounded-md focus:ring-sky-500 focus:border-sky-500 transition-colors text-lg font-mono text-right text-white"
                            />
                        </div>
                        <button onClick={() => handleSuffixClick('final')} className="h-14 w-14 flex-shrink-0 bg-indigo-600 hover:bg-indigo-500 rounded-md flex items-center justify-center" aria-label="Open suffixes menu for final value">
                           <PackagePlus size={20}/>
                        </button>
                    </div>
                    <NumberToWordsDisplay value={finalValue} />
                </div>
            </div>

            <div className="mt-6 bg-slate-800 p-4 rounded-lg shadow-lg">
                <h3 className="text-lg font-semibold text-center text-sky-300 mb-4">{t('common_results')}</h3>
                <div className="space-y-3">
                    <div className="bg-slate-700 p-3 rounded-md">
                        <div className="flex justify-between items-start gap-4">
                            <span className="text-base font-semibold text-slate-300 pt-1 flex-shrink-0">{t('roi_net_profit')}</span>
                            <span className={`font-mono text-xl break-all text-right ${netProfit === null ? 'text-white' : netProfit >= 0 ? 'text-green-300' : 'text-red-400'}`}>{formatCurrency(netProfit)}</span>
                        </div>
                        <NumberToWordsDisplay value={netProfit}/>
                    </div>
                     <div className="flex justify-between items-center bg-slate-900/50 p-3 rounded-md">
                        <span className="font-semibold text-slate-200">{t('roi_return_on_investment')}</span>
                        <span className={`font-mono text-2xl font-bold ${roi === null ? 'text-white' : roi >= 0 ? 'text-green-400' : 'text-red-400'}`}>{formatPercent(roi)}</span>
                    </div>
                </div>
                {error && <p className="text-red-400 text-center mt-4">{error}</p>}
            </div>
             <div className="mt-6 grid grid-cols-2 gap-4">
                 <button
                    onClick={() => { setInitialInvestment(''); setFinalValue(''); }}
                    className="w-full h-14 text-lg font-bold bg-red-600 hover:bg-red-500 text-white rounded-md transition-colors flex items-center justify-center gap-2"
                >
                    <RefreshCw size={18}/> {t('common_clear_all')}
                </button>
                 <button
                    onClick={handleSaveHistory}
                    disabled={!isSavable}
                    className="w-full h-14 text-lg font-bold bg-green-600 hover:bg-green-500 text-white rounded-md transition-colors flex items-center justify-center gap-2 disabled:bg-slate-500 disabled:cursor-not-allowed"
                >
                    <ListPlus size={18}/> {t('history_save_button') || 'Save'}
                </button>
            </div>
            <div className="mt-8">
                <FinancialHistoryView />
            </div>
            <SuffixesMenu show={showSuffixesMenu} onClose={() => setShowSuffixesMenu(false)} onSelect={handleMultiplierSelect} />
        </>
    );
};

export default ROICalculator;