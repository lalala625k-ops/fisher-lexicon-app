// @ts-nocheck
// @ts-nocheck
import React, { useMemo, useState } from 'react';
import { Network, X, Search, Plus } from 'lucide-react';

export const MiniTopology = ({ centerWord, connections, allWords, onAddConnection, onRemoveConnection }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const connectedWords = connections || [];
  
  const baseRadius = 80;
  const cx = 150;
  const cy = 150;
  
  const handleRemove = (e, targetEn) => {
    e.stopPropagation();
    onRemoveConnection(targetEn);
  };

  const linkSuggestions = useMemo(() => {
    if (!searchTerm) return [];
    return allWords.filter(w => 
      w.en !== centerWord && 
      !connectedWords.includes(w.en) &&
      (w.en.toLowerCase().includes(searchTerm.toLowerCase()) || w.zh.includes(searchTerm))
    ).slice(0, 4);
  }, [searchTerm, allWords, centerWord, connectedWords]);

  const handleAddLink = (e, targetWordEn) => {
    e.stopPropagation();
    onAddConnection(targetWordEn);
    setSearchTerm('');
  };
  
  return (
    <div className="relative w-full bg-[#9333ea] text-white rounded-[16px] border-[1.5px] border-[#9333ea]">
       <div className="flex justify-between items-center mb-2 px-3 pt-3">
         <span className="text-[12px] text-white font-ui flex items-center gap-2 uppercase tracking-wide">
           <Network className="w-4 h-4 text-white" /> TOPOLOGY
         </span>
       </div>

       <div className="relative w-full aspect-square max-w-[300px] mx-auto overflow-hidden bg-white/10 rounded-[12px] border-[1.5px] border-white/20 group/canvas" onClick={e => e.stopPropagation()}>
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 300 300">
             {connectedWords.map((wordEn, idx) => {
                const angle = (idx / connectedWords.length) * 2 * Math.PI;
                const x = cx + baseRadius * Math.cos(angle);
                const y = cy + baseRadius * Math.sin(angle);
                return (
                  <line 
                    key={wordEn} x1={cx} y1={cy} x2={x} y2={y}
                    stroke="#ffffff" strokeWidth="1.5" strokeDasharray="4 4" className="opacity-40"
                  />
                );
             })}
          </svg>
          
          <div className="absolute transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center bg-white text-[#9333ea] rounded-full px-3 py-1.5 z-20" style={{ left: '50%', top: '50%' }}>
             <span className="font-ui font-medium text-caption truncate max-w-[100px] text-center">{centerWord}</span>
          </div>

          {connectedWords.map((wordEn, idx) => {
              const angle = (idx / connectedWords.length) * 2 * Math.PI;
              const xPos = 50 + (baseRadius / 150) * 50 * Math.cos(angle);
              const yPos = 50 + (baseRadius / 150) * 50 * Math.sin(angle);
              
              return (
                <div key={wordEn} className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10 group/node" style={{ left: `${xPos}%`, top: `${yPos}%` }}>
                   <div className="relative bg-[#9333ea] border-[1.5px] border-white rounded-full px-2 py-1 text-[11px] text-white transition-colors cursor-pointer flex items-center hover:bg-white hover:text-[#9333ea]">
                      <span className="truncate max-w-[80px] font-ui">{wordEn}</span>
                      <button onClick={(e) => handleRemove(e, wordEn)} className="opacity-0 group-hover/node:opacity-100 ml-1.5 hover:scale-110 transition-transform">
                         <X className="w-3 h-3" />
                      </button>
                   </div>
                </div>
              );
          })}
          
          {connectedWords.length === 0 && (
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 <span className="text-caption text-white/60 font-ui italic">No connections yet. Drag to connect.</span>
             </div>
          )}
       </div>

       <div className="mt-2 relative p-3" onClick={e => e.stopPropagation()}>
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
          <input 
            type="text" placeholder="Search target word..." value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/10 border-[1.5px] border-white/30 rounded-[8px] text-body-sm font-ui py-2 pl-9 pr-3 text-white placeholder-white/50 focus:outline-none focus:ring-1 focus:ring-white transition-colors"
          />
          {linkSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-[#9333ea] border-[1.5px] border-white/30 rounded-[16px] z-30 overflow-hidden shadow-xl">
              {linkSuggestions.map(sugg => (
                <div key={sugg.en} onClick={(e) => handleAddLink(e, sugg.en)} className="px-4 py-3 text-body-sm hover:bg-white hover:text-[#9333ea] cursor-pointer flex justify-between items-center text-white border-b-[1.5px] border-white/10 last:border-0 font-ui group">
                  <div className="flex flex-col"><span className="font-medium">{sugg.en}</span><span className="text-[10px] opacity-70 group-hover:opacity-100">{sugg.zh}</span></div>
                  <Plus className="w-4 h-4" />
                </div>
              ))}
            </div>
          )}
       </div>
    </div>
  );
};
