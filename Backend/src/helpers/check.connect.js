"use strict";
const mongoose = require("mongoose");
const os = require("os");
const process = require("process");
const { set } = require("../app");
const _SECONDS = 5000;

// Kiểm tra số lượng kết nối đến database
const countConnect = () => {
    const numConnection = mongoose.connections.length;
    console.log(`Number of connections: ${numConnection}`);
};

// Thông báo khi server quá tải connect
const checkOverLoad = () => {
    setInterval(() => {
        const numConnection = mongoose.connections.length;
        const numCore = os.cpus().length;
        const memoryUsage = process.memoryUsage().rss;
        // Example maxium number of connection based on number osf core
        const maxConnection = numCore * 5;

        console.log(`Active connections: ${numConnection}`);
        console.log(`Memory usage: ${memoryUsage / 1024 / 1024} MB`);

        if (numConnection > maxConnection) {
            console.log(
                `Server is over load with ${numConnection} connections`
            );
            console.log(`Memory usage: ${memoryUsage}`);
        }
    }, _SECONDS);
};
module.exports = { countConnect, checkOverLoad };
