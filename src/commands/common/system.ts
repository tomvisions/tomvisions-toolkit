const fs = require('fs/promises');
import {readdirSync} from "fs";

class System {

    /**
     * Function which reads a file from a given apth
     * @param file 
     * @returns 
     */
    public async readFilefromPath(file) {
        try {
            return await fs.readFile(file).then((data) => {
 
                return data.toString();
            })
                .catch((error) => {
                    return error.toString()
                });

        } catch (error) {
            return error.toString()
        }
    }

    /**
     * Function which reads a directory
     * @param location 
     */
    public async readDirectory(location) {
        try {
            return readdirSync(location);
        } catch (error) {
            return error.toString();
        }
    }
}

export const system = new System();