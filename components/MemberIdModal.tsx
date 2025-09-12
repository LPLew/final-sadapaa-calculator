import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MemberIdData } from '../types';
import { X, Edit, Save, Camera, Upload, User, Globe, FileText, Share2, Smartphone } from 'lucide-react';

interface MemberIdModalProps {
  data: MemberIdData;
  onSave: (data: MemberIdData) => void;
  onClose: () => void;
}

const countryCodes = [
    { name: 'Afghanistan', dial_code: '+93', code: 'AF' },
    { name: 'Albania', dial_code: '+355', code: 'AL' },
    { name: 'Algeria', dial_code: '+213', code: 'DZ' },
    { name: 'American Samoa', dial_code: '+1684', code: 'AS' },
    { name: 'Andorra', dial_code: '+376', code: 'AD' },
    { name: 'Angola', dial_code: '+244', code: 'AO' },
    { name: 'Argentina', dial_code: '+54', code: 'AR' },
    { name: 'Armenia', dial_code: '+374', code: 'AM' },
    { name: 'Australia', dial_code: '+61', code: 'AU' },
    { name: 'Austria', dial_code: '+43', code: 'AT' },
    { name: 'Azerbaijan', dial_code: '+994', code: 'AZ' },
    { name: 'Bahamas', dial_code: '+1242', code: 'BS' },
    { name: 'Bahrain', dial_code: '+973', code: 'BH' },
    { name: 'Bangladesh', dial_code: '+880', code: 'BD' },
    { name: 'Belarus', dial_code: '+375', code: 'BY' },
    { name: 'Belgium', dial_code: '+32', code: 'BE' },
    { name: 'Benin', dial_code: '+229', code: 'BJ' },
    { name: 'Bolivia', dial_code: '+591', code: 'BO' },
    { name: 'Bosnia and Herzegovina', dial_code: '+387', code: 'BA' },
    { name: 'Brazil', dial_code: '+55', code: 'BR' },
    { name: 'Brunei Darussalam', dial_code: '+673', code: 'BN' },
    { name: 'Bulgaria', dial_code: '+359', code: 'BG' },
    { name: 'Cambodia', dial_code: '+855', code: 'KH' },
    { name: 'Cameroon', dial_code: '+237', code: 'CM' },
    { name: 'Canada', dial_code: '+1', code: 'CA' },
    { name: 'Chile', dial_code: '+56', code: 'CL' },
    { name: 'China', dial_code: '+86', code: 'CN' },
    { name: 'Colombia', dial_code: '+57', code: 'CO' },
    { name: 'Congo, The Democratic Republic of the', dial_code: '+243', code: 'CD' },
    { name: 'Costa Rica', dial_code: '+506', code: 'CR' },
    { name: 'Croatia', dial_code: '+385', code: 'HR' },
    { name: 'Cuba', dial_code: '+53', code: 'CU' },
    { name: 'Cyprus', dial_code: '+357', code: 'CY' },
    { name: 'Czech Republic', dial_code: '+420', code: 'CZ' },
    { name: 'Denmark', dial_code: '+45', code: 'DK' },
    { name: 'Ecuador', dial_code: '+593', code: 'EC' },
    { name: 'Egypt', dial_code: '+20', code: 'EG' },
    { name: 'Estonia', dial_code: '+372', code: 'EE' },
    { name: 'Ethiopia', dial_code: '+251', code: 'ET' },
    { name: 'Finland', dial_code: '+358', code: 'FI' },
    { name: 'France', dial_code: '+33', code: 'FR' },
    { name: 'Georgia', dial_code: '+995', code: 'GE' },
    { name: 'Germany', dial_code: '+49', code: 'DE' },
    { name: 'Greece', dial_code: '+30', code: 'GR' },
    { name: 'Hong Kong', dial_code: '+852', code: 'HK' },
    { name: 'Hungary', dial_code: '+36', code: 'HU' },
    { name: 'Iceland', dial_code: '+354', code: 'IS' },
    { name: 'India', dial_code: '+91', code: 'IN' },
    { name: 'Indonesia', dial_code: '+62', code: 'ID' },
    { name: 'Iran, Islamic Republic of', dial_code: '+98', code: 'IR' },
    { name: 'Iraq', dial_code: '+964', code: 'IQ' },
    { name: 'Ireland', dial_code: '+353', code: 'IE' },
    { name: 'Israel', dial_code: '+972', code: 'IL' },
    { name: 'Italy', dial_code: '+39', code: 'IT' },
    { name: 'Japan', dial_code: '+81', code: 'JP' },
    { name: 'Jordan', dial_code: '+962', code: 'JO' },
    { name: 'Kazakhstan', dial_code: '+7', code: 'KZ' },
    { name: 'Kenya', dial_code: '+254', code: 'KE' },
    { name: 'Korea, Republic of', dial_code: '+82', code: 'KR' },
    { name: 'Kuwait', dial_code: '+965', code: 'KW' },
    { name: 'Lao People\'s Democratic Republic', dial_code: '+856', code: 'LA' },
    { name: 'Lebanon', dial_code: '+961', code: 'LB' },
    { name: 'Libyan Arab Jamahiriya', dial_code: '+218', code: 'LY' },
    { name: 'Lithuania', dial_code: '+370', code: 'LT' },
    { name: 'Macao', dial_code: '+853', code: 'MO' },
    { name: 'Malaysia', dial_code: '+60', code: 'MY' },
    { name: 'Mexico', dial_code: '+52', code: 'MX' },
    { name: 'Mongolia', dial_code: '+976', code: 'MN' },
    { name: 'Morocco', dial_code: '+212', code: 'MA' },
    { name: 'Myanmar', dial_code: '+95', code: 'MM' },
    { name: 'Nepal', dial_code: '+977', code: 'NP' },
    { name: 'Netherlands', dial_code: '+31', code: 'NL' },
    { name: 'New Zealand', dial_code: '+64', code: 'NZ' },
    { name: 'Nigeria', dial_code: '+234', code: 'NG' },
    { name: 'Norway', dial_code: '+47', code: 'NO' },
    { name: 'Oman', dial_code: '+968', code: 'OM' },
    { name: 'Pakistan', dial_code: '+92', code: 'PK' },
    { name: 'Peru', dial_code: '+51', code: 'PE' },
    { name: 'Philippines', dial_code: '+63', code: 'PH' },
    { name: 'Poland', dial_code: '+48', code: 'PL' },
    { name: 'Portugal', dial_code: '+351', code: 'PT' },
    { name: 'Qatar', dial_code: '+974', code: 'QA' },
    { name: 'Romania', dial_code: '+40', code: 'RO' },
    { name: 'Russian Federation', dial_code: '+7', code: 'RU' },
    { name: 'Saudi Arabia', dial_code: '+966', code: 'SA' },
    { name: 'Singapore', dial_code: '+65', code: 'SG' },
    { name: 'South Africa', dial_code: '+27', code: 'ZA' },
    { name: 'Spain', dial_code: '+34', code: 'ES' },
    { name: 'Sri Lanka', dial_code: '+94', code: 'LK' },
    { name: 'Sweden', dial_code: '+46', code: 'SE' },
    { name: 'Switzerland', dial_code: '+41', code: 'CH' },
    { name: 'Syrian Arab Republic', dial_code: '+963', code: 'SY' },
    { name: 'Taiwan', dial_code: '+886', code: 'TW' },
    { name: 'Tanzania, United Republic of', dial_code: '+255', code: 'TZ' },
    { name: 'Thailand', dial_code: '+66', code: 'TH' },
    { name: 'Turkey', dial_code: '+90', code: 'TR' },
    { name: 'Ukraine', dial_code: '+380', code: 'UA' },
    { name: 'United Arab Emirates', dial_code: '+971', code: 'AE' },
    { name: 'United Kingdom', dial_code: '+44', code: 'GB' },
    { name: 'United States', dial_code: '+1', code: 'US' },
    { name: 'Venezuela', dial_code: '+58', code: 'VE' },
    { name: 'Viet Nam', dial_code: '+84', code: 'VN' },
    { name: 'Yemen', dial_code: '+967', code: 'YE' },
    { name: 'Zimbabwe', dial_code: '+263', code: 'ZW' },
].sort((a, b) => a.name.localeCompare(b.name));

