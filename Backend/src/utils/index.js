"use strict";

const _ = require("lodash");
const { Types } = require("mongoose");

// Chuyen tu string sang ObjectId
// const convertToObjectIdMongodb = (id) => new Types.ObjectId(id);
const convertToObjectIdMongodb = (id) => {
    const objectId = new Types.ObjectId(id);
    return objectId;
};

const getIntoData = ({ fileds = [], object = {} }) => {
    return _.pick(object, fileds);
};

// Chuyen tu array sang object
const getSelectData = (select = []) => {
    return Object.fromEntries(select.map((item) => [item, 1]));
};

const unGetSelectData = (select = []) => {
    return Object.fromEntries(select.map((item) => [item, 0]));
};

const remoteUndefinedObject = (obj) => {
    Object.keys(obj).forEach((key) => {
        if (obj[key] === null || obj[key] === undefined) {
            delete obj[key];
        }
    });
    return obj;
};

/*
    const a = {
        c: {
            d: 1,
            e: 2,
        },  
    }
    db.conllection.updateOne({ c.d: 1 }, { c.e: 2 });
*/

const updateNestedObjectParser = (obj) => {
    const final = {};
    Object.keys(obj).forEach((key) => {
        if (typeof obj[key] === "object" && !Array.isArray(obj[key])) {
            const response = updateNestedObjectParser(obj[key]);
            Object.keys(response).forEach((subKey) => {
                final[`${key}.${subKey}`] = response[subKey];
            });
        } else {
            final[key] = obj[key];
        }
    });
    return final;
};

module.exports = {
    getIntoData,
    getSelectData,
    unGetSelectData,
    remoteUndefinedObject,
    updateNestedObjectParser,
    convertToObjectIdMongodb,
};
