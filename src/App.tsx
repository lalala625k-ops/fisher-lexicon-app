// @ts-nocheck
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Search, Ghost, Network, Link as LinkIcon, X, Plus, 
  Download, Upload, PlusCircle, Check, ZoomIn, ZoomOut, 
  RotateCcw, Filter, ArrowDown, Shuffle, ArrowDownAZ, Eye, EyeOff, CheckCircle2
} from 'lucide-react';

import { allWordsWithData, categoriesList, THEME_COLORS, VOCAB_DATA } from './data/mockData';
import { WordCard } from './components/WordCard';
import { SearchConnectModal, AddWordModal } from './components/Modals';

const getWordType = (w) => {
  const enLower = w.en.toLowerCase();
  const isVerb = enLower.endsWith('ing') || enLower.endsWith('ed') || w.zh.startsWith('使') || w.zh.startsWith('重新');
  const isAdj = enLower.endsWith('al') || enLower.endsWith('ic') || enLower.endsWith('ous') || enLower.endsWith('ive') || w.zh.endsWith('的');
  
  if (isAdj && !w.zh.includes("行为") && !w.zh.includes("状态")) return "Adjectives & States";
  if (isVerb) return "Verbs & Actions";
  return "Nouns & Concepts";
};



const AlphabetScrubber = ({ words }) => {
  const [hoveredLetter, setHoveredLetter] = useState(null);
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const timeoutRef = useRef(null);

  const scrollToWord = (wordEn) => {
    const el = document.querySelector(`[data-word-en="${wordEn}"]`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleMouseEnter = (letter) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setHoveredLetter(letter);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setHoveredLetter(null);
    }, 300); // 300ms delay ensures popup doesn't close immediately when moving cursor towards it
  };

  return (
    <div className="fixed right-1 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-[2px] sm:gap-1 p-1 bg-bone-cream/70 backdrop-blur-xs rounded-full border border-ink/10 shadow-xs max-h-[85vh] overflow-y-auto custom-scrollbar">
      {letters.map(letter => {
        const matchingWords = words.filter(w => w.en.toUpperCase().startsWith(letter));
        const hasWords = matchingWords.length > 0;
        const isHovered = hoveredLetter === letter;
        
        return (
          <div
            key={letter}
            onMouseEnter={() => hasWords && handleMouseEnter(letter)}
            onMouseLeave={handleMouseLeave}
            className={`relative flex items-center justify-center w-6 h-6 rounded-full transition-all ${hasWords ? 'text-ink cursor-pointer hover-bg-ink hover-text-paper-white' : 'text-ink opacity-30 cursor-default'}`}
          >
            <span className="text-caption font-ui">{letter}</span>
            
            {hasWords && (
               <div 
                 className={`absolute right-full mr-4 top-1/2 -translate-y-1/2 z-50 transition-all duration-500 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] origin-right
                    ${isHovered ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 translate-x-4 pointer-events-none'}`}
               >
                  <div 
                     className="bg-paper-white border-[1.5px] border-ink p-4 rounded-[16px] flex flex-col custom-scrollbar"
                     style={{
                        resize: 'both',
                        overflow: 'auto',
                        minWidth: '280px',
                        minHeight: '150px',
                        maxWidth: '70vw',
                        maxHeight: '70vh'
                     }}
                     onClick={e => e.stopPropagation()}
                  >
                     <div className="text-heading-sm font-display leading-none text-ink pb-2 border-b border-ink/20 mb-3 sticky top-0 bg-paper-white z-10">
                        {letter}
                     </div>
                     <div className="flex flex-col gap-2">
                        {matchingWords.map(w => (
                          <div 
                            key={w.en} 
                            className="text-body-sm text-ink font-ui hover-bg-ink hover-text-paper-white p-1.5 -mx-1.5 rounded-[8px] cursor-pointer text-left flex justify-between items-baseline group" 
                            onClick={() => scrollToWord(w.en)}
                          >
                            <span className="truncate mr-3 font-medium">{w.en}</span>
                            <span className="text-[10px] opacity-70 shrink-0">{w.zh}</span>
                          </div>
                        ))}
                     </div>
                  </div>
                  
                  {/* Invisible bridge block to maintain hover state when moving mouse left across the gap */}
                  <div className="absolute right-[-16px] top-0 w-4 h-full bg-transparent" />
               </div>
            )}
          </div>
        )
      })}
    </div>
  )
};





