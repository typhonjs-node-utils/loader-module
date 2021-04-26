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
             `'modulepath' is not a string or URL`);
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

         if (!data.isBrowser)
         {
            it(`load - basepath not a string`, async () =>
            {
               await expect(ModuleLoader.load({ modulepath: './a-module.js', basepath: false })).to.be.rejectedWith(
                TypeError, `'basepath' is not a string`);
            });

            it(`load - no basepath and wrong package.json found; will try to load ESM as CJS`, async () =>
            {
               await expect(ModuleLoader.load({ modulepath: './test/fixture/node/esm/sub/success.js' })).to.be.rejectedWith(
                SyntaxError, `Unexpected token 'export'`);
            });
         }
      });
   }
}
