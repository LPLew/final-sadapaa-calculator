

// This utility file centralizes all number-to-word conversion functions
// to be used across the application, preventing code duplication.

const handleBigInt = (numInput: number) => {
    let numStrFull = Math.abs(numInput).toString();
     if (numStrFull.includes('e')) {
        const num = Math.abs(numInput);
        if (num < 1.0e-15 && num !== 0) {
            numStrFull = num.toFixed(20).replace(/\.?0+$/, "");
        } else if (num >= 1.0e+21) {
            numStrFull = num.toLocaleString('en-US', {useGrouping:false, notation: 'standard', maximumFractionDigits: 0});
        } else {
            numStrFull = num.toLocaleString('en-US', {useGrouping:false, notation: 'standard', maximumFractionDigits: 20});
        }
        if (numStrFull.includes('.') && parseFloat(numStrFull) % 1 === 0) {
            numStrFull = numStrFull.split('.')[0];
        }
    }
    return numStrFull;
}

const getDecimalWords = (decimalPartStr: string, ones: string[], pointWord: string) => {
    if (decimalPartStr && decimalPartStr.length > 0) {
        const cleanDecimalDigits = decimalPartStr.replace(/[^0-9]/g, '');
        if (cleanDecimalDigits.length > 0) {
            return ` ${pointWord} ` + cleanDecimalDigits.split('')
                .map(digit => digit === '0' ? (ones[0] || 'Zero') : ones[parseInt(digit)])
                .filter(Boolean)
                .join(' ');
        }
    }
    return '';
}

export const numberToWordsEnglish = (numInput: number): string => {
    if (numInput === 0) return 'Zero';
    if (isNaN(numInput)) return 'Invalid Number';
    if (!isFinite(numInput)) return numInput > 0 ? 'Infinity' : 'Negative Infinity';

    let prefix = '';
    if (numInput < 0) {
      prefix = 'Negative ';
    }
    const numStrFull = handleBigInt(numInput);
    
    const ones: string[] = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const teens: string[] = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tensArr: string[] = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const scales: string[] = ['', 'Thousand', 'Million', 'Billion', 'Trillion', 'Quadrillion', 'Quintillion', 'Sextillion', 'Septillion', 'Octillion', 'Nonillion', 'Decillion', 'Undecillion', 'Duodecillion', 'Tredecillion', 'Quattuordecillion', 'Quindecillion', 'Sexdecillion', 'Septendecillion', 'Octodecillion', 'Novemdecillion', 'Vigintillion'];

    const convertHundreds = (n: number): string => {
      let words = '';
      if (n >= 100) {
          words += ones[Math.floor(n / 100)] + ' Hundred';
          n %= 100;
          if (n > 0) words += ' ';
      }
      if (n === 0 && words !== '') return words.trim();

      if (n >= 20) {
          words += tensArr[Math.floor(n / 10)];
          if (n % 10 > 0) {
              words += (words.endsWith('Hundred') ? ' ' : (words ? '-' : '')) + ones[n % 10];
          }
      } else if (n >= 10) {
          words += (words.endsWith('Hundred') ? ' ' : (words ? ' ' : '')) + teens[n - 10];
      } else if (n > 0) {
          words += (words.endsWith('Hundred') ? ' ' : (words ? ' ' : '')) + ones[n];
      }
      return words.trim();
    };

    const [integerPartStr, decimalPartStr] = numStrFull.split('.');

    let integerWords = '';
    if (integerPartStr === '0') {
        integerWords = 'Zero';
    } else if (integerPartStr) {
        if (integerPartStr.length > 66) { 
            return prefix + "Number too large for words";
        }

        let result = '';
        let scaleIndex = 0;
        let tempNumStr = integerPartStr;

        while (tempNumStr.length > 0 && scaleIndex < scales.length) {
            const chunkLength = Math.min(3, tempNumStr.length);
            const chunkStrVal = tempNumStr.substring(tempNumStr.length - chunkLength);
            tempNumStr = tempNumStr.substring(0, tempNumStr.length - chunkLength);
            const chunkNum = parseInt(chunkStrVal);

            if (chunkNum > 0) {
                const chunkWordsPart = convertHundreds(chunkNum);
                result = chunkWordsPart + (scales[scaleIndex] ? ' ' + scales[scaleIndex] : '') + (result ? ' ' + result : '');
            }
            scaleIndex++;
        }
        if (tempNumStr.length > 0 && scaleIndex >= scales.length) {
            return prefix + "Number too large for words";
        }
        integerWords = result.trim();
    } else {
        integerWords = 'Zero';
    }

    const pointAndDecimalWords = getDecimalWords(decimalPartStr, ['Zero',...ones.slice(1)], 'point');

    if (integerWords === "" && Math.abs(numInput) < 1) integerWords = "Zero";

    return prefix + integerWords + pointAndDecimalWords;
};

