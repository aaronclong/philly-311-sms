const 
	Sequelize = require('sequelize'),
	//Connecting to Database
	sequelize = new Sequelize("postgres://postgress@db:5432/postgress"),


	//Users Table Object
	Users = sequelize.define('User', {
							  id: {
							  	type: Sequelize.INTEGER,
							  	primaryKey: true
							  },
							  number: {
							  	type: Sequelize.STRING,
							  	allowNull: false,
							  	validate: { isNumeric: true }
							  },
							  zip: Sequelize.STRING
							 }),
	//Message Table Object
	Messages = sequelize.define('Messages', {
									id: {
									 	type: Sequelize.UUID,
									    defaultValue: Sequelize.UUIDV1,
									    primaryKey: true
									},
									to: {
										type: Sequelize.STRING,
										references: { model: 'User', key: 'id'}
									},
									messageSid: Sequelize.STRING,
									from: Sequelize.STRING,
									body: Sequelize.TEXT,
									zip: Sequelize.STRING
								}),
	//Clains Table Object
	Claims = sequelize.define('Claims', {
								id: {
									type: Sequelize.UUID,
									defaultValue: Sequelize.UUIDV1,
									primaryKey: true
								},
								user: {
									type: Sequelize.INTEGER,
									references: { model: 'User', key: 'id'}
								},
								department: Sequelize.INTEGER,
								messages: Sequelize.ARRAY(Sequelize.UUID)
							});
	
	//Creates Tables if not already created
	//False indicates wether or not to drop tables if already exists
	sequelize.sync({ force: false });

module.exports = { Users, Messages, Claims };
