#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Directories to process
const directories = [
  '../src',
  '../components',
  '../hooks',
  '../services',
  '../utils'
];

// File extensions to process
const extensions = ['.js', '.jsx', '.ts', '.tsx'];

// Patterns to remove (but keep console.error in catch blocks)
const consolePatterns = [
  /console\.log\s*\([^)]*\);?/g,
  /console\.warn\s*\([^)]*\);?/g,
  /console\.info\s*\([^)]*\);?/g,
  /console\.debug\s*\([^)]*\);?/g,
  /console\.trace\s*\([^)]*\);?/g,
];

let filesProcessed = 0;
let statementsRemoved = 0;

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  let fileStatementsRemoved = 0;

  // Check if this is a test file or contains console.error in catch blocks
  const isTestFile = filePath.includes('.test.') || filePath.includes('.spec.');
  
  consolePatterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      matches.forEach(match => {
        // Skip console.error in catch blocks
        if (match.includes('console.error')) {
          const beforeMatch = content.substring(0, content.indexOf(match));
          const lastCatchIndex = beforeMatch.lastIndexOf('catch');
          const lastTryIndex = beforeMatch.lastIndexOf('try');
          
          // If we're in a catch block, keep the console.error
          if (lastCatchIndex > lastTryIndex) {
            return;
          }
        }
        
        // Remove the console statement
        content = content.replace(match, '');
        fileStatementsRemoved++;
      });
    }
  });

  // Clean up empty lines left behind
  content = content.replace(/^\s*[\r\n]/gm, '\n');
  content = content.replace(/\n\n\n+/g, '\n\n');

  if (content !== originalContent && !isTestFile) {
    fs.writeFileSync(filePath, content);
    console.log(`✓ Processed ${filePath} - Removed ${fileStatementsRemoved} statements`);
    statementsRemoved += fileStatementsRemoved;
    filesProcessed++;
  }
}

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      processDirectory(filePath);
    } else if (stat.isFile() && extensions.includes(path.extname(file))) {
      processFile(filePath);
    }
  });
}

console.log('🧹 Removing console statements from production code...\n');

directories.forEach(dir => {
  const fullPath = path.join(__dirname, dir);
  if (fs.existsSync(fullPath)) {
    processDirectory(fullPath);
  }
});

console.log(`\n✅ Complete! Processed ${filesProcessed} files and removed ${statementsRemoved} console statements.`);
console.log('\n💡 Note: console.error statements in catch blocks were preserved.');
console.log('💡 Test files were skipped.');