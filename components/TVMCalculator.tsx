import React, { useState, useEffect } from 'react';
import { AlertCircle, Calendar, PackagePlus, RefreshCw, ListPlus } from 'lucide-react';
import { useFinancialTranslations } from '../contexts/FinancialTranslationContext';
import { NumberToWordsDisplay, SuffixesMenu } from '../contexts/FinancialTranslationContext';
import { useFinancialHistory } from '../contexts/FinancialHistoryContext';
import { FinancialHistoryView } from './FinancialHistoryView';

type SuffixTarget = 'pv' | 'pmt' | 'fv';
type TVMField = 'n' | 'iy' | 'pv' | 'pmt' | 'fv';

const TVMRow: React.FC<{
    label: string;
    field: TVMField;
    value: string;
    onInputChange: (value: string) => void;
    onCompute: () => void;
    onSuffixClick?: () => void;
    placeholder: string;
    enableSuffix?: boolean;
    isComputed: boolean;
    t: (key: string) => string;
}> = ({ label, value, onInputChange, onCompute, onSuffixClick, placeholder, enableSuffix = false, isComputed, t }) => {
    return (
        <div>
            <div className="flex items-center gap-2">
                <button
                    onClick={onCompute}
                    className="w-20 text-base font-bold bg-purple-700 hover:bg-purple-600 text-white rounded-md h-14 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                    {t('tvm_cpt_button')} {label}
                </button>
                <div className="relative grow">
                  <input
                      type="text"
                      inputMode="decimal"
                      value={value}
                      onChange={(e) => onInputChange(e.target.value)}
                      placeholder={placeholder}
                      className={`w-full h-14 px-4 bg-slate-700 border-2 rounded-md focus:ring-sky-500 focus:border-sky-500 transition-colors text-lg font-mono text-right ${isComputed ? 'border-green-400 text-green-300' : 'border-slate-600 text-white'}`}
                      aria-label={`${label} value`}
                  />
                </div>
                {enableSuffix && onSuffixClick && (
                    <button onClick={onSuffixClick} className="h-14 w-14 flex-shrink-0 bg-indigo-600 hover:bg-indigo-500 rounded-md flex items-center justify-center">
                        <PackagePlus size={20}/>
                    </button>
                )}
            </div>
            {enableSuffix && <NumberToWordsDisplay value={value} />}
        </div>
    );
};

