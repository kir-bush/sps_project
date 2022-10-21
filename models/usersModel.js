module.exports = (sequelize, Sequelize) => {
	const userTab = sequelize.define("user", {
	  login: {
	    type: Sequelize.STRING,
	    autoIncrement: false,
	    primaryKey: true,
	    allowNull: false
	  },
	  password: {
	    type: Sequelize.STRING,
	    allowNull: false
	  },
	  role: {
	    type: Sequelize.STRING,
	    allowNull: false
	  }
	}, {
	timestamps : false
  });
  return userTab;
};
