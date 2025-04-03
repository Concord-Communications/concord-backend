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
                         FOREIGN KEY (senderid) REFERENCES User(id) ON DELETE CASCADE
);
CREATE USER 'your_username'@'localhost' IDENTIFIED BY 'your_password';
GRANT INSERT, UPDATE, DELETE, SELECT on *.* TO 'your_username'@'localhost' WITH GRANT OPTION;
