import path             from 'path';

import resolve          from '@rollup/plugin-node-resolve'; // This resolves NPM modules from node_modules.
import { generateDTS }  from '@typhonjs-build-test/esm-d-ts';

await generateDTS({
   input: './src/node/index.js',
   output: './types/index.d.ts',
});

// The deploy path for the distribution for browser & Node.
const s_DIST_PATH_BROWSER = './dist/browser';
const s_DIST_PATH_NODE = './dist/node';

// Produce sourcemaps or not.
const s_SOURCEMAP = true;

export default () =>
{
   return [{   // This bundle is for the Node distribution.
         input: ['src/node/index.js'],
         output: [{
            file: `${s_DIST_PATH_NODE}${path.sep}ModuleLoader.js`,
            format: 'es',
            generatedCode: { constBindings: true },
            sourcemap: s_SOURCEMAP,
         }],
         plugins: [
            resolve()
         ]
      },

      // This bundle is for the browser distribution.
      {
         input: ['src/browser/index.js'],
         output: [{
            file: `${s_DIST_PATH_BROWSER}${path.sep}ModuleLoader.js`,
            format: 'es',
            generatedCode: { constBindings: true },
            sourcemap: s_SOURCEMAP,
         }],
         plugins: [
            resolve({ browser: true })
         ]
      }
   ];
};
