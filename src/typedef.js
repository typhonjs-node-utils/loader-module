/**
 * @typedef {object} ModuleLoaderObj The object passed back from `ModuleLoader.load`.
 *
 * @property {string}      filepath - If available the file path on Node otherwise this will match `loadpath` in the
 *                                    browser.
 *
 * @property {*}           instance - Either the module itself or any particular export the `resolveModule` function
 *                                    selects.
 *
 * @property {boolean}     isESM - Indicates if the import was an ES Module.
 *
 * @property {string}      loadpath - A string representation of the module path being loaded.
 *
 * @property {*}           module - The direct module import.
 *
 * @property {string|URL}  modulepath - The initial string or URL sent to ModuleLoader.
 *
 * @property {string}      type - One of the following: `import-module`, `import-path`, `import-url`, `require-module`,
 *                                `require-path`, `require-url`.
 */
