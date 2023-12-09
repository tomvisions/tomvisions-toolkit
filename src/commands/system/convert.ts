import {Command} from 'commander';
//import * as uuid from 'uuid';
//import * as shell from 'shelljs';
import {system} from "../common";

interface Options {
    source: string,
    destination:string,
    type: string
}

interface ISomething {
    FirstName: any;
    LastName: number;
    DOB: number;
    Location: number;
    Mother: number
    Father: string;
    Contact: string
    'Platform Registered': string;
}
export class Convert {
    private async Run(options: Options) {
        try {
            const file = (await system.readFilefromPath(options.source)).split("\n");
            const headersArray = file.shift().split(",");
       //     const rowData = file.split(",");
            const jsonData: ISomething = [];

            file.map((entry, index) => {
                const rowData = entry.split(",");
                    const targetObject = {};
                    rowData.map((data, index2) => {
                        if (!data) {
                            data = 'Not Available'
                        }

                        let header = headersArray[index2].replace('\t','');
                        data = sanitizeString(data);
                        header = sanitizeString(header);
                        Object.assign(targetObject, JSON.parse(`{"${header}":"${data}"}`) )
                });
                jsonData.push(targetObject);
            });
          const check =  await  system.writeFile('./file.json', jsonData);
          console.log(check);
            console.log(jsonData);
  //          console.log(headersArray);


        } catch (error) {
            console.log('the error');
            console.log(error);
        }
    }

    public GetCommand(): Command {
        const program = new Command();
        program
            .name('convert')
            .description('Convert one data array type to another')
            .option('-t, --type <value>', 'The type of renaming (uuid)')
            .option('-s, --source <value>', 'The folder source')
            .option('-d, --destination <value>', 'The folder destination for renaming')
            .action(this.Run);
        return program;
    }
}

function sanitizeString(str){
    str = str.replace(/[^a-z0-9áéíóúñü \.,_-]/gim,"");
    return str.trim();
}

export const convert = new Convert();