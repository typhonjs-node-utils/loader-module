export default class ModuleLoaderFailures
{
   static run(Module, data, chai)
   {
      const { expect } = chai;
      const ModuleLoader = Module.default;

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
}
