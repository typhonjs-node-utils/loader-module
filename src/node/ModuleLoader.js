import module              from 'module';
import path                from 'path';
import url                 from 'url';

import { getPackageType }  from '@typhonjs-utils/package-json';

import { ModuleLoadError } from '../ModuleLoadError.js';

const requireMod = module.createRequire(import.meta.url);

/**
 * URL matching RegExp
 *
 * @type {RegExp}
 */
const s_URL_REGEX = /^(https?:\/\/|file:\/\/)/;

export class ModuleLoader
{
   /**
    * @template M, E
    *
    * Loads an ES Module via import dynamic or CommonJS via require in Node passing back an object containing info
    * about the loading process.
    *
    * @param {object}      options - Options object.
    *
    * @param {string|URL}  options.modulepath - A module name, file path, or URL.
    *
    * @param {(M) => E}    [options.resolveModule] - An optional function which resolves the import to set `instance`.
    *
    * @returns {Promise<ModuleLoaderObj<M, E>>} The module / instance and data about the loading process.
    */
   static async load({ modulepath, resolveModule = void 0 })
   {
      if (!(modulepath instanceof URL) && typeof modulepath !== 'string')
      {
         throw new TypeError(`'modulepath' is not a string or URL`);
      }

      if (resolveModule !== void 0 && typeof resolveModule !== 'function')
      {
         throw new TypeError(`'resolveModule' is not a function`);
      }

      const { filepath, isESM, type, loadpath } = resolvePath(modulepath);

      try
      {
         const module = isESM ? await import(url.pathToFileURL(filepath)) : requireMod(filepath);

         const instance = resolveModule !== void 0 ? resolveModule(module) : module;

         return { filepath, instance, loadpath, isESM, module, modulepath, type };
      }
      catch (error)
      {
         // The CJS and ESM loaders of Node have different error codes. Collect both of these as one error with clear
         // stack trace from ModuleLoader.
         if (error.code === 'MODULE_NOT_FOUND' || error.code === 'ERR_MODULE_NOT_FOUND')
         {
            throw new ModuleLoadError({
               message: `${isESM ? 'import()' : 'require'} failed to load ${loadpath}`,
               code: 'MODULE_NOT_FOUND'
            });
         }

         throw error;
      }
   }
}

// Module Private ----------------------------------------------------------------------------------------------------

/**
 * For `.js` files uses `getPackageType` to determine if `type` is set to `module` in associated `package.json`. If
 * the `modulePath` provided ends in `.mjs` it is assumed to be ESM.
 *
 * @param {string} filepath - File path to load.
 *
 * @returns {boolean} If the filepath is an ES Module.
 */
function isPathModule(filepath)
{
   const extension = path.extname(filepath).toLowerCase();

   switch (extension)
   {
      case '.js':
         return getPackageType({ filepath }) === 'module';

      case '.mjs':
         return true;

      default:
         return false;
   }
}

/**
 * Resolves a module path first by `require.resolve` to allow Node to resolve an actual module. If this fails then
 * the `modulepath` is resolved as a file path.
 *
 * @param {string|URL}  modulepath - A module name, file path, URL to load.
 *
 * @returns {{filepath: string, isESM: boolean, type: string, loadpath: string}} An object including file path and
 *                                                                               whether the module is ESM.
 */
function resolvePath(modulepath)
{
   let filepath, isESM, type = 'module';

   let loadpath = modulepath;

   try
   {
      filepath = requireMod.resolve(modulepath);
      isESM = isPathModule(filepath);
   }
   catch (error)
   {
      if (modulepath instanceof URL || modulepath.match(s_URL_REGEX))
      {
         filepath = url.fileURLToPath(modulepath);
         type = 'url';

         loadpath = modulepath instanceof URL ? modulepath.toString() : modulepath;
      }
      else
      {
         filepath = path.resolve(modulepath);
         type = 'path';

         loadpath = filepath;
      }

      isESM = isPathModule(filepath);
   }

   type = `${isESM ? 'import' : 'require'}-${type}`;

   return { filepath, isESM, type, loadpath };
}

/**
 * @template M, E
 *
 * @typedef {object} ModuleLoaderObj The object passed back from `ModuleLoader.load`.
 *
 * @property {string}      filepath If available the file path on Node otherwise this will match `loadpath` in the
 * browser.
 *
 * @property {E}           instance Either the module itself or any particular export the `resolveModule` function
 * selects.
 *
 * @property {boolean}     isESM Indicates if the import was an ES Module.
 *
 * @property {string}      loadpath A string representation of the module path being loaded.
 *
 * @property {M}           module The direct module import.
 *
 * @property {string|URL}  modulepath The initial string or URL sent to ModuleLoader.
 *
 * @property {(
 *    'import-module' |
 *    'import-path' |
 *    'import-url' |
 *    'require-module' |
 *    'require-path' |
 *    'require-url'
 * )} type The type and how the module was loaded.
 */
