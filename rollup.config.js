import path          from 'path';

import resolve       from '@rollup/plugin-node-resolve'; // This resolves NPM modules from node_modules.
import { terser }    from 'rollup-plugin-terser';        // Terser is used for minification / mangling

// Import config files for Terser; refer to respective documentation for more information.
import terserConfig from './terser.config';

// The deploy path for the distribution for browser & Node.
const s_DIST_PATH_BROWSER = './dist/browser';
const s_DIST_PATH_NODE = './dist/node';

// Produce sourcemaps or not.
const s_SOURCEMAP = true;

// Adds Terser to the output plugins.
const s_MINIFY = typeof process.env.ROLLUP_MINIFY === 'string' ? process.env.ROLLUP_MINIFY === 'true' : true;

export default () =>
{
   const outputPlugins = [];
   if (s_MINIFY)
   {
      outputPlugins.push(terser(terserConfig));
   }

   // Reverse relative path from the deploy path to local directory; used to replace source maps path, so that it
   // shows up correctly in Chrome dev tools.
   // const relativeDistBrowserPath = path.relative(`${s_DIST_PATH_BROWSER}`, '.');
   // const relativeDistNodePath = path.relative(`${s_DIST_PATH_NODE}`, '.');

   return [{   // This bundle is for the Node distribution.
         input: ['src/node/ModuleLoader.js'],
         output: [{
            file: `${s_DIST_PATH_NODE}${path.sep}ModuleLoader.js`,
            format: 'es',
            plugins: outputPlugins,
            preferConst: true,
            sourcemap: s_SOURCEMAP,
            // sourcemapPathTransform: (sourcePath) => sourcePath.replace(relativeDistNodePath, `.`)
         }],
         plugins: [
            resolve()
         ]
      },

      // This bundle is for the browser distribution.
      {
         input: ['src/browser/ModuleLoader.js'],
         output: [{
            file: `${s_DIST_PATH_BROWSER}${path.sep}ModuleLoader.js`,
            format: 'es',
            plugins: outputPlugins,
            preferConst: true,
            sourcemap: s_SOURCEMAP,
            // sourcemapPathTransform: (sourcePath) => sourcePath.replace(relativeDistBrowserPath, `.`)
         }],
         plugins: [
            resolve({ browser: true })
         ]
      }
   ];
};
