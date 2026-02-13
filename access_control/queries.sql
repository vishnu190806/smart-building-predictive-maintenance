-- 1. Who are the users with "Full" access?
SELECT User_Name, Department FROM Users WHERE Access_Level = 'Full';

-- 2. Which users accessed which doors, and when?
SELECT U.User_Name, D.Door_Location, A.Access_Time
FROM Access_Logs A
JOIN Users U ON A.User_ID = U.User_ID
JOIN Doors D ON A.Door_ID = D.Door_ID
ORDER BY A.Access_Time DESC;

-- 3. Who had repeatedly denied access attempts? (More than 1 denied attempt)
SELECT U.User_Name, COUNT(A.Log_ID) AS Denied_Count
FROM Access_Logs A
JOIN Users U ON A.User_ID = U.User_ID
WHERE A.Access_Status = 'Denied'
GROUP BY U.User_Name
HAVING COUNT(A.Log_ID) > 1;

-- 4. When are the busiest hours for building entry?
SELECT strftime('%H', Access_Time) AS Hour, COUNT(*) AS Total_Entries
FROM Access_Logs
GROUP BY Hour
ORDER BY Total_Entries DESC;

-- 5. Which zones or floors are most frequently accessed?
SELECT D.Zone, D.Floor_Number, COUNT(A.Log_ID) AS Access_Count
FROM Access_Logs A
JOIN Doors D ON A.Door_ID = D.Door_ID
GROUP BY D.Zone, D.Floor_Number
ORDER BY Access_Count DESC;

-- Task 4: Advanced Analysis

-- 6. Which users frequently attempt access outside permitted hours (e.g., before 8 AM or after 6 PM)?
SELECT U.User_Name, A.Access_Time
FROM Access_Logs A
JOIN Users U ON A.User_ID = U.User_ID
WHERE (strftime('%H', A.Access_Time) < '08' OR strftime('%H', A.Access_Time) > '18');

-- 7. How many total entries per role?
SELECT U.Access_Level, COUNT(A.Log_ID) AS Total_Entries
FROM Access_Logs A
JOIN Users U ON A.User_ID = U.User_ID
GROUP BY U.Access_Level;
