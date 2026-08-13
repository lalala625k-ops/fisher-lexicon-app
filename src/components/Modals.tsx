// @ts-nocheck
// @ts-nocheck
import React, { useState, useMemo } from 'react';
import { Search, X, Link as LinkIcon, Plus, Check } from 'lucide-react';

export const SearchConnectModal = ({ sourceWordEn, isOpen, onClose, onSelectTarget, allWords, connections }) => {
  const [searchTerm, setSearchTerm] = useState('');
  if (!isOpen || !sourceWordEn) return null;

  const currentLinks = connections[sourceWordEn] || [];
  const suggestions = allWords.filter(w => 
    w.en !== sourceWordEn && !currentLinks.includes(w.en) &&
    (w.en.toLowerCase().includes(searchTerm.toLowerCase()) || w.zh.includes(searchTerm))
  ).slice(0, 8);

  return (
    <div className="fixed inset-0 z-50 bg-bone-cream bg-opacity-80 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-paper-white border-[1.5px] border-ink rounded-[16px] p-6 max-w-md w-full animate-in" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6 border-b-[1.5px] border-ink/20 pb-4">
          <div>
            <h3 className="text-body font-ui font-medium text-ink flex items-center gap-2">
              <LinkIcon className="w-5 h-5 text-ink" /> CONNECT TARGET
            </h3>
            <p className="text-caption font-ui text-ink opacity-60 mt-1">From: <span className="font-medium text-ink">{sourceWordEn}</span></p>
          </div>
          <button onClick={onClose} className="text-ink opacity-50 hover:opacity-100 transition-colors"><X className="w-6 h-6" /></button>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink opacity-40" />
          <input 
            type="text" autoFocus placeholder="Search english or chinese..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-paper-white border-[1.5px] border-ink rounded-[16px] py-3 pl-11 pr-4 text-body font-ui text-ink focus:outline-none focus:ring-1 focus:ring-ink"
          />
        </div>

        <div className="max-h-60 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
          {suggestions.map(sugg => (
            <div key={sugg.en} onClick={() => { onSelectTarget(sourceWordEn, sugg.en); onClose(); }} className="p-3 rounded-[16px] bg-paper-white border-[1.5px] border-ink border-opacity-20 hover:border-ink hover-bg-ink hover-text-paper-white cursor-pointer flex justify-between items-center group transition-colors font-ui text-ink">
              <div>
                <div className="font-medium text-body-sm">{sugg.en}</div>
                <div className="text-caption opacity-60 group-hover:opacity-90 mt-0.5">{sugg.zh}</div>
              </div>
              <Plus className="w-5 h-5 opacity-40 group-hover:opacity-100" />
            </div>
          ))}
          {suggestions.length === 0 && <div className="text-center py-8 text-body-sm font-ui text-ink opacity-50">No matching words found.</div>}
        </div>
      </div>
    </div>
  );
};


export const AddWordModal = ({ isOpen, onClose, onAdd, categories }) => {
  const [en, setEn] = useState('');
  const [zh, setZh] = useState('');
  const [ex, setEx] = useState('');
  const [category, setCategory] = useState(categories[0] || '');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!en.trim() || !zh.trim()) return;
    onAdd({ en: en.trim(), zh: zh.trim(), ex: ex.trim() || 'Custom added vocabulary entry.', category });
    setEn(''); setZh(''); setEx(''); setCategory(categories[0] || '');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] bg-bone-cream bg-opacity-80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-paper-white border-[1.5px] border-ink rounded-[16px] p-8 max-w-md w-full animate-in">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-subheading font-ui font-medium text-ink flex items-center gap-2">ADD CUSTOM WORD</h3>
          <button onClick={onClose} className="text-ink opacity-50 hover:opacity-100 transition-colors"><X className="w-6 h-6" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5 font-ui">
          <div>
            <label className="block text-caption uppercase tracking-wide text-ink opacity-70 mb-2 font-medium">English Word</label>
            <input type="text" required value={en} onChange={e => setEn(e.target.value)} placeholder="e.g. hauntology" className="w-full bg-paper-white border-[1.5px] border-ink border-opacity-40 rounded-[16px] p-3 text-body focus:outline-none focus:border-ink transition-colors text-ink" />
          </div>
          <div>
            <label className="block text-caption uppercase tracking-wide text-ink opacity-70 mb-2 font-medium">Chinese Translation</label>
            <input type="text" required value={zh} onChange={e => setZh(e.target.value)} className="w-full bg-paper-white border-[1.5px] border-ink border-opacity-40 rounded-[16px] p-3 text-body focus:outline-none focus:border-ink transition-colors text-ink" />
          </div>
          <div>
            <label className="block text-caption uppercase tracking-wide text-ink opacity-70 mb-2 font-medium">Context Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-paper-white border-[1.5px] border-ink border-opacity-40 rounded-[16px] p-3 text-body focus:outline-none focus:border-ink transition-colors appearance-none text-ink">
              {categories.map(cat => <option key={cat} value={cat}>{cat.split(' (')[1].replace(')','')}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-caption uppercase tracking-wide text-ink opacity-70 mb-2 font-medium">Example Sentence</label>
            <textarea rows={2} value={ex} onChange={e => setEx(e.target.value)} className="w-full bg-paper-white border-[1.5px] border-ink border-opacity-40 rounded-[16px] p-3 text-body focus:outline-none focus:border-ink transition-colors text-ink" />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-[16px] bg-transparent border-[1.5px] border-ink hover:border-[3px] text-ink font-medium transition-all">Cancel</button>
            <button type="submit" className="px-5 py-2.5 rounded-[16px] bg-ink text-paper-white hover-bg-ink font-medium transition-colors flex items-center gap-2"><Check className="w-4 h-4" /> Save Entry</button>
          </div>
        </form>
      </div>
    </div>
  );
};
