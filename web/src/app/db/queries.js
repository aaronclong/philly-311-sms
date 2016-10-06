"use strict";

//Import ORM Objects
const { Users, Messages, Claims } = require("./orm");

module.exports = {

	addUser: function(data) {
		try {
			Users.create()

		} catch (sqlError) {
			console.log(sqlError);
			return -2;
		}

	},


	/*
	 * Add message to database organized object
	 * @param {JSON} data: Phone number
	 * @returns (UUID)
	 */
	addMessage: function(data) {
		try {
		  	Messages.build(data).save()
		          .then(msg => {
		          	return msg.get("id");
		          });
		} catch (sqlError) {
			console.log("1");
			console.log(sqlError);
			return -2;
		}

	},


	/*
	 * Finds the claim based on it's last modification, number, and status
	 * @param {String} num: Phone number
	 * @returns (Claim if available)
	 */
	getOrMakeClaim: function(user, req) {
		try {
			let claim = Claims.findOrCreate({
				where: { 
					user: user,
					updatedAt: { 
						$lt: new Date(), 
						$gt: new Date(new Date() - 60 * 1000) 
					},
					status: 1
				}
			}).then(claim => {
				if (claim === undefined) return;
				claim.update({})
			});
			return claim;
		} catch(sqlError) {
			return -2;
		}
	},


	/*
	 * Finds or Make User entry
	 * @param {String} num: Phone number
	 * @returns (Integer Key for Particular User)
	 */
	getOrMakeUser: function(num, func) {
		try {
			console.log("What is the error");
			Users.findOrCreate({
				where: { number: num }
			}).spread(function(user, created) {
				func(user.get("id"));
				console.log("Success")
			});
		} catch(sqlError) {
			console.log(sqlError);
			return -2;
		}
	}
}