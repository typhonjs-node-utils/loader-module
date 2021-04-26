export default class ModuleLoader
{
   static run(Module, data, chai)
   {
      const { assert } = chai;
      const ModuleLoader = Module.default;

      describe(`ModuleLoader (${data.suitePrefix})`, () =>
      {
         for (const module of data.modules)
         {
            it(`load - ${module.path}`, async () =>
            {
               let result = await ModuleLoader.load({ modulepath: module.path, basepath: module.basepath });

               if (module.defaultInstance)
               {
                  assert.strictEqual(module.defaultInstance, JSON.stringify(result.instance));
               }
               assert.strictEqual(result.isESM, module.isESM);
               assert.strictEqual(result.type, module.type);

               result = await ModuleLoader.load({
                  modulepath: module.path,
                  resolveModule: data.resolveModule,
                  basepath: module.basepath
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
   }
}
