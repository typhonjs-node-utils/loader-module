import { TestsuiteRunner }    from '@typhonjs-build-test/testsuite-runner';

import * as APIErrors            from './tests/APIErrors.js';
import * as ModuleLoader         from './tests/ModuleLoader.js';
import * as ModuleLoaderFailures from './tests/ModuleLoaderFailures.js';

export default new TestsuiteRunner({
   APIErrors,
   ModuleLoader,
   ModuleLoaderFailures,
});
