/**
 * @param {object}                        opts - Test options
 *
 * @param {import('../../../../types')}   opts.Module - Module to test
 *
 * @param {object}                        opts.data - Extra test data.
 *
 * @param {object}                        opts.chai - Chai
 */
export function run({ Module, data, chai })
{
   const { expect } = chai;
   const { ModuleLoader } = Module;

   describe(`API Errors (${data.suitePrefix})`, () =>
   {
      it(`load - modulepath not string (no options)`, async () =>
      {
         // Can't test whole error message as it slightly differs on Node 12.2.0
         await expect(ModuleLoader.load()).to.be.rejectedWith(TypeError, /^Cannot destructure property/);
      });

      it(`load - modulepath not string or URL`, async () =>
      {
         await expect(ModuleLoader.load({ modulepath: false })).to.be.rejectedWith(TypeError,
          `'modulepath' is not a string or URL`);
      });

      it(`load - resolveModule not a function`, async () =>
      {
         await expect(ModuleLoader.load({ modulepath: './a-module.js', resolveModule: false })).to.be.rejectedWith(
          TypeError, `'resolveModule' is not a function`);
      });

      it(`load - bad modulepath`, async () =>
      {
         await expect(ModuleLoader.load({ modulepath: './a-bad-path.js' })).to.be.rejectedWith(Error);
      });

      if (!data.isBrowser)
      {
         if (!process.features?.require_module)
         {
            // Prior to Node v22.12.0 this will fail. Above and `require` can load sync ESM.
            it(`load - package.json w/ no type - will try to load ESM as CJS (Node v22.12 and below)`, async () =>
            {
               await expect(ModuleLoader.load({
                  modulepath: './test/fixture/node/esm/sub/success.js'
               })).to.be.rejectedWith(SyntaxError, `Unexpected token 'export'`);
            });
         }
         else
         {
            // Node v22.12.0+ can `require` ESM code, but not with top level await / async modules.
            it(`load - package.json w/ no type - will try to load async ESM w/ require and fail (Node v22.12+)`,
             async () =>
            {
               await expect(ModuleLoader.load({
                  modulepath: './test/fixture/node/esm/errors/sub/top-level-await-fail.js'
               })).to.be.rejectedWith(Error, `require() cannot be used on an ESM graph with top-level await. Use import() instead. To see where the top-level await comes from, use --experimental-print-required-tla.`);
            });
         }
      }
   });
}
