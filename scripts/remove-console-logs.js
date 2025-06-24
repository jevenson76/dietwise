#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

// Directories to exclude
const excludeDirs = ['node_modules', 'dist', '.git', 'coverage', 'build'];
const excludeFiles = ['test', 'spec', 'debug', 'logger', 'loggingService'];

// Find all TypeScript and JavaScript files
const patterns = ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'];

let totalRemoved = 0;
let filesModified = 0;

patterns.forEach(pattern => {
  const files = glob.sync(pattern, {
    ignore: excludeDirs.map(dir => `**/${dir}/**`)
  });

  files.forEach(file => {
    // Skip test and debug files
    if (excludeFiles.some(exclude => file.toLowerCase().includes(exclude))) {
      return;
    }

    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');
    let modified = false;
    
    const newLines = lines.map(line => {
      // Skip if line is a comment
      if (line.trim().startsWith('//') || line.trim().startsWith('*')) {
        return line;
      }
      
      // Check if line contains console statement

        // Preserve console.error and console.warn in production for critical issues
        if (process.env.NODE_ENV !== 'production') {
        if (line.includes('console.error') || line.includes('console.warn')) {
        }
          // Wrap in production check
          if (!line.includes('NODE_ENV')) {
            totalRemoved++;
            modified = true;
            const indent = line.match(/^\s*/)[0];
            return `${indent}if (process.env.NODE_ENV !== 'production') {\n${line}\n${indent}}`;
          }
        } else {
          // Remove other console statements
          totalRemoved++;
          modified = true;
          return ''; // Remove the line
        }
      }
      return line;
    });

    if (modified) {
      filesModified++;
      // Remove empty lines that result from deletion
      const cleanedContent = newLines
        .filter((line, index) => {
          // Keep line if it's not empty or if previous/next line isn't empty
          return line !== '' || (newLines[index - 1] !== '' && newLines[index + 1] !== '');
        })
        .join('\n');
      
      fs.writeFileSync(file, cleanedContent);

    }
  });
});
if (process.env.NODE_ENV !== 'production') {
console.log('\n⚠️  Note: console.error and console.warn are wrapped in production checks');
}
