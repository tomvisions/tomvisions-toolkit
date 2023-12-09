import { Command } from 'commander';
import { deleteKMS } from './delete';

export class KMSCommands {
    public GetCommand(): Command {
        const program = new Command('kms');
        program
            .description('Commands related to kms');
        program.addCommand(deleteKMS.GetCommand());
        return program;
    }
}

export const kmsCommands = new KMSCommands();
