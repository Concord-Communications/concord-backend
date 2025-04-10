CREATE DATABASE termichat;
USE termichat;


CREATE TABLE User (
                      id INT AUTO_INCREMENT PRIMARY KEY,
                      name VARCHAR(30) NOT NULL,
                      handle VARCHAR(50) UNIQUE NOT NULL,
                      description TEXT,
                      created DATETIME DEFAULT CURRENT_TIMESTAMP,
                      permissions INT NOT NULL,
                      channels JSON NOT NULL,
                      verified BOOLEAN DEFAULT FALSE,
                      password VARCHAR(255) NOT NULL
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

-- INSERT INTO User (id, name, handle, description, permissions, channels, password) VALUES
--          (0,"[System]", "system", "system message helper", 0, '[]', "");
CREATE USER IF NOT EXISTS 'KAUS'@'localhost' IDENTIFIED BY 'aip1urm!WOUT';
GRANT INSERT, UPDATE, DELETE, SELECT on termichat.* TO 'KAUS'@'localhost'; -- WITH GRANT OPTION;

FLUSH PRIVILEGES;

