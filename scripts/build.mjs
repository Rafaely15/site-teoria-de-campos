import './sync-member-counts.mjs';

import { cp, mkdir, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const dist = path.join(root, 'dist');

const entries = [
  'index.html',
  'Home.dc.html',
  'Sobre.dc.html',
  'Publicacoes.dc.html',
  'Colaboradores.dc.html',
  'Noticias.dc.html',
  'Projetos.dc.html',
  'Contato.dc.html',
  'obrigado.html',
  'site.css',
  'site.js',
  'site-i18n.js',
  'support.js',
  'image-slot.js',
  'publicacoes-inspire.js',
  'image.png',
  '.nojekyll',
  '_ds',
  'assets',
  'animacao-black-hole',
  'uploads'
];

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });

for (const entry of entries) {
  const source = path.join(root, entry);
  if (!existsSync(source)) continue;

  await cp(source, path.join(dist, entry), {
    recursive: true,
    force: true
  });
}

console.log('TQCG-UFPB static site built in dist/');
