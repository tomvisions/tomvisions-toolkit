"use strict";

const { DataTypes, Model } = require('.');

export class ImagePhotoGallery extends Model {
    public static initalize(sequelize) {
        return this.init({
            id: {
                type: DataTypes.STRING,
                primaryKey: true
            },
            key: {
                type: DataTypes.STRING,
            },
            name: {
                type: DataTypes.STRING,
            },
            gallery_id: {
                type: DataTypes.STRING,
            },
            createdAt: {
                type: DataTypes.DATE,
            },
            updatedAt: {
                type: DataTypes.DATE,
            }
        }, {
            modelName: 'Image', sequelize, tableName: "image"
        });

    }
}