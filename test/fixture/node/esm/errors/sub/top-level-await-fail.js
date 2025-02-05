// Fail for Node v22+ loading this file via `require` due to top level await.
await Promise.resolve(false);
