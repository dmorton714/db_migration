-- =================================================================
-- STEP 0: CLEANUP
-- =================================================================
DROP DATABASE IF EXISTS shooting_db;

-- =================================================================
-- STEP 1: CREATE DATABASE
-- =================================================================
CREATE DATABASE IF NOT EXISTS shooting_db;
USE shooting_db;

-- =================================================================
-- STEP 2: CREATE TABLES
-- =================================================================

-- Address Table
CREATE TABLE IF NOT EXISTS Address (
    ObjectId BIGINT PRIMARY KEY,
    Address VARCHAR(255),
    Neighborhood VARCHAR(100),
    ZIP_Code VARCHAR(20)
);

-- CaseInfo Table
CREATE TABLE IF NOT EXISTS CaseInfo (
    ObjectId BIGINT PRIMARY KEY,
    Date DATE,
    Case_Number VARCHAR(50),
    Division_Name VARCHAR(100),
    Council_District VARCHAR(50),
    Crime_Type VARCHAR(50),
    Cause VARCHAR(255)
);

-- Demographics Table
CREATE TABLE IF NOT EXISTS Demographics (
    ObjectId BIGINT PRIMARY KEY,
    Age_Group VARCHAR(50),
    Sex VARCHAR(10),
    Race VARCHAR(50)
);

-- Geo Table
CREATE TABLE IF NOT EXISTS Geo (
    ObjectId BIGINT PRIMARY KEY,
    Latitude FLOAT,
    Longitude FLOAT
);

-- =================================================================
-- STEP 3: INSERT FAKE DATA
-- =================================================================

-- Addresses
INSERT INTO Address (ObjectId, Address, Neighborhood, ZIP_Code) VALUES
(1, '400 Block of N 25th St, Louisville, KY', 'Portland', '40212'),
(2, '800 Block of Denmark St, Louisville, KY', 'Algonquin', '40204'),
(3, '2700 Block of Greenwood Ave, Louisville, KY', 'Shively', '40216');

-- CaseInfo
INSERT INTO CaseInfo (ObjectId, Date, Case_Number, Division_Name, Council_District, Crime_Type, Cause) VALUES
(1, '2026-01-01', '10001', 'Central Division', 'District 1', 'Non-Fatal Shooting', 'Argument'),
(2, '2026-01-01', '10002', 'Central Division', 'District 2', 'Non-Fatal Shooting', 'Robbery'),
(3, '2026-01-02', '10003', 'East Division', 'District 3', 'Non-Fatal Shooting', 'Domestic');

-- Demographics
INSERT INTO Demographics (ObjectId, Age_Group, Sex, Race) VALUES
(1, '18-25', 'Male', 'Black'),
(2, '26-35', 'Female', 'White'),
(3, '36-45', 'Male', 'Hispanic');

-- Geo
INSERT INTO Geo (ObjectId, Latitude, Longitude) VALUES
(1, 38.2660203, -85.7898774),
(2, 38.1955832, -85.7728107),
(3, 38.242132, -85.797777);
