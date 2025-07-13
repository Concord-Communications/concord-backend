USE termichat;

CREATE USER IF NOT EXISTS 'KAUS'@'localhost' IDENTIFIED BY 'iW4antAbetterPassword';

-- Grant permissions to user from any host within Docker network
GRANT ALL PRIVILEGES ON termichat.* TO 'KAUS'@'%' IDENTIFIED BY 'iW4antAbetterPassword';
FLUSH PRIVILEGES;