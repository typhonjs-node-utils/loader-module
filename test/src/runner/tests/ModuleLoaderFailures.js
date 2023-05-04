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

   describe(`ModuleLoader Failures (${data.suitePrefix})`, () =>
   {
      for (const module of data.errors)
      {
         it(`load - ${module.path}`, async () =>
         {
            await expect(ModuleLoader.load({
               modulepath: module.path
            })).to.eventually.be.rejectedWith(module.message).and.be.an.instanceOf(module.error);
         });
      }
   });
}
