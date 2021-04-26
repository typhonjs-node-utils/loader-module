import fs                  from 'fs-extra';
import path                from 'path';
import url                 from 'url';

import chai                from 'chai';
import chaiAsPromised      from 'chai-as-promised';

import * as Module         from '../../../dist/node/ModuleLoader.js';

import TestSuiteRunner     from '../runner/TestSuiteRunner.js';

chai.use(chaiAsPromised);

fs.ensureDirSync('./.nyc_output');
fs.emptyDirSync('./.nyc_output');

fs.ensureDirSync('./coverage');
fs.emptyDirSync('./coverage');

const data = {
   suitePrefix: 'node/ModuleLoader',
   isBrowser: false,

   modules: [
      {
         path: './test/fixture/node/esm/success.js',
         defaultInstance: '{"default":"SUCCESS","namedExport":"SUCCESS_NAMED"}',
         resolveInstance: 'SUCCESS_NAMED',
         isESM: true,
         type: 'import-path'
      },
      {
         path: url.pathToFileURL(path.resolve('./test/fixture/node/esm/success.js')),
         defaultInstance: '{"default":"SUCCESS","namedExport":"SUCCESS_NAMED"}',
         resolveInstance: 'SUCCESS_NAMED',
         isESM: true,
         type: 'import-url'
      },
      {
         path: 'file:///Volumes/Data/program/javascript/projects/TyphonJS/repos/typhonrt/typhonjs-node-utils/loader-module/test/fixture/node/esm/success.js',
         defaultInstance: '{"default":"SUCCESS","namedExport":"SUCCESS_NAMED"}',
         resolveInstance: 'SUCCESS_NAMED',
         isESM: true,
         type: 'import-url'
      },
      {
         path: '@typhonjs-utils/package-json',
         isESM: true,
         type: 'import-module'
      },
      {
         path: './test/fixture/node/esm/success.mjs',
         defaultInstance: '{"default":"SUCCESS","namedExport":"SUCCESS_NAMED"}',
         resolveInstance: 'SUCCESS_NAMED',
         isESM: true,
         type: 'import-path'
      },

      {
         path: './test/fixture/node/cjs/success.cjs',
         defaultInstance: '["SUCCESS"]',
         resolveInstance: 'SUCCESS_NAMED',
         isESM: false,
         type: 'require-path'
      },
      {
         path: url.pathToFileURL(path.resolve('./test/fixture/node/cjs/success.cjs')),
         defaultInstance: '["SUCCESS"]',
         resolveInstance: 'SUCCESS_NAMED',
         isESM: false,
         type: 'require-url'
      },
      {
         path: 'file:///Volumes/Data/program/javascript/projects/TyphonJS/repos/typhonrt/typhonjs-node-utils/loader-module/test/fixture/node/cjs/success.cjs',
         defaultInstance: '["SUCCESS"]',
         resolveInstance: 'SUCCESS_NAMED',
         isESM: false,
         type: 'require-url'
      },
      {
         path: 'eslint',
         isESM: false,
         type: 'require-module'
      },
      {
         path: './test/fixture/node/cjs/success.js',
         defaultInstance: '["SUCCESS"]',
         resolveInstance: 'SUCCESS_NAMED',
         isESM: false,
         type: 'require-path'
      },
   ],

   resolveModule: (module) => module.namedExport
};

TestSuiteRunner.run(Module, data, chai);
