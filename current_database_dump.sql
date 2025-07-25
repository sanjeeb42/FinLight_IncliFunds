-- FinTwin Plus Database Complete SQL Dump
-- Generated on 2025-07-25
-- SQLite Database Export

PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;

-- Users table structure and data
CREATE TABLE users (
    id INTEGER NOT NULL, 
    email VARCHAR NOT NULL, 
    hashed_password VARCHAR NOT NULL, 
    is_active BOOLEAN, 
    created_at DATETIME, 
    updated_at DATETIME, 
    phone VARCHAR, 
    full_name VARCHAR, 
    date_of_birth DATE, 
    location VARCHAR, 
    occupation VARCHAR, 
    annual_income FLOAT, 
    financial_knowledge_level VARCHAR, 
    preferred_language VARCHAR, 
    cultural_background VARCHAR, 
    PRIMARY KEY (id), 
    UNIQUE (email), 
    UNIQUE (phone)
);

-- Users data
INSERT INTO users VALUES(1,'test@example.com','$2b$12$example_hash',1,'2025-07-25 05:58:32','2025-07-25 05:58:32',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO users VALUES(2,'user@example.com','$2b$12$another_hash',1,'2025-07-25 06:08:45','2025-07-25 06:08:45',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO users VALUES(4,'demo@example.com','$2b$12$demo_hash',1,'2025-07-25 06:09:07','2025-07-25 06:09:07',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO users VALUES(7,'newuser@example.com','$2b$12$new_hash',1,'2025-07-25 07:39:51','2025-07-25 07:39:51',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL);

-- Government schemes table
CREATE TABLE government_schemes (
    id INTEGER NOT NULL, 
    name VARCHAR NOT NULL, 
    description TEXT, 
    eligibility_criteria TEXT, 
    benefits TEXT, 
    application_process TEXT, 
    category VARCHAR, 
    is_active BOOLEAN, 
    created_at DATETIME, 
    updated_at DATETIME, 
    state_specific VARCHAR, 
    income_limit FLOAT, 
    age_limit_min INTEGER, 
    age_limit_max INTEGER, 
    documents_required TEXT, 
    official_website VARCHAR, 
    contact_info TEXT, 
    PRIMARY KEY (id)
);

-- Government schemes data
INSERT INTO government_schemes VALUES(1,'Public Provident Fund (PPF)','Long-term savings scheme with tax benefits and guaranteed returns','Indian citizen, minimum age 18 years','15-year lock-in period, tax deduction under Section 80C, tax-free returns, current interest rate around 7.1%','Open account at any nationalized bank, post office, or authorized private banks','Tax Saving',1,'2025-07-25 05:58:32','2025-07-25 05:58:32',NULL,NULL,18,NULL,'PAN Card, Aadhaar Card, Address Proof, Passport Size Photos','https://www.nsiindia.gov.in/','Contact your nearest bank or post office');
INSERT INTO government_schemes VALUES(2,'Employee Provident Fund (EPF)','Mandatory retirement savings scheme for salaried employees','Salaried employee in organized sector with basic salary ≤ ₹15,000','Employer contribution matching employee contribution, tax benefits, withdrawal for specific purposes','Automatic enrollment through employer, managed by EPFO','Retirement',1,'2025-07-25 05:58:32','2025-07-25 05:58:32',NULL,NULL,NULL,NULL,'PAN Card, Aadhaar Card, Bank Account Details','https://www.epfindia.gov.in/','EPFO helpline: 1800-118-005');
INSERT INTO government_schemes VALUES(3,'National Pension System (NPS)','Market-linked pension and retirement planning scheme','Indian citizen, age 18-70 years for joining','Tax benefits under Section 80C and 80CCD, market-linked returns, pension at retirement','Online registration through eNPS portal or visit Point of Presence (PoP)','Retirement',1,'2025-07-25 05:58:32','2025-07-25 05:58:32',NULL,NULL,18,70,'PAN Card, Aadhaar Card, Bank Account Details','https://www.npscra.nsdl.co.in/','NPS helpline: 1800-222-080');
INSERT INTO government_schemes VALUES(4,'Sukanya Samriddhi Yojana','Savings scheme for girl child education and marriage','Girl child below 10 years, maximum 2 accounts per family','High interest rate (currently 7.6%), tax benefits, maturity after 21 years','Open account at bank or post office with girl child birth certificate','Child Welfare',1,'2025-07-25 05:58:32','2025-07-25 05:58:32',NULL,NULL,0,10,'Girl child birth certificate, Parents PAN Card, Aadhaar Card','https://www.nsiindia.gov.in/','Contact your nearest bank or post office');
INSERT INTO government_schemes VALUES(5,'Pradhan Mantri Jan Dhan Yojana','Financial inclusion program for banking the unbanked','Indian citizen without bank account','Zero balance account, RuPay debit card, insurance cover, overdraft facility','Visit any bank branch with valid ID and address proof','Financial Inclusion',1,'2025-07-25 05:58:32','2025-07-25 05:58:32',NULL,NULL,NULL,NULL,'Aadhaar Card or any valid ID proof, Address Proof','https://www.pmjdy.gov.in/','Bank branch or customer care');
INSERT INTO government_schemes VALUES(6,'Atal Pension Yojana','Guaranteed pension scheme for unorganized sector workers','Age 18-40, unorganized sector worker, Aadhaar and bank account mandatory','Guaranteed pension of ₹1000-5000 per month, government co-contribution for eligible subscribers','Enroll through bank, post office, or online','Pension',1,'2025-07-25 05:58:32','2025-07-25 05:58:32',NULL,NULL,18,40,'Aadhaar Card, Bank Account, Mobile Number','https://www.npscra.nsdl.co.in/','APY helpline: 1800-110-069');
INSERT INTO government_schemes VALUES(7,'Kisan Vikas Patra','Savings certificate that doubles money in specific period','Indian citizen, no age limit','Fixed returns, currently doubles money in 115 months (9 years 7 months)','Purchase from any post office or designated banks','Savings',1,'2025-07-25 05:58:32','2025-07-25 05:58:32',NULL,NULL,NULL,NULL,'PAN Card (for investment above ₹50,000), Address Proof, ID Proof','https://www.indiapost.gov.in/','Post office customer care: 1800-266-6868');
INSERT INTO government_schemes VALUES(8,'National Savings Certificate','Tax-saving investment with fixed returns','Indian citizen, no age limit','5-year lock-in period, tax deduction under Section 80C, fixed interest rate','Purchase from any post office','Tax Saving',1,'2025-07-25 05:58:32','2025-07-25 05:58:32',NULL,NULL,NULL,NULL,'PAN Card, Address Proof, ID Proof','https://www.indiapost.gov.in/','Post office customer care: 1800-266-6868');
INSERT INTO government_schemes VALUES(9,'Senior Citizens Savings Scheme','High-interest savings scheme for senior citizens','Age 60 and above (55 for VRS/retired defense personnel)','Higher interest rate (currently 8.2%), quarterly interest payout, tax benefits','Open account at bank or post office with age proof','Senior Citizens',1,'2025-07-25 05:58:32','2025-07-25 05:58:32',NULL,NULL,60,NULL,'Age Proof, PAN Card, Address Proof, ID Proof','https://www.nsiindia.gov.in/','Contact your nearest bank or post office');
INSERT INTO government_schemes VALUES(10,'Pradhan Mantri Mudra Yojana','Micro-finance scheme for small businesses and entrepreneurs','Small business owners, entrepreneurs, self-employed individuals','Collateral-free loans up to ₹10 lakhs in three categories: Shishu, Kishore, Tarun','Apply through banks, NBFCs, MFIs with business plan and documents','Business Loan',1,'2025-07-25 05:58:32','2025-07-25 05:58:32',NULL,NULL,NULL,NULL,'Business Plan, ID Proof, Address Proof, Bank Statements','https://www.mudra.org.in/','MUDRA helpline: 1800-180-1111');

-- Local agents table
CREATE TABLE local_agents (
    id INTEGER NOT NULL, 
    name VARCHAR NOT NULL, 
    specialization VARCHAR, 
    location VARCHAR, 
    contact_info TEXT, 
    rating FLOAT, 
    is_available BOOLEAN, 
    created_at DATETIME, 
    updated_at DATETIME, 
    languages_spoken VARCHAR, 
    experience_years INTEGER, 
    certification VARCHAR, 
    fees_structure TEXT, 
    PRIMARY KEY (id)
);

-- Local agents data
INSERT INTO local_agents VALUES(1,'Rajesh Kumar','Investment Planning, Tax Advisory','Mumbai, Maharashtra','{"phone": "+91-9876543210", "email": "rajesh.kumar@finadvice.com", "office": "Shop 15, Andheri West"}',4.5,1,'2025-07-25 05:58:32','2025-07-25 05:58:32','Hindi, English, Marathi',8,'Certified Financial Planner (CFP)','Consultation: ₹500/hour, Portfolio Review: ₹2000');
INSERT INTO local_agents VALUES(2,'Priya Sharma','Retirement Planning, Insurance','Delhi','{"phone": "+91-9876543211", "email": "priya.sharma@wealthcare.com", "office": "Connaught Place, Central Delhi"}',4.7,1,'2025-07-25 05:58:32','2025-07-25 05:58:32','Hindi, English, Punjabi',12,'Chartered Financial Analyst (CFA)','Initial Consultation: Free