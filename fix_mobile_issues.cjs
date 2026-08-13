const fs = require('fs');

let app = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Fix outer wrapper padding to prevent AlphabetScrubber overlap on mobile (<640px)
app = app.replace(
  /className={`min-h-screen bg-bone-cream text-ink [^`]+`/,
  "className={`min-h-screen bg-bone-cream text-ink px-4 pr-12 sm:px-6 sm:pr-14 md:pl-12 md:pr-24 py-6 pt-32 sm:pt-28 md:py-12 font-ui select-none overflow-x-hidden ${dragState ? 'cursor-grabbing' : ''}`"
);

// 2. Fix Nav container to be flex-wrap and responsive on mobile
const oldNav = `<nav className="fixed top-0 left-0 right-0 z-40 bg-bone-cream bg-opacity-90 backdrop-blur-md px-6 py-4 transition-all border-b border-ink border-opacity-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">`;

const newNav = `<nav className="fixed top-0 left-0 right-0 z-40 bg-bone-cream/90 backdrop-blur-md px-3 sm:px-6 py-2.5 sm:py-4 transition-all border-b border-ink/10">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 sm:gap-4">`;

app = app.replace(oldNav, newNav);

// 3. Make Search bar responsive width
app = app.replace(
  'className="relative w-[280px] shrink-0"',
  'className="relative w-full sm:w-[220px] md:w-[280px] shrink-0"'
);

// 4. Ensure nav controls sub-containers wrap nicely
app = app.replace(
  'className="flex items-center gap-2 flex-1"',
  'className="flex items-center gap-1.5 sm:gap-2 flex-1 flex-wrap sm:flex-nowrap"'
);

// 5. Ensure right-hand nav buttons (Front/Back) don't overflow right on mobile
app = app.replace(
  'className="flex items-center gap-2 shrink-0 pr-4"',
  'className="flex items-center gap-1.5 sm:gap-2 shrink-0 pr-8 sm:pr-0"'
);

fs.writeFileSync('src/App.tsx', app, 'utf8');
console.log('Mobile nav & padding fixes successfully applied!');