const generateVCardString = (data: MemberIdData): string => {
  if (!data.fullName) {
    return '';
  }

  const nameParts = data.fullName.trim().split(/\s+/);
  const firstName = nameParts.shift() || '';
  const lastName = nameParts.join(' ') || '';

  const note = data.refText
    ? data.refText.replace(/\\/g, '\\\\').replace(/,/g, '\\,').replace(/;/g, '\\;').replace(/\n/g, '\\n')
    : '';

  const vCardParts: string[] = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${lastName};${firstName};;;`,
    `FN:${data.fullName}`,
    'ORG:DZA Group',
  ];

  if (data.mobileNo) {
    vCardParts.push(`TEL;TYPE=CELL,VOICE:${data.countryCode}${data.mobileNo}`);
  }

  if (note) {
    vCardParts.push(`NOTE:${note}`);
  }

  if (data.photo) {
    try {
      const [header, base64Data] = data.photo.split(',');
      if (header && base64Data) {
        const mimeMatch = header.match(/data:(image\/\w+);base64/);
        if (mimeMatch && mimeMatch[1]) {
          const mimeType = mimeMatch[1].split('/')[1].toUpperCase(); // e.g., JPEG, PNG
          vCardParts.push(`PHOTO;TYPE=${mimeType};ENCODING=b64:${base64Data}`);
        }
      }
    } catch (e) {
      console.error("Could not parse photo for vCard:", e);
    }
  }

  vCardParts.push('END:VCARD');
  
  return vCardParts.join('\r\n');
};

const EditableTextArea: React.FC<{
  label: string;
  value: string;
  icon: React.ReactNode;
  onSave: (newValue: string) => void;
}> = ({ label, value, icon, onSave }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [tempValue, setTempValue] = useState(value);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleSaveClick = () => {
        onSave(tempValue);
        setIsEditing(false);
    }
    
    const handleEditClick = () => {
        setTempValue(value || '');
        setIsEditing(true);
    }

    useEffect(() => {
        if (isEditing && textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [isEditing, tempValue]);


    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {icon}
                    <span className="text-xs text-purple-200">{label}</span>
                </div>
                {isEditing ? (
                    <button onClick={handleSaveClick} className="p-2 text-green-400 hover:text-white rounded-full hover:bg-white/10">
                        <Save size={16} />
                    </button>
                ) : (
                    <button onClick={handleEditClick} className="p-2 text-fuchsia-300 hover:text-white rounded-full hover:bg-white/10">
                        <Edit size={16} />
                    </button>
                )}
            </div>
            {isEditing ? (
                <textarea
                    ref={textareaRef}
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    className="w-full bg-slate-700/80 border border-slate-600 rounded-md p-2 text-white text-sm focus:ring-sky-500 focus:border-sky-500 custom-scrollbar-tape resize-none"
                    style={{ overflowY: 'hidden' }}
                    autoFocus
                />
            ) : (
                <div className="whitespace-pre-wrap text-white text-sm p-2 border border-slate-700 rounded-md min-h-[40px] bg-slate-900/50">
                    {value || <span className="italic text-slate-500">(Not set)</span>}
                </div>
            )}
        </div>
    );
};


export const MemberIdModal: React.FC<MemberIdModalProps> = ({ data, onSave, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [localData, setLocalData] = useState<MemberIdData>(data);
  const [isEditingMobile, setIsEditingMobile] = useState(false);
  const [isEditingLockedFields, setIsEditingLockedFields] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (field: keyof MemberIdData, value: string) => {
    setLocalData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.src = reader.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 512;
          const MAX_HEIGHT = 512;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL(file.type, 0.9);
          handleInputChange('photo', dataUrl);
        };
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSaveSetup = () => {
    onSave({ ...localData, isSetupComplete: true, editCount: 1 });
  };
  
  const handleSaveFinalEdit = () => {
      onSave({ ...localData, editCount: 2 });
      setIsEditingLockedFields(false);
  };

  const handleSaveEditableField = (field: 'refText' | 'countryCode' | 'mobileNo', value: string) => {
      const updatedData = { ...localData, [field]: value };
      setLocalData(updatedData);
      onSave(updatedData);
  };
  
  const handleShare = useCallback(async () => {
    const vCardStr = generateVCardString(localData);
    if (!vCardStr) {
        alert('Cannot generate contact file. Full Name is required.');
        return;
    }
    const fileName = `${localData.fullName.replace(/\s/g, '_')}_Contact.vcf`;
    const downloadFile = () => {
        const dataUri = 'data:text/vcard;charset=utf-8,' + encodeURIComponent(vCardStr);
        const link = document.createElement('a');
        link.href = dataUri;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    const vcfFile = new File([vCardStr], fileName, { type: 'text/vcard;charset=utf-8' });
    const shareData = {
        files: [vcfFile],
        title: `Contact: ${localData.fullName}`,
        text: `Here is the contact information for ${localData.fullName}.`,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        try {
            await navigator.share(shareData);
        } catch (error) {
            if ((error as DOMException).name !== 'AbortError') {
                downloadFile();
            }
        }
    } else {
        downloadFile();
    }
  }, [localData]);

  useEffect(() => {
    setLocalData(data);
  }, [data]);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (modalRef.current && !modalRef.current.contains(target) && document.body.contains(target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);
  
  if (!data.isSetupComplete) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 animate-fadeIn">
        <div ref={modalRef} className="bg-slate-800 text-slate-200 rounded-2xl shadow-2xl w-full max-w-md h-[90vh] flex flex-col border border-slate-600">
            <header className="flex-shrink-0 flex items-center justify-between p-4 border-b border-slate-700">
                <h2 className="text-xl font-bold text-yellow-300">Member ID Setup</h2>
                 <button onClick={onClose} className="p-2 rounded-full text-slate-400 hover:bg-slate-700"><X size={24} /></button>
            </header>
            <main className="flex-grow p-6 overflow-y-auto custom-scrollbar-tape space-y-6">
                 <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Photo</label>
                    <div className="flex items-center gap-4">
                        <div className="w-24 h-24 bg-slate-700 rounded-full flex items-center justify-center overflow-hidden">
                            {localData.photo ? <img src={localData.photo} alt="Preview" className="w-full h-full object-cover" /> : <User size={40} className="text-slate-500" />}
                        </div>
                        <button onClick={() => fileInputRef.current?.click()} className="flex-grow flex items-center justify-center gap-2 px-4 py-2.5 bg-sky-600 text-white rounded-md font-semibold hover:bg-sky-500">
                            <Camera size={18} /> Upload Photo
                        </button>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                    </div>
                     <p className="text-xs text-yellow-400 mt-2">This can be changed one more time after initial setup.</p>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Name</label>
                    <input type="text" value={localData.fullName} onChange={(e) => handleInputChange('fullName', e.target.value)} placeholder="Enter your full name" className="w-full p-2.5 bg-slate-700 border border-slate-600 text-white rounded-md focus:ring-sky-500 focus:border-sky-500" />
                    <p className="text-xs text-yellow-400 mt-2">This can be changed one more time after initial setup.</p>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Country</label>
                    <input type="text" value={localData.country} onChange={(e) => handleInputChange('country', e.target.value)} placeholder="Enter your country" className="w-full p-2.5 bg-slate-700 border border-slate-600 text-white rounded-md focus:ring-sky-500 focus:border-sky-500" />
                    <p className="text-xs text-yellow-400 mt-2">This can be changed one more time after initial setup.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Mobile No.</label>
                   <div className="flex gap-2">
                        <select 
                            value={localData.countryCode} 
                            onChange={(e) => handleInputChange('countryCode', e.target.value)}
                            className="p-2.5 bg-slate-700 border border-slate-600 text-white rounded-md focus:ring-sky-500 focus:border-sky-500 w-1/3"
                        >
                            {countryCodes.map(c => <option key={c.code} value={c.dial_code}>{c.name} ({c.dial_code})</option>)}
                        </select>
                        <input 
                            type="tel" 
                            value={localData.mobileNo} 
                            onChange={(e) => handleInputChange('mobileNo', e.target.value)}
                            placeholder="e.g. 123456789"
                            className="w-2/3 p-2.5 bg-slate-700 border border-slate-600 text-white rounded-md focus:ring-sky-500 focus:border-sky-500" 
                        />
                   </div>
                   <p className="text-xs text-slate-400 mt-2">This can be changed later.</p>
                </div>
            </main>
            <footer className="flex-shrink-0 p-4 border-t border-slate-700">
                <button onClick={handleSaveSetup} disabled={!localData.fullName || !localData.country || !localData.photo} className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-500 disabled:bg-slate-500 disabled:cursor-not-allowed">
                    Save and Lock ID
                </button>
            </footer>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 animate-fadeIn" >
        <div ref={modalRef} className="bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md border-2 border-fuchsia-500/50 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 via-slate-900 to-sky-900/50 opacity-50"></div>
            <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-gradient-radial from-fuchsia-500/30 to-transparent animate-spin-slow"></div>

            <div className="relative p-6">
                <header className="flex justify-between items-start mb-4">
                    <div>
                        <h2 className="text-lg font-bold text-yellow-300">DZA GROUP</h2>
                        <p className="text-xs text-slate-400">MEMBER ID</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={handleShare} className="p-2 rounded-full text-fuchsia-300 hover:text-white hover:bg-white/10 transition-colors" title="Share Contact">
                            <Share2 size={20} />
                        </button>
                        <button onClick={onClose} className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
                            <X size={24} />
                        </button>
                    </div>
                </header>
                
                {isEditingLockedFields ? (
                    <div className="space-y-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">Photo</label>
                            <div className="flex items-center gap-4">
                                <div className="w-24 h-24 bg-slate-700 rounded-full flex items-center justify-center overflow-hidden">
                                    <img src={localData.photo} alt="Preview" className="w-full h-full object-cover" />
                                </div>
                                <button onClick={() => fileInputRef.current?.click()} className="flex-grow flex items-center justify-center gap-2 px-4 py-2.5 bg-sky-600 text-white rounded-md font-semibold hover:bg-sky-500">
                                    <Camera size={18} /> Change Photo
                                </button>
                                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Name</label>
                            <input type="text" value={localData.fullName} onChange={(e) => handleInputChange('fullName', e.target.value)} className="w-full p-2.5 bg-slate-700 border border-slate-600 text-white rounded-md"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">Country</label>
                            <input type="text" value={localData.country} onChange={(e) => handleInputChange('country', e.target.value)} className="w-full p-2.5 bg-slate-700 border border-slate-600 text-white rounded-md"/>
                        </div>
                        <div className="flex gap-2">
                           <button onClick={() => { setIsEditingLockedFields(false); setLocalData(data); }} className="w-full py-2 bg-slate-600 text-white rounded-md font-semibold hover:bg-slate-500">Cancel</button>
                           <button onClick={handleSaveFinalEdit} className="w-full py-2 bg-red-600 text-white rounded-md font-semibold hover:bg-red-500">Save Final Changes</button>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-24 h-24 rounded-full bg-slate-700 border-2 border-fuchsia-400/50 overflow-hidden flex-shrink-0 relative">
                            <img src={localData.photo} alt="Member photo" className="w-full h-full object-cover" />
                        </div>
                        <div className="overflow-hidden">
                            <h3 className="text-xl font-bold text-white break-words">{localData.fullName}</h3>
                            <p className="text-slate-300">{localData.country}</p>
                        </div>
                    </div>
                )}
                 
                 <div className="space-y-4 bg-black/30 backdrop-blur-sm p-4 rounded-lg border border-white/10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                          <Smartphone size={20} className="text-fuchsia-300 flex-shrink-0" />
                          <div className="flex flex-col">
                              <span className="text-xs text-purple-200">Mobile No.</span>
                              <span className="text-white text-base truncate">{localData.countryCode} {localData.mobileNo || <span className="italic text-slate-500">(Not set)</span>}</span>
                          </div>
                      </div>
                      <button onClick={() => setIsEditingMobile(true)} className="p-2 text-fuchsia-300 hover:text-white rounded-full hover:bg-white/10">
                          <Edit size={16} />
                      </button>
                    </div>
                    {isEditingMobile && (
                        <div className="p-3 bg-slate-800/70 rounded-md animate-fadeIn space-y-4">
                            <div>
                               <label className="text-xs text-slate-400">Country Code</label>
                                <select 
                                    value={localData.countryCode} 
                                    onChange={(e) => handleSaveEditableField('countryCode', e.target.value)}
                                    className="w-full mt-1 p-2 bg-slate-700 border border-slate-600 text-white rounded-md focus:ring-sky-500 focus:border-sky-500 text-sm"
                                >
                                    {countryCodes.map(c => <option key={c.code} value={c.dial_code}>{c.name} ({c.dial_code})</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-slate-400">Mobile Number</label>
                                <input 
                                    type="tel" 
                                    value={localData.mobileNo} 
                                    onChange={(e) => handleSaveEditableField('mobileNo', e.target.value)}
                                    placeholder="e.g. 123456789"
                                    className="w-full mt-1 p-2 bg-slate-700 border border-slate-600 text-white rounded-md focus:ring-sky-500 focus:border-sky-500 text-sm" 
                                />
                            </div>
                            <button onClick={() => setIsEditingMobile(false)} className="w-full py-1.5 text-xs bg-sky-600 text-white rounded hover:bg-sky-500">Done</button>
                        </div>
                    )}
                    <hr className="border-white/10"/>
                    <EditableTextArea label="Ref." value={localData.refText} icon={<FileText size={20} className="text-fuchsia-300" />} onSave={(v) => handleSaveEditableField('refText', v)} />
                </div>
                 {data.isSetupComplete && data.editCount < 2 && !isEditingLockedFields && (
                    <div className="mt-4">
                        <button onClick={() => setIsEditingLockedFields(true)} className="w-full py-2.5 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-500 text-sm flex items-center justify-center gap-2">
                            <Edit size={14} /> Edit Locked Info (1 Chance Left)
                        </button>
                    </div>
                )}
            </div>
        </div>
      </div>
    </>
  );
};