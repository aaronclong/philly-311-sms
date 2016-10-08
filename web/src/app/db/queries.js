"use strict";

//Import ORM Objects
const 
	{ Users, Messages, Claims } = require("./orm"),
	Sequelize = require("sequelize");

module.exports = {
	
	/*
	 * Add our update claim's state
	 * @param {claimData} Array containing first the id 
	 * 		then the rest of the data to apply
	 * @returns (0 if succesful, -2 otherwise)
	 */
	addOrUpdateClaim: function(claimData) {
		try {
			Claims.fetchOne({ id: claimData[0] })
				  .then(result => {
				  	result.setDataValue("state", claimData[1].status);
				  	result.get("messages").push(claimData[1].addMessage);
				  	result.save();
				  	console.log("Update Claim Done")
				  });

		} catch (sqlError) {
			console.error(sqlError);
			return -2;
		}

	},

	/*
	 * Add message to database organized object
	 * 		via the callBack function
	 * @param {data} JSON data providing the message and caller
	 * @returns (0 if succesful, -2 otherwise)
	 */
	addMessage: function(data, callBack) {
		try { 
			 Messages.create(data)
					 .then(result => { 
					 	callBack(result.get("id"))
					 	console.log("Message is done!!!")
					 });
			return 0;
		  	
		} catch (sqlError) {
			console.error(sqlError);
			return -2;
		}

	},


	/*
	 * Finds the claim based on it's last modification, number, and status
	 * @param {user} num: Phone number
	 * @param {callBack} function to be called on completion
	 * @returns (Claim's data if available, -2 otherwise)
	 */
	getOrMakeClaim: function(userId, callBack) {
		try {
			console.log("At Claim\n" +userId)
			Claims.findOrCreate({
				where: { 
						user: userId,
						//state: { $lt: 4, $gt: 0 },
						updatedAt: { 
							$lt: new Date(), 
							$gt: new Date(new Date() - 60 * 1000) 
						}
				}
			}).spread((claim, created) => {
				if (claim === undefined) return;
				let data = {};
				data["id"] = claim.get("id");
				data["state"] = claim.get("state");
				callBack(data);
				console.log("Get Claim Done")
			}).catch(sqlError =>{
			console.log("Claim Problem")
			console.error(sqlError)
			return -2;
			});
		} catch(sqlError) {
			console.log("Claim Problem")
			console.error(sqlError)
			return -2;
		}
	},


	/*
	 * Finds or Make User entry
	 * @param {String} num: Phone number
	 * @returns (0 if succesful, -2 otherwise)
	 */
	getOrMakeUser: function(num, callBack) {
		try {
			Users.findOrCreate({
				where: { number: num }
			}).spread((user, created) => callBack(user.get("id")));
			return 0;
		} catch(sqlError) {
			console.log(sqlError);
			return -2;
		}
	}
}