

import React, { useState, useMemo, useEffect } from 'react';
import { Coins, DollarSign, Percent as PercentIcon, Calendar, PackagePlus, RefreshCw, ListPlus } from 'lucide-react';
import { useFinancialTranslations } from '../contexts/FinancialTranslationContext';
import { NumberToWordsDisplay, SuffixesMenu } from '../contexts/FinancialTranslationContext';
import { useFinancialHistory } from '../contexts/FinancialHistoryContext';
import { FinancialHistoryView } from './FinancialHistoryView';

const LoanCalculator: React.FC = () => {
    const { t, numberToWords } = useFinancialTranslations();
    const { addHistoryEntry, entryToReuse, consumeEntryToReuse } = useFinancialHistory();
    const [loanAmount, setLoanAmount] = useState('');
    const [interestRate, setInterestRate] = useState('');
    const [loanTerm, setLoanTerm] = useState(''); // in years
    const [showSuffixesMenu, setShowSuffixesMenu] = useState(false);

    useEffect(() => {
        if (entryToReuse && entryToReuse.calculatorType === 'loan') {
            setLoanAmount(entryToReuse.rawInputs.loanAmount || '');
            setInterestRate(entryToReuse.rawInputs.interestRate || '');
            setLoanTerm(entryToReuse.rawInputs.loanTerm || '');
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

    const { monthlyPayment, totalInterest, totalPayment, error } = useMemo(() => {
        const P = parseFloat(loanAmount.replace(/,/g, ''));
        const annualRate = parseFloat(interestRate.replace(/,/g, ''));
        const years = parseFloat(loanTerm.replace(/,/g, ''));

        if (isNaN(P) || isNaN(annualRate) || isNaN(years) || P <= 0 || annualRate < 0 || years <= 0) {
            return { monthlyPayment: null, totalInterest: null, totalPayment: null, error: null };
        }
        
        const r = (annualRate / 100) / 12; // monthly interest rate
        const n = years * 12; // number of payments

        if (annualRate === 0) {
            const M = P / n;
            return { monthlyPayment: M, totalInterest: 0, totalPayment: P, error: null };
        }

        const M = P * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
        const totalPaid = M * n;
        const totalInt = totalPaid - P;

        if (!isFinite(M)) {
            return { monthlyPayment: null, totalInterest: null, totalPayment: null, error: t('common_error_invalid_number') };
        }

        return { monthlyPayment: M, totalInterest: totalInt, totalPayment: totalPaid, error: null };

    }, [loanAmount, interestRate, loanTerm, t]);

    const formatCurrency = (num: number | null) => {
        if (num === null) return '$ ...';
        return num.toLocaleString(undefined, { style: 'currency', currency: 'USD' });
    };

    const handleMultiplierSelect = (multiplier: number) => {
        const currentValue = parseFloat(String(loanAmount).replace(/,/g, '')) || 1;
        handleInputChange(setLoanAmount, String(currentValue * multiplier));
        setShowSuffixesMenu(false);
    };
    
    const handleSaveHistory = () => {
        if (error || monthlyPayment === null || totalPayment === null || totalInterest === null) return;
        const P = parseFloat(loanAmount.replace(/,/g, ''));

        addHistoryEntry({
            calculatorType: 'loan',
            calculatorNameKey: 'loan_title',
            rawInputs: { loanAmount, interestRate, loanTerm },
            displayInputs: [
                { labelKey: 'loan_amount_label', value: formatCurrency(P) },
                { labelKey: 'loan_rate_label', value: `${interestRate}%` },
                { labelKey: 'loan_term_label', value: loanTerm, valueSuffixKey: 'loan_years_label' },
            ],
            displayResults: [
                { labelKey: 'loan_monthly_payment', value: formatCurrency(monthlyPayment), words: numberToWords(monthlyPayment), isPrimary: true },
                { labelKey: 'loan_total_principal', value: formatCurrency(P), words: numberToWords(P) },
                { labelKey: 'loan_total_interest', value: formatCurrency(totalInterest), words: numberToWords(totalInterest) },
                { labelKey: 'loan_total_payment', value: formatCurrency(totalPayment), words: numberToWords(totalPayment) },
            ]
        });
    };
    
    const principal = useMemo(() => parseFloat(loanAmount.replace(/,/g, '')), [loanAmount]);
    const principalPercent = totalPayment && principal ? (principal / totalPayment) * 100 : 0;
    const interestPercent = totalPayment && totalInterest ? (totalInterest / totalPayment) * 100 : 0;

    const isSavable = !error && monthlyPayment !== null;

    return (
        <>
            <div className="text-center mb-6">
                <Coins className="mx-auto text-purple-400 mb-2" size={40} />
                <h1 className="text-2xl font-bold text-white">{t('loan_title')}</h1>
                <p className="text-base text-slate-400">{t('loan_subtitle')}</p>
            </div>

            <div className="bg-slate-800 p-4 rounded-lg shadow-lg space-y-6">
                 <div>
                    <label htmlFor="loan-amount" className="block text-base font-medium text-slate-300 mb-1">{t('loan_amount_label')}</label>
                    <div className="flex items-center gap-2">
                        <div className="relative grow">
                            <DollarSign size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input id="loan-amount" type="text" inputMode="decimal" value={loanAmount} onChange={(e) => handleInputChange(setLoanAmount, e.target.value)} placeholder={`${t('common_eg')} 350,000`}
                                className="w-full h-14 px-4 pl-10 bg-slate-700 border-2 border-slate-600 rounded-md focus:ring-sky-500 focus:border-sky-500 transition-colors text-lg font-mono text-right text-white" />
                        </div>
                        <button onClick={() => setShowSuffixesMenu(true)} className="h-14 w-14 flex-shrink-0 bg-indigo-600 hover:bg-indigo-500 rounded-md flex items-center justify-center" aria-label="Open suffixes menu for loan amount">
                            <PackagePlus size={20}/>
                        </button>
                    </div>
                    <NumberToWordsDisplay value={loanAmount} />
                </div>
                 <div>
                    <label htmlFor="interest-rate" className="block text-base font-medium text-slate-300 mb-1">{t('loan_rate_label')}</label>
                    <div className="relative">
                        <PercentIcon size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input id="interest-rate" type="text" inputMode="decimal" value={interestRate} onChange={(e) => handleInputChange(setInterestRate, e.target.value)} placeholder={`${t('common_eg')} 6.5`}
                            className="w-full h-14 px-4 pr-10 bg-slate-700 border-2 border-slate-600 rounded-md focus:ring-sky-500 focus:border-sky-500 transition-colors text-lg font-mono text-right text-white" />
                    </div>
                </div>
                 <div>
                    <label htmlFor="loan-term" className="block text-base font-medium text-slate-300 mb-1">{t('loan_term_label')}</label>
                    <div className="relative">
                         <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input id="loan-term" type="text" inputMode="decimal" value={loanTerm} onChange={(e) => handleInputChange(setLoanTerm, e.target.value)} placeholder={`${t('common_eg')} 30`}
                            className="w-full h-14 px-4 pl-10 bg-slate-700 border-2 border-slate-600 rounded-md focus:ring-sky-500 focus:border-sky-500 transition-colors text-lg font-mono text-right text-white" />
                    </div>
                </div>
            </div>

            <div className="mt-6 bg-slate-800 p-4 rounded-lg shadow-lg">
                <h3 className="text-lg font-semibold text-center text-sky-300 mb-2">{t('common_results')}</h3>
                <div className="text-center mb-4">
                    <p className="text-sm text-slate-400">{t('loan_monthly_payment')}</p>
                    <p className="text-4xl font-bold text-green-400 font-mono tracking-tight">{formatCurrency(monthlyPayment)}</p>
                    <NumberToWordsDisplay value={monthlyPayment} />
                </div>
                
                {totalPayment !== null && !isNaN(totalPayment) && totalPayment > 0 && (
                    <>
                        <div className="w-full bg-slate-700 rounded-full h-4 my-4 flex overflow-hidden">
                            <div className="bg-purple-500 h-full" style={{ width: `${principalPercent}%` }} title={`${t('loan_principal_legend')}: ${principalPercent.toFixed(1)}%`}></div>
                            <div className="bg-red-500 h-full" style={{ width: `${interestPercent}%` }} title={`${t('loan_interest_legend')}: ${interestPercent.toFixed(1)}%`}></div>
                        </div>
                        <div className="flex justify-between text-sm mb-4">
                            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-purple-500"></div>{t('loan_principal_legend')}</div>
                            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-500"></div>{t('loan_interest_legend')}</div>
                        </div>

                        <div className="space-y-2 text-base">
                            <div className="p-3 bg-slate-700/50 rounded-md">
                                <div className="flex justify-between items-start gap-4">
                                    <span className="text-slate-300 pt-1 flex-shrink-0">{t('loan_total_principal')}</span>
                                    <span className="font-mono text-white text-base break-all text-right">{formatCurrency(principal)}</span>
                                </div>
                                <NumberToWordsDisplay value={principal} />
                            </div>
                            <div className="p-3 bg-slate-700/50 rounded-md">
                                <div className="flex justify-between items-start gap-4">
                                    <span className="text-slate-300 pt-1 flex-shrink-0">{t('loan_total_interest')}</span>
                                    <span className="font-mono text-white text-base break-all text-right">{formatCurrency(totalInterest)}</span>
                                </div>
                                <NumberToWordsDisplay value={totalInterest} />
                            </div>
                            <div className="p-3 bg-slate-900/50 rounded-md font-bold">
                                <div className="flex justify-between items-start gap-4">
                                    <span className="text-slate-200 pt-1 flex-shrink-0">{t('loan_total_payment')}</span>
                                    <span className="font-mono text-sky-300 text-base break-all text-right">{formatCurrency(totalPayment)}</span>
                                </div>
                                <NumberToWordsDisplay value={totalPayment} />
                            </div>
                        </div>
                    </>
                )}
                {error && <p className="text-red-400 text-center mt-4">{error}</p>}
            </div>
             <div className="mt-6 grid grid-cols-2 gap-4">
                 <button
                    onClick={() => { setLoanAmount(''); setInterestRate(''); setLoanTerm(''); }}
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

export default LoanCalculator;