import {Command} from 'commander';
//import * as uuid from 'uuid';
//import * as shell from 'shelljs';
import {system} from "../common";
var spawn = require('child_process').spawn;
interface Options {
    source: string,
    destination:string,
    type: string
}

/*interface ISomething {
    FirstName: any;
    LastName: number;
    DOB: number;
    Location: number;
    Mother: number
    Father: string;
    Contact: string
    'Platform Registered': string;
} */
export class Convert {
    private async Run(options: Options) {
        try {
            const file = (await system.readFilefromPath(options.source)).split("\n");
            const headersArray = file.shift().split(",");
       //     const rowData = file.split(",");
         //   const jsonData = [];

            file.map((entry, index) => {
                const rowData = entry.split(",");
                    const targetObject = {};
                    rowData.map((data, index2) => {
                        if (!data) {
                            data = 'Not Available'
                        }

                        let header = headersArray[index2].replace('\t','');
                        header = camelCase(header);
                        switch(header) {

                            case "dateOfBirth":
                            case "yearofBirth":
                                break;
                            default:
                                data = sanitizeString(data);
                        }
                        Object.assign(targetObject, JSON.parse(`{"${header}":"${data}"}`) )
                });
            //    console.log(targetObject);
               console.log(['-X', 'POST', '--data', `${JSON.stringify(targetObject)}`, 'http://127.0.0.1:3000/api/player']);
                var ls  = spawn('curl', ['-X', 'POST', '--data', `${JSON.stringify(targetObject)}`, 'http://127.0.0.1:3000/api/player']);
                ls.stdout.on('data', function (data) {
             //       console.log(data.toString());
                });
//                jsonData.push(targetObject);
            });

       ///   const check =  await  system.writeFile('./file.json', jsonData);
        //  console.log(check);
       //     console.log(jsonData);
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
            .description('Convert csv and insert into MongoDB though REST API')
            .option('-t, --type <value>', 'The type of renaming (uuid)')
            .option('-s, --source <value>', 'The csv file')
            .option('-d, --destination <value>', 'The folder destination for renaming')
            .action(this.Run);
        return program;
    }
}

function sanitizeString(str){
    str = str.replace(/[^a-z0-9áéíóúñü \.,_-]/gim,"");
    str = str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    return str.trim();
}

function camelCase(str) {
    // Using replace method with regEx
    return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {

        return index == 0 ? word.toLowerCase() : word.toUpperCase();
    }).replace(/\s+/g, '');
}

export const convert = new Convert();