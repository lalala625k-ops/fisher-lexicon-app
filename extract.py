import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Extract VOCAB_DATA
vocab_match = re.search(r'const VOCAB_DATA = \{.*?\n\};\n', content, re.DOTALL)
if vocab_match:
    vocab_data = vocab_match.group(0)
else:
    vocab_data = ''

# Extract THEME_COLORS
theme_match = re.search(r'const THEME_COLORS = \{.*?\n\};\n', content, re.DOTALL)
if theme_match:
    theme_colors = theme_match.group(0)
else:
    theme_colors = ''

data_file_content = f'''
export {vocab_data}

export const categoriesList = Object.keys(VOCAB_DATA);

export const allWordsWithData = categoriesList.flatMap(cat => 
  VOCAB_DATA[cat].map(w => ({{ ...w, category: cat }}))
);

export {theme_colors}
'''

with open('src/data/mockData.ts', 'w', encoding='utf-8') as f:
    f.write(data_file_content.strip())
