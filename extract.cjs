const fs = require('fs');
const content = fs.readFileSync('src/App.tsx', 'utf8');

const vocabMatch = content.match(/const VOCAB_DATA = \{[\s\S]*?\n\};\n/);
const themeMatch = content.match(/const THEME_COLORS = \[.*?\];/);

const dataFileContent = `
export ${vocabMatch[0]}

export const categoriesList = Object.keys(VOCAB_DATA);

export const allWordsWithData = categoriesList.flatMap(cat => 
  VOCAB_DATA[cat].map(w => ({ ...w, category: cat }))
);

export ${themeMatch[0]}
`;

fs.writeFileSync('src/data/mockData.ts', dataFileContent.trim(), 'utf8');
