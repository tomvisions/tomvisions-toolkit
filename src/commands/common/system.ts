const fs = require('fs/promises');
import {readdirSync, writeFileSync} from "fs";
import {s3} from '.'
import probe from 'probe-image-size';

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

    public async writeFile(file, data) {
        try {
            console.log(file);
            return await writeFileSync(file, data);
        } catch (error) {
            return error.toString();
        }


    }

    public async getImageInfo(bucket, key) {

        const url = await s3.gettingSignedUrl(bucket, key);

        return await probe(url);
    }

}

export const system = new System();