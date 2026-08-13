// @ts-nocheck
// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { MiniTopology } from './TopologyGraph';

export const WordCard = ({ word, delay, connections, onAddConnection, onRemoveConnection, allWords, onStartDrag, accentColor, flipCount, onFlip, isFlipped, isCollapsed, onSideChange }) => {
  const [isExpanded, setIsExpanded] = useState(isFlipped || false);
  const [flipState, setFlipState] = useState('idle'); // 'idle' | 'out' | 'in'
  const [isVisible, setIsVisible] = useState(false);
  const [showHoverGraph, setShowHoverGraph] = useState(false);
  const [popoverPos, setPopoverPos] = useState('right');
  const [isHovered, setIsHovered] = useState(false);
  
  const cardRef = useRef(null);
  const hoverTimeoutRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const handleToggle = (e) => {
    e.stopPropagation();
    if (flipState !== 'idle') return;
    
    if (!isFlipped && onFlip) {
      onFlip();
    }
    
    setFlipState('out');
    setIsExpanded(prev => !prev);
    
    // Swap content exactly halfway through the 0.5s animation (at 250ms)
    setTimeout(() => {
      onSideChange && onSideChange();
      setFlipState('in');
      
      // Animation completes
      setTimeout(() => {
        setFlipState('idle');
      }, 250); 
    }, 250);
  };

  const currentLinks = connections[word.en] || [];
  const connCount = currentLinks.length;

  const handleMouseEnterBottom = () => {
    if (cardRef.current) {
       const rect = cardRef.current.getBoundingClientRect();
       if (window.innerWidth - rect.right < 320 && rect.left > 320) setPopoverPos('left'); else setPopoverPos('right');
    }
    // 1-second delay before showing topology
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setShowHoverGraph(true);
    }, 1000);
  };

  const handleMouseLeaveBottom = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setShowHoverGraph(false);
  };

  const flipClass = flipState === 'out' ? 'animate-flip-out' : flipState === 'in' ? 'animate-flip-in' : '';

  return (
    <div 
      data-word-card data-word-en={word.en} ref={cardRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative break-inside-avoid transition-all duration-700 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${showHoverGraph ? 'z-40' : 'z-10'} select-none`}
    >
      <div className={`transition-transform duration-200 ${!isFlipped && flipState === 'idle' ? 'hover:-translate-y-1' : ''}`}>
        <div 
          className={`flex flex-col rounded-[16px] overflow-visible transition-colors duration-200 border-[1.5px] border-ink ${flipClass}
            ${isFlipped ? 'bg-ink text-paper-white' : 'bg-paper-white text-ink'}`}
        >
          <div 
            onClick={handleToggle} 
            className={`flex-1 p-4 cursor-pointer flex flex-col items-center justify-center relative z-10 transition-all duration-300 ${isCollapsed ? 'min-h-[40px] py-2' : 'min-h-[80px]'}`}
          >
            {flipCount > 0 && !isCollapsed && (
              <div className={`absolute top-4 right-4 text-[11px] font-ui font-bold px-2 py-0.5 rounded-full ${isFlipped ? 'bg-paper-white text-ink' : 'bg-ink text-paper-white'} opacity-40 transition-colors`}>
                × {flipCount}
              </div>
            )}
            <div className="relative w-full flex flex-col items-center justify-center">
              <span className={`font-display leading-tight tracking-tight text-center break-all sm:break-words px-2 transition-all duration-300 ${isCollapsed ? 'text-body font-bold' : word.en.length > 13 ? 'text-subheading' : 'text-heading'}`}>
                {word.en}
              </span>
            </div>
            
            <div 
              className="grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] text-left w-full font-ui" 
              style={{ gridTemplateRows: (isExpanded && !isCollapsed) ? '1fr' : '0fr' }}
            >
              <div className={`overflow-hidden transition-opacity duration-200 ${(isFlipped && !isCollapsed) ? 'opacity-100' : 'opacity-0'}`}>
                <div className="mt-6 h-[2px] w-full mb-4 bg-paper-white opacity-20" />
                <p className="text-subheading font-medium mb-3">{word.zh}</p>
                <p className="text-body leading-body opacity-90">"{word.ex}"</p>
              </div>
            </div>
          </div>

          <div onMouseEnter={handleMouseEnterBottom} onMouseLeave={handleMouseLeaveBottom} className={`relative shrink-0 transition-all duration-300 overflow-hidden ${isCollapsed ? 'h-0 opacity-0 border-t-0' : 'h-12 opacity-100'}`}>
             <div 
                onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); onStartDrag(e, word.en); }}
                onTouchStart={(e) => { e.preventDefault(); e.stopPropagation(); onStartDrag(e, word.en); }}
                className="absolute inset-0 flex items-center justify-end px-4 border-t-[1.5px] border-ink/20 cursor-grab active:cursor-grabbing transition-colors duration-300 rounded-b-[16px] hover:bg-ink hover:bg-opacity-5"
             >
                <span className="text-caption font-ui opacity-40 mr-auto select-none pointer-events-none">Connect</span>
                <div className="flex items-center gap-1.5 h-full py-3 opacity-80 pointer-events-none">
                  {Array.from({ length: Math.min(connCount, 10) }).map((_, i) => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-ink" />
                  ))}
                  {connCount > 10 && <span className="text-[10px] font-ui font-medium ml-1">+{connCount - 10}</span>}
                </div>
             </div>

             {showHoverGraph && (
               <div className={`absolute top-0 ${popoverPos === 'right' ? 'left-[calc(100%+12px)]' : 'right-[calc(100%+12px)]'} w-[300px] z-[100] cursor-default animate-in`} onClick={(e) => e.stopPropagation()}>
                  <MiniTopology 
                    centerWord={word.en} connections={currentLinks} allWords={allWords}
                    onAddConnection={(targetEn) => onAddConnection(word.en, targetEn)}
                    onRemoveConnection={(targetEn) => onRemoveConnection(word.en, targetEn)}
                  />
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};
