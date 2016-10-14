"use strict";

const query = require("./db/queries");


// Available Response messages
let rspOne = {
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

//Array of acceptable second round responses
let rspTwo = [ "1", "2", "3", "4", "5", "6", "7", "8" ];


/*
 * Response Object that serializes and distributed parsed Twilio requests
 * @param {data} JSON Object from Twilio
 */

class Response {
	constructor(data) {
		this.meta = data;
		//store the id number of associated field
		this.user = null;
		this.request = null;
		this.claim = { id: null, status: null };
		//Message to return
		this.response = "";
	} 


	/*
	 * @param {updateObj} JSON Object consisting of following fields or undefined:
	 *  				  1) status - Integer, determine the opened or closed status of claim
	 *  				  2) messages - String, message to be added to internal array
	 */
	addToClaim(updateObj) {
		if (this.claim === null) return;
		console.log(updateObj);
		query.addOrUpdateClaim([this.claim["id"], updateObj]);


	}

	* defUser() {
		let id = yield query.getOrMakeUser(this.meta["From"]);
		this.setUser(id);
		yield { user: id };
	}

	getRequest() {
		return this.request;
	}

	* defClaim() {
		if (this.user === null) throw Error("\nUser not substantiated\n");
		let claim = yield query.getOrMakeClaim(this.user);
		this.setClaim(claim);
		this.setResponse();
	}

	* defRequest() {
		if (this.user === null) throw Error("\nUser not substantiated\n");
		let { Body, MessageSid, FromZip } = this.meta;
		let obj = {
			        body: Body,
			        messageSId: MessageSid,
			        user: this.user,
			        zip: FromZip
			      }
		console.log(obj);
		let id = yield query.addRequest(obj);
		this.setRequest(id);
		yield { msg: id };
	}

	setClaim(val) {
		this.claim = val;
		this.setResponse();
	}

	setRequest(val) {
		this.request = val;
	}

	setResponse() {
		let { Body } = this.meta;
		if (this.claim.state === 3){
			this.response = rspOne[Body];
			if (Body === rspOne["311"]) {
				this.addToClaim({ state: 3, messages: this.request });
			} else if (Body === rspOne["311"]) {
				this.addToClaim({ state: 3, messages: this.request });
			} else if (rspOne[Body] !== undefined) {
				this.addToClaim({ state: 2, messages: this.request });
			}
		} else if (this.claim.state === 2) {
			if (Body === rspTwo[7]) {
			   this.response = rspOne["extra"];
			   this.addToClaim({ state: 2, messages: this.request });
			} else if (rspTwo.includes(Body)) {
				this.response = rspOne["local"];
				this.addToClaim({ state: 1, messages: this.request });
			}
		} else if (this.claim.state === 1) {
			this.respnse = "Thank you, your claim number is " + this.claim.id;; 
			this.addToClaim({ state: 0, messages: this.request });
		} else this.response = "Sorry there was some kind of error please try again";

		console.log("Response message: " + this.response);
	}

	setUser(val) {
		this.user = val;
	}

	returnMessage() {
		return this.response;
	}
}

module.exports = { Response };
