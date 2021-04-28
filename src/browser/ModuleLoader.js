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

      const module = await import(modulepath);

      const loadpath = modulepath instanceof URL ? modulepath.toString() : modulepath;

      const type = `import-${modulepath instanceof URL ||
      (typeof modulepath === 'string' && modulepath.match(s_URL_REGEX)) ? 'url' : 'path'}`;

      const instance = resolveModule !== void 0 ? resolveModule(module) : module;

      return { filepath: loadpath, instance, isESM: true, loadpath, module, modulepath, type };
   }
}
