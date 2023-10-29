import { Command } from 'commander';
import { importRDS } from './import';
import { exportRDS } from './export';
import { deleteRDS } from './delete';

export * from  './db';

export class RDSCommands {
    public GetCommand(): Command {
        const program = new Command('rds');
        program
            .description('Commands related to RDS');
        program.addCommand(importRDS.GetCommand());
        program.addCommand(exportRDS.GetCommand());
        program.addCommand(deleteRDS.GetCommand());

        return program;
    }
}

export const rdsCommands = new RDSCommands();
