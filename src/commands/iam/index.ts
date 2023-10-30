import { Command } from 'commander';
import { deleteIAM } from './delete';

export class IAMCommands {
    public GetCommand(): Command {
        const program = new Command('iam');
        program
            .description('Commands related to iam');
        program.addCommand(deleteIAM.GetCommand());

        return program;
    }
}

export const iamCommands = new IAMCommands();
