import { Command } from 'commander';
import { importRDS } from './import';
export * from  './db';

export class RDSCommands {
    public GetCommand(): Command {
        const program = new Command('rds');
        program
            .description('Commands to import data into RDS');
        program.addCommand(importRDS.GetCommand());

        return program;
    }
}

export const rdsCommands = new RDSCommands();
