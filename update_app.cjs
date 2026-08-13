const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(/const VOCAB_DATA = \{[\s\S]*?\n\};\n/, '');
content = content.replace(/const THEME_COLORS = \[.*?\];/, '');
content = content.replace(/const MiniTopology = \([\s\S]*?\n\};\n/, '');
content = content.replace(/const WordCard = \([\s\S]*?\n\};\n/, '');
content = content.replace(/const SearchConnectModal = \([\s\S]*?\n\};\n/, '');
content = content.replace(/const AddWordModal = \([\s\S]*?\n\};\n/, '');
content = content.replace(/^import React.*?\} from 'lucide-react';\n/sm, '');

const imports = `import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Search, Ghost, Network, Link as LinkIcon, X, Plus, 
  Download, Upload, PlusCircle, Check, ZoomIn, ZoomOut, 
  RotateCcw, Filter, ArrowDown, Shuffle, ArrowDownAZ, Eye, EyeOff, CheckCircle2
} from 'lucide-react';

import { allWordsWithData, categoriesList, THEME_COLORS } from './data/mockData';
import { WordCard } from './components/WordCard';
import { SearchConnectModal, AddWordModal } from './components/Modals';\n\n`;

fs.writeFileSync('src/App.tsx', imports + content.trim(), 'utf8');
