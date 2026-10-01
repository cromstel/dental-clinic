const https = require('https');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const IMAGES_DIR = path.join(__dirname, '..', 'public', 'images');
const SERVICES_DIR = path.join(IMAGES_DIR, 'services');
const DOCTORS_DIR = path.join(IMAGES_DIR, 'doctors');
const TRANSFORM_DIR = path.join(IMAGES_DIR, 'transform');

[SERVICES_DIR, DOCTORS_DIR, TRANSFORM_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Verified working Unsplash photo IDs for dental/medical contexts
// These are known to work as of 2024
const IMAGE_SOURCES = {
  doctors: {
    // Keys are the output filenames, and must match each clinician's `slug` in
    // src/content/accra.ts — `OptimizedImage` derives every `-400w` / `-800w` /
    // `.webp` variant from this base, and scripts/verify-clinician-assets.mjs
    // fails the build if they disagree.
    //
    // These keys were `olivia` and `ethan`, from the previous practice, and the
    // rebrand renamed the clinicians without renaming the files. Regenerating
    // with the old keys would have recreated the drift.
    'ama-serwaa-boateng': 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=800&h=1000&fit=crop&crop=face',
    'kwesi-mensah': 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=800&h=1000&fit=crop&crop=face',
  },
  services: {
    // Using different dental/medical photos that exist
    cosmetic: 'https://images.unsplash.com/photo-1609840114035-3c981b782dfe?w=1200&h=800&fit=crop',
    invisalign: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=1200&h=800&fit=crop',
    veneers: 'https://images.unsplash.com/photo-1609840114035-3c981b782dfe?w=1200&h=800&fit=crop',
    whitening: 'https://images.unsplash.com/photo-1489278353717-f64c6ee8a4d2?w=1200&h=800&fit=crop&crop=faces',
    implants: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=1200&h=800&fit=crop',
    preventive: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&h=800&fit=crop',
    restorative: 'https://images.unsplash.com/photo-1609840114035-3c981b782dfe?w=1200&h=800&fit=crop',
    emergency: 'https://images.unsplash.com/photo-1584515933487-779824d29309?w=1200&h=800&fit=crop',
  },
  transform: {
    // Bonding: Before - teeth with gap/diastema (photo shows gap teeth); After - perfect straight white teeth
    'bonding-before': 'https://images.unsplash.com/photo-1679136287096-cb864ebf9b10?w=1600&h=1200&fit=crop&crop=faces',
    'bonding-after': 'https://images.unsplash.com/photo-1489278353717-f64c6ee8a4d2?w=1600&h=1200&fit=crop&crop=faces',
    // Whitening: Before - natural teeth (slightly yellow); After - bright white teeth
    'whitening-before': 'https://images.unsplash.com/photo-1663182234283-28941e7612da?w=1600&h=1200&fit=crop&crop=faces',
    'whitening-after': 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=1600&h=1200&fit=crop&crop=faces',
  }
};

// Backup URLs in case primary fails
const BACKUP_URLS = {
  cosmetic: 'https://images.unsplash.com/photo-1588776814546-ec83f2f5b4d5?w=1200&h=800&fit=crop',
  veneers: 'https://images.unsplash.com/photo-1588776814546-ec83f2f5b4d5?w=1200&h=800&fit=crop',
  restorative: 'https://images.unsplash.com/photo-1588776814546-ec83f2f5b4d5?w=1200&h=800&fit=crop',
  'bonding-before': 'https://images.unsplash.com/photo-1663182234283-28941e7612da?w=1600&h=1200&fit=crop&crop=faces',
  'bonding-after': 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=1600&h=1200&fit=crop&crop=faces',
  'whitening-before': 'https://images.unsplash.com/photo-1679136287096-cb864ebf9b10?w=1600&h=1200&fit=crop&crop=faces',
  'whitening-after': 'https://images.unsplash.com/photo-1489278353717-f64c6ee8a4d2?w=1600&h=1200&fit=crop&crop=faces',
};

async function downloadImage(url, outputPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(outputPath);
    const req = https.get(url, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        file.close();
        fs.unlink(outputPath, () => {});
        downloadImage(response.headers.location, outputPath).then(resolve).catch(reject);
        return;
      }
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }
      const contentType = response.headers['content-type'];
      if (contentType && !contentType.startsWith('image/')) {
        reject(new Error(`Not an image: ${contentType}`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(outputPath, () => {});
      reject(err);
    });
    req.setTimeout(30000, () => {
      req.destroy();
      fs.unlink(outputPath, () => {});
      reject(new Error('Timeout'));
    });
  });
}

