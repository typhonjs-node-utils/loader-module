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
                  modulepath: module.path,
                  basepath: module.basepath }
               )).to.be.rejectedWith(module.error, module.message);
            });
         }
      });
   }
}
