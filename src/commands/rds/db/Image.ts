"use strict";

const { DataTypes, Model } = require('.');

export class ImagePhotoGallery extends Model {
    public static initialize(sequelize) {
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
            GalleryId: {
                type: DataTypes.STRING,
            },
            createdAt: {
                type: DataTypes.DATE,
            },
            updatedAt: {
                type: DataTypes.DATE,
            },
            orientation: {
                type: DataTypes.SMALLINT,
            },
        }, {
            modelName: 'Image', sequelize, tableName: "image"
        });

    }
}