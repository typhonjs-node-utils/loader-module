import fs                  from 'fs-extra';
import { BrowserRunner }   from '@typhonjs-build-test/node-browser';

// Empty / copy test fixtures to web server root.
fs.ensureDirSync('./test/public/modules');
fs.emptyDirSync('./test/public/modules');
fs.copySync('./test/fixture/browser', './test/public');

(async () =>
{
   await BrowserRunner.runServerAndTestSuite({ reportDir: './coverage-browser' });

   // Uncomment to keep live server alive; useful when manually testing Firefox, etc.
   // await TestRunner.runServerAndTestSuite({
   //    reportDir: './coverage-browser',
   //    keepAlive: true,
   //    stdinLatch: true
   // });
})().catch((err) =>
{
   console.log(err);
   process.exit(1);
});