export const numberToWordsMalay = (numInput: number): string => {
    if (numInput === 0) return 'Sifar';
    if (isNaN(numInput)) return 'Nombor Tidak Sah';
    if (!isFinite(numInput)) return numInput > 0 ? 'Infiniti' : 'Negatif Infiniti';

    let prefix = '';
    if (numInput < 0) {
        prefix = 'Negatif ';
    }
    const numStrFull = handleBigInt(numInput);

    const units = ['', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'lapan', 'sembilan'];
    const belas = ['sepuluh', 'sebelas', 'dua belas', 'tiga belas', 'empat belas', 'lima belas', 'enam belas', 'tujuh belas', 'lapan belas', 'sembilan belas'];
    const puluh = ['', 'sepuluh', 'dua puluh', 'tiga puluh', 'empat puluh', 'lima puluh', 'enam puluh', 'tujuh puluh', 'lapan puluh', 'sembilan puluh'];
    const scales = ['', 'ribu', 'juta', 'bilion', 'trilion', 'kuadrilion', 'kuintilion', 'sekstilion'];

    const convertThreeDigits = (n: number): string => {
        if (n === 0) return '';
        let s = '';
        if (n >= 100) {
            const h = Math.floor(n / 100);
            s += (h === 1 ? 'seratus' : units[h] + ' ratus');
            n %= 100;
            if (n > 0) s += ' ';
        }
        if (n === 0) return s;

        if (n < 10) {
            s += units[n];
        } else if (n < 20) {
            s += belas[n - 10];
        } else {
            const t = Math.floor(n / 10);
            const u = n % 10;
            s += puluh[t];
            if (u > 0) s += ' ' + units[u];
        }
        return s.trim();
    };

    const [integerPartStr, decimalPartStr] = numStrFull.split('.');
    
    let integerWords = '';
    if (integerPartStr === '0') {
      integerWords = 'Sifar';
    } else {
        let tempNumStr = integerPartStr;
        let scaleIndex = 0;
        let result = '';
        while (tempNumStr.length > 0) {
            const chunk = parseInt(tempNumStr.slice(-3));
            tempNumStr = tempNumStr.slice(0, -3);
            if (chunk > 0) {
                const chunkWords = convertThreeDigits(chunk);
                const scaleWord = scales[scaleIndex] || '';
                result = `${chunkWords} ${scaleWord} ${result}`.trim();
            }
            scaleIndex++;
        }
        integerWords = result.trim();
    }
    
    const pointAndDecimalWords = getDecimalWords(decimalPartStr, ['sifar',...units.slice(1)], 'per puluhan');
    if (integerWords === "" && Math.abs(numInput) < 1) integerWords = "Sifar";

    return prefix + integerWords + pointAndDecimalWords;
};

export const numberToWordsChinese = (numInput: number): string => {
    if (numInput === 0) return '零';
    if (isNaN(numInput)) return '无效数字';
    if (!isFinite(numInput)) return numInput > 0 ? '正无穷' : '负无穷';

    const prefix = numInput < 0 ? '负 ' : '';
    const numStr = handleBigInt(numInput);
    const [integerPart, decimalPart] = numStr.split('.');

    const digits = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
    const units = ['', '十', '百', '千'];
    const groups = ['', '万', '亿', '兆', '京', '垓', '秭', '穰', '沟', '涧', '正', '载'];

    const convertIntChunk = (chunk: string): string => {
        let result = '';
        let zeroFlag = false;
        for (let i = 0; i < chunk.length; i++) {
            const digit = parseInt(chunk[i]);
            const unit = units[chunk.length - 1 - i];
            if (digit === 0) {
                zeroFlag = true;
            } else {
                if (zeroFlag) {
                    result += '零';
                    zeroFlag = false;
                }
                result += (digit === 1 && unit === '十' && chunk.length === 2 && i === 0) ? unit : digits[digit] + unit;
            }
        }
        return result;
    };

    const convertInt = (intStr: string): string => {
        if (intStr === '0') return '零';
        let result = '';
        let groupIndex = 0;
        while (intStr.length > 0) {
            const chunk = intStr.length > 4 ? intStr.slice(-4) : intStr;
            intStr = intStr.slice(0, -chunk.length);
            const chunkWords = convertIntChunk(chunk);
            if (chunkWords) {
                result = chunkWords + groups[groupIndex] + result;
            } else if (result && !result.startsWith('零')) {
                 result = '零' + result;
            }
            groupIndex++;
        }
        return result.replace(/零$/, '').replace(/零零+/g, '零');
    };
    
    let integerWords = convertInt(integerPart);
    let decimalWords = '';
    if (decimalPart) {
        decimalWords = '点' + decimalPart.split('').map(d => digits[parseInt(d)]).join('');
    }

    if (integerWords === "" && Math.abs(numInput) < 1) integerWords = "零";

    return prefix + integerWords + decimalWords;
};

