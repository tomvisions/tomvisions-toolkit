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
                iam.deleteRoleByPrefix(options.prefix);
                break;
            case "policy":
                iam.deletePolicyByPrefix(options.prefix);
                break;

            default:
                break;

        }
        //        const acceptableExtensions = ['.jpeg', '.jpg', '.PNG', '.png']

        /*  const readDirectory = (location) => {
              try {
                  return readdirSync(location);
              } catch (error) {
                  return error.toString();
              }
          } */

        //   const acceptableExtensions = ['.jpeg', '.jpg', '.PNG', '.png']

        try {
            //const list = await s3.retrieveObjectsNamesFromBucket(options.bucket, options.prefix);
            //  console.log(list);

            //    for (let item of list.Contents) {
            //  const gallery = item.Key.split('/')[item.Key.split('/').length-2];

            /*
                            let gallery_params = {
                                id:  uuid.v4(),
                                file: item.Key,
                                gallery_id: gallery,
                                image_type: 'portrait'
                            }
                            console.log('params');
                            console.log(gallery_params);
            
                            await Image.create(gallery_params).then(data => {
                                console.log('the data');
                                console.log(data);
                                return data;
                            }).catch(err => {
                                console.log('the error');
                                console.log(err);
                                return err;
                            })
            */
            //   }
            //     const list = await this.retrieveObjectsNamesFromBucket(options.bucket, options.prefix);
            // console.log(list);
            /*
                        const files = await readDirectory(options.directory);
                        switch (options.type) {
                            case "uuid":
            
                                break;
            
                            default:
                                break;
                        }
            
            
                        for (let file of files) {
                            for (let extension of acceptableExtensions) {
                                if (file.includes(extension)) {
                                   // console.log(file);
            //                        console.log(file.replaceAll(/ /g, '/\ /'));
                                    console.log(`${options.directory}/${file.replaceAll(/ /g, '\\ ')}`);
                                    console.log(`${options.directory}/${uuid.v4()}${extension}`);
            
                                    shell.cp(`${options.directory}/${file.replaceAll(/ /g, '\\ ')}`, `${options.directory}/${uuid.v4()}${extension}`);
                                        //      process.exit(0);
                                }
                            }
                        } */

        } catch (error) {
            console.log('the error');
            console.log(error);
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
