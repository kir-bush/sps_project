module.exports = (sequelize, Sequelize) => {
	const demochart = sequelize.define("demochart", {
	  id: {
	    type: Sequelize.INTEGER,
	    autoIncrement: true,
	    primaryKey: true,
	    allowNull: false
	  },
	  Месяц: {
	    type: Sequelize.STRING,
	    allowNull: false
	  },
	  Участок: {
	    type: Sequelize.STRING,
	    allowNull: false
	  },
	  Ремонт: {
	    type: Sequelize.INTEGER,
	    allowNull: false
	  },
	  Простой: {
	    type: Sequelize.INTEGER,
	    allowNull: false
	  },
	  Линия: {
	    type: Sequelize.INTEGER,
	    allowNull: false
	  },
	  Количество: {
	    type: Sequelize.INTEGER,
	    allowNull: false
	  },
	  Стоимость: {
	    type: Sequelize.DOUBLE,
	    allowNull: false
	  },
	  СрКоэф: {
	    type: Sequelize.DOUBLE,
	    allowNull: false
	  },
	  Среднее: {
	    type: Sequelize.DOUBLE, 
	    allowNull: false
	  }
	}, {
	timestamps : false
  });
  return demochart;
};
