import React, { useState, useCallback } from 'react';
import { useFinancialHistory } from '../contexts/FinancialHistoryContext';
import { useFinancialTranslations } from '../contexts/FinancialTranslationContext';
import { Trash2, CornerDownLeft, ClipboardCopy } from 'lucide-react';

const HistoryCard: React.FC<{
    entry: ReturnType<typeof useFinancialHistory>['history'][0];
    onReuse: (id: number) => void;
    onDelete: (id: number) => void;
}> = ({ entry, onReuse, onDelete }) => {
    const { t } = useFinancialTranslations();
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = useCallback(async () => {
        const inputsText = entry.displayInputs.map(i => `${t(i.labelKey)}: ${i.value}${i.valueSuffixKey ? ' ' + t(i.valueSuffixKey) : ''}`).join('\n');
        const resultsText = entry.displayResults.map(r => `${t(r.labelKey, r.labelReplacements)}: ${r.value}`).join('\n');
        const textToCopy = `${t(entry.calculatorNameKey)}\n\n${t('history_inputs')}:\n${inputsText}\n\n${t('history_results')}:\n${resultsText}`;

        try {
            await navigator.clipboard.writeText(textToCopy);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy financial history entry:', err);
        }
    }, [entry, t]);


    return (
        <li className="p-3 bg-slate-700/80 rounded-lg text-sm transition-colors duration-200 hover:bg-slate-700">
            <div className="flex justify-between items-start mb-3">
                <div>
                    <h4 className="font-bold text-sky-300">{t(entry.calculatorNameKey)}</h4>
                    <p className="text-xs text-slate-400">{entry.timestamp}</p>
                </div>
                <button
                    onClick={() => onReuse(entry.id)}
                    className="px-3 py-1 bg-sky-600 hover:bg-sky-500 text-white text-xs rounded-md flex items-center gap-1.5"
                    aria-label={`Use scenario from ${t(entry.calculatorNameKey)}`}
                >
                    <CornerDownLeft size={14} /> {t('history_use_button')}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 mb-3">
                <div>
                    <p className="text-xs text-slate-400 font-semibold mb-1 border-b border-slate-600 pb-1">{t('history_inputs')}</p>
                    <ul className="space-y-1 text-xs">
                        {entry.displayInputs.map((input, i) => (
                            <li key={i} className="flex justify-between">
                                <span className="text-slate-300">{t(input.labelKey)}:</span>
                                <span className="font-mono text-slate-100">{input.value}{input.valueSuffixKey ? ` ${t(input.valueSuffixKey)}` : ''}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                <div>
                    <p className="text-xs text-slate-400 font-semibold mb-1 border-b border-slate-600 pb-1">{t('history_results')}</p>
                    <ul className="space-y-1 text-xs">
                        {entry.displayResults.map((res, i) => (
                             <li key={i} className={`flex flex-col items-end ${res.isPrimary ? 'p-2 bg-slate-800/50 rounded-md' : ''}`}>
                                <div className="w-full flex justify-between items-start">
                                    <span className={`text-slate-300 ${res.isPrimary ? 'font-bold' : ''}`}>{t(res.labelKey, res.labelReplacements)}:</span>
                                    <span className={`font-mono text-base ${res.isPrimary ? 'font-bold text-green-400' : 'text-slate-100'}`}>{res.value}</span>
                                </div>
                                {res.words && <div className="w-full text-right text-yellow-300 italic text-[0.7rem] leading-tight">{res.words}</div>}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
             <div className="mt-3 flex justify-end space-x-2">
                <button
                    onClick={handleCopy}
                    className={`px-3 py-1 text-xs rounded flex items-center gap-1.5 transition-colors duration-150 ${
                        isCopied
                            ? 'bg-green-600 hover:bg-green-500 text-white'
                            : 'bg-sky-700 hover:bg-sky-600 text-white'
                    }`}
                    aria-label={t('history_copy_button')}
                >
                    <ClipboardCopy size={12} />
                    <span>{isCopied ? t('history_copied_button') : t('history_copy_button')}</span>
                </button>
                <button
                    onClick={() => onDelete(entry.id)}
                    className="px-3 py-1 text-xs bg-red-600 hover:bg-red-500 text-white rounded flex items-center gap-1.5"
                    aria-label={t('history_delete_button')}
                >
                    <Trash2 size={12} />
                    <span>{t('history_delete_button')}</span>
                </button>
            </div>
        </li>
    );
};

export const FinancialHistoryView: React.FC = () => {
    const { history, clearHistory, reuseEntry, deleteHistoryEntry } = useFinancialHistory();
    const { t } = useFinancialTranslations();

    return (
        <div className="bg-slate-800 p-4 pb-8 rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-amber-300">{t('history_title')}</h3>
                {history.length > 0 && (
                    <button
                        onClick={clearHistory}
                        className="px-3 py-1.5 bg-red-700 hover:bg-red-600 text-white text-xs rounded-md flex items-center gap-1.5"
                        aria-label={t('history_clear_button')}
                    >
                        <Trash2 size={14} /> {t('common_clear_all')}
                    </button>
                )}
            </div>

            {history.length === 0 ? (
                <p className="text-slate-400 italic text-center py-4">{t('history_empty')}</p>
            ) : (
                <ul className="space-y-3">
                    {history.map(entry => (
                        <HistoryCard key={entry.id} entry={entry} onReuse={reuseEntry} onDelete={deleteHistoryEntry} />
                    ))}
                </ul>
            )}
        </div>
    );
};