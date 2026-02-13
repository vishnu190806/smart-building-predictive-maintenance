-- Users Table
CREATE TABLE Users (
    User_ID INTEGER PRIMARY KEY,
    User_Name TEXT NOT NULL,
    Department TEXT,
    Floor_Number INTEGER,
    Access_Level TEXT CHECK(Access_Level IN ('Full', 'Limited', 'Visitor'))
);

-- Doors Table
CREATE TABLE Doors (
    Door_ID INTEGER PRIMARY KEY,
    Door_Location TEXT,
    Zone TEXT,
    Floor_Number INTEGER
);

-- Access_Logs Table
CREATE TABLE Access_Logs (
    Log_ID INTEGER PRIMARY KEY,
    User_ID INTEGER,
    Door_ID INTEGER,
    Access_Time DATETIME DEFAULT CURRENT_TIMESTAMP,
    Access_Status TEXT CHECK(Access_Status IN ('Granted', 'Denied')),
    FOREIGN KEY(User_ID) REFERENCES Users(User_ID),
    FOREIGN KEY(Door_ID) REFERENCES Doors(Door_ID)
);

-- Insert Sample Users
INSERT INTO Users (User_ID, User_Name, Department, Floor_Number, Access_Level) VALUES
(1, 'Alice Johnson', 'Engineering', 3, 'Full'),
(2, 'Bob Smith', 'HR', 2, 'Limited'),
(3, 'Charlie Davis', 'Sales', 1, 'Limited'),
(4, 'Diana Evans', 'Engineering', 3, 'Full'),
(5, 'Evan Wright', 'Security', 0, 'Full'),
(6, 'Fiona Green', 'Marketing', 2, 'Limited'),
(7, 'George Hall', 'Facility', 0, 'Limited'),
(8, 'Hannah King', 'Visitor', 0, 'Visitor'),
(9, 'Ian Lewis', 'Sales', 1, 'Limited'),
(10, 'Jack Scott', 'Engineering', 3, 'Full'),
(11, 'Karen Adams', 'HR', 2, 'Limited'),
(12, 'Liam Baker', 'Visitor', 0, 'Visitor'),
(13, 'Mia Clark', 'Marketing', 2, 'Limited'),
(14, 'Noah Allen', 'Research', 4, 'Full'),
(15, 'Olivia Young', 'Executive', 5, 'Full'),
(16, 'Peter Hill', 'Research', 4, 'Full'),
(17, 'Quinn Turner', 'Sales', 1, 'Limited'),
(18, 'Rachel Carter', 'Visitor', 0, 'Visitor'),
(19, 'Steve Ward', 'Security', 0, 'Full'),
(20, 'Tina Roberts', 'Facility', 0, 'Limited');

-- Insert Sample Doors
INSERT INTO Doors (Door_ID, Door_Location, Zone, Floor_Number) VALUES
(101, 'Main Entrance', 'Lobby', 0),
(102, 'Back Exit', 'Lobby', 0),
(103, 'Server Room', 'Secure', 3),
(104, 'HR Office', 'Office', 2),
(105, 'Sales Floor', 'Office', 1),
(106, 'Lab A', 'Research', 4),
(107, 'Lab B', 'Research', 4),
(108, 'Executive Suite', 'Secure', 5),
(109, 'Cafeteria', 'Common', 1),
(110, 'Maintenance Room', 'Service', 0);

-- Insert Sample Access Logs
INSERT INTO Access_Logs (User_ID, Door_ID, Access_Time, Access_Status) VALUES
(1, 103, '2023-10-25 08:30:00', 'Granted'),
(2, 104, '2023-10-25 08:35:00', 'Granted'),
(8, 101, '2023-10-25 09:00:00', 'Granted'),
(8, 103, '2023-10-25 09:15:00', 'Denied'), -- Visitor trying secure room
(3, 105, '2023-10-25 09:30:00', 'Granted'),
(5, 108, '2023-10-25 10:00:00', 'Granted'),
(1, 106, '2023-10-25 10:15:00', 'Granted'),
(2, 103, '2023-10-25 10:30:00', 'Denied'), -- Limited access trying server room
(2, 103, '2023-10-25 10:31:00', 'Denied'), -- Repeated attempt
(4, 103, '2023-10-25 11:00:00', 'Granted'),
(15, 108, '2023-10-25 11:15:00', 'Granted'),
(11, 104, '2023-10-25 12:00:00', 'Granted'),
(8, 106, '2023-10-25 12:30:00', 'Denied'),
(14, 106, '2023-10-25 13:00:00', 'Granted'),
(16, 107, '2023-10-25 13:15:00', 'Granted'),
(6, 104, '2023-10-25 13:30:00', 'Granted'),
(7, 110, '2023-10-25 14:00:00', 'Granted'),
(20, 110, '2023-10-25 14:15:00', 'Granted'),
(18, 101, '2023-10-25 15:00:00', 'Granted'),
(18, 108, '2023-10-25 15:10:00', 'Denied'),
(1, 101, '2023-10-25 18:00:00', 'Granted'), -- Late exit
(2, 101, '2023-10-25 18:05:00', 'Granted'),
(12, 103, '2023-10-25 20:00:00', 'Denied'), -- Night attempt unauthorized
(12, 103, '2023-10-25 20:01:00', 'Denied'), -- Night attempt unauthorized
(12, 103, '2023-10-25 20:05:00', 'Denied'); -- Night attempt unauthorized
