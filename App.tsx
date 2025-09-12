

import React, { useState, useEffect } from 'react';
import { Calculator } from 'lucide-react';
import { BigNumberProCalculator } from './components/ThomsonCalculator';
import { NotesView } from './components/NotesView';
import FinancialCalculator from './components/FinancialCalculator';
import { FinancialTranslationProvider } from './contexts/FinancialTranslationContext';
import { FinancialHistoryProvider } from './contexts/FinancialHistoryContext'; // New

type View = 'calculator' | 'financial' | 'notes';

const App: React.FC = () => {
  const [view, setView] = useState<View>('calculator');
  const [showSplash, setShowSplash] = useState(true);
  const [fadeout, setFadeout] = useState(false);

  useEffect(() => {
    // Start fade out after 2.5 seconds
    const fadeTimer = setTimeout(() => {
      setFadeout(true);
    }, 2500);

    // Remove splash screen from DOM after fade out is complete (2.5s + 0.5s)
    const hideTimer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []);


  const navigateTo = (targetView: View) => {
    setView(targetView);
  };

  const renderView = () => {
    switch (view) {
      case 'calculator':
        return <BigNumberProCalculator onNavigate={navigateTo} />;
      case 'financial':
        return (
          <FinancialTranslationProvider>
            <FinancialHistoryProvider>
              <FinancialCalculator onNavigate={navigateTo} />
            </FinancialHistoryProvider>
          </FinancialTranslationProvider>
        );
      case 'notes':
        return <NotesView onNavigate={navigateTo} />;
      default:
        return <BigNumberProCalculator onNavigate={navigateTo} />;
    }
  };

  if (showSplash) {
    return (
      <div 
        className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gray-900 text-white text-center transition-opacity duration-500 ease-in-out ${fadeout ? 'opacity-0' : 'opacity-100'}`} 
        aria-hidden="true"
      >
        <Calculator size={80} className="text-sky-400 mb-6 animate-pulse" />
        <h1 className="text-5xl font-bold text-yellow-300 tracking-wider">DZA</h1>
        <p className="text-2xl mt-4 text-slate-200">Calculator</p>
        <p className="text-lg text-slate-400">of</p>
        <p className="text-3xl font-semibold text-yellow-300 tracking-wide">SADAPA'A</p>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-900 flex flex-col overflow-hidden">
      <main className="flex-grow overflow-y-auto">
        {renderView()}
      </main>
    </div>
  );
};

export default App;