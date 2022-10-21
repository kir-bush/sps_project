module.exports = (sequelize, Sequelize) => {
	const catTab = sequelize.define("category", {
	  id: {
	    type: Sequelize.INTEGER,
	    autoIncrement: true,
	    primaryKey: true,
	    allowNull: false
	  },
	  name: {
	    type: Sequelize.STRING,
	    allowNull: false
	  },
	  catorder: {
	    type: Sequelize.INTEGER,
	    allowNull: true
	  }
	}, {
	timestamps : false
  });
  return catTab;
};
