import { LanguageCode } from '../types';

type TranslationMap = { [key: string]: string };

export const translations: { [key in LanguageCode]?: TranslationMap } = {
  en: {
    // Common
    'common_results': 'Results',
    'common_clear_all': 'Clear All',
    'common_eg': 'e.g.,',
    'common_error_invalid_number': 'Calculation resulted in an invalid number. Please check your inputs.',
    
    // Financial Hub
    'hub_title': 'Financial Calculators',
    'hub_subtitle': 'Tools for loans, investments, business, and personal finance.',
    'hub_section_investment': 'Investment & Growth',
    'hub_section_business': 'Business & Profitability',
    'hub_section_personal': 'Loans & Personal Finance',
    'hub_back_to_calc': 'Back to Calculator',
    'hub_back_to_menu': 'Back to Menu',
    'hub_language_selector_label': 'Language',
    
    // Loan Calculator
    'loan_title': 'Loan Calculator',
    'loan_subtitle': 'Estimate your monthly loan payments.',
    'loan_amount_label': 'Loan Amount',
    'loan_rate_label': 'Annual Interest Rate',
    'loan_term_label': 'Loan Term',
    'loan_years_label': 'years',
    'loan_monthly_payment': 'Monthly Payment',
    'loan_principal_legend': 'Principal',
    'loan_interest_legend': 'Interest',
    'loan_total_principal': 'Total Principal',
    'loan_total_interest': 'Total Interest',
    'loan_total_payment': 'Total Payment',
    
    // ROI Calculator
    'roi_title': 'Return on Investment (ROI)',
    'roi_subtitle': 'Calculate the profitability of an investment.',
    'roi_initial_investment': 'Initial Investment',
    'roi_final_value': 'Final Value of Investment',
    'roi_net_profit': 'Net Profit',
    'roi_return_on_investment': 'Return on Investment (ROI)',
    'roi_error_initial_zero': 'Initial Investment cannot be zero.',
    
    // TVM Calculator
    'tvm_title': 'TVM Calculator',
    'tvm_subtitle': 'The core financial engine.',
    'tvm_n_label': 'Number of Periods',
    'tvm_iy_label': 'Interest per Period (%)',
    'tvm_pv_label': 'Present Value',
    'tvm_pmt_label': 'Payment',
    'tvm_fv_label': 'Future Value',
    'tvm_cpt_button': 'CPT',
    'tvm_cashflow_convention': 'Cashflow Convention: Money you receive (e.g., a loan) should be a positive number. Money you pay out (e.g., payments) should be a negative number.',
    'tvm_error_args': 'Invalid arguments for',
    
    // Compound Interest
    'compound_title': 'Compound Interest',
    'compound_subtitle': 'Project your investment growth over time.',
    'compound_principal': 'Initial Principal',
    'compound_monthly_contrib': 'Monthly Contribution',
    'compound_annual_rate': 'Annual Rate (%)',
    'compound_years': 'Years to Grow',
    'compound_frequency': 'Compounding Frequency',
    'compound_monthly': 'Monthly',
    'compound_quarterly': 'Quarterly',
    'compound_semiannually': 'Semi-Annually',
    'compound_annually': 'Annually',
    'compound_future_value': 'Future Investment Value',
    'compound_total_principal': 'Total Principal',
    'compound_total_interest': 'Total Interest Earned',
    
    // Retirement
    'retirement_title': 'Retirement Savings',
    'retirement_subtitle': 'Project your nest egg and potential income.',
    'retirement_current_age': 'Current Age',
    'retirement_retirement_age': 'Retirement Age',
    'retirement_current_savings': 'Current Savings',
    'retirement_annual_return': 'Annual Return (%)',
    'retirement_withdrawal_rate': 'Withdrawal (%)',
    'retirement_outlook_title': 'Retirement Outlook',
    'retirement_nest_egg': 'Projected Nest Egg at Retirement',
    'retirement_monthly_income': 'Sustainable Monthly Income',
    'retirement_withdrawal_rate_info': 'Based on a {rate}% annual withdrawal rate.',
    
    // Break-Even
    'breakeven_title': 'Break-Even Point',
    'breakeven_subtitle': 'Find the point where revenue equals costs.',
    'breakeven_fixed_costs': 'Total Fixed Costs',
    'breakeven_variable_cost': 'Variable Cost Per Unit',
    'breakeven_price_per_unit': 'Sale Price Per Unit',
    'breakeven_units_to_sell': 'Units to Sell',
    'breakeven_revenue_to_generate': 'Revenue to Generate',
    'breakeven_error_margin': 'Price per unit must be greater than variable cost per unit.',
    
    // Margin & Markup
    'margin_title': 'Margin & Markup',
    'margin_subtitle': 'Interactively calculate pricing and profit.',
    'margin_instruction': 'Enter any two values to calculate the others. Cost is the primary driver.',
    'margin_cost': 'Cost of Goods',
    'margin_price': 'Selling Price',
    'margin_margin': 'Gross Margin (%)',
    'margin_markup': 'Markup (%)',
    'margin_profit': 'Gross Profit',
    'margin_error_negative_profit': 'Selling price is less than cost.',
    
    // Inflation
    'inflation_title': 'Inflation Calculator',
    'inflation_subtitle': 'Understand the future value of money.',
    'inflation_amount': 'Amount',
    'inflation_rate': 'Inflation Rate (%)',
    'inflation_years': 'Number of Years',
    'inflation_future_value': 'Value in {years} Years',
    'inflation_future_value_desc': 'An item costing {amount} today would cost this much.',
    'inflation_purchasing_power': 'Purchasing Power in {years} Years',
    'inflation_purchasing_power_desc': '{amount} today would be worth this much.',
    
    // History
    'history_title': 'Calculation History',
    'history_empty': 'No saved calculations yet.',
    'history_save_button': 'Save',
    'history_use_button': 'Use',
    'history_copy_button': 'Copy',
    'history_copied_button': 'Copied!',
    'history_delete_button': 'Delete',
    'history_clear_button': 'Clear All',
    'history_inputs': 'Inputs',
    'history_results': 'Results',
  },
  
  ms: {
    // Common
    'common_results': 'Keputusan',
    'common_clear_all': 'Kosongkan Semua',
    'common_eg': 'cth.,',
    'common_error_invalid_number': 'Pengiraan menghasilkan nombor yang tidak sah. Sila semak input anda.',
    
    // Financial Hub
    'hub_title': 'Kalkulator Kewangan',
    'hub_subtitle': 'Alat untuk pinjaman, pelaburan, perniagaan, dan kewangan peribadi.',
    'hub_section_investment': 'Pelaburan & Pertumbuhan',
    'hub_section_business': 'Perniagaan & Keuntungan',
    'hub_section_personal': 'Pinjaman & Kewangan Peribadi',
    'hub_back_to_calc': 'Kembali ke Kalkulator',
    'hub_back_to_menu': 'Kembali ke Menu',
    'hub_language_selector_label': 'Bahasa',
    
    // Loan Calculator
    'loan_title': 'Kalkulator Pinjaman',
    'loan_subtitle': 'Anggarkan bayaran bulanan pinjaman anda.',
    'loan_amount_label': 'Jumlah Pinjaman',
    'loan_rate_label': 'Kadar Faedah Tahunan',
    'loan_term_label': 'Tempoh Pinjaman',
    'loan_years_label': 'tahun',
    'loan_monthly_payment': 'Bayaran Bulanan',
    'loan_principal_legend': 'Prinsipal',
    'loan_interest_legend': 'Faedah',
    'loan_total_principal': 'Jumlah Prinsipal',
    'loan_total_interest': 'Jumlah Faedah',
    'loan_total_payment': 'Jumlah Bayaran',
    
    // ROI Calculator
    'roi_title': 'Pulangan Pelaburan (ROI)',
    'roi_subtitle': 'Kira keuntungan sesuatu pelaburan.',
    'roi_initial_investment': 'Pelaburan Awal',
    'roi_final_value': 'Nilai Akhir Pelaburan',
    'roi_net_profit': 'Keuntungan Bersih',
    'roi_return_on_investment': 'Pulangan Pelaburan (ROI)',
    'roi_error_initial_zero': 'Pelaburan Awal tidak boleh sifar.',
    
    // History
    'history_title': 'Sejarah Pengiraan',
    'history_empty': 'Tiada pengiraan yang disimpan lagi.',
    'history_save_button': 'Simpan',
    'history_use_button': 'Guna',
    'history_copy_button': 'Salin',
    'history_copied_button': 'Disalin!',
    'history_delete_button': 'Padam',
    'history_clear_button': 'Kosongkan Semua',
    'history_inputs': 'Input',
    'history_results': 'Keputusan',
  }
};

export const financialLanguageOptions = [
  { code: 'en' as LanguageCode, name: 'English' },
  { code: 'ms' as LanguageCode, name: 'Bahasa Malaysia' },
  { code: 'zh-CN' as LanguageCode, name: '中文 (简体)' },
  { code: 'es' as LanguageCode, name: 'Español' },
  { code: 'fr' as LanguageCode, name: 'Français' },
  { code: 'de' as LanguageCode, name: 'Deutsch' },
  { code: 'ar' as LanguageCode, name: 'العربية' },
  { code: 'hi' as LanguageCode, name: 'हिन्दी' },
  { code: 'vi' as LanguageCode, name: 'Tiếng Việt' },
  { code: 'ko' as LanguageCode, name: '한국어' },
  { code: 'pt' as LanguageCode, name: 'Português' },
  { code: 'th' as LanguageCode, name: 'ไทย' },
  { code: 'it' as LanguageCode, name: 'Italiano' },
  { code: 'ja' as LanguageCode, name: '日本語' },
];