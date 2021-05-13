/**
 * Provides a custom error for Node to combine CJS and ESM module not found errors.
 */
export default class ModuleLoadError extends Error
{
   /**
    * @param {object} options - Options object.
    *
    * @param {string} options.message - Error message.
    *
    * @param {string} options.code - Error code.
    */
   constructor({ message, code })
   {
      super(`[${code}] ${message}`);
      this.name = 'ModuleLoadError';
      this.code = code;
   }
}
