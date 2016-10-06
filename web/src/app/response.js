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
 * Compossible setter for callbacks
 * @param {setter} Method variable to be eventually set
 * @param {func} Method to call on callback
 * @return (Returns an autobound callback function)
 */
 
let setFunc = (setter, func) => {

	//let ist = this;
	//@param {val} Value to be added
	//setter.bind(this);
	//func.bind(this);

	console.log("Made it this far!!!");
	console.log(this);
	let callBack = function(val) {
		console.log("Hey");
		setter(val);
		func();
	}
	return callBack.bind(this);
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

	defUser() {
		/*let setUser = val => {
			this.user = val;
			this.setRequest();
		} */
		query.getOrMakeUser(this.meta["From"], setFunc(this.setUser.bind(this), this.defRequest));
	}

	getRequest() {
		return this.request;
	}

	defClaim() {
		if (this.user === null && this.request == null) throw Error("\nUser not substantiated\n");
		query.getOrMakeClaim();
	}

	defRequest() {
		if (this.user === null) throw Error("\nUser not substantiated\n");
		let { Body, MessageSid, FromZip } = this.meta;
		let obj = {
			        "body": Body,
			        "messageSId": MessageSid,
			        "user": this.user,
			        "zip": FromZip
			      };
		let options = ["1", "2", "3", "4", "5", "6", "7"];
		if (options.find(Body) !== undefined) setFunc(this.setRequest, this.defClaim);
		let req = query.addMessage(obj);
		this.request = req !== -2 ? req : null;
	}

	setRequest(val) {
		this.request = val;
	}

	setUser(val) {
		this.user = val;
	}

	returnMessage() {
		let { Body } = this.meta;
		//let notValid = "You're message wasn't formatted correctly";
		return rspMsg[Body] !== undefined ? rspMsg[Body] : rspMsg["311"];
	}
}

module.exports = { Response };
