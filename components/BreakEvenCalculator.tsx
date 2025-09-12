import React, { useState, useMemo, useEffect } from 'react';
import { Scale, DollarSign, RefreshCw, PackagePlus, ListPlus } from 'lucide-react';
import { useFinancialTranslations } from '../contexts/FinancialTranslationContext';
import { NumberToWordsDisplay, SuffixesMenu } from '../contexts/FinancialTranslationContext';
import { useFinancialHistory } from '../contexts/FinancialHistoryContext';
import { FinancialHistoryView } from './FinancialHistoryView';

type SuffixTarget = 'fixed' | 'variable' | 'price';

const InputWithSuffix: React.FC<{ 
    label: string;
    value: string;
    onChange: (v: string) => void;
    onSuffixClick: () => void;
    placeholder: string;
}> = ({ label, value, onChange, onSuffixClick, placeholder }) => (
    <div>
        <label className="block text-base font-medium text-slate-300 mb-1">{label}</label>
        <div className="flex items-center gap-2">
            <div className="relative grow">
                <DollarSign size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" inputMode="decimal" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
                    className="w-full h-14 px-4 pl-10 bg-slate-700 border-2 border-slate-600 rounded-md focus:ring-sky-500 focus:border-sky-500 text-lg font-mono text-right" />
            </div>
            <button onClick={onSuffixClick} className="h-14 w-14 flex-shrink-0 bg-indigo-600 hover:bg-indigo-500 rounded-md flex items-center justify-center">
                <PackagePlus size={20}/>
            </button>
        </div>
        <NumberToWordsDisplay value={value} />
    </div>
);

