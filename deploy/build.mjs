// Gera os arquivos publicados a partir dos fontes:
//   styles.css            -> styles.min.css
//   vendor/gsap + ScrollTrigger + main.js -> app.min.js
// Uso (na raiz do projeto): node deploy/build.mjs
// Depois, suba o ?v= de styles.min.css e app.min.js no index.html.
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, rmSync } from 'node:fs';

const esbuild = 'npx -y esbuild@0.24.0';
execSync(`${esbuild} styles.css --minify --outfile=styles.min.css`, { stdio: 'inherit' });
execSync(`${esbuild} main.js --minify --outfile=main.tmp.js`, { stdio: 'inherit' });

const bundle = [
  readFileSync('vendor/gsap.min.js', 'utf8'),
  readFileSync('vendor/ScrollTrigger.min.js', 'utf8'),
  readFileSync('main.tmp.js', 'utf8'),
].join('\n;\n');
writeFileSync('app.min.js', bundle);
rmSync('main.tmp.js');
console.log(`app.min.js ${(bundle.length / 1024).toFixed(1)} KB`);
