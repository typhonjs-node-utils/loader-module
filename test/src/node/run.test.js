import fs               from 'fs-extra';
import path             from 'path';
import url              from 'url';

import * as Module      from '../../../dist/node/ModuleLoader.js';

import TestSuiteRunner  from '../runner/TestSuiteRunner.js';

const { ModuleLoadError } = Module;

fs.ensureDirSync('./.nyc_output');
fs.emptyDirSync('./.nyc_output');

fs.ensureDirSync('./coverage');
fs.emptyDirSync('./coverage');

const data = {
   suitePrefix: 'node/ModuleLoader',
   isBrowser: false,

   errors: [
      {
         path: './test/fixture/node/esm/errors/bad_path.js',
         error: ModuleLoadError,
         message: `[MODULE_NOT_FOUND] import() failed to load ${path.resolve('./test/fixture/node/esm/errors/bad_path.js')}`
      },
      {
         path: './test/fixture/node/cjs/errors/bad_path.cjs',
         error: ModuleLoadError,
         message: `[MODULE_NOT_FOUND] require failed to load ${path.resolve('./test/fixture/node/cjs/errors/bad_path.cjs')}`
      },
      {
         path: url.pathToFileURL(path.resolve('./test/fixture/node/esm/errors/bad_path.js')),
         error: ModuleLoadError,
         message: `[MODULE_NOT_FOUND] import() failed to load ${url.pathToFileURL(path.resolve('./test/fixture/node/esm/errors/bad_path.js')).toString()}`
      },
      {
         path: url.pathToFileURL(path.resolve('./test/fixture/node/cjs/errors/bad_path.cjs')),
         error: ModuleLoadError,
         message: `[MODULE_NOT_FOUND] require failed to load ${url.pathToFileURL(path.resolve('./test/fixture/node/cjs/errors/bad_path.cjs')).toString()}`
      },

      {
         path: './test/fixture/node/esm/errors/bad_reference.js',
         error: ReferenceError,
         message: 'bad_reference is not defined'
      },
      {
         path: './test/fixture/node/cjs/errors/bad_reference.cjs',
         error: ReferenceError,
         message: 'bad_reference is not defined'
      },
   ],

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
         path: url.pathToFileURL(path.resolve('./test/fixture/node/esm/success.js')).toString(),
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
         path: url.pathToFileURL(path.resolve('./test/fixture/node/cjs/success.cjs')).toString(),
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

TestSuiteRunner.run({ Module, data });