const BreakEvenCalculator: React.FC = () => {
    const { t, numberToWords } = useFinancialTranslations();
    const { addHistoryEntry, entryToReuse, consumeEntryToReuse } = useFinancialHistory();
    const [fixedCosts, setFixedCosts] = useState('');
    const [variableCost, setVariableCost] = useState('');
    const [pricePerUnit, setPricePerUnit] = useState('');

    const [showSuffixesMenu, setShowSuffixesMenu] = useState(false);
    const [suffixTarget, setSuffixTarget] = useState<SuffixTarget | null>(null);

    useEffect(() => {
        if (entryToReuse && entryToReuse.calculatorType === 'breakeven') {
            setFixedCosts(entryToReuse.rawInputs.fixedCosts || '');
            setVariableCost(entryToReuse.rawInputs.variableCost || '');
            setPricePerUnit(entryToReuse.rawInputs.pricePerUnit || '');
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

    const { breakEvenUnits, breakEvenRevenue, error } = useMemo(() => {
        const fc = parseFloat(fixedCosts.replace(/,/g, ''));
        const vc = parseFloat(variableCost.replace(/,/g, ''));
        const p = parseFloat(pricePerUnit.replace(/,/g, ''));

        if (isNaN(fc) || isNaN(vc) || isNaN(p) || fc < 0 || vc < 0 || p < 0) {
            return { breakEvenUnits: null, breakEvenRevenue: null, error: null };
        }

        const contributionMargin = p - vc;

        if (contributionMargin <= 0) {
            return { breakEvenUnits: null, breakEvenRevenue: null, error: t('breakeven_error_margin') };
        }

        const units = fc / contributionMargin;
        const revenue = units * p;

        if (!isFinite(units) || !isFinite(revenue)) {
            return { breakEvenUnits: null, breakEvenRevenue: null, error: t('common_error_invalid_number') };
        }

        return { breakEvenUnits: units, breakEvenRevenue: revenue, error: null };
    }, [fixedCosts, variableCost, pricePerUnit, t]);

    const handleSuffixClick = (target: SuffixTarget) => {
        setSuffixTarget(target);
        setShowSuffixesMenu(true);
    };

    const handleMultiplierSelect = (multiplier: number) => {
        if (!suffixTarget) return;
        const setters = { fixed: setFixedCosts, variable: setVariableCost, price: setPricePerUnit };
        const values = { fixed: fixedCosts, variable: variableCost, price: pricePerUnit };
        
        const currentValue = parseFloat(String(values[suffixTarget]).replace(/,/g, '')) || 1;
        handleInputChange(setters[suffixTarget], String(currentValue * multiplier));
        setShowSuffixesMenu(false);
    };

    const clearAll = () => {
        setFixedCosts('');
        setVariableCost('');
        setPricePerUnit('');
    };

    const formatCurrency = (num: number | null) => {
        if (num === null) return '$ ...';
        return num.toLocaleString(undefined, { style: 'currency', currency: 'USD' });
    };

    const formatUnits = (num: number | null) => {
        if (num === null) return '...';
        return Math.ceil(num).toLocaleString();
    };

    const handleSaveHistory = () => {
        if (error || breakEvenUnits === null || breakEvenRevenue === null) return;
        
        addHistoryEntry({
            calculatorType: 'breakeven',
            calculatorNameKey: 'breakeven_title',
            rawInputs: { fixedCosts, variableCost, pricePerUnit },
            displayInputs: [
                { labelKey: 'breakeven_fixed_costs', value: formatCurrency(parseFloat(fixedCosts.replace(/,/g, ''))) },
                { labelKey: 'breakeven_variable_cost', value: formatCurrency(parseFloat(variableCost.replace(/,/g, ''))) },
                { labelKey: 'breakeven_price_per_unit', value: formatCurrency(parseFloat(pricePerUnit.replace(/,/g, ''))) },
            ],
            displayResults: [
                { labelKey: 'breakeven_units_to_sell', value: formatUnits(breakEvenUnits), words: numberToWords(Math.ceil(breakEvenUnits)), isPrimary: true },
                { labelKey: 'breakeven_revenue_to_generate', value: formatCurrency(breakEvenRevenue), words: numberToWords(breakEvenRevenue) },
            ]
        });
    };
    
    const isSavable = !error && breakEvenUnits !== null;

    return (
        <>
            <div className="text-center mb-6">
                <Scale className="mx-auto text-teal-400 mb-2" size={40} />
                <h1 className="text-2xl font-bold text-white">{t('breakeven_title')}</h1>
                <p className="text-base text-slate-400">{t('breakeven_subtitle')}</p>
            </div>

            <div className="bg-slate-800 p-4 rounded-lg shadow-lg space-y-6">
                <InputWithSuffix 
                    label={t('breakeven_fixed_costs')} 
                    value={fixedCosts} 
                    onChange={v => handleInputChange(setFixedCosts, v)}
                    onSuffixClick={() => handleSuffixClick('fixed')}
                    placeholder={`${t('common_eg')} 50,000`}
                />
                <InputWithSuffix 
                    label={t('breakeven_variable_cost')} 
                    value={variableCost} 
                    onChange={v => handleInputChange(setVariableCost, v)}
                    onSuffixClick={() => handleSuffixClick('variable')}
                    placeholder={`${t('common_eg')} 30`}
                />
                <InputWithSuffix 
                    label={t('breakeven_price_per_unit')} 
                    value={pricePerUnit} 
                    onChange={v => handleInputChange(setPricePerUnit, v)}
                    onSuffixClick={() => handleSuffixClick('price')}
                    placeholder={`${t('common_eg')} 50`}
                />
            </div>

            <div className="mt-6 bg-slate-800 p-4 rounded-lg shadow-lg">
                <h3 className="text-lg font-semibold text-center text-sky-300 mb-4">{t('common_results')}</h3>
                <div className="space-y-4">
                    <div className="text-center p-3 bg-slate-700/50 rounded-lg">
                        <p className="text-sm text-slate-400">{t('breakeven_units_to_sell')}</p>
                        <p className="text-4xl font-bold text-green-400 font-mono tracking-tight">{formatUnits(breakEvenUnits)}</p>
                    </div>
                     <div className="text-center p-3 bg-slate-700/50 rounded-lg">
                        <p className="text-base text-slate-400">{t('breakeven_revenue_to_generate')}</p>
                        <p className="text-3xl font-bold text-yellow-300 font-mono tracking-tight break-all">{formatCurrency(breakEvenRevenue)}</p>
                        <NumberToWordsDisplay value={breakEvenRevenue} />
                    </div>
                </div>
                {error && <p className="text-red-400 text-center mt-4 p-2 bg-red-900/50 rounded-md">{error}</p>}
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

export default BreakEvenCalculator;