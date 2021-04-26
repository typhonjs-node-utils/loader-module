import TestRunner from '@typhonjs-utils/build-test-browser';
import fs         from "fs-extra";

// Empty / copy test fixtures to web server root.
fs.ensureDirSync('./test/live-server/modules');
fs.emptyDirSync('./test/live-server/modules');
fs.copySync('./test/fixture/browser', './test/live-server');

(async () =>
{
   await TestRunner.runServerAndTestSuite({ reportDir: './coverage-browser' });

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
