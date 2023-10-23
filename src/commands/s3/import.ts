//import {readdirSync} from "fs";
import {Command} from 'commander';
///import * as uuid from 'uuid';
//import * as shell from 'shelljs';
//import {s3} from "../common/s3";
//oimport {readdirSync} from "fs";
//import {sequelize} from "./db";

interface Options {
    bucket: string,
    prefix: string,
    database:string,
    table:string,
    field:string
}



export class ImportS3 {
    private async Run(options: Options) {


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
            .name('import')
            .description('Import file(s) from a specific source to a speific S3 Bucket')
            .option('-b, --bucket <value>', 'The bucket the files or file is being uploaded to')
            .option('-f, --folder <value>', 'The folder the files are being uploaded from')
            .option('-d, --file <value>', 'The folder focused on renaming')
            .option('-t, --table <value>', 'The folder focused on renaming')
            .option('-f, --field <value>', 'The folder focused on renaming')
            .action(this.Run);
        return program;
    }
}

export const importS3 = new ImportS3();
