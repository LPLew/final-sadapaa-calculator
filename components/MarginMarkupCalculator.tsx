import React, { useState, useEffect } from 'react';
import { Tag, DollarSign, Percent as PercentIcon, RefreshCw, PackagePlus, ListPlus } from 'lucide-react';
import { useFinancialTranslations } from '../contexts/FinancialTranslationContext';
import { NumberToWordsDisplay, SuffixesMenu } from '../contexts/FinancialTranslationContext';
import { useFinancialHistory } from '../contexts/FinancialHistoryContext';
import { FinancialHistoryView } from './FinancialHistoryView';

type LastEdited = 'cost' | 'price' | 'margin' | 'markup' | null;
type SuffixTarget = 'cost' | 'price';

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
                <input
                    type="text"
                    inputMode="decimal"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="w-full h-14 px-4 pl-10 bg-slate-700 border-2 border-slate-600 rounded-md focus:ring-sky-500 focus:border-sky-500 text-lg font-mono text-right"
                />
            </div>
            <button onClick={onSuffixClick} className="h-14 w-14 flex-shrink-0 bg-indigo-600 hover:bg-indigo-500 rounded-md flex items-center justify-center">
                <PackagePlus size={20} />
            </button>
        </div>
        <NumberToWordsDisplay value={value} />
    </div>
);


