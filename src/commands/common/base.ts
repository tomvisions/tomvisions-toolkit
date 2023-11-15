export class Base {

    /**
     * Function 
     * @param data 
     */
    public async formatFirstCharacterOfEveryWorld(data:string) {
        return data.split("-").map((word) => { 
            return word[0].toUpperCase() + word.substring(1); 
        }).join(" ");
    }


}