export const numberToWordsChineseTraditional = (numInput: number): string => {
    return numberToWordsChinese(numInput)
        .replace(/万/g, '萬')
        .replace(/亿/g, '億')
        .replace(/兆/g, '兆');
};

const spanishNumberConverter = (isPortuguese: boolean) => (numInput: number): string => {
    const zero = isPortuguese ? 'Zero' : 'Cero';
    if (numInput === 0) return zero;
    if (isNaN(numInput)) return isPortuguese ? 'Número Inválido' : 'Número Inválido';
    if (!isFinite(numInput)) return numInput > 0 ? 'Infinito' : (isPortuguese ? 'Infinito Negativo' : 'Infinito Negativo');

    const prefix = numInput < 0 ? (isPortuguese ? 'Menos ' : 'Menos ') : '';
    const numStrFull = handleBigInt(numInput);
    const [integerPartStr, decimalPartStr] = numStrFull.split('.');
    
    const ones = isPortuguese
        ? ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove']
        : ['', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve'];
    const teens = isPortuguese
        ? ['dez', 'onze', 'doze', 'treze', 'catorze', 'quinze', 'dezasseis', 'dezassete', 'dezoito', 'dezanove']
        : ['diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve'];
    const tens = isPortuguese
        ? ['', 'dez', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa']
        : ['', 'diez', 'veinte', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];
    const hundreds = isPortuguese
        ? ['', 'cem', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos']
        : ['', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos', 'seiscientos', 'setecientos', 'ochocientos', 'novecientos'];
    const scales = ['', 'mil', 'milhão', 'bilião', 'trilião']; // Portuguese uses long scale
    const spanishScales = ['', 'mil', 'millón', 'billón', 'trillón'];

    const convertChunk = (n: number) => {
        if (n === 0) return '';
        if (n === 100) return isPortuguese ? 'cem' : 'cien';
        let words = '';
        if (n >= 100) {
            words += hundreds[Math.floor(n / 100)] + ' ';
            n %= 100;
        }
        if (n >= 20) {
            words += tens[Math.floor(n / 10)];
            if (n % 10 > 0) words += (isPortuguese ? ' e ' : ' y ') + ones[n % 10];
        } else if (n >= 10) {
            words += teens[n - 10];
        } else if (n > 0) {
            words += ones[n];
        }
        return words.trim();
    };

    let integerWords = '';
    if (integerPartStr === '0') {
        integerWords = zero;
    } else {
        let tempStr = integerPartStr;
        let scaleIndex = 0;
        let result: string[] = [];
        const currentScales = isPortuguese ? scales : spanishScales;
        while(tempStr.length > 0) {
            const chunkStr = tempStr.slice(-3);
            tempStr = tempStr.slice(0, -3);
            const chunkNum = parseInt(chunkStr);
            if (chunkNum > 0) {
                const chunkWords = convertChunk(chunkNum);
                const scaleWord = currentScales[scaleIndex];
                if (scaleWord) {
                    if(chunkNum === 1 && scaleIndex > 1) { // un millón, not uno millón
                        result.unshift(`un ${scaleWord}`);
                    } else if (scaleWord === 'mil' && chunkNum === 1) {
                        result.unshift(scaleWord);
                    } else {
                         result.unshift(`${chunkWords} ${scaleWord}${chunkNum > 1 && scaleIndex > 1 ? (isPortuguese ? 'ões' : 'es') : ''}`);
                    }
                } else {
                    result.unshift(chunkWords);
                }
            }
            scaleIndex++;
        }
        integerWords = result.join(' ').replace('uno mil', 'un mil');
    }

    const pointWord = isPortuguese ? 'vírgula' : 'punto';
    const decimalWords = getDecimalWords(decimalPartStr, isPortuguese ? ['zero',...ones.slice(1)] : [zero, ...ones.slice(1)], pointWord);

    if (integerWords === "" && Math.abs(numInput) < 1) integerWords = zero;
    
    return prefix + integerWords + decimalWords;
};

export const numberToWordsSpanish = spanishNumberConverter(false);
export const numberToWordsPortuguese = spanishNumberConverter(true);

export const numberToWordsFrench = (numInput: number): string => {
    if (numInput === 0) return 'Zéro';
    if (isNaN(numInput)) return 'Nombre Invalide';
    if (!isFinite(numInput)) return numInput > 0 ? 'Infini' : 'Infini Négatif';

    const prefix = numInput < 0 ? 'Moins ' : '';
    const numStrFull = handleBigInt(numInput);
    const [integerPartStr, decimalPartStr] = numStrFull.split('.');
    
    const ones = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf'];
    const teens = ['dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
    const tens = ['', 'dix', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante'];
    const scales = ['', 'mille', 'million', 'milliard', 'billion', 'billiard'];

    const convertChunk = (n: number) => {
        if (n === 0) return '';
        if (n > 999) return "Error";
        let words = '';
        if (n >= 100) {
            words += (n >= 200 ? ones[Math.floor(n / 100)] + ' ' : '') + 'cent' + (n % 100 === 0 ? 's' : ' ');
            n %= 100;
        }
        if (n >= 80) {
            words += 'quatre-vingt' + (n === 80 ? 's' : '-' + teens[n - 80]);
        } else if (n >= 70) {
            words += 'soixante-' + teens[n - 60];
        } else if (n >= 60) {
            words += 'soixante' + (n % 10 > 0 ? (n % 10 === 1 ? ' et ' : '-') + ones[n % 10] : '');
        } else if (n > 19) {
            words += tens[Math.floor(n / 10)] + (n % 10 > 0 ? (n % 10 === 1 ? ' et ' : '-') + ones[n % 10] : '');
        } else if (n >= 10) {
            words += teens[n - 10];
        } else {
            words += ones[n];
        }
        return words;
    };
    
    let integerWords = '';
    if (integerPartStr === '0') {
        integerWords = 'zéro';
    } else {
        let tempStr = integerPartStr;
        let scaleIndex = 0;
        let result: string[] = [];
        while (tempStr.length > 0) {
            const chunkStr = tempStr.slice(-3);
            tempStr = tempStr.slice(0, -3);
            const chunkNum = parseInt(chunkStr);
            if (chunkNum > 0) {
                const chunkWords = convertChunk(chunkNum);
                const scaleWord = scales[scaleIndex];
                if (scaleWord) {
                    if (scaleWord === 'mille' && chunkNum === 1) {
                         result.unshift(scaleWord);
                    } else {
                        result.unshift(`${chunkWords} ${scaleWord}${chunkNum > 1 && scaleIndex > 1 ? 's' : ''}`);
                    }
                } else {
                    result.unshift(chunkWords);
                }
            }
            scaleIndex++;
        }
        integerWords = result.join(' ').replace(/\s-/g, '-').trim();
    }
    
    const decimalWords = getDecimalWords(decimalPartStr, ['zéro', ...ones.slice(1)], 'virgule');
    if (integerWords === "" && Math.abs(numInput) < 1) integerWords = "zéro";

    return prefix + integerWords + decimalWords;
};

export const numberToWordsGerman = (numInput: number): string => {
    if (numInput === 0) return 'Null';
    if (isNaN(numInput)) return 'Ungültige Nummer';
    if (!isFinite(numInput)) return numInput > 0 ? 'Unendlich' : 'Negativ Unendlich';

    const prefix = numInput < 0 ? 'Minus ' : '';
    const numStrFull = handleBigInt(numInput);
    const [integerPartStr, decimalPartStr] = numStrFull.split('.');
    
    const ones = ['', 'ein', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun'];
    const teens = ['zehn', 'elf', 'zwölf', 'dreizehn', 'vierzehn', 'fünfzehn', 'sechzehn', 'siebzehn', 'achtzehn', 'neunzehn'];
    const tens = ['', 'zehn', 'zwanzig', 'dreißig', 'vierzig', 'fünfzig', 'sechzig', 'siebzig', 'achtzig', 'neunzig'];
    const scales = ['', 'tausend', 'Million', 'Milliarde', 'Billion'];

    const convertChunk = (n: number) => {
        if (n === 0) return '';
        let words = '';
        if (n >= 100) {
            words += ones[Math.floor(n / 100)] + 'hundert';
            n %= 100;
        }
        if (n > 0) {
            if (n < 10) {
                words += ones[n];
            } else if (n < 20) {
                words += teens[n - 10];
            } else {
                const u = n % 10;
                const t = Math.floor(n / 10);
                words += (u > 0 ? ones[u] + 'und' : '') + tens[t];
            }
        }
        return words;
    };
    
    let integerWords = '';
    if (integerPartStr === '0') {
        integerWords = 'Null';
    } else {
        let tempStr = integerPartStr;
        let scaleIndex = 0;
        let result: string[] = [];
        while (tempStr.length > 0) {
            const chunkStr = tempStr.slice(-3);
            tempStr = tempStr.slice(0, -3);
            const chunkNum = parseInt(chunkStr);
            if (chunkNum > 0) {
                let chunkWords = convertChunk(chunkNum);
                const scaleWord = scales[scaleIndex];
                if (scaleWord) {
                     chunkWords = chunkWords.replace(/^ein$/, 'eine');
                     result.unshift(`${chunkWords} ${scaleWord}${chunkNum > 1 && scaleIndex > 1 ? 'en' : ''}`);
                } else {
                     result.unshift(chunkWords);
                }
            }
            scaleIndex++;
        }
        integerWords = result.join(' ').replace(/\s+/, ' ').trim();
    }
    
    const decimalWords = getDecimalWords(decimalPartStr, ['null', ...ones.slice(1)], 'Komma');
    if (integerWords === "" && Math.abs(numInput) < 1) integerWords = "Null";

    return prefix + integerWords + decimalWords;
};

export const numberToWordsArabic = (numInput: number): string => {
    if (numInput === 0) return 'صفر';
    if (isNaN(numInput)) return 'رقم غير صالح';
    if (!isFinite(numInput)) return numInput > 0 ? 'لانهاية' : 'لانهاية سالبة';
    
    const prefix = numInput < 0 ? 'سالب ' : '';
    const numStrFull = handleBigInt(numInput);
    const [integerPartStr, decimalPartStr] = numStrFull.split('.');
    
    const ones = ['', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة'];
    const teens = ['عشرة', 'أحد عشر', 'اثنا عشر', 'ثلاثة عشر', 'أربعة عشر', 'خمسة عشر', 'ستة عشر', 'سبعة عشر', 'ثمانية عشر', 'تسعة عشر'];
    const tens = ['', 'عشرة', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون'];
    const hundreds = ['', 'مئة', 'مئتان', 'ثلاثمئة', 'أربعمئة', 'خمسمئة', 'ستمئة', 'سبعمئة', 'ثمانمئة', 'تسعمئة'];
    const scales = ['', 'ألف', 'مليون', 'مليار', 'تريليون'];

    const convertChunk = (n: number) => {
        if (n === 0) return '';
        let words = '';
        if (n >= 100) {
            words += hundreds[Math.floor(n / 100)];
            n %= 100;
            if (n > 0) words += ' و ';
        }
        if (n > 0) {
            if (n < 10) {
                words += ones[n];
            } else if (n < 20) {
                words += teens[n - 10];
            } else {
                words += ones[n % 10];
                if(n % 10 > 0) words += ' و ';
                words += tens[Math.floor(n / 10)];
            }
        }
        return words;
    };
    
    let integerWords = '';
    if (integerPartStr === '0') {
        integerWords = 'صفر';
    } else {
        let tempStr = integerPartStr;
        let scaleIndex = 0;
        let result: string[] = [];
        while (tempStr.length > 0) {
            const chunkStr = tempStr.slice(-3);
            tempStr = tempStr.slice(0, -3);
            const chunkNum = parseInt(chunkStr);
            if (chunkNum > 0) {
                const scaleWord = scales[scaleIndex];
                let chunkWords = convertChunk(chunkNum);
                if(scaleWord){
                     if(chunkNum === 1) chunkWords = scaleWord;
                     else if (chunkNum === 2) chunkWords = scaleWord === 'ألف' ? 'ألفان' : scaleWord + 'ان';
                     else if(chunkNum >= 3 && chunkNum <= 10) chunkWords = chunkWords + ' ' + (scaleWord === 'ألف' ? 'آلاف' : scaleWord + 'ات');
                     else chunkWords = chunkWords + ' ' + scaleWord;
                }
                result.unshift(chunkWords);
            }
            scaleIndex++;
        }
        integerWords = result.join(' و ').trim();
    }
    
    const decimalWords = getDecimalWords(decimalPartStr, ['صفر', ...ones.slice(1)], 'فاصلة');
    if (integerWords === "" && Math.abs(numInput) < 1) integerWords = "صفر";
    
    return prefix + integerWords + decimalWords;
};

export const numberToWordsHindi = (numInput: number): string => {
    if (numInput === 0) return 'शून्य';
    if (isNaN(numInput)) return 'अमान्य संख्या';
    if (!isFinite(numInput)) return numInput > 0 ? 'अनंत' : 'ऋण अनंत';

    const prefix = numInput < 0 ? 'ऋण ' : '';
    const numStrFull = handleBigInt(numInput);
    const [integerPartStr, decimalPartStr] = numStrFull.split('.');

    const ones = ['शून्य', 'एक', 'दो', 'तीन', 'चार', 'पाँच', 'छह', 'सात', 'आठ', 'नौ'];
    const nums_1_99 = [
        "", "एक", "दो", "तीन", "चार", "पाँच", "छह", "सात", "आठ", "नौ", "दस",
        "ग्यारह", "बारह", "तेरह", "चौदह", "पंद्रह", "सोलह", "सत्रह", "अठारह", "उन्नीस", "बीस",
        "इक्कीस", "बाईस", "तेईस", "चौबीस", "पच्चीस", "छब्बीस", "सत्ताईस", "अट्ठाईस", "उनतीस", "तीस",
        "इकतीस", "बत्तीस", "तैंतीस", "चौंतीस", "पैंतीस", "छत्तीस", "सैंतीस", "अड़तीस", "उनतालीस", "चालीस",
        "इकतालीस", "बयालीस", "तैंतालीस", "चौवालीस", "पैंतालीस", "छियालीस", "सैंतालीस", "अड़तालीस", "उनचास", "पचास",
        "इक्यावन", "बावन", "तिरपन", "चौवन", "पचपन", "छप्पन", "सत्तावन", "अट्ठावन", "उनसठ", "साठ",
        "इकसठ", "बासठ", "तिरसठ", "चौंसठ", "पैंसठ", "छियासठ", "सड़सठ", "अड़सठ", "उनहत्तर", "सत्तर",
        "इकहत्तर", "बहत्तर", "तिहत्तर", "चौहत्तर", "पचहत्तर", "छिहत्तर", "सतहत्तर", "अठहत्तर", "उनासी", "अस्सी",
        "इक्यासी", "बयासी", "तिरासी", "चौरासी", "पचासी", "छियासी", "सतासी", "अठासी", "नवासी", "नब्बे",
        "इक्यानबे", "बानबे", "तिरानबे", "चौरानबे", "पंचानबे", "छियानबे", "सतानबे", "अट्ठानबे", "निन्यानबे"
    ];

    const convertLessThanHundred = (n: number): string => nums_1_99[n] || "";

    const convertLessThanThousand = (n: number): string => {
        if (n < 100) return convertLessThanHundred(n);
        let word = '';
        const hundred = Math.floor(n / 100);
        const remainder = n % 100;
        word += nums_1_99[hundred] + ' सौ';
        if (remainder > 0) {
            word += ' ' + convertLessThanHundred(remainder);
        }
        return word;
    }

    const convert = (nStr: string): string => {
        if (nStr === '0') return '';
        if (nStr.length > 15) return "बहुत बड़ी संख्या";

        let result = '';
        if (nStr.length > 7) {
            const crorePart = nStr.slice(0, -7);
            result += convert(crorePart) + ' करोड़ ';
            nStr = nStr.slice(-7);
        }
        if (nStr.length > 5) {
            const lakhPart = Number(nStr.slice(0, -5));
            if (lakhPart > 0) {
                result += convertLessThanHundred(lakhPart) + ' लाख ';
            }
            nStr = nStr.slice(-5);
        }
        if (nStr.length > 3) {
            const thousandPart = Number(nStr.slice(0, -3));
            if (thousandPart > 0) {
                result += convertLessThanHundred(thousandPart) + ' हज़ार ';
            }
            nStr = nStr.slice(-3);
        }
        const hundredPart = Number(nStr);
        if (hundredPart > 0) {
            result += convertLessThanThousand(hundredPart);
        }

        return result.trim();
    }

    const integerWords = integerPartStr === '0' ? 'शून्य' : convert(integerPartStr);
    const decimalWords = getDecimalWords(decimalPartStr, ones, ' दशमलव ');

    if (integerWords === 'शून्य' && decimalWords) {
        return prefix + 'शून्य' + decimalWords;
    }

    return prefix + integerWords + decimalWords;
};

export const numberToWordsItalian = (numInput: number): string => {
    if (numInput === 0) return 'Zero';
    if (isNaN(numInput)) return 'Numero non valido';
    if (!isFinite(numInput)) return numInput > 0 ? 'Infinito' : 'Infinito negativo';

    const prefix = numInput < 0 ? 'Meno ' : '';
    const numStrFull = handleBigInt(numInput);
    const [integerPartStr, decimalPartStr] = numStrFull.split('.');

    if (integerPartStr.length > 24) { // Increased limit up to 10^24
        return prefix + "Numero troppo grande";
    }

    const ones = ['', 'uno', 'due', 'tre', 'quattro', 'cinque', 'sei', 'sette', 'otto', 'nove'];
    const teens = ['dieci', 'undici', 'dodici', 'tredici', 'quattordici', 'quindici', 'sedici', 'diciassette', 'diciotto', 'diciannove'];
    const tens = ['', 'dieci', 'venti', 'trenta', 'quaranta', 'cinquanta', 'sessanta', 'settanta', 'ottanta', 'novanta'];
    const scales = [
        { one: '', many: '' },
        { one: 'mille', many: 'mila' },
        { one: 'milione', many: 'milioni' },
        { one: 'miliardo', many: 'miliardi' },
        { one: 'bilione', many: 'bilioni' },
        { one: 'biliardo', many: 'biliardi' },
        { one: 'trilione', many: 'trilioni' },
        { one: 'triliardo', many: 'triliardi' },
    ];

    const convertChunk = (chunkStr: string): string => {
        const n = parseInt(chunkStr);
        if (n === 0) return '';
        
        let words = '';
        const hundreds = Math.floor(n / 100);
        const remainder = n % 100;

        if (hundreds > 0) {
            words += (hundreds === 1 ? 'cento' : ones[hundreds] + 'cento');
        }

        if (remainder > 0) {
            if (remainder < 10) {
                words += ones[remainder];
            } else if (remainder < 20) {
                words += teens[remainder - 10];
            } else {
                let tenWord = tens[Math.floor(remainder / 10)];
                const unit = remainder % 10;
                if (unit === 1 || unit === 8) { // Vowel elision
                    tenWord = tenWord.slice(0, -1);
                }
                words += tenWord + (unit > 0 ? ones[unit] : '');
            }
        }
        return words;
    };

    let integerWords = '';
    if (integerPartStr === '0') {
        integerWords = 'zero';
    } else {
        const chunks: string[] = [];
        let tempStr = integerPartStr;
        while (tempStr.length > 0) {
            chunks.unshift(tempStr.slice(-3));
            tempStr = tempStr.slice(0, -3);
        }

        const wordParts = chunks.map((chunk, index) => {
            const chunkNum = parseInt(chunk);
            if (chunkNum === 0) return '';

            const scaleIndex = chunks.length - 1 - index;
            if (scaleIndex >= scales.length) {
              return "(numero troppo grande)"; // Safeguard
            }
            const scale = scales[scaleIndex];
            
            let chunkWords = convertChunk(chunk);
            
            if (scale.one) { // It's a scale like thousand, million etc.
                if (chunkNum === 1) {
                    if (scale.one === 'mille') {
                        return scale.one;
                    }
                    return 'un ' + scale.one; // "un milione"
                } else {
                     if (scale.many === 'mila') {
                        return chunkWords + scale.many; // e.g. trecentomila
                    }
                    return chunkWords + ' ' + scale.many; // e.g. due milioni
                }
            } else {
                return chunkWords; // The last chunk (hundreds, tens, ones)
            }
        });

        integerWords = wordParts.filter(Boolean).join(' ').trim();
    }
    
    const decimalWords = getDecimalWords(decimalPartStr, ['zero', ...ones.slice(1)], ' virgola ');
    if (integerWords === "" && Math.abs(numInput) < 1) integerWords = "zero";

    return prefix + integerWords + decimalWords;
};


export const numberToWordsJapanese = (numInput: number): string => {
    if (numInput === 0) return 'ゼロ';
    if (isNaN(numInput)) return '無効な数字';
    if (!isFinite(numInput)) return numInput > 0 ? '無限大' : '負の無限大';
    
    const prefix = numInput < 0 ? 'マイナス' : '';
    const numStrFull = handleBigInt(numInput);
    const [integerPartStr, decimalPartStr] = numStrFull.split('.');

    const digits = ['〇', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
    const scales = ['', '万', '億', '兆'];
    const units = ['', '十', '百', '千'];

    const convertChunk = (chunk: string): string => {
        let res = '';
        for (let i = 0; i < chunk.length; i++) {
            const d = parseInt(chunk[i]);
            if (d > 0) {
                res += (d === 1 && i < chunk.length -1 && units[chunk.length - 1 - i] !== '' ? '' : digits[d]) + units[chunk.length - 1 - i];
            }
        }
        return res;
    };
    
    let integerWords = '';
    if (integerPartStr === '0') {
        integerWords = 'ゼロ'
    } else {
        let tempStr = integerPartStr;
        let scaleIdx = 0;
        while(tempStr.length > 0) {
            const chunk = tempStr.slice(-4);
            tempStr = tempStr.slice(0, -4);
            const chunkWords = convertChunk(chunk);
            if(chunkWords) {
                integerWords = chunkWords + scales[scaleIdx] + integerWords;
            }
            scaleIdx++;
        }
    }
    
    const decimalWords = decimalPartStr ? '点' + decimalPartStr.split('').map(d=>digits[parseInt(d)]).join('') : '';

    if (integerWords === "ゼロ" && !decimalWords) return "ゼロ";
    if (integerWords === "ゼロ" && decimalWords) integerWords = "〇";

    return prefix + integerWords + decimalWords;
};

export const numberToWordsKorean = (numInput: number): string => {
    if (numInput === 0) return '영';
    if (isNaN(numInput)) return '유효하지 않은 숫자';
    if (!isFinite(numInput)) return numInput > 0 ? '무한대' : '음의 무한대';

    const prefix = numInput < 0 ? '마이너스 ' : '';
    const numStrFull = handleBigInt(numInput);
    const [integerPartStr, decimalPartStr] = numStrFull.split('.');

    const digits = ['', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구'];
    const scales = ['', '만', '억', '조'];
    const units = ['', '십', '백', '천'];
    
    let integerWords = '';
    if (integerPartStr === '0') {
        integerWords = '영';
    } else {
        let tempStr = integerPartStr;
        let scaleIdx = 0;
        while(tempStr.length > 0) {
            const chunk = tempStr.slice(-4);
            tempStr = tempStr.slice(0, -4);
            let chunkWords = '';
            for (let i = 0; i < chunk.length; i++) {
                const d = parseInt(chunk[i]);
                if (d > 0) {
                    chunkWords += (d > 1 || (d === 1 && i === chunk.length - 1) ? digits[d] : '') + units[chunk.length - 1 - i];
                }
            }
            if(chunkWords) {
                integerWords = chunkWords.replace(/일([십백천])/g, '$1') + scales[scaleIdx] + ' ' + integerWords;
            }
            scaleIdx++;
        }
    }
    
    const decimalWords = decimalPartStr ? '점 ' + decimalPartStr.split('').map(d=> d === '0' ? '영' : digits[parseInt(d)]).join('') : '';
    
    if (integerWords === '영' && !decimalWords) return '영';

    return prefix + integerWords.trim() + decimalWords;
};


export const numberToWordsThai = (numInput: number): string => {
    if (numInput === 0) return 'ศูนย์';
    if (isNaN(numInput)) return 'เลขไม่ถูกต้อง';
    if (!isFinite(numInput)) return numInput > 0 ? 'อนันต์' : 'ลบอนันต์';

    const prefix = numInput < 0 ? 'ลบ' : '';
    const numStrFull = handleBigInt(numInput);
    const [integerPartStr, decimalPartStr] = numStrFull.split('.');

    const digits = ['ศูนย์', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า'];
    const units = ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน', 'ล้าน'];
    
    const convert = (numStr: string): string => {
        let result = '';
        const len = numStr.length;
        if(len === 0) return '';
        if(len > 7) { // handle numbers larger than a million recursively
            return convert(numStr.slice(0, -6)) + 'ล้าน' + convert(numStr.slice(-6));
        }
        for (let i = 0; i < len; i++) {
            const digit = parseInt(numStr[i]);
            if (digit !== 0) {
                const unitIndex = len - 1 - i;
                if (unitIndex === 1 && digit === 2) result += 'ยี่'; // 20
                else if (unitIndex === 1 && digit === 1) {} // 10
                else if (unitIndex === 0 && digit === 1 && len > 1) result += 'เอ็ด';
                else result += digits[digit];
                result += units[unitIndex];
            }
        }
        return result;
    }

    let integerWords = integerPartStr === '0' ? 'ศูนย์' : convert(integerPartStr);
    const decimalWords = decimalPartStr ? 'จุด' + decimalPartStr.split('').map(d => digits[parseInt(d)]).join('') : '';

    if(integerWords === "ศูนย์" && !decimalWords) return "ศูนย์";
    
    return prefix + integerWords + decimalWords;
};

export const numberToWordsVietnamese = (numInput: number): string => {
    if (numInput === 0) return 'không';
    if (isNaN(numInput)) return 'số không hợp lệ';
    if (!isFinite(numInput)) return numInput > 0 ? 'vô hạn' : 'âm vô hạn';
    
    const prefix = numInput < 0 ? 'âm ' : '';
    const numStrFull = handleBigInt(numInput);
    const [integerPartStr, decimalPartStr] = numStrFull.split('.');

    if (integerPartStr.length > 15) { // Up to hundreds of trillions
        return prefix + "số quá lớn";
    }

    const digits = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
    
    const convertChunk = (chunkStr: string, isFirstChunk: boolean) => {
        let result = '';
        const n = parseInt(chunkStr);
        if (n === 0) return isFirstChunk ? '' : 'không trăm linh không';

        const tram = Math.floor(n / 100);
        const chuc = Math.floor((n % 100) / 10);
        const donvi = n % 10;
        
        if (tram > 0 || !isFirstChunk) { // Only show hundreds if non-zero, or if it's not the leading chunk
            result += digits[tram] + ' trăm ';
        }
        
        if (chuc > 0) {
            if (chuc === 1) result += 'mười ';
            else result += digits[chuc] + ' mươi ';
        } else if ((tram > 0 || !isFirstChunk) && donvi > 0) { // Add 'linh' for numbers like 101, 205 etc.
            result += 'linh ';
        }

        if (donvi > 0) {
            if (chuc === 1 && donvi === 5) result += 'lăm';
            else if (chuc > 1 && donvi === 1) result += 'mốt';
            else if (donvi === 4 && chuc > 0) result += 'tư';
            else if (donvi === 5 && chuc > 0) result += 'lăm';
            else result += digits[donvi];
        }

        return result.trim();
    }

    const scales = ['', ' nghìn', ' triệu', ' tỷ'];

    let integerWords = '';
    if (integerPartStr === '0') {
        integerWords = 'không';
    } else {
        let tempStr = integerPartStr;
        let parts = [];
        while (tempStr.length > 0) {
            parts.push(tempStr.slice(-3));
            tempStr = tempStr.slice(0, -3);
        }

        let resultWords: string[] = [];
        for (let i = 0; i < parts.length; i++) {
            const chunk = parts[i];
            const isFirst = (i === parts.length - 1);
            const chunkWords = convertChunk(chunk, isFirst);
            
            if (chunkWords || (i > 0 && !isFirst)) { // Add scale if chunk has words, or if it's a middle chunk of zeros
                 if(chunkWords) resultWords.push(chunkWords + (scales[i] || ''));
            }
        }
        integerWords = resultWords.reverse().join(' ').trim().replace(/\s+/g, ' ');
    }
    
    const decimalWords = getDecimalWords(decimalPartStr, digits, ' phẩy');

    if (integerWords === "" && Math.abs(numInput) < 1) integerWords = "không";

    return prefix + integerWords + decimalWords;
};