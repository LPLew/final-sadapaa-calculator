

import React, { useState, useMemo, useEffect } from 'react';
import { TrendingUp, DollarSign, Percent as PercentIcon, Calendar, RefreshCw, PackagePlus, ListPlus } from 'lucide-react';
import { useFinancialTranslations } from '../contexts/FinancialTranslationContext';
import { NumberToWordsDisplay, SuffixesMenu } from '../contexts/FinancialTranslationContext';
import { useFinancialHistory } from '../contexts/FinancialHistoryContext';
import { FinancialHistoryView } from './FinancialHistoryView';

const CompoundInterestCalculator: React.FC = () => {
    const { t, numberToWords } = useFinancialTranslations();
    const { addHistoryEntry, entryToReuse, consumeEntryToReuse } = useFinancialHistory();
    const [principal, setPrincipal] = useState('');
    const [monthlyContribution, setMonthlyContribution] = useState('');
    const [annualRate, setAnnualRate] = useState('');
    const [years, setYears] = useState('');
    const [compoundingFrequency, setCompoundingFrequency] = useState(12);
    
    const [showSuffixesMenu, setShowSuffixesMenu] = useState(false);
    type SuffixTarget = 'principal' | 'monthlyContribution';
    const [suffixTarget, setSuffixTarget] = useState<SuffixTarget | null>(null);

    useEffect(() => {
        if (entryToReuse && entryToReuse.calculatorType === 'compound') {
            setPrincipal(entryToReuse.rawInputs.principal || '');
            setMonthlyContribution(entryToReuse.rawInputs.monthlyContribution || '');
            setAnnualRate(entryToReuse.rawInputs.annualRate || '');
            setYears(entryToReuse.rawInputs.years || '');
            setCompoundingFrequency(parseInt(entryToReuse.rawInputs.compoundingFrequency, 10) || 12);
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

    const { futureValue, totalPrincipal, totalInterest, error } = useMemo(() => {
        const P = parseFloat(principal.replace(/,/g, '')) || 0;
        const PMT = parseFloat(monthlyContribution.replace(/,/g, '')) || 0;
        const r = parseFloat(annualRate.replace(/,/g, '')) / 100;
        const time = parseFloat(years.replace(/,/g, ''));
        const n = compoundingFrequency;

        if (isNaN(r) || isNaN(time) || time <= 0) {
            return { futureValue: null, totalPrincipal: null, totalInterest: null, error: null };
        }
        
        const totalP_calc = P + (PMT * 12 * time);

        if (r === 0) {
            return { futureValue: totalP_calc, totalPrincipal: totalP_calc, totalInterest: 0, error: null };
        }

        const ratePerPeriod = r / n;
        const numberOfPeriods = n * time;

        const fvPrincipal = P * Math.pow(1 + ratePerPeriod, numberOfPeriods);
        const fvContributions = PMT * ((Math.pow(1 + ratePerPeriod, numberOfPeriods) - 1) / ratePerPeriod);
        
        const totalFV = fvPrincipal + fvContributions;
        const totalI = totalFV - totalP_calc;

        if (!isFinite(totalFV)) {
            return { futureValue: null, totalPrincipal: null, totalInterest: null, error: t('common_error_invalid_number') };
        }

        return { futureValue: totalFV, totalPrincipal: totalP_calc, totalInterest: totalI, error: null };
    }, [principal, monthlyContribution, annualRate, years, compoundingFrequency, t]);

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
            principal,
            monthlyContribution,
        }[suffixTarget];

        const targetSetter = {
            principal: setPrincipal,
            monthlyContribution: setMonthlyContribution,
        }[suffixTarget];
        
        const currentValue = parseFloat(String(targetState).replace(/,/g, '')) || 1;
        handleInputChange(targetSetter, String(currentValue * multiplier));
        setShowSuffixesMenu(false);
    };

    const clearAll = () => {
        setPrincipal('');
        setMonthlyContribution('');
        setAnnualRate('');
        setYears('');
        setCompoundingFrequency(12);
    };

    const handleSaveHistory = () => {
        if (error || futureValue === null || totalPrincipal === null || totalInterest === null) return;

        addHistoryEntry({
            calculatorType: 'compound',
            calculatorNameKey: 'compound_title',
            rawInputs: { principal, monthlyContribution, annualRate, years, compoundingFrequency: String(compoundingFrequency) },
            displayInputs: [
                { labelKey: 'compound_principal', value: formatCurrency(parseFloat(principal.replace(/,/g, '') || '0')) },
                { labelKey: 'compound_monthly_contrib', value: formatCurrency(parseFloat(monthlyContribution.replace(/,/g, '') || '0')) },
                { labelKey: 'compound_annual_rate', value: `${annualRate}%` },
                { labelKey: 'compound_years', value: `${years}` },
            ],
            displayResults: [
                { labelKey: 'compound_future_value', value: formatCurrency(futureValue), words: numberToWords(futureValue), isPrimary: true },
                { labelKey: 'compound_total_principal', value: formatCurrency(totalPrincipal), words: numberToWords(totalPrincipal) },
                { labelKey: 'compound_total_interest', value: formatCurrency(totalInterest), words: numberToWords(totalInterest) },
            ]
        });
    };

    const isSavable = !error && futureValue !== null;
    const principalPercent = futureValue && totalPrincipal ? (totalPrincipal / futureValue) * 100 : 0;
    const interestPercent = futureValue && totalInterest ? (totalInterest / futureValue) * 100 : 0;

    return (
        <>
            <div className="text-center mb-6">
                <TrendingUp className="mx-auto text-green-400 mb-2" size={40} />
                <h1 className="text-2xl font-bold text-white">{t('compound_title')}</h1>
                <p className="text-base text-slate-400">{t('compound_subtitle')}</p>
            </div>

            <div className="bg-slate-800 p-4 rounded-lg shadow-lg space-y-6">
                <div>
                    <label className="block text-base font-medium text-slate-300 mb-1">{t('compound_principal')}</label>
                    <div className="flex items-center gap-2">
                        <div className="relative grow">
                            <DollarSign size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input type="text" inputMode="decimal" value={principal} onChange={(e) => handleInputChange(setPrincipal, e.target.value)} placeholder={`${t('common_eg')} 10,000`}
                                className="w-full h-14 px-4 pl-10 bg-slate-700 border-2 border-slate-600 rounded-md focus:ring-sky-500 focus:border-sky-500 text-lg font-mono text-right" />
                        </div>
                        <button onClick={() => handleSuffixClick('principal')} className="h-14 w-14 flex-shrink-0 bg-indigo-600 hover:bg-indigo-500 rounded-md flex items-center justify-center" aria-label="Open suffixes menu for initial principal">
                            <PackagePlus size={20}/>
                        </button>
                    </div>
                    <NumberToWordsDisplay value={principal} />
                </div>
                 <div>
                    <label className="block text-base font-medium text-slate-300 mb-1">{t('compound_monthly_contrib')}</label>
                    <div className="flex items-center gap-2">
                        <div className="relative grow">
                            <DollarSign size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input type="text" inputMode="decimal" value={monthlyContribution} onChange={(e) => handleInputChange(setMonthlyContribution, e.target.value)} placeholder={`${t('common_eg')} 500`}
                                className="w-full h-14 px-4 pl-10 bg-slate-700 border-2 border-slate-600 rounded-md focus:ring-sky-500 focus:border-sky-500 text-lg font-mono text-right" />
                        </div>
                         <button onClick={() => handleSuffixClick('monthlyContribution')} className="h-14 w-14 flex-shrink-0 bg-indigo-600 hover:bg-indigo-500 rounded-md flex items-center justify-center" aria-label="Open suffixes menu for monthly contribution">
                            <PackagePlus size={20}/>
                        </button>
                    </div>
                    <NumberToWordsDisplay value={monthlyContribution} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-base font-medium text-slate-300 mb-1">{t('compound_annual_rate')}</label>
                        <div className="relative">
                             <PercentIcon size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                             <input type="text" inputMode="decimal" value={annualRate} onChange={(e) => handleInputChange(setAnnualRate, e.target.value)} placeholder={`${t('common_eg')} 8`}
                                className="w-full h-14 px-4 pr-10 bg-slate-700 border-2 border-slate-600 rounded-md focus:ring-sky-500 focus:border-sky-500 text-lg font-mono text-right" />
                        </div>
                    </div>
                     <div>
                        <label className="block text-base font-medium text-slate-300 mb-1">{t('compound_years')}</label>
                         <div className="relative">
                            <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input type="text" inputMode="decimal" value={years} onChange={(e) => handleInputChange(setYears, e.target.value)} placeholder={`${t('common_eg')} 10`}
                                className="w-full h-14 px-4 pl-10 bg-slate-700 border-2 border-slate-600 rounded-md focus:ring-sky-500 focus:border-sky-500 text-lg font-mono text-right" />
                         </div>
                    </div>
                </div>
                <div>
                    <label className="block text-base font-medium text-slate-300 mb-1">{t('compound_frequency')}</label>
                    <select value={compoundingFrequency} onChange={(e) => setCompoundingFrequency(Number(e.target.value))} className="w-full h-14 px-3 bg-slate-700 border-2 border-slate-600 rounded-md focus:ring-sky-500 focus:border-sky-500 text-base">
                        <option value={12}>{t('compound_monthly')}</option>
                        <option value={4}>{t('compound_quarterly')}</option>
                        <option value={2}>{t('compound_semiannually')}</option>
                        <option value={1}>{t('compound_annually')}</option>
                    </select>
                </div>
            </div>

            <div className="mt-6 bg-slate-800 p-4 rounded-lg shadow-lg">
                <h3 className="text-lg font-semibold text-center text-sky-300 mb-2">{t('common_results')}</h3>
                <div className="text-center mb-4">
                    <p className="text-sm text-slate-400">{t('compound_future_value')}</p>
                    <p className="text-4xl font-bold text-green-400 font-mono tracking-tight break-all">{formatCurrency(futureValue)}</p>
                    <NumberToWordsDisplay value={futureValue} />
                </div>
                
                {futureValue !== null && !isNaN(futureValue) && futureValue > 0 && (
                    <>
                        <div className="w-full bg-slate-700 rounded-full h-4 my-4 flex overflow-hidden">
                            <div className="bg-sky-500 h-full" style={{ width: `${principalPercent}%` }} title={`${t('loan_principal_legend')}: ${principalPercent.toFixed(1)}%`}></div>
                            <div className="bg-green-500 h-full" style={{ width: `${interestPercent}%` }} title={`${t('loan_interest_legend')}: ${interestPercent.toFixed(1)}%`}></div>
                        </div>
                        <div className="flex justify-between text-sm mb-4">
                            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-sky-500"></div>{t('loan_principal_legend')}</div>
                            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-green-500"></div>{t('loan_interest_legend')}</div>
                        </div>

                        <div className="space-y-2 text-base">
                            <div className="p-3 bg-slate-700/50 rounded-md">
                                <div className="flex justify-between items-start gap-4">
                                    <span className="text-slate-300 pt-1 flex-shrink-0">{t('compound_total_principal')}</span>
                                    <span className="font-mono text-white text-base break-all text-right">{formatCurrency(totalPrincipal)}</span>
                                </div>
                                <NumberToWordsDisplay value={totalPrincipal} />
                            </div>
                             <div className="p-3 bg-slate-700/50 rounded-md">
                                <div className="flex justify-between items-start gap-4">
                                    <span className="text-slate-300 pt-1 flex-shrink-0">{t('compound_total_interest')}</span>
                                    <span className="font-mono text-white text-base break-all text-right">{formatCurrency(totalInterest)}</span>
                                </div>
                                <NumberToWordsDisplay value={totalInterest} />
                            </div>
                        </div>
                    </>
                )}
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

export default CompoundInterestCalculator;