import { ModuleLoadError } from '../ModuleLoadError.js';

export class ModuleLoader
{
   /**
    * @template M, E
    *
    * Loads an ES Module in the browser passing back an object containing info about the loading process.
    *
    * @param {object}      options - Options object.
    *
    * @param {string|URL}  options.modulepath - A URL to load.
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

      const loadpath = modulepath instanceof URL ? modulepath.toString() : modulepath;

      const type = `import-${modulepath instanceof URL ||
      (typeof modulepath === 'string' && modulepath.match(/^(https?:\/\/|file:\/\/)/)) ? 'url' : 'path'}`;

      try
      {
         const module = await import(modulepath);

         const instance = resolveModule !== void 0 ? resolveModule(module) : module;

         return { filepath: loadpath, instance, isESM: true, loadpath, module, modulepath, type };
      }
      catch (error)
      {
         // In case the browser version of ModuleLoader is used on Node... The CJS and ESM loaders of Node have
         // different error codes. Collect both of these as one error with clear stack trace from ModuleLoader.
         /* istanbul ignore next */
         if (error.code === 'MODULE_NOT_FOUND' || error.code === 'ERR_MODULE_NOT_FOUND')
         {
            throw new ModuleLoadError({
               message: `import() failed to load ${loadpath}`,
               code: 'ERR_MODULE_NOT_FOUND'
            });
         }

         throw error;
      }
   }
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
