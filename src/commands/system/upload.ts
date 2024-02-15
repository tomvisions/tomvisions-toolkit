import {Command} from 'commander';
//const axios = require('axios');
//import imageToUri from 'image-to-uri';
import {system} from "../common";
import { parse } from 'path';
//import { SocketAddress } from 'net';
//import { parse } from 'csv-parse';

interface Options {
    directory: string,
    gallery: string
    file: string
}

export class Upload {
    private async Run(options: Options) {

       // const acceptableExtensions = ['.jpeg', '.jpg', '.JPG', '.PNG', '.png']
        try {
            if (!options.file) {
                throw new Error("Missing file option")
            }    
            const file = await system.readFilefromPath(options.file)
            console.log('the file');
            console.log(file);

            const boo = parse(file);
               console.log('boo');
               console.log(boo);
         /*   for(let row in file.split("\n")){
                console.log('the row')
                console.log(row);
                const rowItems = row.split(',');    
                console.log(rowItems);
           //     await axios.postForm('http://127.0.0.1:3500/user', {
             //       name: rowItems[0],
               //     email: rowItems[0]
               //     phone: SocketAddress,
                 //   description: 
               // })
//                parsedData.push(rowItems[0].toString() + rowItems[1].toString());
              } */

           /* const files = await system.readDirectory(options.directory);
            for (let file of files) {
                for (let extension of acceptableExtensions) {
                    if (file.includes(extension)) {
                        const theFile = imageToUri(`${options.directory}/${file}`);
                        await axios.postForm('http://127.0.0.1:3500/user', {
                            name: options.gallery,
                            email: theFile
                            phone: SocketAddress,
                            description: 
                        })
                    }
                }
            }  */

        } catch (error) {
            console.log('the error');
            console.log(error);
        }
    }

    public GetCommand(): Command {
        const program = new Command();
        program
            .name('upload')
            .description('Reads the csv file and posts data through API.')
            .option('-f, --file <value>', 'The gallery id to import for')
            .action(this.Run);
        return program;
    }
}

export const upload = new Upload();
