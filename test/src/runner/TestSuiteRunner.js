import APIErrors        from './tests/APIErrors.js';
import ModuleLoader     from './tests/ModuleLoader.js';

const s_API_ERRORS      = true;
const s_MODULE_LOADER   = true;

const s_TESTS = [];

if (s_API_ERRORS) { s_TESTS.push(APIErrors); }
if (s_MODULE_LOADER) { s_TESTS.push(ModuleLoader); }

export default class TestSuiteRunner
{
   static run(Module, data, chai)
   {
      for (const Test of s_TESTS)
      {
         Test.run(Module, data, chai);
      }
   }
}
