CREATE DATABASE termichat
CREATE TABLE User (
                      id INT AUTO_INCREMENT PRIMARY KEY,
                      name VARCHAR(30) NOT NULL,
                      handle VARCHAR(50) UNIQUE NOT NULL,
                      description TEXT,
                      created DATETIME DEFAULT CURRENT_TIMESTAMP,
                      permissions INT NOT NULL,
                      channels JSON NOT NULL,
                      verified BOOLEAN DEFAULT FALSE
);

CREATE TABLE Message (
                         id INT AUTO_INCREMENT PRIMARY KEY,
                         senderid INT NOT NULL,
                         content TEXT NOT NULL,
                         reactions JSON NOT NULL,
                         date DATETIME DEFAULT CURRENT_TIMESTAMP,
                         channelid INT NOT NULL,
                         FOREIGN KEY (channelid) REFERENCES channels ON DELETE CASCADE,
                         FOREIGN KEY (senderid) REFERENCES User(id) ON DELETE CASCADE
);
CREATE TABLE channels (
                          id INTEGER PRIMARY KEY AUTO_INCREMENT,
                          name VARCHAR(18) NOT NULL,
                          description VARCHAR(35)
);
INSERT INTO User (id, name, handle, description, permissions, channels, password) VALUES
        (0,"[System]", "system", "system message helper", 0, '[]', "");
CREATE USER 'your_username'@'localhost' IDENTIFIED BY 'your_password';
GRANT INSERT, UPDATE, DELETE, SELECT on *.* TO 'your_username'@'localhost' WITH GRANT OPTION;

