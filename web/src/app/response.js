"use strict";

const query = require("./db/queries");


// Available Response messages
let rspMsg = {
	"311" : "Welcome to 311. Enter problem category or type 00 for a list.",
	"00" : "Enter # from list:\n 1 - Street/potholes/lights\n 2 - Trash/dumping\n 3 - Graffiti\n 4 - Unsafe bldg\n 5 - Vacant bldgs/lots\n 6 - Fallen trees\n 7 - Abandoned autos\n 8 - other\n",
	"1" : "Enter # from list\n 1 - Trash pickup\n 2 - Dumping in vacant lots\n 3 - Dumping in public space\n 4 - Recycling location",
	"3" : "Enter # from list\n 1 - In center city\n 2 - On bldg 1st or 2nd floor\n 3 - On bldg above 2nd floor\n 4 - Rail corridor",
	"4" : "Enter # from list\n 1 - Collapse hazard\n 2 - Broken glass\n 3 - Other",
	"5" : "Enter # from list\n 1 - Vacant commercial bldg\n 2 - Vacant residential bldg\n 3 - Vacant lot dumping",
	"6" : "Enter # from list\n 1 - Tree blocking roadway\n 2 - Tree on utility line\n 3 - Tree on public thoroughfare\n 4 - Other",
	"7" : "Enter # from list\n 1 -  Vehicle has a license plate\n 2 - Vehicle has no plates",
	"local" : "Where did this take place?",
	"extra" : "Anymore details you would like to add?"
}

/*
 * Response Object that serializes and distributed parsed Twilio requests
 * @param data
 */

class Response {
	constructor(data) {
		this.meta = data;
		//store the id number of associated field
		this.user = null;
		this.request = null;
	}

	addToClaim() {

	}

	defineUser(wait) {
		let setUser = val => {
			this.user = val;
			this.setRequest();
		}
		let q = query.getOrMakeUser(this.meta["From"], setUser.bind(this));

		/*if (q === -1) {
			let fields = ["From", "FromZip"].filter( i => {
				if (this.meta[i] !== undefined) return i;
			});
			q = addUser(fields);
		} */
		//console.log("DEfined Users");
		//console.log(q);
		//this.user = q;
	}

	getRequest() {
		return this.request;
	}

	makeClaim() {

	}

	setRequest() {
		if (this.user === null) throw Error("\nUser not substantiated\n");
		let { Body, MessageSid, FromZip } = this.meta;
		let obj = {
			        "body": Body,
			        "messageSId": MessageSid,
			        "user": this.user,
			        "zip": FromZip
			      };
		let req = query.addMessage(obj);
		this.request = req !== -2 ? req : null;
	}

	returnMessage() {
		let { Body } = this.meta;
		//let notValid = "You're message wasn't formatted correctly";
		return rspMsg[Body] !== undefined ? rspMsg[Body] : rspMsg["311"];
	}
}

module.exports = { Response };
