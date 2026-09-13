import { writeFile, mkdir, readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// Resolve directory paths relative to script location
const __dirname = dirname(fileURLToPath(import.meta.url));
const ICONS_DIR = join(__dirname, '..', 'src', 'components', 'icons');
const SVG_FILE = join(ICONS_DIR, 'svg.ts');

// Delimiters used to locate and parse embedded JSON inside the generated TypeScript file
const JSON_START = '/*__ICONS_JSON_START__*/';
const JSON_END = '/*__ICONS_JSON_END__*/';

// App-facing names: outlined = rounded outline, filled = rounded filled.
type IconVariant = 'outlined' | 'filled';

/** Per-variant SVG path `d` strings. Not every icon has every variant. */
type IconPaths = Partial<Record<IconVariant, string[]>>;

/** Full icon dataset keyed by application icon identifier. */
type IconData = Record<string, IconPaths>;

const VARIANT_ORDER: IconVariant[] = ['outlined', 'filled'];

type VariantUrlFn = (name: string) => string;

const VARIANT_URLS: Record<IconVariant, VariantUrlFn> = {
  outlined: (name) =>
    `https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsrounded/${name}/default/24px.svg`,
  filled: (name) =>
    `https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsrounded/${name}/fill1/24px.svg`,
};

// Map Flow icon identifiers to Google Material Symbols names.
const ICON_MAP: Record<string, string> = {
  MENU: 'menu',
  SEARCH: 'search',
  CLOSE: 'close',
  CHEVRON_DOWN: 'keyboard_arrow_down',
  CHEVRON_RIGHT: 'chevron_right',
  CHEVRON_LEFT: 'chevron_left',
  MORE: 'more_horiz',
  SETTINGS: 'settings',
  HELP: 'help',
  COMMAND: 'keyboard_command_key',
  SUN: 'light_mode',
  MOON: 'dark_mode',
  AMOLED: 'contrast',
  HOME: 'home',
  PAGE: 'description',
  FOLDER: 'folder',
  DATABASE: 'database',
  TABLE: 'table',
  BOARD: 'view_kanban',
  CALENDAR: 'calendar_month',
  CANVAS: 'gesture',
  TASK: 'task_alt',
  FILE: 'attach_file',
  COMMENT: 'chat_bubble',
  BELL: 'notifications',
  LINK: 'link',
  USER: 'person',
  USERS: 'group',
  MAIL: 'mail',
  LOCK: 'lock',
  LOGOUT: 'logout',
  PLUS: 'add',
  EDIT: 'edit',
  TRASH: 'delete',
  COPY: 'content_copy',
  CHECK: 'check',
  FILTER: 'filter_alt',
  REFRESH: 'refresh',
  EYE: 'visibility',
  EYE_OFF: 'visibility_off',
  ALERT: 'warning',
};

/**
 * Extract path `d` attribute strings from raw SVG XML
 */
function extractPaths(svg: string): string[] {
  const paths: string[] = [];
  const re = /<path\s+d="([^"]+)"/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(svg)) !== null) {
    paths.push(match[1]);
  }
  return paths;
}

/**
 * Fetch remote SVG with exponential backoff retries for resilient downloads
 */
async function fetchSvg(url: string, retries = 3): Promise<string> {
  for (let i = 1; i <= retries; i++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.text();
    } catch (err) {
      if (i === retries) throw err;
      await new Promise((resolve) => setTimeout(resolve, 400 * i));
    }
  }
  // Unreachable: loop either returns or throws on the final attempt.
  throw new Error('fetchSvg: exhausted retries without returning or throwing');
}

/**
 * Extract existing cached JSON data embedded inside `svg.ts` to prevent unnecessary re-fetches
 */
async function loadExisting(file: string): Promise<IconData> {
  try {
    const txt = await readFile(file, 'utf-8');
    const start = txt.indexOf(JSON_START);
    const end = txt.indexOf(JSON_END);
    if (start === -1 || end === -1) return {};
    const json = txt.slice(start + JSON_START.length, end);
    return JSON.parse(json) as IconData;
  } catch {
    return {};
  }
}

