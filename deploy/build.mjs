// Gera os arquivos publicados a partir dos fontes:
//   styles.css -> styles.min.css
//   main.js    -> app.min.js
// Uso (na raiz do projeto): node deploy/build.mjs
// Depois, suba o ?v= de styles.min.css e app.min.js no index.html.
import { execSync } from 'node:child_process';

const esbuild = 'npx -y esbuild@0.24.0';
execSync(`${esbuild} styles.css --minify --outfile=styles.min.css`, { stdio: 'inherit' });
execSync(`${esbuild} main.js --minify --outfile=app.min.js`, { stdio: 'inherit' });
