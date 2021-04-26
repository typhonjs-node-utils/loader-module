import module from 'module';
import path from 'path';
import url from 'url';
import fs from 'fs';

/**
 * Stores the data tracked over traversing the starting directory. And provides a few internal utility methods.
 */
class TraversalData
{
   constructor()
   {
      /**
       * Stores any base directory defined or the root path.
       *
       * @type {string}
       */
      this.baseDirectory = void 0;

      /**
       * Stores the number of times a package is processed; useful in callbacks.
       *
       * @type {number}
       */
      this.cntr = 0;

      /**
       * Current directory of traversal.
       *
       * @type {string}
       */
      this.currentDirectory = void 0;

      /**
       * Current loaded `package.json` object.
       *
       * @type {object}
       */
      this.packageObj = void 0;

      /**
       * Path of current loaded `package.json` object
       *
       * @type {string}
       */
      this.packagePath = void 0;

      /**
       * The root path to stop traversal; determined from starting directory path.
       *
       * @type {string}
       */
      this.rootPath = void 0;

      /**
       * Stores a callback function.
       *
       * @type {Function}
       * @private
       */
      this._callback = void 0;
   }

   /**
    * Returns true if basedir has been set comparing the starting directory against the base directory to
    * determine if the base directory is a parent path intentionally stopping traversal.
    *
    * @returns {boolean} Whether basedir is set and a parent of the starting directory.
    */
   isBaseParent()
   {
      // If basepath is not configured it is set to root path.
      if (this.baseDirectory === this.rootPath) { return false; }

      const relative = path.relative(this.baseDirectory, this.currentDirectory);
      return relative && !relative.startsWith('..') && !path.isAbsolute(relative);
   }

   /**
    * Parses the options object passed into the various getPackage functions.
    *
    * @param {TraversalData}  data - A TraversalData instance.
    *
    * @param {object}      options - An object.
    *
    * @param {string|URL}  options.filepath - Initial file or directory path to search for `package.json`.
    *
    * @param {string|URL}  [options.basepath] - Base path to stop traversing. Set to the root path of `filepath` if not
    *                                           provided.
    *
    * @param {Function}    [options.callback] - A function that evaluates any loaded package.json object that passes
    *                                           back a truthy value that stops or continues the traversal.
    *
    * @returns {TraversalData} Returns the parsed TraversalData instance.
    */
   static parse(data, { filepath, basepath = void 0, callback } = {})
   {
      if (typeof filepath !== 'string' && !(filepath instanceof URL))
      {
         throw new TypeError(`'filepath' is not a 'string' or file 'URL'`);
      }

      if (basepath !== void 0 && typeof basepath !== 'string' && !(basepath instanceof URL))
      {
         throw new TypeError(`'basepath' is not a 'string' or file 'URL'`);
      }

      if (callback !== void 0 && typeof callback !== 'function')
      {
         throw new TypeError(`'callback' is not a 'function'`);
      }

      // Convert basepath if an URL to a file path
      if (basepath instanceof URL)
      {
         basepath = url.fileURLToPath(basepath);
      }

      // Convert any URL or string file URL to path.
      if (filepath instanceof URL || filepath.startsWith('file:/'))
      {
         filepath = url.fileURLToPath(filepath);
      }

      // Handle `filepath` as a directory or get directory of path with file name.
      data.currentDirectory = fs.existsSync(filepath) && fs.lstatSync(filepath).isDirectory() ?
       path.resolve(filepath) : path.resolve(path.dirname(filepath));

      // Convert basepath to root of resolved file path if not a string.
      if (typeof basepath !== 'string')
      {
         basepath = path.parse(data.currentDirectory).root;
      }

      // Convert string file URL to path.
      if (basepath.startsWith('file:/'))
      {
         basepath = url.fileURLToPath(basepath);
      }

      // Handle `basepath` as a directory or convert a path with file name to a directory.
      data.baseDirectory = fs.existsSync(basepath) && fs.lstatSync(basepath).isDirectory() ? path.resolve(basepath) :
       path.resolve(path.dirname(basepath));

      // If the resolved paths do not exist then return null.
      if (!fs.existsSync(data.baseDirectory) || !fs.existsSync(data.currentDirectory))
      {
         throw new Error(`Could not resolve 'filepath' or 'basepath'`);
      }

      // Ensure we track the root of the current directory path to stop iteration.
      data.rootPath = path.parse(data.currentDirectory).root;

      data._callback = callback;

      return data;
   }
}

/**
 * @typedef {object} PackageObjData
 *
 * @property {object|undefined}  packageObj - Loaded `package.json` object.
 * @property {string|undefined}  packagePath - Path of loaded `package.json` object.
 * @property {Error|undefined}   error - An error instance.
 */

