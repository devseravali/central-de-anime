import { isMain, runRestore } from './runners';

if (isMain(import.meta.url)) {
  void runRestore().then(code => { process.exitCode = code; });
}
