"use strict"

const mongoose = require("mongoose");
const { db: {host, port, name} } = require("../configs/congif.mongdb");
const connectString = `mongodb://${host}:${port}/${name}`;

const { countConnect } = require("../helpers/check.connect");

class Database {
	constructor() {
		this.connect();
	}
	//connect
	connect(type = "mongodb") {
		if( 1 === 1 ) {
			mongoose.set("debug", true);
			mongoose.set("debug", {color: true});
		}

		mongoose.connect( connectString, {
			maxPoolSize: 100,									//toi da 100 ket noi 
		} ).then( _ => {
			console.log(`Connected MongoDB`, countConnect());
		})
		.catch( e => console.log(`Connect failed`) );
	}

	static getInstance() {
		if( !Database.instance ) {
			Database.instance = new Database();
		}
		return Database.instance;
	}
}

const instanceMongoose = Database.getInstance();
module.exports = instanceMongoose;
