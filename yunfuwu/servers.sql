SET NAMES UTF8;
DROP DATABASE IF EXISTS servers;
CREATE DATABASE servers CHARSET=UTF8;
USE servers;
CREATE TABLE servers_user(
  uid   INT PRIMARY KEY AUTO_INCREMENT,
  uname VARCHAR(25) NOT NULL DEFAULT '',
  upwd  VARCHAR(32) NOT NULL DEFAULT ''
);
INSERT INTO servers_user VALUES(null,'Leo','123456');
INSERT INTO servers_user VALUES(null,'Tom','123456');