export default function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [userCols, setUserCols] = useState(4);
  
  const [dragState, setDragState] = useState(null);
  const [isHoveringRedTarget, setIsHoveringRedTarget] = useState(false);
  const [searchConnectSource, setSearchConnectSource] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const [cols, setCols] = useState(4);
  useEffect(() => {
    const updateCols = () => {
      if (window.innerWidth >= 1024) setCols(userCols);
      else if (window.innerWidth >= 768) setCols(3);
      else if (window.innerWidth >= 640) setCols(2);
      else setCols(1);
    };
    updateCols();
    window.addEventListener('resize', updateCols);
    return () => window.removeEventListener('resize', updateCols);
  }, [userCols]);

  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [filters, setFilters] = useState({ context: 'All', type: 'All' });
  const [sortBy, setSortBy] = useState('random'); 
  const [sortTrigger, setSortTrigger] = useState(0);
  const [randomSeed, setRandomSeed] = useState(() => Math.random());

  const fileInputRef = useRef(null);

  const [connections, setConnections] = useState(() => {
    try { const saved = localStorage.getItem('fisher_word_connections'); return saved ? JSON.parse(saved) : {}; } 
    catch { return {}; }
  });

  const [customWords, setCustomWords] = useState(() => {
    try { const saved = localStorage.getItem('fisher_custom_words'); return saved ? JSON.parse(saved) : []; } 
    catch { return []; }
  });

  const [flipCounts, setFlipCounts] = useState(() => {
    try { const saved = localStorage.getItem('fisher_flip_counts'); return saved ? JSON.parse(saved) : {}; } 
    catch { return {}; }
  });
  const [flippedCards, setFlippedCards] = useState(() => {
    try { const saved = localStorage.getItem('fisher_flipped_cards'); return saved ? JSON.parse(saved) : {}; } 
    catch { return {}; }
  });
  const [showFront, setShowFront] = useState(true);
  const [showBack, setShowBack] = useState(true);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    localStorage.setItem('fisher_flip_counts', JSON.stringify(flipCounts));
  }, [flipCounts]);

  useEffect(() => {
    localStorage.setItem('fisher_flipped_cards', JSON.stringify(flippedCards));
  }, [flippedCards]);

  const handleFlipCount = (wordEn) => setFlipCounts(prev => ({...prev, [wordEn]: (prev[wordEn] || 0) + 1}));

  useEffect(() => {
    if (!dragState) return;
    const handlePointerMove = (e) => {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      setDragState(prev => prev ? { ...prev, currentX: clientX, currentY: clientY } : null);
      const targetElem = document.elementFromPoint(clientX, clientY);
      setIsHoveringRedTarget(!!(targetElem && targetElem.closest('#red-search-drop-target')));
    };
    const handlePointerUp = (e) => {
      if (!dragState) return;
      const clientX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
      const clientY = e.changedTouches ? e.changedTouches[0].clientY : e.clientY;
      const elementAtPoint = document.elementFromPoint(clientX, clientY);
      
      if (elementAtPoint) {
        const cardElem = elementAtPoint.closest('[data-word-card]');
        if (cardElem) {
          const targetEn = cardElem.getAttribute('data-word-en');
          if (targetEn && targetEn !== dragState.sourceEn) handleAddConnection(dragState.sourceEn, targetEn);
        } else {
          setSearchConnectSource(dragState.sourceEn);
        }
      } else {
        setSearchConnectSource(dragState.sourceEn);
      }
      setDragState(null);
      setIsHoveringRedTarget(false);
    };

    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);
    window.addEventListener('touchmove', handlePointerMove, { passive: false });
    window.addEventListener('touchend', handlePointerUp);
    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);
    };
  }, [dragState]);

  const handleStartDrag = (e, sourceEn) => {
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    setDragState({ sourceEn, startX: clientX, startY: clientY, currentX: clientX, currentY: clientY });
  };

  const handleExportData = () => {
    const exportPayload = { connections, customWords, exportedAt: new Date().toISOString() };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `fisher_lexicon_backup.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportData = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        const newConns = parsed.connections || connections;
        const newWords = parsed.customWords || customWords;
        setConnections(newConns); setCustomWords(newWords);
        localStorage.setItem('fisher_word_connections', JSON.stringify(newConns));
        localStorage.setItem('fisher_custom_words', JSON.stringify(newWords));
        showToast('Data imported successfully!');
      } catch (err) {
        showToast('Error parsing JSON backup.');
      }
    };
    reader.readAsText(file);
    e.target.value = null; 
  };

  const handleAddConnection = (wordA, wordB) => {
    const newConns = { ...connections };
    if (!newConns[wordA]) newConns[wordA] = [];
    if (!newConns[wordB]) newConns[wordB] = [];
    if (!newConns[wordA].includes(wordB)) newConns[wordA].push(wordB);
    if (!newConns[wordB].includes(wordA)) newConns[wordB].push(wordA);
    setConnections(newConns);
    localStorage.setItem('fisher_word_connections', JSON.stringify(newConns));
  };

  const handleRemoveConnection = (wordA, wordB) => {
    const newConns = { ...connections };
    if (newConns[wordA]) newConns[wordA] = newConns[wordA].filter(w => w !== wordB);
    if (newConns[wordB]) newConns[wordB] = newConns[wordB].filter(w => w !== wordA);
    setConnections(newConns);
    localStorage.setItem('fisher_word_connections', JSON.stringify(newConns));
  };

  const handleAddCustomWord = (newWord) => {
    const newWords = [...customWords, newWord];
    setCustomWords(newWords);
    localStorage.setItem('fisher_custom_words', JSON.stringify(newWords));
  };

  const allWordsWithData = useMemo(() => {
    const data = JSON.parse(JSON.stringify(VOCAB_DATA));
    customWords.forEach(w => {
      const cat = w.category || Object.keys(VOCAB_DATA)[0];
      if (data[cat]) data[cat].push(w);
    });
    return Object.values(data).flat();
  }, [customWords]);

  const categoriesList = Object.keys(VOCAB_DATA);
  const typeOptions = ["Nouns & Concepts", "Verbs & Actions", "Adjectives & States"];

  const activeWords = useMemo(() => {
    return allWordsWithData.filter(w => {
      const matchesSearch = w.en.toLowerCase().includes(searchTerm.toLowerCase()) || w.zh.includes(searchTerm);
      if (!matchesSearch) return false;
      const matchesContext = filters.context === 'All' || (w.category || categoriesList[0]) === filters.context;
      if (!matchesContext) return false;
      const matchesType = filters.type === 'All' || getWordType(w) === filters.type;
      if (!matchesType) return false;
      return true;
    });
  }, [allWordsWithData, searchTerm, filters, categoriesList]);

  const groupedData = useMemo(() => {
    let sorted = [...activeWords];
    if (sortBy === 'alpha') {
      sorted.sort((a, b) => a.en.localeCompare(b.en));
    } else if (sortBy === 'flipCount') {
      sorted.sort((a, b) => (flipCounts[b.en] || 0) - (flipCounts[a.en] || 0));
    } else if (sortBy === 'random') {
      const seededHash = (str) => {
        let h = 0xdeadbeef ^ Math.floor(randomSeed * 0xFFFFFFFF);
        for(let i = 0; i < str.length; i++)
            h = Math.imul(h ^ str.charCodeAt(i), 2654435761);
        return ((h ^ h >>> 16) >>> 0);
      };
      sorted.sort((a, b) => seededHash(a.en) - seededHash(b.en));
    }
    return { "Vocabulary": sorted };
  }, [activeWords, sortBy, sortTrigger, randomSeed]);

  return (
    <div className={`min-h-screen bg-bone-cream text-ink px-4 pr-12 sm:px-6 sm:pr-14 md:pl-12 md:pr-24 py-6 pt-32 sm:pt-28 md:py-12 font-ui select-none overflow-x-hidden ${dragState ? 'cursor-grabbing' : ''}`}>
      
      {toastMessage && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-ink text-paper-white px-6 py-3 rounded-full text-body-sm font-medium animate-in flex items-center gap-2">
          <Check className="w-4 h-4 text-paper-white" /> {toastMessage}
        </div>
      )}

      <AlphabetScrubber words={allWordsWithData} />

      <nav className="fixed top-0 left-0 right-0 z-40 bg-bone-cream/90 backdrop-blur-md px-3 sm:px-6 py-2.5 sm:py-4 transition-all border-b border-ink/10">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 sm:gap-4">
          
          <div className="flex items-center gap-1.5 sm:gap-2 flex-1 flex-wrap sm:flex-nowrap">
            <div className="relative w-full sm:w-[220px] md:w-[280px] shrink-0">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink opacity-40" />
              <input 
                type="text" value={searchTerm} placeholder="Search english or chinese..." onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-paper-white border-[1.5px] border-ink rounded-[16px] py-2 pl-11 pr-9 text-ink placeholder-ink/40 focus:outline-none focus:ring-1 focus:ring-ink transition-all text-body-sm font-ui"
              />
              {searchTerm && <button onClick={() => setSearchTerm('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-ink opacity-40 hover:opacity-100"><X className="w-4 h-4" /></button>}
            </div>
            
            <div className="flex items-center gap-1 bg-transparent border-[1.5px] border-ink rounded-[16px] p-1 ml-2">
               <button onClick={() => { setSortBy('random'); setSortTrigger(p => p + 1); setRandomSeed(Math.random()); }} className={`p-1.5 rounded-[10px] transition-colors ${sortBy === 'random' ? 'bg-ink text-paper-white' : 'text-ink hover:bg-ink/10'}`} title="Random Order"><Shuffle className="w-4 h-4" /></button>
               <button onClick={() => { setSortBy('alpha'); setSortTrigger(p => p + 1); }} className={`p-1.5 rounded-[10px] transition-colors ${sortBy === 'alpha' ? 'bg-ink text-paper-white' : 'text-ink hover:bg-ink/10'}`} title="Alphabetical"><ArrowDownAZ className="w-4 h-4" /></button>
               <button onClick={() => { setSortBy('flipCount'); setSortTrigger(p => p + 1); }} className={`p-1.5 rounded-[10px] transition-colors ${sortBy === 'flipCount' ? 'bg-ink text-paper-white' : 'text-ink hover:bg-ink/10'}`} title="By Flip Count"><ArrowDown className="w-4 h-4" /></button>
            </div>
            
            <div className="flex items-center gap-1 bg-transparent border-[1.5px] border-ink rounded-[16px] p-1 ml-1 sm:ml-2">
               <button onClick={() => setUserCols(prev => Math.min(5, prev + 1))} disabled={userCols >= 5} className="p-1.5 rounded-[10px] text-ink hover:bg-ink/10 disabled:opacity-30 transition-colors" title="Zoom Out (More Columns)"><ZoomOut className="w-4 h-4" /></button>
               <span className="font-mono text-[12px] w-4 text-center text-ink font-bold">{userCols}</span>
               <button onClick={() => setUserCols(prev => Math.max(3, prev - 1))} disabled={userCols <= 3} className="p-1.5 rounded-[10px] text-ink hover:bg-ink/10 disabled:opacity-30 transition-colors" title="Zoom In (Fewer Columns)"><ZoomIn className="w-4 h-4" /></button>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 pr-8 sm:pr-0">
             <button 
               onClick={() => setShowFront(!showFront)} 
               className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[12px] transition-all border-[1.5px] border-ink ${showFront ? 'bg-ink text-paper-white' : 'bg-transparent text-ink hover:bg-ink/5 opacity-50'}`}
             >
               <span className="text-caption font-bold">Front</span>
             </button>
             <button 
               onClick={() => setShowBack(!showBack)} 
               className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[12px] transition-all border-[1.5px] border-ink ${showBack ? 'bg-ink text-paper-white' : 'bg-transparent text-ink hover:bg-ink/5 opacity-50'}`}
             >
               <span className="text-caption font-bold">Back</span>
             </button>
          </div>
        </div>
      </nav>

      {/* Drag Overlays */}
      {dragState && (
        <svg className="fixed inset-0 w-full h-full pointer-events-none z-[60]">
          <line x1={dragState.startX} y1={dragState.startY} x2={dragState.currentX} y2={dragState.currentY} stroke={isHoveringRedTarget ? "var(--color-ink)" : "rgba(14, 14, 14, 0.5)"} strokeWidth={isHoveringRedTarget ? "4" : "2"} strokeDasharray="6 6" />
          <circle cx={dragState.startX} cy={dragState.startY} r="6" fill="var(--color-ink)" />
          <circle cx={dragState.currentX} cy={dragState.currentY} r={isHoveringRedTarget ? "12" : "8"} fill={isHoveringRedTarget ? "var(--color-ink)" : "rgba(14, 14, 14, 0.8)"} />
        </svg>
      )}

      {dragState && (
        <div id="red-search-drop-target" className={`fixed bottom-12 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 pointer-events-auto rounded-[16px] border-[1.5px] px-8 py-4 flex items-center gap-4 ${isHoveringRedTarget ? 'bg-ink border-ink text-paper-white scale-110' : 'bg-paper-white border-ink text-ink'}`}>
          <Search className={`w-6 h-6 ${isHoveringRedTarget ? 'animate-bounce' : ''}`} />
          <div className="flex flex-col"><span className="text-body-sm font-ui font-medium tracking-wide">{isHoveringRedTarget ? "Release to search target" : "Drop to search and connect"}</span><span className="text-caption opacity-70 font-mono">From: {dragState.sourceEn}</span></div>
        </div>
      )}

      <input type="file" accept=".json" ref={fileInputRef} onChange={handleImportData} className="hidden" />

      <SearchConnectModal sourceWordEn={searchConnectSource} isOpen={!!searchConnectSource} onClose={() => setSearchConnectSource(null)} onSelectTarget={handleAddConnection} allWords={allWordsWithData} connections={connections} />
      <AddWordModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onAdd={handleAddCustomWord} categories={categoriesList} />

      <header className="max-w-7xl mx-auto mb-16 pt-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <h1 className="text-display-lg font-display text-ink tracking-tight mb-6 leading-none hidden md:block">
              FISHER'S<br/>LEXICON
            </h1>
            <h1 className="text-display font-display text-ink tracking-tight mb-6 leading-none md:hidden">
              FISHER'S<br/>LEXICON
            </h1>
            <div className="text-body-sm text-ink font-mono flex items-center gap-3 bg-paper-white border-[1.5px] border-ink rounded-[16px] px-4 py-2 inline-flex">
              <span className="hidden md:inline font-medium">CAPITALIST REALISM ARCHIVE</span>
              <span className="text-ink opacity-30 hidden md:inline">•</span>
              <div className="flex items-center gap-4">
                 <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-ink"></span><span>Mastered <span className="font-bold">142</span></span></div>
                 <div className="flex items-center gap-1.5 opacity-60"><span className="w-2.5 h-2.5 rounded-full border-[1.5px] border-ink"></span><span>Pending <span className="font-bold">166</span></span></div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={handleExportData} className="p-3 bg-transparent border-[1.5px] border-ink hover-bg-ink hover-text-paper-white text-ink rounded-[16px] transition-colors" title="Export Backup"><Download className="w-5 h-5" /></button>
            <button onClick={() => fileInputRef.current?.click()} className="p-3 bg-transparent border-[1.5px] border-ink hover-bg-ink hover-text-paper-white text-ink rounded-[16px] transition-colors" title="Import Backup"><Upload className="w-5 h-5" /></button>
          </div>
        </div>
      </header>

      {/* Filter Area */}
      <div className="max-w-7xl mx-auto flex items-start mb-16 relative z-30 min-h-[50px]">
        <button 
          onClick={() => {
            if (isFilterPanelOpen) setFilters({ context: 'All', type: 'All' });
            setIsFilterPanelOpen(!isFilterPanelOpen);
          }}
          className={`shrink-0 p-4 rounded-[16px] transition-all border-[1.5px] flex items-center justify-center mr-4 z-40
            ${isFilterPanelOpen ? 'bg-ink text-paper-white border-ink' : 'bg-transparent text-ink border-ink hover-bg-ink hover-text-paper-white'}`}
        >
          <Filter className="w-6 h-6" />
        </button>

        {isFilterPanelOpen && (
          <div className="flex-1 bg-paper-white border-[1.5px] border-ink rounded-[16px] p-6 animate-in flex flex-col gap-6 origin-left overflow-hidden">
            <div className="flex items-start gap-4">
              <div className="flex-1 flex flex-wrap gap-2.5">
                {['All', ...categoriesList].map((cat, i) => {
                  const displayName = cat === 'All' ? 'All Contexts' : cat.match(/\((.*?)\)/)?.[1] || cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setFilters(p => ({...p, context: cat}))}
                      className={`px-4 py-2 text-caption uppercase tracking-wide rounded-full transition-all border-[1.5px] font-medium font-ui
                        ${filters.context === cat ? 'bg-ink text-paper-white border-ink' : 'bg-transparent text-ink border-ink border-opacity-30 hover:border-opacity-100'}`}
                    >
                      {displayName}
                    </button>
                  )
                })}
              </div>
              <button 
                onClick={() => setSortBy('context')} title="Sort by Context"
                className={`shrink-0 p-2 rounded-lg transition-colors border-[1.5px] ${sortBy === 'context' ? 'bg-ink text-paper-white border-ink' : 'border-transparent text-ink hover:bg-ink hover:bg-opacity-5'}`}
              >
                <ArrowDown className="w-5 h-5" />
              </button>
            </div>

            <div className="h-[1.5px] w-full bg-ink opacity-10" />

            <div className="flex items-start gap-4">
              <div className="flex-1 flex flex-wrap gap-2.5">
                {['All', ...typeOptions].map(type => (
                    <button
                      key={type}
                      onClick={() => setFilters(p => ({...p, type: type}))}
                      className={`px-4 py-2 text-caption uppercase tracking-wide rounded-full transition-all border-[1.5px] font-medium font-ui
                        ${filters.type === type ? 'bg-ink text-paper-white border-ink' : 'bg-transparent text-ink border-ink border-opacity-30 hover:border-opacity-100'}`}
                    >
                      {type}
                    </button>
                ))}
              </div>
              <button 
                onClick={() => setSortBy('type')} title="Sort by Type"
                className={`shrink-0 p-2 rounded-lg transition-colors border-[1.5px] ${sortBy === 'type' ? 'bg-ink text-paper-white border-ink' : 'border-transparent text-ink hover:bg-ink hover:bg-opacity-5'}`}
              >
                <ArrowDown className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      <main className="max-w-7xl mx-auto pr-8 sm:pr-12 md:pr-14 transition-all duration-300">
        <div className="space-y-24">
          {Object.entries(groupedData).map(([groupName, words], groupIdx) => {
            if (words.length === 0) return null;
            const displayName = groupName.includes('(') ? groupName.match(/\((.*?)\)/)?.[1] || groupName : groupName;
            const accentColor = THEME_COLORS[(groupIdx + 1) % THEME_COLORS.length]; // Offset to avoid pure orange everywhere

            return (
              <section key={groupName} className="animate-in relative z-20">
                <div className="flex items-center gap-4 mb-10 border-l-[4px] pl-5" style={{ borderColor: accentColor }}>
                  <h2 className="text-ink text-heading-sm font-ui font-medium tracking-wide uppercase flex items-center gap-3">
                    {displayName}
                    <span className="text-[12px] bg-paper-white border-[1.5px] border-ink text-ink px-2.5 py-1 rounded-full font-mono font-bold leading-none">{words.length}</span>
                  </h2>
                </div>
                
                <div className="flex gap-6 items-start w-full">
                  {Array.from({ length: cols }).map((_, colIndex) => (
                    <div key={colIndex} className="flex-1 flex flex-col gap-6">
                      {words.filter((_, idx) => idx % cols === colIndex).map((item, idx) => {
                        const isFlipped = flippedCards[item.en] || false;
                        const isCollapsed = (!showFront && !isFlipped) || (!showBack && isFlipped);
                        return (
                          <WordCard 
                            key={item.en} word={item} delay={((idx * cols + colIndex) % 15) * 40} connections={connections}
                            onAddConnection={handleAddConnection} onRemoveConnection={handleRemoveConnection}
                            allWords={allWordsWithData} onStartDrag={handleStartDrag} accentColor={accentColor}
                            flipCount={flipCounts[item.en] || 0} onFlip={() => handleFlipCount(item.en)}
                            isFlipped={isFlipped} isCollapsed={isCollapsed} onSideChange={() => setFlippedCards(prev => ({...prev, [item.en]: !prev[item.en]}))}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
          
          {Object.keys(groupedData).length === 0 && (
            <div className="text-center py-32 text-ink flex flex-col items-center font-ui opacity-30">
               <Ghost className="w-16 h-16 mb-6 opacity-50" />
               <p className="text-heading-sm">No words found for current filters.</p>
            </div>
          )}
        </div>
      </main>

      <footer className="max-w-7xl mx-auto mt-40 pt-12 border-t-[1.5px] border-ink flex justify-between items-center text-caption font-ui tracking-wide text-ink pb-12 relative z-20">
        <p className="font-bold">© RAW MATERIALS // FISHER LEXICON</p>
        <p>There is no alternative.</p>
      </footer>
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;900&family=JetBrains+Mono:wght@400;700&display=swap');

        :root {
          --color-ink: #0e0e0e;
          --color-bone-cream: #f4e9e1;
          --color-paper-white: #ffffff;
        }

        body { font-family: 'Inter', sans-serif; background-color: var(--color-bone-cream); }
        .font-ui { font-family: 'Inter', sans-serif; }
        .font-display { font-family: 'Inter', sans-serif; font-weight: 900; }
        
        .text-caption { font-size: 12px; line-height: 1.38; letter-spacing: -0.05em; }
        .text-body-sm { font-size: 14px; line-height: 1.38; letter-spacing: -0.05em; }
        .text-body { font-size: 16px; line-height: 1.38; letter-spacing: -0.02em; }
        .text-subheading { font-size: 20px; line-height: 1.2; letter-spacing: -0.02em; }
        .text-heading-sm { font-size: 24px; line-height: 1.2; letter-spacing: -0.02em; }
        .text-heading { font-size: 32px; line-height: 1.17; letter-spacing: -0.01em; }
        .text-display { font-size: 100px; line-height: 1.03; letter-spacing: -1px; }
        .text-display-lg { font-size: 150px; line-height: 1; letter-spacing: -2px; }

        /* Explicit Tailwind-like utility classes to ensure Raw Materials colors work perfectly */
        .bg-ink { background-color: var(--color-ink); }
        .text-ink { color: var(--color-ink); }
        .border-ink { border-color: var(--color-ink); }
        
        .bg-bone-cream { background-color: var(--color-bone-cream); }
        .text-bone-cream { color: var(--color-bone-cream); }
        .border-bone-cream { border-color: var(--color-bone-cream); }
        
        .bg-paper-white { background-color: var(--color-paper-white); }
        .text-paper-white { color: var(--color-paper-white); }
        .border-paper-white { border-color: var(--color-paper-white); }

        .hover-bg-ink:hover { background-color: var(--color-ink); color: var(--color-paper-white); }
        .hover-text-paper-white:hover { color: var(--color-paper-white); }

        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-in { animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }

        @keyframes flipOut {
          from { transform: perspective(1000px) rotateX(0deg); }
          to { transform: perspective(1000px) rotateX(90deg); }
        }
        @keyframes flipIn {
          from { transform: perspective(1000px) rotateX(-90deg); }
          to { transform: perspective(1000px) rotateX(0deg); }
        }
        
        /* 0.5s total flip animation (0.25s out, 0.25s in) with non-linear bezier curves */
        .animate-flip-out {
          animation: flipOut 0.25s cubic-bezier(0.55, 0.085, 0.68, 0.53) forwards;
        }
        .animate-flip-in {
          animation: flipIn 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }

        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: var(--color-ink); border-radius: 99px; }
      `}</style>
    </div>
  );
}