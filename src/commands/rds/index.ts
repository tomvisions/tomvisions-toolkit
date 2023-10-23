import { Command } from 'commander';
import { importRDS } from './import';
import { exportRDS } from './export';

export * from  './db';

export class RDSCommands {
    public GetCommand(): Command {
        const program = new Command('rds');
        program
            .description('Commands related to RDS');
        program.addCommand(importRDS.GetCommand());
        program.addCommand(exportRDS.GetCommand());

        return program;
    }
}

export const rdsCommands = new RDSCommands();
