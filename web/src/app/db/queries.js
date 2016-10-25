"use strict";

//Import ORM Objects
const { sequilize, Users, Messages, Claims } = require("./orm");

module.exports = {
	
	/*
	 * Add our update claim's state
	 * @param {claimData} Array containing first the id 
	 * 		then the rest of the data to apply
	 * @returns (0 if succesful, -2 otherwise)
	 */
	addOrUpdateClaim: function(claimData) {
		return Claims.find({ id: claimData[0] })
					 .then(result => {
					 	result.state = claimData[1].state;
					 	result.save();
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
		return Claims.find({where: { 
						$and: {
							user: userId,
							state: { $in: [1, 2, 3] }
						}
					}}).then(claim => {
						if (claim===null) {
							return Claims.create({user: userId})
											.then(result => {
												let data = {
													id: result.get("id"),
													state: result.get("state")
												}
												return data;
											});

						}
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
			}).then(user => { 
				return user[0].get("id");
			})
			  .catch(sqlError => {
				console.log(sqlError);
				return -2;
		});
	}
}