const MarginMarkupCalculator: React.FC = () => {
    const { t, numberToWords } = useFinancialTranslations();
    const { addHistoryEntry, entryToReuse, consumeEntryToReuse } = useFinancialHistory();
    const [cost, setCost] = useState('');
    const [price, setPrice] = useState('');
    const [margin, setMargin] = useState('');
    const [markup, setMarkup] = useState('');
    const [grossProfit, setGrossProfit] = useState('');
    const [lastEdited, setLastEdited] = useState<LastEdited>(null);
    const [error, setError] = useState<string | null>(null);

    const [showSuffixesMenu, setShowSuffixesMenu] = useState(false);
    const [suffixTarget, setSuffixTarget] = useState<SuffixTarget | null>(null);

     useEffect(() => {
        if (entryToReuse && entryToReuse.calculatorType === 'margin') {
            setCost(entryToReuse.rawInputs.cost || '');
            setPrice(entryToReuse.rawInputs.price || '');
            setMargin(entryToReuse.rawInputs.margin || '');
            setMarkup(entryToReuse.rawInputs.markup || '');
            setLastEdited(null); // Let useEffect recalculate
            consumeEntryToReuse();
        }
    }, [entryToReuse, consumeEntryToReuse]);

    useEffect(() => {
        if (lastEdited === null) {
            if (cost && price) {
                setLastEdited('price');
            }
            return
        };

        const c = parseFloat(cost.replace(/,/g, ''));
        const p = parseFloat(price.replace(/,/g, ''));
        const mgn = parseFloat(margin.replace(/,/g, ''));
        const mkp = parseFloat(markup.replace(/,/g, ''));
        
        setError(null);

        const format = (val: number, type: 'currency' | 'percent') => {
            if (isNaN(val) || !isFinite(val)) return '';
            return type === 'currency' ? val.toFixed(2) : val.toFixed(2);
        };
        
        let newPrice = p, newCost = c, newMargin = mgn, newMarkup = mkp, newProfit = NaN;

        if (lastEdited === 'cost' || lastEdited === 'price') {
            if (!isNaN(c) && !isNaN(p)) {
                 if (p < c) setError(t('margin_error_negative_profit'));
                newProfit = p - c;
                newMargin = p > 0 ? (newProfit / p) * 100 : 0;
                newMarkup = c > 0 ? (newProfit / c) * 100 : 0;
            }
        } else if (lastEdited === 'margin') {
            if (!isNaN(c) && !isNaN(mgn)) {
                newPrice = c / (1 - (mgn / 100));
                newProfit = newPrice - c;
                newMarkup = c > 0 ? (newProfit / c) * 100 : 0;
            }
        } else if (lastEdited === 'markup') {
            if (!isNaN(c) && !isNaN(mkp)) {
                newPrice = c * (1 + (mkp / 100));
                newProfit = newPrice - c;
                newMargin = newPrice > 0 ? (newProfit / newPrice) * 100 : 0;
            }
        }
        
        if(lastEdited !== 'price') setPrice(format(newPrice, 'currency'));
        if(lastEdited !== 'margin') setMargin(format(newMargin, 'percent'));
        if(lastEdited !== 'markup') setMarkup(format(newMarkup, 'percent'));
        setGrossProfit(format(newProfit, 'currency'));

    }, [cost, price, margin, markup, lastEdited, t]);

    const handleSuffixClick = (target: SuffixTarget) => {
        setSuffixTarget(target);
        setShowSuffixesMenu(true);
    };

    const handleInput = (setter: React.Dispatch<React.SetStateAction<string>>, field: LastEdited, value: string, isCurrency: boolean) => {
        const valueWithoutCommas = value.replace(/,/g, '');
        
        if (/^-?\d*\.?\d*$/.test(valueWithoutCommas) || valueWithoutCommas === '' || valueWithoutCommas === '-') {
            if (isCurrency) {
                const [integer, decimal] = valueWithoutCommas.split('.');
                const formattedInteger = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                const formattedValue = decimal !== undefined ? `${formattedInteger}.${decimal}` : formattedInteger;
                setter(formattedValue);
            } else {
                setter(valueWithoutCommas);
            }
            setLastEdited(field);
        }
    };

    const handleMultiplierSelect = (multiplier: number) => {
        if (!suffixTarget) return;
        const setters = { cost: setCost, price: setPrice };
        const values = { cost: cost, price: price };
        
        const currentValue = parseFloat(String(values[suffixTarget]).replace(/,/g, '')) || 1;
        // Use the new handleInput to format correctly
        handleInput(setters[suffixTarget], suffixTarget, String(currentValue * multiplier), true);
        setShowSuffixesMenu(false);
    };

    const clearAll = () => {
        setCost('');
        setPrice('');
        setMargin('');
        setMarkup('');
        setGrossProfit('');
        setLastEdited(null);
        setError(null);
    };

    const isSavable = lastEdited !== null && !error && !isNaN(parseFloat(grossProfit));

    const handleSaveHistory = () => {
        if (!isSavable) return;
        const profitValue = parseFloat(grossProfit);

        addHistoryEntry({
            calculatorType: 'margin',
            calculatorNameKey: 'margin_title',
            rawInputs: { cost, price, margin, markup },
            displayInputs: [
                { labelKey: 'margin_cost', value: `$${cost}` },
                { labelKey: 'margin_price', value: `$${price}` },
            ],
            displayResults: [
                { labelKey: 'margin_profit', value: `$${grossProfit}`, words: numberToWords(profitValue), isPrimary: true },
                { labelKey: 'margin_margin', value: `${margin}%`, words: numberToWords(parseFloat(margin)) },
                { labelKey: 'margin_markup', value: `${markup}%`, words: numberToWords(parseFloat(markup)) },
            ]
        });
    };

    return (
        <>
            <div className="text-center mb-6">
                <Tag className="mx-auto text-teal-400 mb-2" size={40} />
                <h1 className="text-2xl font-bold text-white">{t('margin_title')}</h1>
                <p className="text-base text-slate-400">{t('margin_subtitle')}</p>
            </div>

            <div className="bg-slate-800 p-4 rounded-lg shadow-lg space-y-6">
                <p className="text-xs text-center text-slate-400 p-2 bg-slate-900/50 rounded-md">{t('margin_instruction')}</p>
                
                <InputWithSuffix 
                    label={t('margin_cost')} 
                    value={cost} 
                    onChange={v => handleInput(setCost, 'cost', v, true)} 
                    onSuffixClick={() => handleSuffixClick('cost')}
                    placeholder="0.00" 
                />
                <InputWithSuffix 
                    label={t('margin_price')} 
                    value={price} 
                    onChange={v => handleInput(setPrice, 'price', v, true)}
                    onSuffixClick={() => handleSuffixClick('price')} 
                    placeholder="0.00" 
                />
                
                <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-base font-medium text-slate-300 mb-1">{t('margin_margin')}</label>
                        <div className="relative">
                             <PercentIcon size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                             <input type="text" inputMode="decimal" value={margin} onChange={(e) => handleInput(setMargin, 'margin', e.target.value, false)} placeholder="0.00"
                                className="w-full h-14 px-4 pr-10 bg-slate-700 border-2 border-slate-600 rounded-md focus:ring-sky-500 focus:border-sky-500 text-lg font-mono text-right" />
                        </div>
                    </div>
                     <div>
                        <label className="block text-base font-medium text-slate-300 mb-1">{t('margin_markup')}</label>
                         <div className="relative">
                            <PercentIcon size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input type="text" inputMode="decimal" value={markup} onChange={(e) => handleInput(setMarkup, 'markup', e.target.value, false)} placeholder="0.00"
                                className="w-full h-14 px-4 pr-10 bg-slate-700 border-2 border-slate-600 rounded-md focus:ring-sky-500 focus:border-sky-500 text-lg font-mono text-right" />
                         </div>
                    </div>
                </div>
            </div>

            <div className="mt-6 bg-slate-800 p-4 rounded-lg shadow-lg">
                <h3 className="text-lg font-semibold text-center text-sky-300 mb-4">{t('common_results')}</h3>
                 <div className="text-center">
                    <p className="text-sm text-slate-400">{t('margin_profit')}</p>
                    <p className={`text-4xl font-bold font-mono tracking-tight ${error ? 'text-red-400' : 'text-green-400'}`}>
                        ${grossProfit || '0.00'}
                    </p>
                    <NumberToWordsDisplay value={grossProfit} />
                </div>
                {error && <p className="text-yellow-400 text-center mt-4 p-2 bg-yellow-900/50 rounded-md">{error}</p>}
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

export default MarginMarkupCalculator;