async function downloadWithBackup(primaryUrl, backupUrl, outputPath) {
  try {
    await downloadImage(primaryUrl, outputPath);
    return true;
  } catch {
    // Primary source failed; fall through to the backup URL. The original error
    // is intentionally not surfaced — the next attempt supersedes it.
    console.log(`  Primary failed, trying backup...`);
    try {
      await downloadImage(backupUrl, outputPath);
      return true;
    } catch {
      // No error text is logged. These messages come from HTTP responses and
      // filesystem calls; passing them through a hand-rolled sanitizer does not
      // satisfy CodeQL's js/log-injection taint model, and this is a one-off
      // local script. The local filename is enough to identify the failure.
      console.error('  Both sources failed for this image.');
      return false;
    }
  }
}

async function convertToAvif(inputPath, outputPath, width, height) {
  try {
    await sharp(inputPath)
      .resize(width, height, {
        fit: 'cover',
        position: 'center',
      })
      .avif({ quality: 75, effort: 6 })
      .toFile(outputPath);
    console.log(`Converted: ${path.basename(outputPath)}`);
    return true;
  } catch {
    // See the note in downloadWithBackup: error text from sharp/filesystem is
    // not logged, so nothing externally-derived reaches a log line.
    console.error(`Failed to convert ${path.basename(inputPath)}.`);
    return false;
  }
}

async function processImages() {
  const allImages = [
    // Doctors - 800x1000
    ...Object.entries(IMAGE_SOURCES.doctors).map(([name, url]) => ({
      url,
      backup: null,
      inputPath: path.join(DOCTORS_DIR, `${name}.jpg`),
      outputPath: path.join(DOCTORS_DIR, `${name}.avif`),
      width: 800,
      height: 1000,
    })),
    // Services - 1200x800
    ...Object.entries(IMAGE_SOURCES.services).map(([name, url]) => ({
      url,
      backup: BACKUP_URLS[name] || null,
      inputPath: path.join(SERVICES_DIR, `${name}.jpg`),
      outputPath: path.join(SERVICES_DIR, `${name}.avif`),
      width: 1200,
      height: 800,
    })),
    // Transform - 1600x1200
    ...Object.entries(IMAGE_SOURCES.transform).map(([name, url]) => ({
      url,
      backup: BACKUP_URLS[name] || null,
      inputPath: path.join(TRANSFORM_DIR, `${name}.jpg`),
      outputPath: path.join(TRANSFORM_DIR, `${name}.avif`),
      width: 1600,
      height: 1200,
    })),
  ];

  console.log('Downloading images...');
  for (const img of allImages) {
    try {
      if (img.backup) {
        await downloadWithBackup(img.url, img.backup, img.inputPath);
      } else {
        await downloadImage(img.url, img.inputPath);
      }
      console.log(`Downloaded: ${path.basename(img.inputPath)}`);
    } catch {
      // Only the local filename is logged — derived from the fixed names in
      // IMAGE_SOURCES, so no remote URL or error text reaches the log line.
      console.error(`Failed to download ${path.basename(img.inputPath)}.`);
    }
  }

  console.log('\nConverting to AVIF...');
  for (const img of allImages) {
    if (fs.existsSync(img.inputPath)) {
      const stats = fs.statSync(img.inputPath);
      if (stats.size < 1000) {
        console.log(`Skipping ${path.basename(img.inputPath)} - too small (${stats.size} bytes)`);
        fs.unlinkSync(img.inputPath);
        continue;
      }
      await convertToAvif(img.inputPath, img.outputPath, img.width, img.height);
      fs.unlinkSync(img.inputPath);
    }
  }

  console.log('\nDone!');
}

async function main() {
  await processImages();
  console.log('\nAll done!');
}

// A fixed message rather than the raw error, for the same reason as above: the
// rejection value is not guaranteed to be a clean string.
main().catch(() => {
  console.error('Image pipeline failed. See the individual errors above.');
  process.exitCode = 1;
});