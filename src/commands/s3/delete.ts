//import {readdirSync} from "fs";
import {Command} from 'commander';
///import * as uuid from 'uuid';
//import * as shell from 'shelljs';
import {s3} from "../common/s3";
//oimport {readdirSync} from "fs";
//import {sequelize} from "./db";

interface Options {
    bucket: string,
    prefix: string,
    database:string,
    table:string,
    field:string
}



export class DeleteS3 {
    private async Run(options: Options) {

        try {
            await s3.deleteBucketBasedOnPrefix(options.prefix);
        } catch (error) {
            console.log('the error');
            console.log(error);
        }
    }

    public GetCommand(): Command {
        const program = new Command();
        program
            .name('delete')
            .description('Delete S3 bucket(s) based on prefix. If bucket is not empty, it will delete the items in bucket')
            .option('-p, --prefix <value>', 'The bucket prefix to delete')
            .action(this.Run);
        return program;
    }
}

export const deleteS3 = new DeleteS3();
