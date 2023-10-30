#!/usr/bin/env node
'use strict';

import { Command } from 'commander';

const pkg = require(`../package.json`);

import { systemCommands, rdsCommands, s3Commands, iamCommands} from './commands';

const program = new Command();

program
    .name('Tomvisions Toolkit')
    .version(pkg.version ? pkg.version : `Unknown`)
    .description('CLI toolkit for Tomvisions Toolkit. There is access to system, s3, and rds commands')
    .addCommand(systemCommands.GetCommand())
    .addCommand(rdsCommands.GetCommand())
    .addCommand(s3Commands.GetCommand())
    .addCommand(iamCommands.GetCommand())

program.parse(process.argv);
