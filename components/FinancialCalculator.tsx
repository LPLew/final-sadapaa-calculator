
import React, { useState } from 'react';
import { Landmark, ArrowLeft, Coins, Percent, Calendar, TrendingUp, Sunrise, Scale, Tag, Gauge, Languages } from 'lucide-react';
import LoanCalculator from './LoanCalculator';
import ROICalculator from './ROICalculator';
import TVMCalculator from './TVMCalculator';
import CompoundInterestCalculator from './CompoundInterestCalculator';
import RetirementSavingsCalculator from './RetirementSavingsCalculator';
import BreakEvenCalculator from './BreakEvenCalculator';
import MarginMarkupCalculator from './MarginMarkupCalculator';
import InflationCalculator from './InflationCalculator';
import { useFinancialTranslations } from '../contexts/FinancialTranslationContext';
import { financialLanguageOptions } from '../utils/financial-translations';

type FinancialView = 'menu' | 'loan' | 'roi' | 'tvm' | 'compound' | 'retirement' | 'breakeven' | 'margin' | 'inflation';

interface FinancialCalculatorProps {
  onNavigate: (view: 'calculator') => void;
}

const LanguageSelector: React.FC = () => {
  const { language, setLanguage, t } = useFinancialTranslations();

  return (
    <div className="mb-6">
      <label htmlFor="financial-language-selector" className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-1">
        <Languages size={16} />
        {t('hub_language_selector_label')}
      </label>
      <select
        id="financial-language-selector"
        value={language}
        onChange={(e) => setLanguage(e.target.value as any)}
        className="w-full h-11 px-3 bg-slate-700 border-2 border-slate-600 rounded-md focus:ring-sky-500 focus:border-sky-500 text-base text-white"
        aria-label="Select language for financial calculators"
      >
        {financialLanguageOptions.map(opt => (
          <option key={opt.code} value={opt.code}>{opt.name}</option>
        ))}
      </select>
    </div>
  );
};

const FinancialCalculator: React.FC<FinancialCalculatorProps> = ({ onNavigate }) => {
  const [view, setView] = useState<FinancialView>('menu');
  const { t } = useFinancialTranslations();

  const menuItems = [
    {
      section: t('hub_section_investment'),
      color: 'sky',
      items: [
        { view: 'compound' as FinancialView, icon: TrendingUp, title: t('compound_title'), subtitle: t('compound_subtitle'), color: 'green' },
        { view: 'roi' as FinancialView, icon: Percent, title: t('roi_title'), subtitle: t('roi_subtitle'), color: 'green' },
        { view: 'retirement' as FinancialView, icon: Sunrise, title: t('retirement_title'), subtitle: t('retirement_subtitle'), color: 'green' },
      ]
    },
    {
      section: t('hub_section_business'),
      color: 'teal',
      items: [
        { view: 'breakeven' as FinancialView, icon: Scale, title: t('breakeven_title'), subtitle: t('breakeven_subtitle'), color: 'teal' },
        { view: 'margin' as FinancialView, icon: Tag, title: t('margin_title'), subtitle: t('margin_subtitle'), color: 'teal' },
      ]
    },
    {
      section: t('hub_section_personal'),
      color: 'purple',
      items: [
        { view: 'loan' as FinancialView, icon: Coins, title: t('loan_title'), subtitle: t('loan_subtitle'), color: 'purple' },
        { view: 'tvm' as FinancialView, icon: Calendar, title: t('tvm_title'), subtitle: t('tvm_subtitle'), color: 'purple' },
        { view: 'inflation' as FinancialView, icon: Gauge, title: t('inflation_title'), subtitle: t('inflation_subtitle'), color: 'purple' },
      ]
    }
  ];

  const renderView = () => {
    switch(view) {
      case 'loan': return <LoanCalculator />;
      case 'roi': return <ROICalculator />;
      case 'tvm': return <TVMCalculator />;
      case 'compound': return <CompoundInterestCalculator />;
      case 'retirement': return <RetirementSavingsCalculator />;
      case 'breakeven': return <BreakEvenCalculator />;
      case 'margin': return <MarginMarkupCalculator />;
      case 'inflation': return <InflationCalculator />;
      case 'menu':
      default:
        return (
          <>
            <div className="text-center mb-8">
              <Landmark className="mx-auto text-sky-400 mb-2" size={40} />
              <h1 className="text-2xl font-bold text-white">{t('hub_title')}</h1>
              <p className="text-sm text-slate-400">{t('hub_subtitle')}</p>
            </div>
            <div className="space-y-4">
              {menuItems.map(menuSection => (
                <div key={menuSection.section} className={`p-3 bg-slate-800/50 border border-slate-700 rounded-lg`}>
                  <h3 className={`text-xs font-semibold uppercase text-${menuSection.color}-400 mb-2 pl-1`}>{menuSection.section}</h3>
                  <div className="space-y-2">
                    {menuSection.items.map(item => (
                       <button key={item.view} onClick={() => setView(item.view)} className={`w-full flex items-center gap-4 p-3 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-${item.color}-500`}>
                        <div className={`p-3 bg-${item.color}-600 rounded-md`}><item.icon size={24} className="text-white" /></div>
                        <div>
                          <h2 className="text-lg font-semibold text-left text-white">{item.title}</h2>
                          <p className="text-sm text-left text-slate-400">{item.subtitle}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        );
    }
  };

  return (
     <div className="p-4 sm:p-6 bg-gray-900 text-white h-full overflow-y-auto">
      <div className="max-w-md mx-auto">
        <div className="relative">
          <button
              onClick={() => {
                  if (view === 'menu') {
                      onNavigate('calculator');
                  } else {
                      setView('menu');
                  }
              }}
              className="absolute -top-2 -left-2 sm:-left-4 flex items-center gap-2 text-sky-400 hover:text-sky-300 z-10 p-2"
              aria-label={view === 'menu' ? t('hub_back_to_calc') : t('hub_back_to_menu')}
            >
              <ArrowLeft size={20} />
              <span>{view === 'menu' ? t('hub_back_to_calc') : t('hub_back_to_menu')}</span>
          </button>
          
          <div className="pt-12">
            <LanguageSelector />
            {renderView()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialCalculator;
