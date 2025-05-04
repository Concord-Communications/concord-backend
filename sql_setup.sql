CREATE DATABASE termichat;
USE termichat;


CREATE TABLE User (
                      id INT AUTO_INCREMENT PRIMARY KEY,
                      name VARCHAR(30) NOT NULL,
                      handle VARCHAR(50) UNIQUE NOT NULL,
                      description TEXT,
                      created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                      permissions INT NOT NULL,
                      channels JSON NOT NULL,
                      name_color CHAR(7) NOT NULL DEFAULT "#00fff7",
                      verified BOOLEAN DEFAULT FALSE,
                      password VARCHAR(255) NOT NULL,
                      last_read_message INT, -- this should have the null allowed
                      FOREIGN KEY (last_read_message) REFERENCES Message(id)
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
                         date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                         channelid INT NOT NULL,
                         FOREIGN KEY (channelid) REFERENCES channels(id) ON DELETE CASCADE,
                         FOREIGN KEY (senderid) REFERENCES User(id) ON DELETE CASCADE
);

-- INSERT INTO User (id, name, handle, description, permissions, channels, password) VALUES
--          (0,"[System]", "system", "system message helper", 0, '[]', "");
CREATE USER IF NOT EXISTS 'KAUS'@'localhost' IDENTIFIED BY 'aip1urm!WOUT';
GRANT INSERT, UPDATE, DELETE, SELECT on termichat.* TO 'KAUS'@'localhost'; -- WITH GRANT OPTION;

FLUSH PRIVILEGES;

