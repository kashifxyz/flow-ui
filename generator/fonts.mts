import { writeFile, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// Resolve directory paths relative to script location
const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = join(__dirname, '..');

// Store both CSS and .woff2 binaries together in src/styles/fonts
const FONTS_DIR = join(ROOT_DIR, 'src', 'styles', 'fonts');
const FONTS_CSS_FILE = join(FONTS_DIR, 'fonts.css');

interface FontConfig {
  name: string;
  family: string;
  weights: number[];
}

// UI sans + code mono. No extra display families.
const FONTS_CONFIG: FontConfig[] = [
  { name: 'Inter', family: 'Inter', weights: [400, 500, 600, 700] },
  { name: 'JetBrains Mono', family: 'JetBrains+Mono', weights: [400, 500] },
];

/**
 * Build Google Fonts API v2 request URL for target families and weights
 */
function buildGoogleFontsUrl(config: FontConfig[]): string {
  const familiesParam = config
    .map(({ family, weights }) => {
      const sortedWeights = weights.sort((a, b) => a - b).join(';');
      return `family=${family}:wght@${sortedWeights}`;
    })
    .join('&');

  return `https://fonts.googleapis.com/css2?${familiesParam}&display=swap`;
}

/**
 * Fetch Google Fonts CSS using a modern browser User-Agent to receive WOFF2 links
 */
async function fetchGoogleFontsCss(url: string, retries = 3): Promise<string> {
  for (let i = 1; i <= retries; i++) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.text();
    } catch (err) {
      if (i === retries) throw err;
      await new Promise((resolve) => setTimeout(resolve, 400 * i));
    }
  }
  // Unreachable: loop either returns or throws on the final attempt.
  throw new Error('fetchGoogleFontsCss: exhausted retries without returning or throwing');
}

interface ParsedFontFace {
  family: string;
  style: string;
  weight: string;
  url: string;
}

/**
 * Extract `@font-face` blocks and parse metadata alongside source URLs
 */
function parseCssBlocks(css: string): ParsedFontFace[] {
  const blocks: ParsedFontFace[] = [];
  const fontFaceRegex = /@font-face\s*\{([^}]+)\}/g;
  let match: RegExpExecArray | null;

  while ((match = fontFaceRegex.exec(css)) !== null) {
    const body = match[1];

    const fontFamily = body.match(/font-family:\s*['"]?([^'"]+)['"]?;/)?.[1];
    const fontStyle = body.match(/font-style:\s*([^;]+);/)?.[1] || 'normal';
    const fontWeight = body.match(/font-weight:\s*([^;]+);/)?.[1] || '400';
    const urlMatch = body.match(/url\((https:\/\/[^)]+)\)/)?.[1];

    if (fontFamily && urlMatch) {
      blocks.push({
        family: fontFamily,
        style: fontStyle,
        weight: fontWeight,
        url: urlMatch,
      });
    }
  }

  return blocks;
}

/**
 * Fetch remote binary font file with retry logic
 */
async function downloadFontFile(url: string, retries = 3): Promise<Buffer> {
  for (let i = 1; i <= retries; i++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const arrayBuffer = await res.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch (err) {
      if (i === retries) throw err;
      await new Promise((resolve) => setTimeout(resolve, 400 * i));
    }
  }
  // Unreachable: loop either returns or throws on the final attempt.
  throw new Error('downloadFontFile: exhausted retries without returning or throwing');
}

async function main(): Promise<void> {
  const totalFonts = FONTS_CONFIG.length;
  const familyNames = FONTS_CONFIG.map((font) => font.name).join(', ');
  console.log(`Processing ${totalFonts} font families (${familyNames})…\n`);

  await mkdir(FONTS_DIR, { recursive: true });

  const gfontsUrl = buildGoogleFontsUrl(FONTS_CONFIG);
  console.log(`Fetching CSS metadata from Google Fonts…`);

  const rawCss = await fetchGoogleFontsCss(gfontsUrl);
  const parsedFonts = parseCssBlocks(rawCss);

  if (!parsedFonts.length) {
    throw new Error('No font-face rules extracted from Google Fonts response.');
  }

  const generatedCssRules: string[] = [];
  const processedFiles = new Set<string>();
  let downloadedCount = 0;
  let errorCount = 0;

  for (const font of parsedFonts) {
    const slug = font.family.toLowerCase().replace(/\s+/g, '-');
    const filename = `${slug}-${font.weight}-${font.style}.woff2`;
    const localFilePath = join(FONTS_DIR, filename);

    // Skip duplicate subset entries for the same font weight/style
    if (processedFiles.has(filename)) continue;
    processedFiles.add(filename);

    try {
      const buffer = await downloadFontFile(font.url);
      await writeFile(localFilePath, buffer);
      downloadedCount++;
      process.stdout.write(`  ✓ ${font.family} (${font.weight}, ${font.style}) → ${filename}\n`);

      // Co-located relative URL inside src/styles/fonts/
      generatedCssRules.push(`@font-face {
  font-family: '${font.family}';
  font-style: ${font.style};
  font-weight: ${font.weight};
  font-display: swap;
  src: url('./${filename}') format('woff2');
}`);
    } catch (err) {
      errorCount++;
      const message = err instanceof Error ? err.message : String(err);
      process.stdout.write(`  ✗ Failed to download ${font.family} (${font.weight}): ${message}\n`);
    }
  }

  const headerNotice = `/* Auto-generated by generator/fonts.mts — DO NOT EDIT MANUALLY. */\n\n`;
  const fullCss = headerNotice + generatedCssRules.join('\n\n') + '\n';

  await writeFile(FONTS_CSS_FILE, fullCss, 'utf-8');

  console.log(`\n✓ ${downloadedCount} font binaries saved to /src/styles/fonts/`);
  if (errorCount) {
    console.log(`✗ ${errorCount} fonts failed to download.`);
  }
  console.log(`Generated: ${FONTS_CSS_FILE}`);
}

main().catch((err) => {
  console.error('Fatal: ', err);
  process.exit(1);
});
