const fs = require('fs');
const path = require('path');

const findFiles = (dir, fileList = []) => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const stat = fs.statSync(path.join(dir, file));
    if (stat.isDirectory()) {
      findFiles(path.join(dir, file), fileList);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      fileList.push(path.join(dir, file));
    }
  }
  return fileList;
};

const srcDir = path.join(process.cwd(), 'src');
const files = findFiles(srcDir);

let changedFiles = 0;

for (const file of files) {
  if (file === path.join(srcDir, 'config', 'apiClient.ts')) continue;
  
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('fetch(') || content.includes('fetch (')) {
    
    // Replace fetch with apiFetch
    content = content.replace(/\bfetch\s*\(/g, 'apiFetch(');
    
    // Calculate relative path to apiClient.ts
    let relativePath = path.relative(path.dirname(file), path.join(srcDir, 'config', 'apiClient')).replace(/\\/g, '/');
    const importPath = relativePath.startsWith('.') ? relativePath : './' + relativePath;
    
    // Add import statement
    const importStmt = `import { apiFetch } from '${importPath}';\n`;
    
    if (content.includes(`import { apiFetch }`)) continue; // already imported
    
    const importIndex = content.lastIndexOf('import ');
    if (importIndex !== -1) {
      const endOfImports = content.indexOf('\n', importIndex) + 1;
      content = content.substring(0, endOfImports) + importStmt + content.substring(endOfImports);
    } else {
      content = importStmt + content;
    }
    
    fs.writeFileSync(file, content);
    changedFiles++;
    console.log('Updated', file);
  }
}
console.log('Total files updated:', changedFiles);
