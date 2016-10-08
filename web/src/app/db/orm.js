"use strict";

const 
	Sequelize = require("sequelize"),
	//Connecting to Database
	sequelize = new Sequelize("postgres://admin:password@db:5432/admin"),


	//Users Table Object
	Users = sequelize.define("Users", {
							  id: {
							  	type: Sequelize.INTEGER,
							  	primaryKey: true,
							  	autoIncrement: true
							  },
							  number: {
							  	type: Sequelize.STRING,
							  	allowNull: false,
							  	validate: { isNumeric: true }
							  },
							  zip: Sequelize.STRING,
							 },
							 {
								  getterMethods: {
								  	getID: function() { return this.id; }
								  }
							 }),
	//Message Table Object
	Messages = sequelize.define("Messages", {
									id: {
									 	type: Sequelize.UUID,
									    defaultValue: Sequelize.UUIDV1,
									    primaryKey: true
									},
									user: {
										type: Sequelize.INTEGER,
										references: { model: "Users", key: "id"}
									},
									messageSid: Sequelize.STRING,
									body: Sequelize.TEXT,
									zip: Sequelize.STRING
								}),
	//Clains Table Object
	Claims = sequelize.define("Claims", {
								id: {
									type: Sequelize.UUID,
									defaultValue: Sequelize.UUIDV1,
									primaryKey: true
								},
								user: {
									type: Sequelize.INTEGER,
									references: { model: "Users", key: "id"}
								},
								department: Sequelize.STRING,
								messages: { type: Sequelize.ARRAY(Sequelize.UUID), defaultValue: [] }, 
								state: {
									type: Sequelize.INTEGER,
									defaultValue: 3
								}
							}, {
								setterMethods: {
									addToArray: function(item) {
										this.setDataValue("messages", item);
									}
								}
							});

	
	//Creates Tables if not already created
	//False indicates wether or not to drop tables if already exists
	sequelize.sync({ force: false });

module.exports = { Users, Messages, Claims };
