import { Command } from 'commander';
import { importS3 } from './import';

export class S3Commands {
    public GetCommand(): Command {
        const program = new Command('s3');
        program
            .description('Commands to copy file(s) to an s3 Bucket');
        program.addCommand(importS3.GetCommand());

        return program;
    }
}

export const s3Commands = new S3Commands();
