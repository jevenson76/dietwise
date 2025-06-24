const fs = require('fs');
const path = require('path');

// Create a simple SVG icon for DietWise
const svgIcon = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0d9488;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#0f766e;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect width="512" height="512" rx="80" fill="url(#bg)"/>
  
  <!-- Apple icon -->
  <g transform="translate(256,256) scale(8,8)">
    <!-- Apple body -->
    <path d="M-12,-8 C-12,-16 -8,-20 0,-20 C8,-20 12,-16 12,-8 C12,8 8,16 0,16 C-8,16 -12,8 -12,-8 Z" 
          fill="white" opacity="0.9"/>
    
    <!-- Apple stem -->
    <path d="M0,-20 L0,-24" stroke="white" stroke-width="2" stroke-linecap="round" opacity="0.8"/>
    
    <!-- Apple leaf -->
    <path d="M2,-22 C6,-20 8,-16 6,-14" stroke="white" stroke-width="1.5" 
          fill="none" stroke-linecap="round" opacity="0.7"/>
    
    <!-- Nutrition symbols -->
    <circle cx="-6" cy="-4" r="2" fill="#0d9488" opacity="0.6"/>
    <circle cx="6" cy="0" r="2" fill="#0d9488" opacity="0.6"/>
    <circle cx="0" cy="4" r="2" fill="#0d9488" opacity="0.6"/>
  </g>
</svg>
`;

// Write SVG to file
fs.writeFileSync(path.join(__dirname, 'public', 'icon.svg'), svgIcon);