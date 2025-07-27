-- This file is used for a developer to set up the database manually
-- It is not used for the Docker setup

-- When running in Docker, the database is already created by MYSQL_DATABASE env var
-- So we just need to use it
USE termichat;


CREATE TABLE User (
                      id INT AUTO_INCREMENT PRIMARY KEY,
                      name VARCHAR(30) NOT NULL,
                      handle VARCHAR(50) UNIQUE NOT NULL,
                      description TEXT,
                      created DATETIME DEFAULT CURRENT_TIMESTAMP,
                      permissions INT NOT NULL,
                      channels JSON NOT NULL,
                      name_color CHAR(7) NOT NULL DEFAULT "#00fff7",
                      verified BOOLEAN DEFAULT FALSE,
                      isBot BOOLEAN DEFAULT FALSE NOT NULL,
                      password VARCHAR(255) NOT NULL,
                      global_permissions BINARY(2) NOT NULL DEFAULT 0x0000
);

CREATE TABLE channels (
                          id INTEGER PRIMARY KEY AUTO_INCREMENT,
                          name VARCHAR(18) NOT NULL,
                          description VARCHAR(35)
);

CREATE TABLE Message (
                         id INT AUTO_INCREMENT PRIMARY KEY,
                         senderid INT NOT NULL,
                         content TEXT NOT NULL,
                         reactions JSON NOT NULL,
                         date DATETIME DEFAULT CURRENT_TIMESTAMP,
                         channelid INT NOT NULL,
                         FOREIGN KEY (channelid) REFERENCES channels(id) ON DELETE CASCADE,
                         FOREIGN KEY (senderid) REFERENCES User(id) ON DELETE CASCADE
);

CREATE TABLE UserChannels (
                         id INT AUTO_INCREMENT PRIMARY KEY,
                         userid INT NOT NULL,
                         channelid INT NOT NULL,
                         lastMessageid INT,
                         FOREIGN KEY (userid) REFERENCES User(id) ON DELETE CASCADE,
                         FOREIGN KEY (channelid) REFERENCES channels(id) ON DELETE CASCADE
                         -- DON'T ADD A FOREIGN KEY CONSTRAINT TO MESSAGE
);

CREATE INDEX userchannels_user_id ON UserChannels (userid, channelid);


