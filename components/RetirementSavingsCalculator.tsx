

import React, { useState, useMemo, useEffect } from 'react';
import { Sunrise, DollarSign, Percent as PercentIcon, RefreshCw, PackagePlus, ListPlus } from 'lucide-react';
import { useFinancialTranslations } from '../contexts/FinancialTranslationContext';
import { NumberToWordsDisplay, SuffixesMenu } from '../contexts/FinancialTranslationContext';
import { useFinancialHistory } from '../contexts/FinancialHistoryContext';
import { FinancialHistoryView } from './FinancialHistoryView';

const RetirementSavingsCalculator: React.FC = () => {
    const { t, numberToWords } = useFinancialTranslations();
    const { addHistoryEntry, entryToReuse, consumeEntryToReuse } = useFinancialHistory();
    const [currentAge, setCurrentAge] = useState('');
    const [retirementAge, setRetirementAge] = useState('');
    const [currentSavings, setCurrentSavings] = useState('');
    const [monthlyContribution, setMonthlyContribution] = useState('');
    const [annualRate, setAnnualRate] = useState('');
    const [withdrawalRate, setWithdrawalRate] = useState('4');
    
    const [showSuffixesMenu, setShowSuffixesMenu] = useState(false);
    type SuffixTarget = 'currentSavings' | 'monthlyContribution';
    const [suffixTarget, setSuffixTarget] = useState<SuffixTarget | null>(null);

    useEffect(() => {
        if (entryToReuse && entryToReuse.calculatorType === 'retirement') {
            setCurrentAge(entryToReuse.rawInputs.currentAge || '');
            setRetirementAge(entryToReuse.rawInputs.retirementAge || '');
            setCurrentSavings(entryToReuse.rawInputs.currentSavings || '');
            setMonthlyContribution(entryToReuse.rawInputs.monthlyContribution || '');
            setAnnualRate(entryToReuse.rawInputs.annualRate || '');
            setWithdrawalRate(entryToReuse.rawInputs.withdrawalRate || '4');
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

    const {
        projectedSavings,
        error
    } = useMemo(() => {
        const P = parseFloat(currentSavings.replace(/,/g, '')) || 0;
        const PMT = parseFloat(monthlyContribution.replace(/,/g, '')) || 0;
        const r = parseFloat(annualRate.replace(/,/g, '')) / 100;
        const age = parseInt(currentAge, 10);
        const retireAge = parseInt(retirementAge, 10);

        if (isNaN(r) || isNaN(age) || isNaN(retireAge) || retireAge <= age) {
            return { projectedSavings: null, error: null };
        }

        const time = retireAge - age;
        const n = 12; // Compounded monthly
        const ratePerPeriod = r / n;
        const numberOfPeriods = n * time;

        const fvPrincipal = P * Math.pow(1 + ratePerPeriod, numberOfPeriods);
        const fvContributions = PMT * ((Math.pow(1 + ratePerPeriod, numberOfPeriods) - 1) / ratePerPeriod);
        
        const totalFV = fvPrincipal + fvContributions;
        
        if (!isFinite(totalFV)) {
             return { projectedSavings: null, error: t('common_error_invalid_number') };
        }

        return { projectedSavings: totalFV, error: null };
    }, [currentSavings, monthlyContribution, annualRate, currentAge, retirementAge, t]);
    
    const sustainableMonthlyIncome = useMemo(() => {
        if (!projectedSavings) return null;
        const wr = parseFloat(withdrawalRate) / 100;
        return (projectedSavings * wr) / 12;
    }, [projectedSavings, withdrawalRate]);

    const formatCurrency = (num: number | null) => {
        if (num === null) return '$ ...';
        return num.toLocaleString(undefined, { style: 'currency', currency: 'USD' });
    };

    const handleSuffixClick = (target: SuffixTarget) => {
        setSuffixTarget(target);
        setShowSuffixesMenu(true);
    };

    const handleMultiplierSelect = (multiplier: number) => {
        if (!suffixTarget) return;

        const targetState = {
            currentSavings,
            monthlyContribution,
        }[suffixTarget];

        const targetSetter = {
            currentSavings: setCurrentSavings,
            monthlyContribution: setMonthlyContribution,
        }[suffixTarget];
        
        const currentValue = parseFloat(String(targetState).replace(/,/g, '')) || 1;
        handleInputChange(targetSetter, String(currentValue * multiplier));
        setShowSuffixesMenu(false);
    };


    const clearAll = () => {
        setCurrentAge('');
        setRetirementAge('');
        setCurrentSavings('');
        setMonthlyContribution('');
        setAnnualRate('');
        setWithdrawalRate('4');
    };

    const handleSaveHistory = () => {
        if (error || projectedSavings === null || sustainableMonthlyIncome === null) return;
        
        addHistoryEntry({
            calculatorType: 'retirement',
            calculatorNameKey: 'retirement_title',
            rawInputs: { currentAge, retirementAge, currentSavings, monthlyContribution, annualRate, withdrawalRate },
            displayInputs: [
                { labelKey: 'retirement_current_age', value: currentAge },
                { labelKey: 'retirement_retirement_age', value: retirementAge },
                { labelKey: 'retirement_current_savings', value: formatCurrency(parseFloat(currentSavings.replace(/,/g, '') || '0')) },
                { labelKey: 'compound_monthly_contrib', value: formatCurrency(parseFloat(monthlyContribution.replace(/,/g, '') || '0')) },
                { labelKey: 'retirement_annual_return', value: `${annualRate}%` },
            ],
            displayResults: [
                { labelKey: 'retirement_nest_egg', value: formatCurrency(projectedSavings), words: numberToWords(projectedSavings), isPrimary: true },
                { labelKey: 'retirement_monthly_income', value: formatCurrency(sustainableMonthlyIncome), words: numberToWords(sustainableMonthlyIncome) },
            ]
        });
    };

    const isSavable = !error && projectedSavings !== null;

    return (
        <>
            <div className="text-center mb-6">
                <Sunrise className="mx-auto text-yellow-400 mb-2" size={40} />
                <h1 className="text-2xl font-bold text-white">{t('retirement_title')}</h1>
                <p className="text-base text-slate-400">{t('retirement_subtitle')}</p>
            </div>

            <div className="bg-slate-800 p-4 rounded-lg shadow-lg space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-base font-medium text-slate-300 mb-1">{t('retirement_current_age')}</label>
                        <input type="text" inputMode="numeric" value={currentAge} onChange={(e) => handleInputChange(setCurrentAge, e.target.value)} placeholder={`${t('common_eg')} 30`}
                            className="w-full h-14 px-4 bg-slate-700 border-2 border-slate-600 rounded-md focus:ring-sky-500 focus:border-sky-500 text-lg font-mono text-right" />
                    </div>
                    <div>
                        <label className="block text-base font-medium text-slate-300 mb-1">{t('retirement_retirement_age')}</label>
                        <input type="text" inputMode="numeric" value={retirementAge} onChange={(e) => handleInputChange(setRetirementAge, e.target.value)} placeholder={`${t('common_eg')} 65`}
                            className="w-full h-14 px-4 bg-slate-700 border-2 border-slate-600 rounded-md focus:ring-sky-500 focus:border-sky-500 text-lg font-mono text-right" />
                    </div>
                </div>
                <div>
                    <label className="block text-base font-medium text-slate-300 mb-1">{t('retirement_current_savings')}</label>
                    <div className="flex items-center gap-2">
                        <div className="relative grow">
                            <DollarSign size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input type="text" inputMode="decimal" value={currentSavings} onChange={(e) => handleInputChange(setCurrentSavings, e.target.value)} placeholder={`${t('common_eg')} 50,000`}
                                className="w-full h-14 px-4 pl-10 bg-slate-700 border-2 border-slate-600 rounded-md focus:ring-sky-500 focus:border-sky-500 text-lg font-mono text-right" />
                        </div>
                        <button onClick={() => handleSuffixClick('currentSavings')} className="h-14 w-14 flex-shrink-0 bg-indigo-600 hover:bg-indigo-500 rounded-md flex items-center justify-center">
                            <PackagePlus size={20}/>
                        </button>
                    </div>
                    <NumberToWordsDisplay value={currentSavings} />
                </div>
                 <div>
                    <label className="block text-base font-medium text-slate-300 mb-1">{t('compound_monthly_contrib')}</label>
                    <div className="flex items-center gap-2">
                        <div className="relative grow">
                            <DollarSign size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input type="text" inputMode="decimal" value={monthlyContribution} onChange={(e) => handleInputChange(setMonthlyContribution, e.target.value)} placeholder={`${t('common_eg')} 1,000`}
                                className="w-full h-14 px-4 pl-10 bg-slate-700 border-2 border-slate-600 rounded-md focus:ring-sky-500 focus:border-sky-500 text-lg font-mono text-right" />
                        </div>
                        <button onClick={() => handleSuffixClick('monthlyContribution')} className="h-14 w-14 flex-shrink-0 bg-indigo-600 hover:bg-indigo-500 rounded-md flex items-center justify-center">
                            <PackagePlus size={20}/>
                        </button>
                    </div>
                    <NumberToWordsDisplay value={monthlyContribution} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-base font-medium text-slate-300 mb-1">{t('retirement_annual_return')}</label>
                        <div className="relative">
                             <PercentIcon size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                             <input type="text" inputMode="decimal" value={annualRate} onChange={(e) => handleInputChange(setAnnualRate, e.target.value)} placeholder={`${t('common_eg')} 7`}
                                className="w-full h-14 px-4 pr-10 bg-slate-700 border-2 border-slate-600 rounded-md focus:ring-sky-500 focus:border-sky-500 text-lg font-mono text-right" />
                        </div>
                    </div>
                     <div>
                        <label className="block text-base font-medium text-slate-300 mb-1">{t('retirement_withdrawal_rate')}</label>
                         <div className="relative">
                            <PercentIcon size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input type="text" inputMode="decimal" value={withdrawalRate} onChange={(e) => handleInputChange(setWithdrawalRate, e.target.value)} placeholder={`${t('common_eg')} 4`}
                                className="w-full h-14 px-4 pr-10 bg-slate-700 border-2 border-slate-600 rounded-md focus:ring-sky-500 focus:border-sky-500 text-lg font-mono text-right" />
                         </div>
                    </div>
                </div>
            </div>

            <div className="mt-6 bg-slate-800 p-4 rounded-lg shadow-lg">
                <h3 className="text-lg font-semibold text-center text-sky-300 mb-4">{t('retirement_outlook_title')}</h3>
                 <div className="text-center mb-4">
                    <p className="text-sm text-slate-400">{t('retirement_nest_egg')}</p>
                    <p className="text-4xl font-bold text-green-400 font-mono tracking-tight break-all">{formatCurrency(projectedSavings)}</p>
                    <NumberToWordsDisplay value={projectedSavings} />
                </div>

                <div className="text-center">
                    <p className="text-base text-slate-400">{t('retirement_monthly_income')}</p>
                    <p className="text-3xl font-bold text-yellow-300 font-mono tracking-tight break-all">{formatCurrency(sustainableMonthlyIncome)}</p>
                    <NumberToWordsDisplay value={sustainableMonthlyIncome} />
                    <p className="text-xs text-slate-500 mt-1">{t('retirement_withdrawal_rate_info', {rate: withdrawalRate})}</p>
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

export default RetirementSavingsCalculator;