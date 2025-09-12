

import React, { useState, useMemo, useEffect } from 'react';
import { Gauge, DollarSign, Percent as PercentIcon, Calendar, RefreshCw, PackagePlus, ListPlus } from 'lucide-react';
import { useFinancialTranslations } from '../contexts/FinancialTranslationContext';
import { NumberToWordsDisplay, SuffixesMenu } from '../contexts/FinancialTranslationContext';
import { useFinancialHistory } from '../contexts/FinancialHistoryContext';
import { FinancialHistoryView } from './FinancialHistoryView';

const InflationCalculator: React.FC = () => {
    const { t, numberToWords } = useFinancialTranslations();
    const { addHistoryEntry, entryToReuse, consumeEntryToReuse } = useFinancialHistory();
    const [amount, setAmount] = useState('1000');
    const [inflationRate, setInflationRate] = useState('3');
    const [years, setYears] = useState('10');
    const [showSuffixesMenu, setShowSuffixesMenu] = useState(false);

    useEffect(() => {
        if (entryToReuse && entryToReuse.calculatorType === 'inflation') {
            setAmount(entryToReuse.rawInputs.amount || '1000');
            setInflationRate(entryToReuse.rawInputs.inflationRate || '3');
            setYears(entryToReuse.rawInputs.years || '10');
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

    const { futureValue, purchasingPower, error } = useMemo(() => {
        const pv = parseFloat(amount.replace(/,/g, ''));
        const i = parseFloat(inflationRate.replace(/,/g, '')) / 100;
        const n = parseFloat(years.replace(/,/g, ''));

        if (isNaN(pv) || isNaN(i) || isNaN(n) || n < 0) {
            return { futureValue: null, purchasingPower: null, error: null };
        }
        
        const fv = pv * Math.pow(1 + i, n);
        const pp = pv / Math.pow(1 + i, n);

        return { futureValue: fv, purchasingPower: pp, error: null };

    }, [amount, inflationRate, years]);

    const handleMultiplierSelect = (multiplier: number) => {
        const currentValue = parseFloat(String(amount).replace(/,/g, '')) || 1;
        handleInputChange(setAmount, String(currentValue * multiplier));
        setShowSuffixesMenu(false);
    };

    const formatCurrency = (num: number | null) => {
        if (num === null) return '$ ...';
        return num.toLocaleString(undefined, { style: 'currency', currency: 'USD' });
    };
    
    const clearAll = () => {
        setAmount('');
        setInflationRate('');
        setYears('');
    };

    const handleSaveHistory = () => {
        if (error || futureValue === null || purchasingPower === null) return;
        
        addHistoryEntry({
            calculatorType: 'inflation',
            calculatorNameKey: 'inflation_title',
            rawInputs: { amount, inflationRate, years },
            displayInputs: [
                { labelKey: 'inflation_amount', value: formatCurrency(parseFloat(amount.replace(/,/g, ''))) },
                { labelKey: 'inflation_rate', value: `${inflationRate}%` },
                { labelKey: 'inflation_years', value: years },
            ],
            displayResults: [
                { labelKey: 'inflation_future_value', labelReplacements: { years: years || 'X' }, value: formatCurrency(futureValue), words: numberToWords(futureValue), isPrimary: true },
                { labelKey: 'inflation_purchasing_power', labelReplacements: { years: years || 'X' }, value: formatCurrency(purchasingPower), words: numberToWords(purchasingPower) },
            ]
        });
    };
    
    const isSavable = !error && futureValue !== null;
    const currentAmountFormatted = useMemo(() => formatCurrency(parseFloat(amount.replace(/,/g, ''))), [amount]);

    return (
        <>
            <div className="text-center mb-6">
                <Gauge className="mx-auto text-purple-400 mb-2" size={40} />
                <h1 className="text-2xl font-bold text-white">{t('inflation_title')}</h1>
                <p className="text-base text-slate-400">{t('inflation_subtitle')}</p>
            </div>

            <div className="bg-slate-800 p-4 rounded-lg shadow-lg space-y-6">
                <div>
                    <label className="block text-base font-medium text-slate-300 mb-1">{t('inflation_amount')}</label>
                    <div className="flex items-center gap-2">
                        <div className="relative grow">
                            <DollarSign size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input type="text" inputMode="decimal" value={amount} onChange={(e) => handleInputChange(setAmount, e.target.value)} placeholder={`${t('common_eg')} 1,000`}
                                className="w-full h-14 px-4 pl-10 bg-slate-700 border-2 border-slate-600 rounded-md focus:ring-sky-500 focus:border-sky-500 text-lg font-mono text-right" />
                        </div>
                        <button onClick={() => setShowSuffixesMenu(true)} className="h-14 w-14 flex-shrink-0 bg-indigo-600 hover:bg-indigo-500 rounded-md flex items-center justify-center">
                            <PackagePlus size={20}/>
                        </button>
                    </div>
                     <NumberToWordsDisplay value={amount} />
                </div>
                 <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-base font-medium text-slate-300 mb-1">{t('inflation_rate')}</label>
                        <div className="relative">
                             <PercentIcon size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                             <input type="text" inputMode="decimal" value={inflationRate} onChange={(e) => handleInputChange(setInflationRate, e.target.value)} placeholder={`${t('common_eg')} 3`}
                                className="w-full h-14 px-4 pr-10 bg-slate-700 border-2 border-slate-600 rounded-md focus:ring-sky-500 focus:border-sky-500 text-lg font-mono text-right" />
                        </div>
                    </div>
                     <div>
                        <label className="block text-base font-medium text-slate-300 mb-1">{t('inflation_years')}</label>
                         <div className="relative">
                            <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input type="text" inputMode="decimal" value={years} onChange={(e) => handleInputChange(setYears, e.target.value)} placeholder={`${t('common_eg')} 10`}
                                className="w-full h-14 px-4 pl-10 bg-slate-700 border-2 border-slate-600 rounded-md focus:ring-sky-500 focus:border-sky-500 text-lg font-mono text-right" />
                         </div>
                    </div>
                </div>
            </div>

            <div className="mt-6 bg-slate-800 p-4 rounded-lg shadow-lg">
                <h3 className="text-lg font-semibold text-center text-sky-300 mb-4">{t('common_results')}</h3>
                <div className="space-y-4">
                     <div className="text-center p-3 bg-slate-700/50 rounded-lg">
                        <p className="text-sm text-slate-400">{t('inflation_future_value', { years: years || 'X' })}</p>
                        <p className="text-3xl font-bold text-red-400 font-mono tracking-tight">{formatCurrency(futureValue)}</p>
                        <NumberToWordsDisplay value={futureValue} />
                        <p className="text-sm text-slate-500 mt-1">{t('inflation_future_value_desc', { amount: currentAmountFormatted })}</p>
                    </div>
                    <div className="text-center p-3 bg-slate-700/50 rounded-lg">
                        <p className="text-base text-slate-400">{t('inflation_purchasing_power', { years: years || 'X' })}</p>
                        <p className="text-3xl font-bold text-green-400 font-mono tracking-tight">{formatCurrency(purchasingPower)}</p>
                        <NumberToWordsDisplay value={purchasingPower} />
                        <p className="text-sm text-slate-500 mt-1">{t('inflation_purchasing_power_desc', { amount: currentAmountFormatted })}</p>
                    </div>
                </div>
                {error && <p className="text-red-400 text-center mt-4">{error}</p>}
            </div>
             <div className="mt-6 grid grid-cols-2 gap-4">
                <button onClick={clearAll} className="w-full h-14 text-lg font-bold bg-red-600 hover:bg-red-500 text-white rounded-md transition-colors flex items-center justify-center gap-2">
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

export default InflationCalculator;