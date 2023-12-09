import { Command } from 'commander';
import { rename } from './rename';
import { upload } from './upload';
import {convert} from "./convert";

export class SystemCommands {
    public GetCommand(): Command {
        const program = new Command('system');
        program
            .description('System commands that helps tomvisions in a devops capacity');
        program.addCommand(rename.GetCommand());
        program.addCommand(upload.GetCommand());
        program.addCommand(convert.GetCommand());

        return program;
    }
}

export const systemCommands = new SystemCommands();
