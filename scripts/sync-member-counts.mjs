import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const collaboratorsPath = path.join(root, 'Colaboradores.dc.html');
const i18nPath = path.join(root, 'site-i18n.js');

const CATEGORY_KEYS = [
  'countProfessors',
  'countExternal',
  'countPostdocs',
  'countPhd',
  'countMasters',
  'countUndergrad'
];

function extractDict(source) {
  const match = source.match(/dict\s*=\s*({[\s\S]*?})\s*;\s*\n\s*setLang/);
  if (!match) {
    throw new Error('Não foi possível localizar o dicionário de colaboradores.');
  }

  return Function('"use strict"; return (' + match[1] + ');')();
}

function countPeople(groups) {
  const counts = {};
  let total = 0;

  CATEGORY_KEYS.forEach((key, index) => {
    const group = groups[index];
    const value = group && Array.isArray(group.people) ? group.people.length : 0;
    counts[key] = String(value);
    total += value;
  });

  counts.countResearchers = String(total);
  return counts;
}

function replaceCount(source, key, value) {
  const re = new RegExp(`(${key}:\\s*')[^']*(')`);
  if (!re.test(source)) {
    throw new Error(`Campo ${key} não encontrado em site-i18n.js.`);
  }
  return source.replace(re, `$1${value}$2`);
}

const collaborators = await readFile(collaboratorsPath, 'utf8');
const dict = extractDict(collaborators);
const counts = countPeople(dict.pt.groups || []);

let i18n = await readFile(i18nPath, 'utf8');
for (const [key, value] of Object.entries(counts)) {
  i18n = replaceCount(i18n, key, value);
}

await writeFile(i18nPath, i18n);

console.log(
  'Contagens de membros sincronizadas:',
  Object.entries(counts).map(([key, value]) => `${key}=${value}`).join(', ')
);
