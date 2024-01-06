import { Command } from 'commander';
import { deleteS3 } from './delete';
import { storageClass } from './storage-class'

export class S3Commands {
    public GetCommand(): Command {
        const program = new Command('s3');
        program
            .description('Commands related to s3');
        program.addCommand(deleteS3.GetCommand());
        program.addCommand(storageClass.GetCommand());
        return program;
    }
}

export const s3Commands = new S3Commands();
