import * as shell from 'shelljs';
shell.cp('-R', 'package.json', 'dist/');
shell.cp('-R', 'package-lock.json', 'dist/');
shell.cp('-R', 'README.md', 'dist/');

