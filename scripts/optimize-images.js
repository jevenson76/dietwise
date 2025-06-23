#!/usr/bin/env node

import imagemin from 'imagemin';
import imageminPngquant from 'imagemin-pngquant';
import imageminGifsicle from 'imagemin-gifsicle';
import { promises as fs } from 'fs';
import path from 'path';

const INPUT_PATHS = [
  'ios/App/App/Assets.xcassets/**/*.png',
  'android/app/src/main/res/**/splash.png',
  'android/app/src/main/res/mipmap-*/*.png',
  'public/icons/*.png'
];

const OUTPUT_DIR = 'optimized-images';

async function optimizeImages() {
  console.log('🖼️  Starting image optimization...');

  try {
    // Create output directory
    await fs.mkdir(OUTPUT_DIR, { recursive: true });

    // Get original sizes
    const getFileSize = async (filePath) => {
      try {
        const stats = await fs.stat(filePath);
        return stats.size;
      } catch {
        return 0;
      }
    };

    let totalOriginalSize = 0;
    let totalOptimizedSize = 0;
    let filesProcessed = 0;

    for (const inputPath of INPUT_PATHS) {
      console.log(`📁 Processing: ${inputPath}`);
      
      const files = await imagemin([inputPath], {
        destination: path.join(OUTPUT_DIR, path.dirname(inputPath)),
        plugins: [
          imageminPngquant({
            quality: [0.6, 0.8], // Compress to 60-80% quality
            speed: 1, // Slower but better compression
            strip: true // Remove metadata
          }),
          imageminGifsicle({
            optimizationLevel: 3
          })
        ]
      });

      for (const file of files) {
        const originalSize = await getFileSize(file.sourcePath);
        const optimizedSize = file.data.length;
        
        totalOriginalSize += originalSize;
        totalOptimizedSize += optimizedSize;
        filesProcessed++;

        const savings = ((originalSize - optimizedSize) / originalSize * 100).toFixed(1);
        console.log(`  ✅ ${path.basename(file.sourcePath)}: ${originalSize} → ${optimizedSize} bytes (${savings}% smaller)`);
      }
    }

    const totalSavings = ((totalOriginalSize - totalOptimizedSize) / totalOriginalSize * 100).toFixed(1);
    
    console.log('\n📊 Optimization Summary:');
    console.log(`   Files processed: ${filesProcessed}`);
    console.log(`   Original total: ${(totalOriginalSize / 1024).toFixed(1)} KB`);
    console.log(`   Optimized total: ${(totalOptimizedSize / 1024).toFixed(1)} KB`);
    console.log(`   Total savings: ${totalSavings}% (${((totalOriginalSize - totalOptimizedSize) / 1024).toFixed(1)} KB)`);
    
    console.log('\n🎯 Next steps:');
    console.log('   1. Review optimized images in the "optimized-images" folder');
    console.log('   2. Replace original images with optimized versions if satisfied');
    console.log('   3. Run "npm run build" to see the impact on bundle size');

  } catch (error) {
    console.error('❌ Error during optimization:', error.message);
    process.exit(1);
  }
}

optimizeImages();