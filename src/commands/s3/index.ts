import { Command } from 'commander';
import { importS3 } from './import';
import { deleteS3 } from './delete';

export class S3Commands {
    public GetCommand(): Command {
        const program = new Command('s3');
        program
            .description('Commands related to s3');
        program.addCommand(importS3.GetCommand());
        program.addCommand(deleteS3.GetCommand());
        return program;
    }
}

export const s3Commands = new S3Commands();
