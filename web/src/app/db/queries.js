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
		console.log(claimData);
		return Claims.findOne({ id: claimData[0] })
			  .then(result => {
			  	let data = result.get("messages");
			  	data.messages.push(claimData[1].messages);
			  	claimData[1].messages = data;
			  	result.update(claimData[1]);
			  	return 0;
			  }).catch(sqlError => {
						console.error(sqlError);
						return -2;
					});

	},

	/*
	 * Add message to database organized object
	 * 		via the callBack function
	 * @param {data} JSON data providing the message and caller
	 * @returns (id if succesful, -2 otherwise)
	 */
	addRequest: function(data) {
		return Messages.create(data)
					   .then(result => { return result.get("id"); })
					   .catch(sqlError => {
								console.error(sqlError);
								return -2;
						});

	},


	/*
	 * Finds the claim based on it's last modification, number, and status
	 * @param {user} num: Phone number
	 * @param {callBack} function to be called on completion
	 * @returns (Claim's data if available, -2 otherwise)
	 */
	getOrMakeClaim: function(userId) {
		console.log("At Claim\n" +userId)
		return Claims.findOrCreate({
					where: { 
							user: userId,
							updatedAt: { 
								$lt: new Date(), 
								$gt: new Date(new Date() - 60 * 1000) 
							}
					}
				}).spread((claim, created) => {
					if (claim === undefined) return;
					let data = {
						id: claim.get("id"),
						state: claim.get("state")
					}
					return data;
				}).catch(sqlError =>{
					console.log("Claim Problem");
					console.error(sqlError);
					return -2;
				});
	},


	/*
	 * Finds or Make User entry
	 * @param {String} num: Phone number
	 * @returns (0 if succesful, -2 otherwise)
	 */
	getOrMakeUser: function(num) {
		return Users.findOrCreate({
				where: { number: num }
			}).spread((user, created) => user.get("id"));

		} catch(sqlError => {
			console.log(sqlError);
			return -2;
		});
}