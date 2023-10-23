const fs = require('fs/promises');

class System {

    /**
     * 
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

}

export const system = new System();