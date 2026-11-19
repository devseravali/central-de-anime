import { isMain, runBackup } from './runners';

if (isMain(import.meta.url)) {
  void runBackup().then(code => { process.exitCode = code; });
}
