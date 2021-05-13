export default class ModuleLoader
{
   static run(Module, data, chai)
   {
      const { expect } = chai;
      const ModuleLoader = Module.default;

      describe(`API Errors (${data.suitePrefix})`, () =>
      {
         it(`load - modulepath not string (no options)`, async () =>
         {
            await expect(ModuleLoader.load()).to.be.rejectedWith(TypeError,
             /^Cannot destructure property 'modulepath'/);
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
            // In CI on Node 12.2.0 the `esm` module is used and it messes this test up, so it's skipped.
            if (!data.isNode12_2_0)
            {
               it(`load - package.json w/ no type - will try to load ESM as CJS`, async () =>
               {
                  await expect(ModuleLoader.load({
                     modulepath: './test/fixture/node/esm/sub/success.js'
                  })).to.be.rejectedWith(SyntaxError, `Unexpected token 'export'`);
               });
            }
         }
      });
   }
}
