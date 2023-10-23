//import {readdirSync} from "fs";
import {Command} from 'commander';
///import * as uuid from 'uuid';
//import * as shell from 'shelljs';
//oimport {readdirSync} from "fs";
//import {sequelize} from "./db";
import http from 'http';
import request from "request";
//var request = require('request');

//import {Image} from "./db/Image";
interface Options {
    sourceLocation: string,
    destinationLocation: string,
    importCommand: string,
}


export class MigrateMySQLToMongoDB {
    private async Run(options: Options) {
        const getTableData = (location) => {
            return new Promise((resolve, reject) => {
                try {
                    http.get(location, res => {

                        let data = [];
                        const headerDate = res.headers && res.headers.date ? res.headers.date : 'no response date';
                        console.log('Status Code:', res.statusCode);
                        console.log('Date in Response header:', headerDate);

                        res.on('data', chunk => {
                            data.push(chunk);
                        });

                        res.on('end', () => {
                            console.log('Response ended: ');
                            const galleries = JSON.parse(Buffer.concat(data).toString());

                            return resolve(galleries);
                        });
                    });

                } catch (error) {
                    return reject(error.toString());
                }
            })
        }
/*

        const getGallery = (location, galleries) => {
            return new Promise((resolve, reject) => {
                try {

                    for (let gallery of galleries.galleries) {
                        console.log(gallery);
                        console.log('the url');
                        console.log(`http://127.0.0.1:3001/api/v1/gallery?gallery_id=${gallery.id}`);
                        http.get(`http://127.0.0.1:3001/api/v1/gallery?gallery_id=${gallery.id}`, resp => {
                            let data2 = [];
                            const headerDate = resp.headers && resp.headers.date ? resp.headers.date : 'no response date';
                            console.log('Status Code:', resp.statusCode);
                            console.log('Date in Response header:', headerDate);

                            resp.on('data', chunk => {
                                data2.push(chunk);
                            });

                            resp.on('end', () => {
                                console.log('Response ended: ');
                                const images = JSON.parse(Buffer.concat(data2).toString());
                                return resolve(images);
                            });
                        });
                    }
                } catch (error) {
                    return reject(error.toString());
                }
            });
        }

 */

        const postData = (location, data) => {
            return new Promise((resolve, reject) => {
                try {
                    console.log('data');
                    console.log(data);
//                    for (let object of data[field]) {
                        //      console.log(gallery);
                   //     ovje.image = object.images[0]
                      //  delete gallery['images'];
                        //    console.log(gallery);
                        request.post({
                            headers: {'content-type': 'application/json'},
                            "url": location,
                            "json": data
                        }, (error, response, body) => {
                            console.log(body);
                        }).on('error', err => {
                            console.log('Error: ', err.message);
                        });
               //     }
                } catch (error) {
                    console.log(error.toString());
                }
            });
        }
 /*
        const postImages = (location, galleries) => {
            return new Promise((resolve, reject) => {
                try {
                    for (let gallery of galleries.galleries) {
                        //      console.log(gallery);
                        gallery.image = gallery.images[0]
                        delete gallery['images'];
                        //    console.log(gallery);
                        request.post({
                            headers: {'content-type': 'application/json'},
                            "url": " http://localhost:3000/api/v1/gallery",
                            "json": gallery
                        }, (error, response, body) => {
                            console.log(body);
                        }).on('error', err => {
                            console.log('Error: ', err.message);
                        });
                    }
                } catch (error) {
                    console.log(error.toString());
                }
            });
        }*/

        let galleries;
        switch (options.importCommand) {
            case "gallery":
                galleries = await getTableData(`http://127.0.0.1:3001/api/v1/gallery?primary=1`);
           //     await postData(`http://127.0.0.1:3001/api/v1/gallery`, galleries, 'Galleries');
                break;

            case "images":
                galleries = await getTableData(`http://127.0.0.1:3001/api/v1/gallery?primary=1`);
                for (let gallery of galleries.galleries) {
              //      const images = await getTableData(`http://127.0.0.1:3001/api/v1/gallery?gallery_slug=${gallery.slug}`);
                    gallery.image = gallery.images[0]
             //       await postData(`http://127.0.0.1:3001/api/v1/gallery/images`, images);

                }

                break;

            case "event":
                const events = await getTableData(`http://127.0.0.1:3000/api/v1/event`);

                for (let event of events['events']) {
                    delete event.id;
                    console.log(event);
                    await postData(`http://127.0.0.1:3000/api/v1/event/import`, event);
                }
                console.log(event);
                break;

        }

        if (options.importCommand) {

        }


    }

    public GetCommand(): Command {
        const program = new Command();
        program
            .name('migrate')
            .description('Migrates Files from MySQL AND mongoDB')
            .option('-sl, --sourceLocation <value>', 'The type of renaming (uuid)')
            .option('-dl, --destinationLocation <value>', 'The type of renaming (uuid)')
            .option('-ig, --importCommand <value>', 'The folder focused on renaming')
            .option('-ii, --importImages <value>', 'The folder focused on renaming')
            .option('-f, --field <value>', 'The folder focused on renaming')
            .action(this.Run);
        return program;
    }
}

export const migrateMySQLToMongoDB = new MigrateMySQLToMongoDB();
