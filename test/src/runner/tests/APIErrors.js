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
         it(`load - package.json w/ no type - will try to load ESM as CJS`, async () =>
         {
            await expect(ModuleLoader.load({
               modulepath: './test/fixture/node/esm/sub/success.js'
            })).to.be.rejectedWith(SyntaxError, `Unexpected token 'export'`);
         });
      }
   });
}
