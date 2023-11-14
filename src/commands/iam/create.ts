//import {readdirSync} from "fs";
import { Command } from 'commander';
///import * as uuid from 'uuid';
//import * as shell from 'shelljs';
import { iam } from "../common/";
//oimport {readdirSync} from "fs";
//import {sequelize} from "./db";

interface Options {
    prefix: string,
    type: string,
}



export class DeleteIAM {
    private async Run(options: Options) {

        switch (options.type) {
            case "role":
     //           iam.createRoleByPrefix(options.prefix);
                break;
            case "policy":
                iam.deletePolicyByPrefix(options.prefix);
                break;

            case "user":
                iam.deletePolicyByPrefix(options.prefix);
                break;
    

            default:
                break;
        }
    }

    public GetCommand(): Command {
        const program = new Command();
        program
            .name('delete')
            .description('Operations responding to deleting IAM resources')
            .option('-p, --prefix <value>', 'Delete IAM resource based on prefix')
            .option('-t, --type <value>', 'Focus on type to delete: user, role, or policy to delete')
            .action(this.Run);
        return program;
    }
}

export const deleteIAM = new DeleteIAM();