interface FetchIconResult {
  paths: IconPaths;
  failures: string[];
}

/**
 * Fetch all variant SVGs for a single icon in parallel and collect valid path data
 */
async function fetchIcon(materialName: string): Promise<FetchIconResult> {
  const results = await Promise.allSettled(
    (Object.entries(VARIANT_URLS) as [IconVariant, VariantUrlFn][]).map(
      async ([variant, urlFn]) => {
        const svg = await fetchSvg(urlFn(materialName));
        return { variant, paths: extractPaths(svg) };
      },
    ),
  );

  const collected: Partial<Record<IconVariant, string[]>> = {};
  const failures: string[] = [];

  for (const result of results) {
    if (result.status === 'fulfilled') {
      if (result.value.paths.length) {
        collected[result.value.variant] = result.value.paths;
      }
    } else {
      failures.push(result.reason?.message ?? String(result.reason));
    }
  }

  // Preserve deterministic order based on VARIANT_ORDER
  const ordered: IconPaths = {};
  for (const variant of VARIANT_ORDER) {
    if (collected[variant]) ordered[variant] = collected[variant];
  }

  return { paths: ordered, failures };
}

/**
 * Format gathered icon paths into a strongly-typed TypeScript module
 */
function generateModule(data: IconData): string {
  const json = JSON.stringify(data, null, 2);
  return `// Auto-generated by generator/icons.mts — DO NOT EDIT MANUALLY.
// Re-run the script to add or refresh icons.

export type IconVariant = 'outlined' | 'filled';

/** Per-variant SVG path \`d\` strings. Not every icon has every variant. */
export type IconPaths = Partial<Record<IconVariant, string[]>>;

export const icons = ${JSON_START}${json}${JSON_END} satisfies Record<string, IconPaths>;

export type IconName = keyof typeof icons;
`;
}

async function main(): Promise<void> {
  const forceDownload = process.argv.includes('--force');
  const total = Object.keys(ICON_MAP).length;
  console.log(`Fetching ${total} icons × ${VARIANT_ORDER.length} variants…\n`);

  await mkdir(ICONS_DIR, { recursive: true });

  const existing = forceDownload ? {} : await loadExisting(SVG_FILE);

  const data: IconData = {};
  let fetched = 0;
  let cached = 0;
  let errors = 0;
  const errorList: string[] = [];

  for (const [name, materialName] of Object.entries(ICON_MAP)) {
    // Reuse cached data unless forced via --force flag
    if (!forceDownload && existing[name] && Object.keys(existing[name]).length) {
      data[name] = existing[name];
      process.stdout.write(`  ~ ${name} (cached)\n`);
      cached++;
      continue;
    }

    const { paths, failures } = await fetchIcon(materialName);

    if (Object.keys(paths).length) {
      data[name] = paths;
      fetched++;
      process.stdout.write(`  ✓ ${name}  ←  ${materialName}\n`);
    } else if (existing[name]) {
      data[name] = existing[name];
      process.stdout.write(`  ! ${name} (fetch failed, kept cached)\n`);
    } else {
      process.stdout.write(`  ✗ ${name} (fetch failed)\n`);
    }

    for (const failure of failures) {
      errors++;
      errorList.push(`${name} (${materialName}): ${failure}`);
    }
  }

  // Write finalized module to src/components/icons/svg.ts
  await writeFile(SVG_FILE, generateModule(data), 'utf-8');

  const iconCount = Object.keys(data).length;
  console.log(`\n✓ ${fetched} icons fetched, ${cached} reused from cache.`);
  if (errors) {
    console.log(`✗ ${errors} variant errors:`);
    errorList.forEach((e) => console.log(`  - ${e}`));
  }
  console.log(`\nGenerated: ${SVG_FILE} (${iconCount} icons)`);
}

main().catch((err) => {
  console.error('Fatal: ', err);
  process.exit(1);
});
