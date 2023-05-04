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
   const { assert } = chai;
   const { ModuleLoader } = Module;

   describe(`ModuleLoader (${data.suitePrefix})`, () =>
   {
      for (const module of data.modules)
      {
         it(`load - ${module.path}`, async () =>
         {
            let result = await ModuleLoader.load({ modulepath: module.path });

            if (module.defaultInstance)
            {
               assert.strictEqual(module.defaultInstance, JSON.stringify(result.instance));
            }
            assert.strictEqual(result.isESM, module.isESM);
            assert.strictEqual(result.type, module.type);

            result = await ModuleLoader.load({
               modulepath: module.path,
               resolveModule: data.resolveModule
            });

            if (module.resolveInstance)
            {
               assert.strictEqual(module.resolveInstance, result.instance);
            }
            assert.strictEqual(result.isESM, module.isESM);
            assert.strictEqual(result.type, module.type);
         });
      }
   });

   describe(`ModuleLoadError`, () =>
   {
      it('exported correctly', () =>
      {
         const { ModuleLoadError } = Module;

         const error = new ModuleLoadError({ message: 'test', code: '1' });

         assert.isTrue(error instanceof ModuleLoadError);
         assert.isTrue(error instanceof Error);
      });
   });
}