const TVMCalculator: React.FC = () => {
    const { t, numberToWords } = useFinancialTranslations();
    const { addHistoryEntry, entryToReuse, consumeEntryToReuse } = useFinancialHistory();
    const [n, setN] = useState<string>('');
    const [iy, setIy] = useState<string>('');
    const [pv, setPv] = useState<string>('');
    const [pmt, setPmt] = useState<string>('');
    const [fv, setFv] = useState<string>('');
    const [computedField, setComputedField] = useState<string | null>(null);
    
    const [showSuffixesMenu, setShowSuffixesMenu] = useState(false);
    const [suffixTarget, setSuffixTarget] = useState<SuffixTarget | null>(null);

    useEffect(() => {
        if (entryToReuse && entryToReuse.calculatorType === 'tvm') {
            setN(entryToReuse.rawInputs.n || '');
            setIy(entryToReuse.rawInputs.iy || '');
            setPv(entryToReuse.rawInputs.pv || '');
            setPmt(entryToReuse.rawInputs.pmt || '');
            setFv(entryToReuse.rawInputs.fv || '');
            setComputedField(null);
            consumeEntryToReuse();
        }
    }, [entryToReuse, consumeEntryToReuse]);

    const parse = (val: string): number => parseFloat(val.replace(/,/g, '')) || 0;

    const handleInputChange = (setter: (value: string) => void, value: string) => {
        const valueWithoutCommas = value.replace(/,/g, '');
    
        if (/^-?\d*\.?\d*$/.test(valueWithoutCommas) || valueWithoutCommas === '' || valueWithoutCommas === '-') {
            const [integer, decimal] = valueWithoutCommas.split('.');
            const formattedInteger = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            const formattedValue = decimal !== undefined ? `${formattedInteger}.${decimal}` : formattedInteger;
            setter(formattedValue);
            if (computedField) setComputedField(null);
        }
    };

    const compute = (fieldToCompute: 'n' | 'iy' | 'pv' | 'pmt' | 'fv') => {
        setComputedField(fieldToCompute);
        const values = {
            n: parse(n),
            i: parse(iy) / 100,
            pv: parse(pv),
            pmt: parse(pmt),
            fv: parse(fv),
        };

        let result: number | null = null;
        const errorMsg = (field: string) => `${t('tvm_error_args')} ${field}`;

        try {
            switch (fieldToCompute) {
                case 'n': {
                    if (values.i === 0) {
                        if (values.pmt === 0) throw new Error(errorMsg('N'));
                        result = -(values.pv + values.fv) / values.pmt;
                    } else {
                        const logArg = (values.pmt - values.fv * values.i) / (values.pmt + values.pv * values.i);
                        if (logArg <= 0) throw new Error(errorMsg('N'));
                        result = Math.log(logArg) / Math.log(1 + values.i);
                    }
                    setN(formatResult(result, 4));
                    break;
                }
                case 'iy': {
                    result = solveRate(values.n, values.pmt, values.pv, values.fv) * 100;
                    setIy(formatResult(result, 6));
                    break;
                }
                case 'pv': {
                    if (values.i === 0) {
                        result = -values.fv - values.pmt * values.n;
                    } else {
                        const pow = Math.pow(1 + values.i, values.n);
                        result = -(values.fv + values.pmt * (pow - 1) / values.i) / pow;
                    }
                    setPv(formatResult(result));
                    break;
                }
                case 'pmt': {
                    if (values.i === 0) {
                        if (values.n === 0) throw new Error(errorMsg('PMT'));
                        result = (-values.fv - values.pv) / values.n;
                    } else {
                        const pow = Math.pow(1 + values.i, values.n);
                        if (pow === 1) throw new Error(errorMsg('PMT'));
                        result = -(values.fv * values.i + values.pv * values.i * pow) / (pow - 1);
                    }
                    setPmt(formatResult(result));
                    break;
                }
                case 'fv': {
                     if (values.i === 0) {
                        result = -values.pv - values.pmt * values.n;
                    } else {
                        const pow = Math.pow(1 + values.i, values.n);
                        result = -(values.pv * pow + values.pmt * (pow - 1) / values.i);
                    }
                    setFv(formatResult(result));
                    break;
                }
            }
        } catch (error) {
            console.error("Financial calculation error:", error);
            const errorSetter = { n: setN, iy: setIy, pv: setPv, pmt: setPmt, fv: setFv }[fieldToCompute];
            errorSetter("Error");
        }
    };
    
    const solveRate = (n: number, pmt: number, pv: number, fv: number, maxIter = 100, tolerance = 1e-7): number => {
        if (n <= 0) return NaN;
        let rate = 0.1;
        for (let i = 0; i < maxIter; i++) {
            if (rate <= -1) rate = -0.999999;
            const pow = Math.pow(1 + rate, n);
            const f = pv * pow + pmt * (rate !== 0 ? (pow - 1) / rate : n) + fv;
            if (Math.abs(f) < tolerance) return rate;
            const df = n * pv * Math.pow(1 + rate, n - 1) + pmt * (rate !== 0 ? (n * pow / rate - (pow - 1) / (rate * rate)) : 0);
            if (Math.abs(df) < 1e-15) break;
            rate = rate - f / df;
        }
        return NaN;
    };

    const formatResult = (num: number | null, precision = 2): string => {
        if (num === null || isNaN(num) || !isFinite(num)) return "Error";
        return num.toLocaleString(undefined, {
            minimumFractionDigits: precision,
            maximumFractionDigits: precision,
            useGrouping: true
        });
    };

    const clearAll = () => {
        setN(''); setIy(''); setPv(''); setPmt(''); setFv('');
        setComputedField(null);
    };

    const handleSuffixClick = (target: SuffixTarget) => {
        setSuffixTarget(target);
        setShowSuffixesMenu(true);
    };

    const handleMultiplierSelect = (multiplier: number) => {
        if (!suffixTarget) return;
        const setters = { pv: setPv, pmt: setPmt, fv: setFv };
        const values = { pv: pv, pmt: pmt, fv: fv };
        
        const currentValue = parseFloat(String(values[suffixTarget]).replace(/,/g, '')) || 1;
        handleInputChange(setters[suffixTarget], String(currentValue * multiplier));
        setShowSuffixesMenu(false);
    };

    const getFieldValue = (field: string) => {
        switch (field) {
            case 'n': return n;
            case 'iy': return iy;
            case 'pv': return pv;
            case 'pmt': return pmt;
            case 'fv': return fv;
            default: return '';
        }
    };

    const isSavable = computedField !== null && getFieldValue(computedField) !== 'Error';

    const handleSaveHistory = () => {
        if (!isSavable) return;
        const resultValue = getFieldValue(computedField!);
        const resultLabelKey = {
            n: 'tvm_n_label', iy: 'tvm_iy_label', pv: 'tvm_pv_label',
            pmt: 'tvm_pmt_label', fv: 'tvm_fv_label'
        }[computedField as 'n'|'iy'|'pv'|'pmt'|'fv'];

        addHistoryEntry({
            calculatorType: 'tvm',
            calculatorNameKey: 'tvm_title',
            rawInputs: { n, iy, pv, pmt, fv },
            displayInputs: [
                { labelKey: 'tvm_n_label', value: n },
                { labelKey: 'tvm_iy_label', value: `${iy}%` },
                { labelKey: 'tvm_pv_label', value: `$${pv}` },
                { labelKey: 'tvm_pmt_label', value: `$${pmt}` },
                { labelKey: 'tvm_fv_label', value: `$${fv}` },
            ].filter(item => item.labelKey !== resultLabelKey),
            displayResults: [
                {
                    labelKey: resultLabelKey,
                    value: ['iy'].includes(computedField!) ? `${resultValue}%` : `$${resultValue}`,
                    words: numberToWords(parseFloat(resultValue.replace(/,/g, ''))),
                    isPrimary: true
                },
            ]
        });
    };
    
    return (
        <>
            <div className="text-center mb-6">
                <Calendar className="mx-auto text-purple-400 mb-2" size={40} />
                <h1 className="text-2xl font-bold text-white">{t('tvm_title')}</h1>
                <p className="text-base text-slate-400">{t('tvm_subtitle')}</p>
            </div>

            <div className="bg-slate-800 p-4 rounded-lg shadow-lg space-y-4">
                <TVMRow 
                    label="N" 
                    field="n" 
                    value={n} 
                    onInputChange={v => handleInputChange(setN, v)}
                    onCompute={() => compute('n')}
                    isComputed={computedField === 'n'}
                    t={t}
                    placeholder={t('tvm_n_label')} 
                />
                <TVMRow 
                    label="I/Y" 
                    field="iy" 
                    value={iy} 
                    onInputChange={v => handleInputChange(setIy, v)}
                    onCompute={() => compute('iy')}
                    isComputed={computedField === 'iy'}
                    t={t}
                    placeholder={t('tvm_iy_label')} 
                />
                <TVMRow 
                    label="PV" 
                    field="pv" 
                    value={pv} 
                    onInputChange={v => handleInputChange(setPv, v)}
                    onCompute={() => compute('pv')}
                    onSuffixClick={() => handleSuffixClick('pv')}
                    isComputed={computedField === 'pv'}
                    t={t}
                    placeholder={t('tvm_pv_label')} 
                    enableSuffix 
                />
                <TVMRow 
                    label="PMT" 
                    field="pmt" 
                    value={pmt} 
                    onInputChange={v => handleInputChange(setPmt, v)}
                    onCompute={() => compute('pmt')}
                    onSuffixClick={() => handleSuffixClick('pmt')}
                    isComputed={computedField === 'pmt'}
                    t={t}
                    placeholder={t('tvm_pmt_label')} 
                    enableSuffix 
                />
                <TVMRow 
                    label="FV" 
                    field="fv" 
                    value={fv} 
                    onInputChange={v => handleInputChange(setFv, v)}
                    onCompute={() => compute('fv')}
                    onSuffixClick={() => handleSuffixClick('fv')}
                    isComputed={computedField === 'fv'}
                    t={t}
                    placeholder={t('tvm_fv_label')} 
                    enableSuffix 
                />
            </div>
            
            <div className="mt-4 p-3 bg-amber-900/40 border border-amber-700 rounded-lg text-amber-200 text-xs flex items-start gap-2">
               <AlertCircle size={32} className="flex-shrink-0 mt-0.5" />
                <p>{t('tvm_cashflow_convention')}</p>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
                <button
                    onClick={clearAll}
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

export default TVMCalculator;