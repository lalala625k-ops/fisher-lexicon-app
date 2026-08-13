const fs = require('fs');

// 1. Update App.tsx
let app = fs.readFileSync('src/App.tsx', 'utf8');

// Fix column buttons visibility (remove 'hidden lg:flex', change to 'flex')
app = app.replace(
  'className="hidden lg:flex items-center gap-1 bg-transparent border-[1.5px] border-ink rounded-[16px] p-1 ml-2"',
  'className="flex items-center gap-1 bg-transparent border-[1.5px] border-ink rounded-[16px] p-1 ml-1 sm:ml-2"'
);

// Responsive updateCols logic that respects userCols better
const oldUpdateCols = `const updateCols = () => {
      if (window.innerWidth >= 1024) setCols(userCols);
      else if (window.innerWidth >= 768) setCols(3);
      else if (window.innerWidth >= 640) setCols(2);
      else setCols(1);
      };`;

const newUpdateCols = `const updateCols = () => {
      const width = window.innerWidth;
      if (width >= 1280) setCols(userCols);
      else if (width >= 1024) setCols(Math.min(userCols, 4));
      else if (width >= 768) setCols(Math.min(userCols, 3));
      else if (width >= 500) setCols(Math.min(userCols, 2));
      else setCols(1);
    };`;

app = app.replace(oldUpdateCols, newUpdateCols);

// Add right padding to main element so cards never collide with right AlphabetScrubber
app = app.replace(
  'className="max-w-7xl mx-auto transition-all duration-300"',
  'className="max-w-7xl mx-auto pr-8 sm:pr-12 md:pr-14 transition-all duration-300"'
);

// Style AlphabetScrubber to be more compact on smaller/zoomed screens
app = app.replace(
  'className="fixed right-1 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-1 p-2"',
  'className="fixed right-1 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-[2px] sm:gap-1 p-1 bg-bone-cream/70 backdrop-blur-xs rounded-full border border-ink/10 shadow-xs max-h-[85vh] overflow-y-auto custom-scrollbar"'
);

fs.writeFileSync('src/App.tsx', app, 'utf8');

// 2. Update WordCard.tsx for text overflow prevention and popover boundary checking
let wordCard = fs.readFileSync('src/components/WordCard.tsx', 'utf8');

// Fix text class to break words and scale down long words automatically
wordCard = wordCard.replace(
  "className={`font-display leading-tight tracking-tight text-center break-words px-2 transition-all duration-300 ${isCollapsed ? 'text-body font-bold' : 'text-heading'}`}",
  "className={`font-display leading-tight tracking-tight text-center break-all sm:break-words px-2 transition-all duration-300 ${isCollapsed ? 'text-body font-bold' : word.en.length > 13 ? 'text-subheading' : 'text-heading'}`}"
);

// Improve popover positioning logic
wordCard = wordCard.replace(
  "if (window.innerWidth - rect.right < 340) setPopoverPos('left');",
  "if (window.innerWidth - rect.right < 320 && rect.left > 320) setPopoverPos('left'); else setPopoverPos('right');"
);

fs.writeFileSync('src/components/WordCard.tsx', wordCard, 'utf8');

console.log("Successfully optimized App.tsx and WordCard.tsx!");
