import { Command } from 'commander';
import { migrateMySQLToMongoDB } from './migrate';

export class MongoDBCommands {
    public GetCommand(): Command {
        const program = new Command('mongodb');
        program
            .description('System commands that helps tomvisions in a devops capacity');
        program.addCommand(migrateMySQLToMongoDB.GetCommand());

        return program;
    }
}

export const mongoDBCommands = new MongoDBCommands();
