CREATE DATABASE `sitesps` 
CREATE TABLE `sitesps`.`categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(150) NOT NULL,
  `catorder` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`),
  UNIQUE KEY `name_UNIQUE` (`name`),
  UNIQUE KEY `order_UNIQUE` (`catorder`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=cp1251;

CREATE TABLE `sitesps`.`docs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(150) NOT NULL,
  `loaded` date DEFAULT NULL,
  `category` int DEFAULT NULL,
  `hasview` tinyint(1) NOT NULL DEFAULT '0',
  `filename` varchar(255) DEFAULT NULL,
  `type` varchar(6) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=cp1251;

CREATE TABLE `sitesps`.`users` (
  `login` varchar(255) NOT NULL,
  `password` varchar(50) NOT NULL,
  `role` varchar(30) NOT NULL,
  PRIMARY KEY (`login`)
) ENGINE=InnoDB DEFAULT CHARSET=cp1251;

INSERT INTO `sitesps`.`categories` (`name`, `catorder`) VALUES ('Загруженные графические файлы', '1');
INSERT INTO `sitesps`.`categories` (`name`, `catorder`) VALUES ('Загруженные PDF', '2');
INSERT INTO `sitesps`.`categories` (`name`, `catorder`) VALUES ('Загружженные WORD', '3');

INSERT INTO `sitesps`.`docs` (`id`, `name`, `loaded`, `category`, `hasview`, `filename`, `type`) VALUES ('1', 'Тестовая JPG', '2022-10-21', '1', '0', 'Тестовая JPG.jpg', 'img');
INSERT INTO `sitesps`.`docs` (`id`, `name`, `loaded`, `category`, `hasview`, `filename`, `type`) VALUES ('2', 'Тестовая PNG', '2022-10-21', '1', '0', 'Тестовая PNG.png', 'img');
INSERT INTO `sitesps`.`docs` (`id`, `name`, `loaded`, `category`, `hasview`, `filename`, `type`) VALUES ('3', 'Тестовый PDF с горизонтальной ориентацией', '2022-10-21', '2', '0', 'Тестовый PDF с горизонтальной ориентацией.pdf', 'doc');
INSERT INTO `sitesps`.`docs` (`id`, `name`, `loaded`, `category`, `hasview`, `filename`, `type`) VALUES ('4', 'Тестовый WORD с различными ссылками', '2022-10-21', '3', '1', 'Тестовый WORD с различными ссылками.docx', 'doc');

INSERT INTO `sitesps`.`users` (`login`, `password`, `role`) VALUES ('admin', 'admin', 'admin');
