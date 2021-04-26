import module              from 'module';
import path                from 'path';
import url                 from 'url';

import { getPackageType }  from '@typhonjs-utils/package-json';

const requireMod = module.createRequire(import.meta.url);

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
    * @param {string}      [options.basepath] - An optional base file path to stop traversal for `package.json`.
    *
    * @returns {Promise<{ModuleLoaderObj}>} The module / instance and data about the loading process.
    */
   static async load({ modulepath, resolveModule = void 0, basepath = void 0 } = {})
   {
      if (!(modulepath instanceof URL) && typeof modulepath !== 'string')
      {
         throw new TypeError(`'modulepath' is not a string or URL`);
      }

      if (resolveModule !== void 0 && typeof resolveModule !== 'function')
      {
         throw new TypeError(`'resolveModule' is not a function`);
      }

      if (basepath !== void 0 && typeof basepath !== 'string')
      {
         throw new TypeError(`'basepath' is not a string`);
      }

      const { filepath, isESM, type, loadpath } = resolvePath(modulepath, basepath);

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
 * @param {string} [basepath] - An optional base file path to accurately resolve `package.json`. By default the
 *                              traversal algorithm stops at the first `package.json` encountered.
 *
 * @returns {boolean} If the filepath is an ES Module.
 */
function isPathModule(filepath, basepath)
{
   const extension = path.extname(filepath).toLowerCase();

   switch (extension)
   {
      case '.js':
// console.log(`!!!!! getPackageType({ filepath, basepath }): ${getPackageType({ filepath, basepath })}`)
// console.log(`!!!!! truthy result: ${getPackageType({ filepath, basepath }) === 'module'}`)
         return getPackageType({ filepath, basepath }) === 'module';

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
 * @param {string}      [basepath] - An optional base file path to accurately resolve `package.json`. By default the
 *                                   traversal algorithm stops at the first `package.json` encountered.
 *
 * @returns {{filepath: string, isESM: boolean, type: string, loadpath: string}} An object including file path and
 *                                                                               whether the module is ESM.
 */
function resolvePath(modulepath, basepath)
{
   let filepath, isESM, type = 'module';

   let loadpath = modulepath;

   try
   {
      filepath = requireMod.resolve(modulepath);
      isESM = isPathModule(filepath, basepath);
   }
   catch (error)
   {
      if (modulepath instanceof URL || modulepath.startsWith('file:'))
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

      isESM = isPathModule(filepath, basepath);
   }

   type = `${isESM ? 'import' : 'require'}-${type}`;

   return { filepath, isESM, type, loadpath };
}
