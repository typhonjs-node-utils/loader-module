import module              from 'module';
import path                from 'path';
import url                 from 'url';

import { getPackageType }  from '@typhonjs-utils/package-json';

const requireMod = module.createRequire(import.meta.url);

/**
 * URL matching RegExp
 *
 * @type {RegExp}
 */
const s_URL_REGEX = /^(https?:\/\/|file:\/\/)/;

export default class ModuleLoader
{
   /**
    * Loads an ES Module in the browser passing back an object containing info about the loading process.
    *
    * @param {object}      options - Options object.
    *
    * @param {string|URL}  options.modulepath - A module name, file path, or URL.
    *
    * @param {Function}    [options.resolveModule] - An optional function which resolves the import to set `instance`.
    *
    * @returns {Promise<{ModuleLoaderObj}>} The module / instance and data about the loading process.
    */
   static async load({ modulepath, resolveModule = void 0 } = {})
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

      const module = isESM ? await import(url.pathToFileURL(filepath)) : requireMod(filepath);

      const instance = resolveModule !== void 0 ? resolveModule(module) : module;

      return { filepath, instance, loadpath, isESM, module, modulepath, type };
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