/**
 * Attempts to traverse from `filepath` to `basepath` attempting to load `package.json` along with the package path.
 *
 * Note: If malformed data is presented the result will undefined along with a possible error included in the returned
 * object / `PackageObjData`. Also note that a file may be specified that does not exist and the directory will be
 * resolved. If that directory exists then resolution will continue.
 *
 * @param {object}      options - An object.
 *
 * @param {string|URL}  options.filepath - Initial file or directory path to search for `package.json`.
 *
 * @param {string|URL}  [options.basepath] - Base path to stop traversing. Set to the root path of `filepath` if not
 *                                           provided.
 *
 * @param {Function}    [options.callback] - A function that evaluates any loaded package.json object that passes back a
 *                                           truthy value that stops or continues the traversal.
 *
 * @returns {PackageObjData} Loaded package.json / path or potentially an error.
 */
function getPackagePath(options)
{
   const isTraversalData = options instanceof TraversalData;

   const data = isTraversalData ? options : new TraversalData();

   try
   {
      if (!isTraversalData)
      {
         TraversalData.parse(data, options);
      }

      const context = {};

      do
      {
         data.packagePath = path.resolve(data.currentDirectory, 'package.json');

         // If there is a `package.json` path attempt to load it.
         if (fs.existsSync(data.packagePath))
         {
            data.packageObj = JSON.parse(fs.readFileSync(data.packagePath, 'utf-8'));

            // If it is a valid object then process it.
            if (typeof data.packageObj === 'object')
            {
               // If there is a provided callback then invoke it with the traversal data and if a truthy value is
               // returned then return the data; otherwise immediately return the loaded `package.json` object & path.
               if (typeof data._callback === 'function')
               {
                  if (data._callback.call(context, data))
                  {
                     return { packageObj: data.packageObj, packagePath: data.packagePath };
                  }
               }
               else
               {
                  return { packageObj: data.packageObj, packagePath: data.packagePath };
               }

               data.cntr++;
            }
         }

         // If the current directory equals the base directory then stop traversal.
         if (data.currentDirectory === data.baseDirectory) { break; }

      // If the current directory equals the root path then stop traversal.
      } while ((data.currentDirectory = path.dirname(data.currentDirectory)) !== data.rootPath);
   }
   catch (error)
   {
      return { packagePath: data.packagePath, error };
   }

   return { error: new Error(`No 'package.json' located`) };
}

/**
 * Attempts to traverse from `filepath` to `basepath` attempting to access `type` field of `package.json`. The type
 * is returned if it is set in the found `package.json` otherwise `commonjs` is returned.
 *
 * Note: With only `filepath` set this function only reliably returns a positive result when there are no
 * intermediary `package.json` files in between a supposed root and path. If provided with malformed
 * data or there is any error / edge case triggered then 'commonjs' by default will be returned.
 *
 * Another edge case is that traversal stops at the first valid `package.json` file and this may not contain a `type`
 * property whereas a `package.json` file in the root of the module may define it.
 *
 * However if you provide a `filepath` and a `basepath` that is a parent path giving a firm stopping point then a
 * proper resolution callback, `s_RESOLVE_TYPE`, is automatically added. Intermediary `package.json` files that
 * do not have an explicit `type` attribute set do not prevent traversal which continues until the `basepath` is
 * reached which is how Node.js actually resolves the `type` attribute.
 *
 * @param {object}      options - An object.
 *
 * @param {string|URL}  options.filepath - Initial file or directory path to search for `package.json`.
 *
 * @param {string|URL}  [options.basepath] - Base path to stop traversing. Set to the root path of `filepath` if not
 *                                           provided.
 *
 * @param {Function}    [options.callback] - A function that evaluates any loaded package.json object that passes back a
 *                                           truthy value that stops or continues the traversal.
 *
 * @returns {string} Type of package - 'module' for ESM otherwise 'commonjs'.
 */
function getPackageType(options)
{
   try
   {
      const data = TraversalData.parse(new TraversalData(), options);

      // Base directory is set and there is no callback set so add a proper resolution callback for package type.
      if (data.isBaseParent() && data._callback === void 0)
      {
         data._callback = s_RESOLVE_TYPE;
      }

      const result = getPackagePath(data);

      return typeof result.packageObj === 'object' ?
       result.packageObj.type === 'module' ? 'module' : 'commonjs' :
        'commonjs';
   }
   catch (error)
   {
      return 'commonjs';
   }
}

/**
 * Handles proper resolution of finding the parent `package.json` that has a type attribute set. You must set
 * `basepath` to provide a known stopping point.
 *
 * @param {TraversalData}  data - Current traversal state.
 *
 * @returns {boolean} If the package object contains a `type` attribute then stop traversal.
 */
const s_RESOLVE_TYPE = (data) => typeof data.packageObj.type === 'string';

const requireMod = module.createRequire(import.meta.url);

class ModuleLoader
{
   /**
    * Loads an ES Module in the browser passing back an object containing info about the loading process.
    *
    * @param {object}      options - Options object.
    *
    * @param {string|URL}  options.modulepath - A module name, file path, or URL.
    *
    * @param {function}    [options.resolveModule] - An optional function which resolves the import to set `instance`.
    *
    * @param {string}      [options.basepath] - An optional base file path to accurately resolve `package.json`. By
    *                                           default the traversal algorithm stops at the first `package.json`
    *                                           encountered.
    *
    * @returns {Promise<{ModuleLoaderObj}>}
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

export default ModuleLoader;
//# sourceMappingURL=ModuleLoader.js.map
