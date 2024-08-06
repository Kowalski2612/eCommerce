"use strict";

const _ = require("lodash");

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

module.exports = {
    getIntoData,
    getSelectData,
    unGetSelectData,
};
