import {mkdir, copyFile, cp, rm} from 'node:fs/promises';

await rm('dist', {recursive: true, force: true});
await mkdir('dist/assets/video', {recursive: true});
await mkdir('dist/assets/services', {recursive: true});

const pages = [
  'index.html','portfolio-data.js',
  'responsive.css','styles.css','components.css','darya.css','app.js','booking.js',
];
for (const file of pages) await copyFile(file, `dist/${file}`);

await copyFile('assets/fonts.css', 'dist/assets/fonts.css');
await cp('assets/fonts', 'dist/assets/fonts', {recursive: true});
await cp('assets/darya', 'dist/assets/darya', {recursive: true});
await cp('assets/video/darya', 'dist/assets/video/darya', {recursive: true});
for (const file of ['hero-koi-left.png','catalog-brush.svg','catalog-dragon.png','catalog-panels-clean.png']) {
  await copyFile(`assets/${file}`, `dist/assets/${file}`);
}
await copyFile('assets/services/crane-background.png', 'dist/assets/services/crane-background.png');
console.log('Built clean static website in dist/');
