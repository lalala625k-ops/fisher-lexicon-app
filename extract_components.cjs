const fs = require('fs');
const content = fs.readFileSync('src/App.tsx', 'utf8');

// TopologyGraph (MiniTopology)
const miniTopoMatch = content.match(/const MiniTopology = \([\s\S]*?\n\};\n/);
let miniTopoCode = `import React, { useMemo } from 'react';\n\nexport ${miniTopoMatch[0]}`;
fs.writeFileSync('src/components/TopologyGraph.tsx', miniTopoCode, 'utf8');

// WordCard
const wordCardMatch = content.match(/const WordCard = \([\s\S]*?\n\};\n/);
let wordCardCode = `import React, { useState, useEffect, useRef } from 'react';\nimport { MiniTopology } from './TopologyGraph';\n\nexport ${wordCardMatch[0]}`;
fs.writeFileSync('src/components/WordCard.tsx', wordCardCode, 'utf8');

// Modals
const searchConnMatch = content.match(/const SearchConnectModal = \([\s\S]*?\n\};\n/);
const addWordMatch = content.match(/const AddWordModal = \([\s\S]*?\n\};\n/);
let modalsCode = `import React, { useState, useMemo } from 'react';\nimport { Search, X } from 'lucide-react';\n\nexport ${searchConnMatch[0]}\n\nexport ${addWordMatch[0]}`;
fs.writeFileSync('src/components/Modals.tsx', modalsCode, 'utf8');
