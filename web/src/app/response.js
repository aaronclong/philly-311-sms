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
	//"extra" : "Anymore details you would like to add?" TODO
}

/*
 * A very ugly compossible setter for callbacks
 * @param {setter} Method variable to be eventually set
 * @param {func} Method to call on callback
 * @return (Returns an autobound callback function)
 */
 
let setFunc = function(setter, func) {
	//Callback back function to be returned
	let callBack = function(val) {
		setter(val);
		if (func !== undefined) func();
	}
	return callBack;
}

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
	 *  				  2) addMsg - String, message to be added to internal array
	 */
	addToClaim(updateObj) {
		if (this.claim === null) return;
		console.log(updateObj);
		queries.addOrUpdateClaim([this.claim["id"], updateObj]);


	}

	defUser() {
		query
		    .getOrMakeUser(this.meta["From"], 
			                 setFunc(this.setUser.bind(this), this.defRequest.bind(this)));
	}

	getRequest() {
		return this.request;
	}

	defClaim() {
		if (this.user === null) throw Error("\nUser not substantiated\n");
		query.getOrMakeClaim(this.user, setFunc(this.setClaim.bind(this), this.setResponse.bind(this)));
	}

	defRequest() {
		if (this.user === null) throw Error("\nUser not substantiated\n");
		let { Body, MessageSid, FromZip } = this.meta;
		let obj = {
			        body: Body,
			        messageSId: MessageSid,
			        user: this.user,
			        zip: FromZip
			      }
		this.response = Body.length <= 3 && rspMsg[Body] !== undefined ? rspMsg[Body] : "";
		console.log(obj);
		query
			.addMessage(obj,
						 setFunc(this.setRequest.bind(this), this.defClaim.bind(this)));
	}

	setClaim(val) {
		this.claim = val;
		this.setResponse();
	}

	setRequest(val) {
		this.request = val;
	}

	setResponse() {
		if (this.claim.id === null) {
			let { Body } = this.meta;
			this.response = rspMsg[Body];
		}
		if (this.respnse === "" && this.claim.status === 3) {
			this.respnse = rspMsg["local"]; 
			this.addToClaim({ status: 2, addMsg: this.request });
		} else if (this.respnse === "" && this.claim.status === 2) {
			this.respnse = "Thank you, your claim number is " + this.claim.id; 
			this.addToClaim({ status: 2, addMsg: this.request });
		}
	}

	setUser(val) {
		this.user = val;
		console.log("This is user\n" + this.user)
	}

	returnMessage() {
		return this.response;
	}
}

module.exports = { Response };
