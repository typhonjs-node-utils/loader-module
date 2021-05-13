import path       from 'path';

import istanbul   from 'rollup-plugin-istanbul';      // Adds Istanbul instrumentation.

// The test browser distribution is bundled to `./test/live-server`.
const s_TEST_BROWSER_PATH = './test/live-server';

// Produce sourcemaps or not.
const s_SOURCEMAP = true;

const relativeTestBrowserPath = path.relative(`${s_TEST_BROWSER_PATH}`, '.');

export default () =>
{
   return [{ // This bundle is for the Istanbul instrumented browser test.
         input: ['src/browser/index.js'],
         output: [{
            file: `${s_TEST_BROWSER_PATH}/ModuleLoader.js`,
            format: 'es',
            preferConst: true,
            sourcemap: s_SOURCEMAP,
            sourcemapPathTransform: (sourcePath) => sourcePath.replace(relativeTestBrowserPath, `.`)
         }],
         plugins: [
            istanbul()
         ]
      },

      // This bundle is the test suite
      {
         input: ['test/src/runner/TestSuiteRunner.js'],
         output: [{
            file: `${s_TEST_BROWSER_PATH}/TestSuiteRunner.js`,
            format: 'es',
            preferConst: true
         }]
      }
   ];
};
