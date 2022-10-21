module.exports = (sequelize, Sequelize) => {
	const docTab = sequelize.define("doc", {
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
	  loaded: {
	    type: Sequelize.DATE,
	    allowNull: true
	  },
	  category: {
	    type: Sequelize.INTEGER,
	    allowNull: true
	  },
	  hasview: {
	    type: Sequelize.BOOLEAN,
	    allowNull: false
	  },
	  filename: {
	    type: Sequelize.STRING,
	    allowNull: true
	  },
	  type: {
	    type: Sequelize.STRING,
	    allowNull: true
	  }
	}, {
	timestamps : false
  });
  return docTab;
};
