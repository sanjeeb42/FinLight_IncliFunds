PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
CREATE TABLE users (
	id INTEGER NOT NULL, 
	email VARCHAR NOT NULL, 
	phone VARCHAR, 
	full_name VARCHAR NOT NULL, 
	hashed_password VARCHAR NOT NULL, 
	preferred_language VARCHAR, 
	language VARCHAR, 
	state VARCHAR, 
	religion VARCHAR, 
	cultural_background VARCHAR, 
	financial_knowledge_level VARCHAR, 
	onboarding_completed BOOLEAN, 
	is_active BOOLEAN, 
	is_verified BOOLEAN, 
	created_at DATETIME DEFAULT CURRENT_TIMESTAMP, 
	updated_at DATETIME, 
	PRIMARY KEY (id)
);
INSERT INTO users VALUES(1,'admin@fintwin.com','+91-9999999999','FinTwin Admin','$2b$12$OIkhT9EF/qb7jMiy2cf0K.ztGOfBbo/LvSEP0ajDkiAmgxbcYV9N.','en','en','Delhi',NULL,NULL,'beginner',0,1,1,'2025-07-24 17:09:33',NULL);
INSERT INTO users VALUES(2,'a@db.com','8888888888','aa','$2b$12$/WB1KVPc94rry1K9jZ7sMOr2lYphCS59DoJfEIQbDAsy2wNAMLtRO','en','','','','','beginner',1,1,0,'2025-07-24 17:12:02','2025-07-24 17:16:56');
INSERT INTO users VALUES(3,'b@db.com','9999999999','bb','$2b$12$4WLU8gqe5LD7bEh1zNr.YeiwIHJHEtPtiBVIjGUSHJWqOC6OgRsB.','hi','','','','','beginner',1,1,0,'2025-07-24 17:21:30','2025-07-24 18:25:27');
INSERT INTO users VALUES(4,'c@db.com','7777777777','cc','$2b$12$NiNXqSL70lfblkdTGw7I6uUALfLVa0g0EDpNFRBubuX5DRerNBmMK','ta','','','','','proficient',1,1,0,'2025-07-24 17:27:31','2025-07-24 17:28:20');
INSERT INTO users VALUES(5,'e@db.com','6666666666','ee','$2b$12$1NezptfCyye3jyzYIdVk2u3GwPl7I7.0ue.Mpos/DOATAGy5gh7Ri','gu','en','Nagaland',NULL,'Extended Family','beginner',0,1,0,'2025-07-24 22:15:12',NULL);
INSERT INTO users VALUES(6,'f@db.com','2243432234','fa','$2b$12$kkaUVQoUdm/Hd4v8JRHTZet1SMAyqgZ3wDnKtFW1Wstv3mOEEX7IW','te','en','Karnataka',NULL,NULL,'intermediate',0,1,0,'2025-07-25 05:28:01','2025-07-25 05:28:55');
INSERT INTO users VALUES(7,'g@db.com','1234567890','gg','$2b$12$CMon0W8RI/E/cG7VuGF6U./MX7GL20ePecPMlmhkC6HK.B1mfAYl.','te','en','Himachal Pradesh',NULL,NULL,'intermediate',0,1,0,'2025-07-25 07:38:08','2025-07-25 07:38:18');
INSERT INTO users VALUES(8,'h@db.com','2626262626','hh','$2b$12$5Og0osdiJUOCQSjpNyYV6OZcrFddaMQyT2tQb.cNv0RvntP5RJ732','gu','en','Himachal Pradesh',NULL,NULL,'intermediate',0,1,0,'2025-07-25 08:50:32','2025-07-25 08:50:42');
INSERT INTO users VALUES(9,'test3@example.com','09954858276','Sanjeeb Kumar','$2b$12$aWSWjaNY5QewBRQIV1hERONY8V9GAsST8rYLXT3l63zpAtx3QIB1C','en','en','Assam',NULL,NULL,'intermediate',0,1,0,'2025-07-25 09:16:44','2025-07-25 09:16:59');
INSERT INTO users VALUES(10,'test2@example.com','9954858276','Sanjeeb Kumar','$2b$12$MDzQGIkKjzUY./Bm0W4gAeP9Q9k3ZjSgjsH1Qf0ozck9ZhM2H1Q/C','en','en','Assam',NULL,NULL,'beginner',0,1,0,'2025-07-25 09:29:05',NULL);
INSERT INTO users VALUES(11,'d@gmail.com','9954858275','Sanjeeb Kumar','$2b$12$HZjCteC1tMMQn1R7Ubx/U.G6CUriJi8cXkYvC423RjUQkB1XK9aWS','en','en','Assam',NULL,NULL,'beginner',0,1,0,'2025-07-25 09:36:59',NULL);
CREATE TABLE government_schemes (
	id INTEGER NOT NULL, 
	name VARCHAR NOT NULL, 
	description TEXT, 
	scheme_type VARCHAR, 
	eligibility_criteria JSON, 
	benefits JSON, 
	application_process TEXT, 
	required_documents JSON, 
	applicable_states JSON, 
	age_min INTEGER, 
	age_max INTEGER, 
	income_max FLOAT, 
	is_active BOOLEAN, 
	official_website VARCHAR, 
	created_at DATETIME DEFAULT CURRENT_TIMESTAMP, 
	updated_at DATETIME, 
	PRIMARY KEY (id)
);
INSERT INTO government_schemes VALUES(1,'Pradhan Mantri Jan Dhan Yojana','Financial inclusion program providing bank accounts with zero balance',NULL,'"{\"age_min\": 18, \"income_max\": 200000, \"documents_required\": [\"Aadhaar\", \"PAN\"]}"','"{\"zero_balance_account\": true, \"overdraft_facility\": 10000, \"insurance_cover\": 200000}"','Visit nearest bank branch with required documents',NULL,'"[\"All States\"]"',NULL,NULL,NULL,1,'https://pmjdy.gov.in/','2025-07-24 17:09:33',NULL);
INSERT INTO government_schemes VALUES(2,'Atal Pension Yojana','Pension scheme for unorganized sector workers',NULL,'"{\"age_min\": 18, \"age_max\": 40, \"income_max\": 500000, \"documents_required\": [\"Aadhaar\", \"Bank Account\"]}"','"{\"guaranteed_pension\": true, \"pension_amount\": [1000, 2000, 3000, 4000, 5000], \"government_contribution\": true}"','Apply through bank or online portal',NULL,'"[\"All States\"]"',NULL,NULL,NULL,1,'https://npscra.nsdl.co.in/','2025-07-24 17:09:33',NULL);
INSERT INTO government_schemes VALUES(3,'Sukanya Samriddhi Yojana','Savings scheme for girl child education and marriage',NULL,'"{\"girl_child_age_max\": 10, \"documents_required\": [\"Birth Certificate\", \"Aadhaar\", \"Parent ID\"]}"','"{\"interest_rate\": 7.6, \"tax_benefit\": true, \"maturity_period\": 21, \"partial_withdrawal\": true}"','Open account at post office or authorized bank',NULL,'"[\"All States\"]"',NULL,NULL,NULL,1,'https://www.nsiindia.gov.in/','2025-07-24 17:09:33',NULL);
INSERT INTO government_schemes VALUES(4,'PM Kisan Samman Nidhi','Income support for small and marginal farmers',NULL,'"{\"land_holding_max\": 2, \"farmer_category\": [\"Small\", \"Marginal\"], \"documents_required\": [\"Land Records\", \"Aadhaar\", \"Bank Account\"]}"','"{\"annual_amount\": 6000, \"installments\": 3, \"direct_transfer\": true}"','Register online or through Common Service Centers',NULL,'"[\"All States\"]"',NULL,NULL,NULL,1,'https://pmkisan.gov.in/','2025-07-24 17:09:33',NULL);
INSERT INTO government_schemes VALUES(5,'Pradhan Mantri Mudra Yojana','Micro-finance scheme for small businesses',NULL,'"{\"business_type\": [\"Manufacturing\", \"Trading\", \"Services\"], \"loan_amount_max\": 1000000, \"documents_required\": [\"Business Plan\", \"Aadhaar\", \"Bank Statements\"]}"','"{\"collateral_free\": true, \"categories\": {\"Shishu\": 50000, \"Kishore\": 500000, \"Tarun\": 1000000}}"','Apply through banks, NBFCs, or MFIs',NULL,'"[\"All States\"]"',NULL,NULL,NULL,1,'https://mudra.org.in/','2025-07-24 17:09:33',NULL);
CREATE TABLE local_agents (
	id INTEGER NOT NULL, 
	name VARCHAR NOT NULL, 
	phone VARCHAR NOT NULL, 
	email VARCHAR, 
	address TEXT, 
	state VARCHAR, 
	district VARCHAR, 
	specializations JSON, 
	languages_spoken JSON, 
	rating FLOAT, 
	total_reviews INTEGER, 
	is_verified BOOLEAN, 
	is_active BOOLEAN, 
	whatsapp_number VARCHAR, 
	created_at DATETIME DEFAULT CURRENT_TIMESTAMP, 
	PRIMARY KEY (id)
);
INSERT INTO local_agents VALUES(1,'Rajesh Kumar','+91-9876543210','rajesh.kumar@fintwin.com',NULL,'Delhi',NULL,'"[\"Government Schemes\", \"Tax Planning\"]"','"[\"Hindi\", \"English\"]"',4.5,0,1,1,NULL,'2025-07-24 17:09:33');
INSERT INTO local_agents VALUES(2,'Priya Sharma','+91-9876543211','priya.sharma@fintwin.com',NULL,'Maharashtra',NULL,'"[\"Investment Planning\", \"Mutual Funds\"]"','"[\"Hindi\", \"English\", \"Marathi\"]"',4.700000000000000177,0,1,1,NULL,'2025-07-24 17:09:33');
INSERT INTO local_agents VALUES(3,'Suresh Reddy','+91-9876543212','suresh.reddy@fintwin.com',NULL,'Telangana',NULL,'"[\"Business Loans\", \"MUDRA Schemes\"]"','"[\"Telugu\", \"English\", \"Hindi\"]"',4.299999999999999823,0,1,1,NULL,'2025-07-24 17:09:33');
INSERT INTO local_agents VALUES(4,'Lakshmi Iyer','+91-9876543213','lakshmi.iyer@fintwin.com',NULL,'Tamil Nadu',NULL,'"[\"Women Schemes\", \"Education Loans\"]"','"[\"Tamil\", \"English\"]"',4.599999999999999644,0,1,1,NULL,'2025-07-24 17:09:33');
INSERT INTO local_agents VALUES(5,'Amit Patel','+91-9876543214','amit.patel@fintwin.com',NULL,'Gujarat',NULL,'"[\"Small Business\", \"Agricultural Loans\"]"','"[\"Gujarati\", \"Hindi\", \"English\"]"',4.400000000000000356,0,1,1,NULL,'2025-07-24 17:09:33');
CREATE TABLE investment_filters (
	id INTEGER NOT NULL, 
	name VARCHAR NOT NULL, 
	filter_type VARCHAR, 
	description TEXT, 
	criteria JSON, 
	applicable_religions JSON, 
	excluded_sectors JSON, 
	is_active BOOLEAN, 
	created_at DATETIME DEFAULT CURRENT_TIMESTAMP, 
	PRIMARY KEY (id)
);
INSERT INTO investment_filters VALUES(1,'Halal Investments','religious','Sharia-compliant investment options excluding interest-based and prohibited sectors','"{\"excluded_sectors\": [\"Banking\", \"Alcohol\", \"Tobacco\", \"Gambling\", \"Adult Entertainment\"], \"investment_types\": [\"Equity\", \"Gold\", \"Real Estate\", \"Sukuk\"], \"principles\": [\"No Interest\", \"No Speculation\", \"Asset-backed\"]}"','"[\"Islam\"]"',NULL,1,'2025-07-24 17:09:33');
INSERT INTO investment_filters VALUES(2,'Jain Investment Principles','religious','Investment options aligned with Jain principles of non-violence and ethical business','"{\"excluded_sectors\": [\"Leather\", \"Alcohol\", \"Tobacco\", \"Weapons\", \"Animal Products\"], \"preferred_sectors\": [\"Technology\", \"Healthcare\", \"Education\", \"Renewable Energy\"], \"principles\": [\"Ahimsa\", \"Ethical Business\", \"Sustainable Growth\"]}"','"[\"Jainism\"]"',NULL,1,'2025-07-24 17:09:33');
INSERT INTO investment_filters VALUES(3,'Vegetarian Lifestyle Investments','lifestyle','Investment options for those following vegetarian lifestyle principles','"{\"excluded_sectors\": [\"Meat Processing\", \"Leather\", \"Animal Testing\"], \"preferred_sectors\": [\"Plant-based Foods\", \"Organic Farming\", \"Sustainable Agriculture\"], \"principles\": [\"Cruelty-free\", \"Plant-based\", \"Sustainable\"]}"','"[\"Hindu\", \"Jain\", \"Buddhist\"]"',NULL,1,'2025-07-24 17:09:33');
INSERT INTO investment_filters VALUES(4,'Traditional Hindu Values','religious','Investment approach based on traditional Hindu values and dharmic principles','"{\"preferred_investments\": [\"Gold\", \"Real Estate\", \"Education\", \"Healthcare\"], \"auspicious_timing\": [\"Akshaya Tritiya\", \"Dhanteras\", \"Gudi Padwa\"], \"principles\": [\"Dharma\", \"Long-term wealth\", \"Family security\"]}"','"[\"Hindu\"]"',NULL,1,'2025-07-24 17:09:33');
INSERT INTO investment_filters VALUES(5,'Sikh Community Values','religious','Investment options aligned with Sikh principles of honest earning and community welfare','"{\"excluded_sectors\": [\"Tobacco\", \"Alcohol\", \"Gambling\"], \"preferred_sectors\": [\"Agriculture\", \"Education\", \"Healthcare\", \"Community Development\"], \"principles\": [\"Honest earning\", \"Community welfare\", \"Hard work\"]}"','"[\"Sikhism\"]"',NULL,1,'2025-07-24 17:09:33');
CREATE TABLE financial_profiles (
	id INTEGER NOT NULL, 
	user_id INTEGER, 
	monthly_income FLOAT, 
	monthly_expenses FLOAT, 
	savings_goal FLOAT, 
	risk_tolerance VARCHAR, 
	investment_preferences JSON, 
	financial_goals JSON, 
	occupation VARCHAR, 
	family_size INTEGER, 
	dependents INTEGER, 
	created_at DATETIME DEFAULT CURRENT_TIMESTAMP, 
	updated_at DATETIME, 
	PRIMARY KEY (id), 
	UNIQUE (user_id), 
	FOREIGN KEY(user_id) REFERENCES users (id)
);
INSERT INTO financial_profiles VALUES(1,1,100000.0,60000.0,500000.0,'moderate','"[\"mutual_funds\", \"stocks\"]"','"[\"retirement\", \"wealth_building\"]"','admin',3,2,'2025-07-24 17:09:33',NULL);
CREATE TABLE community_circles (
	id INTEGER NOT NULL, 
	name VARCHAR NOT NULL, 
	description TEXT, 
	state VARCHAR, 
	language VARCHAR, 
	category VARCHAR, 
	member_count INTEGER, 
	is_active BOOLEAN, 
	created_by INTEGER, 
	created_at DATETIME DEFAULT CURRENT_TIMESTAMP, 
	PRIMARY KEY (id), 
	FOREIGN KEY(created_by) REFERENCES users (id)
);
INSERT INTO community_circles VALUES(1,'Beginner Savers','A community for people just starting their savings journey. Share tips, ask questions, and motivate each other.',NULL,NULL,'savings',0,1,NULL,'2025-07-24 17:09:33');
INSERT INTO community_circles VALUES(2,'Investment Enthusiasts','Discuss investment strategies, market trends, and share portfolio insights with fellow investors.',NULL,NULL,'investment',0,1,NULL,'2025-07-24 17:09:33');
INSERT INTO community_circles VALUES(3,'Wedding Planners','Planning a wedding? Join this circle to share budgeting tips, vendor recommendations, and cost-saving strategies.',NULL,NULL,'goals',0,1,NULL,'2025-07-24 17:09:33');
INSERT INTO community_circles VALUES(4,'Government Scheme Experts','Learn about and discuss various government schemes, eligibility criteria, and application processes.',NULL,NULL,'schemes',0,1,NULL,'2025-07-24 17:09:33');
INSERT INTO community_circles VALUES(5,'Tax Savers Club','Share tax-saving strategies, discuss new tax rules, and help each other maximize tax benefits.',NULL,NULL,'tax',0,1,NULL,'2025-07-24 17:09:33');
CREATE TABLE savings_goals (
	id INTEGER NOT NULL, 
	user_id INTEGER, 
	title VARCHAR NOT NULL, 
	description TEXT, 
	target_amount FLOAT NOT NULL, 
	current_amount FLOAT, 
	target_date DATETIME, 
	category VARCHAR, 
	cultural_context VARCHAR, 
	is_completed BOOLEAN, 
	priority VARCHAR, 
	auto_contribution FLOAT, 
	created_at DATETIME DEFAULT CURRENT_TIMESTAMP, 
	updated_at DATETIME, 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES users (id)
);
CREATE TABLE voice_interactions (
	id INTEGER NOT NULL, 
	user_id INTEGER, 
	query_text TEXT, 
	query_language VARCHAR, 
	response_text TEXT, 
	response_language VARCHAR, 
	intent_detected VARCHAR, 
	confidence_score FLOAT, 
	session_id VARCHAR, 
	created_at DATETIME DEFAULT CURRENT_TIMESTAMP, 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES users (id)
);
CREATE TABLE financial_scores (
	id INTEGER NOT NULL, 
	user_id INTEGER, 
	overall_score INTEGER, 
	savings_score INTEGER, 
	spending_score INTEGER, 
	learning_score INTEGER, 
	community_score INTEGER, 
	goal_achievement_score INTEGER, 
	cultural_awareness_score INTEGER, 
	calculation_date DATETIME, 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES users (id)
);
CREATE TABLE cultural_nudges (
	id INTEGER NOT NULL, 
	user_id INTEGER, 
	nudge_type VARCHAR, 
	title VARCHAR NOT NULL, 
	message TEXT, 
	cultural_context VARCHAR, 
	state_specific VARCHAR, 
	language VARCHAR, 
	action_suggested VARCHAR, 
	is_read BOOLEAN, 
	is_acted_upon BOOLEAN, 
	expires_at DATETIME, 
	created_at DATETIME DEFAULT CURRENT_TIMESTAMP, 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES users (id)
);
INSERT INTO cultural_nudges VALUES(1,NULL,'festival','Diwali Savings Reminder','Diwali is approaching! Start saving ₹500 weekly to have ₹5000 for celebrations and gifts.',NULL,NULL,NULL,NULL,0,0,NULL,'2025-07-24 17:09:33');
INSERT INTO cultural_nudges VALUES(2,NULL,'festival','Eid Preparation','Eid Mubarak! Plan your Eid expenses wisely. Consider setting aside money for charity (Zakat) and celebrations.',NULL,NULL,NULL,NULL,0,0,NULL,'2025-07-24 17:09:33');
INSERT INTO cultural_nudges VALUES(3,NULL,'seasonal','Wedding Season Planning','Wedding season is here! If you''re planning a wedding, start saving early. Consider wedding loans with low interest rates.',NULL,NULL,NULL,NULL,0,0,NULL,'2025-07-24 17:09:33');
INSERT INTO cultural_nudges VALUES(4,NULL,'seasonal','Monsoon Emergency Fund','Monsoon season can bring unexpected expenses. Ensure you have an emergency fund covering 3-6 months of expenses.',NULL,NULL,NULL,NULL,0,0,NULL,'2025-07-24 17:09:33');
INSERT INTO cultural_nudges VALUES(5,NULL,'deadline','Tax Saving Deadline','March 31st is approaching! Don''t miss out on tax-saving opportunities. Invest in ELSS, PPF, or NSC to save taxes.',NULL,NULL,NULL,NULL,0,0,NULL,'2025-07-24 17:09:33');
CREATE TABLE community_memberships (
	id INTEGER NOT NULL, 
	user_id INTEGER, 
	circle_id INTEGER, 
	role VARCHAR, 
	joined_at DATETIME DEFAULT CURRENT_TIMESTAMP, 
	is_active BOOLEAN, 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES users (id), 
	FOREIGN KEY(circle_id) REFERENCES community_circles (id)
);
CREATE TABLE learning_content (
	id INTEGER NOT NULL, 
	title VARCHAR NOT NULL, 
	content TEXT, 
	content_type VARCHAR, 
	language VARCHAR, 
	state_specific VARCHAR, 
	cultural_context VARCHAR, 
	circle_id INTEGER, 
	created_by INTEGER, 
	is_approved BOOLEAN, 
	view_count INTEGER, 
	created_at DATETIME DEFAULT CURRENT_TIMESTAMP, 
	PRIMARY KEY (id), 
	FOREIGN KEY(circle_id) REFERENCES community_circles (id), 
	FOREIGN KEY(created_by) REFERENCES users (id)
);
INSERT INTO learning_content VALUES(1,'Basics of Saving Money','Learn the fundamentals of saving money and building an emergency fund. Start with the 50-30-20 rule: 50% needs, 30% wants, 20% savings.','article','en',NULL,NULL,NULL,NULL,0,0,'2025-07-24 17:09:33');
INSERT INTO learning_content VALUES(2,'Understanding Mutual Funds','Mutual funds pool money from many investors to buy securities. Learn about SIP, NAV, and different types of mutual funds.','video','en',NULL,NULL,NULL,NULL,0,0,'2025-07-24 17:09:33');
INSERT INTO learning_content VALUES(3,'बचत की मूल बातें','पैसे बचाने और आपातकालीन फंड बनाने की बुनियादी बातें सीखें। 50-30-20 नियम से शुरुआत करें: 50% जरूरतें, 30% इच्छाएं, 20% बचत।','article','hi',NULL,NULL,NULL,NULL,0,0,'2025-07-24 17:09:33');
INSERT INTO learning_content VALUES(4,'Tax Saving Strategies','Learn about Section 80C, ELSS, PPF, and other tax-saving instruments. Maximize your tax savings while building wealth.','article','en',NULL,NULL,NULL,NULL,0,0,'2025-07-24 17:09:33');
INSERT INTO learning_content VALUES(5,'Wedding Financial Planning','Plan your wedding finances effectively. Learn about wedding loans, savings strategies, and budget allocation for different ceremonies.','guide','en',NULL,NULL,NULL,NULL,0,0,'2025-07-24 17:09:33');
CREATE TABLE peer_challenges (
	id INTEGER NOT NULL, 
	title VARCHAR NOT NULL, 
	description TEXT, 
	challenge_type VARCHAR, 
	target_amount FLOAT, 
	duration_days INTEGER, 
	circle_id INTEGER, 
	created_by INTEGER, 
	start_date DATETIME, 
	end_date DATETIME, 
	is_active BOOLEAN, 
	participant_count INTEGER, 
	created_at DATETIME DEFAULT CURRENT_TIMESTAMP, 
	PRIMARY KEY (id), 
	FOREIGN KEY(circle_id) REFERENCES community_circles (id), 
	FOREIGN KEY(created_by) REFERENCES users (id)
);
CREATE TABLE savings_transactions (
	id INTEGER NOT NULL, 
	goal_id INTEGER, 
	amount FLOAT NOT NULL, 
	transaction_type VARCHAR, 
	description VARCHAR, 
	transaction_date DATETIME, 
	created_at DATETIME DEFAULT CURRENT_TIMESTAMP, 
	PRIMARY KEY (id), 
	FOREIGN KEY(goal_id) REFERENCES savings_goals (id)
);
CREATE TABLE challenge_participations (
	id INTEGER NOT NULL, 
	user_id INTEGER, 
	challenge_id INTEGER, 
	current_progress FLOAT, 
	is_completed BOOLEAN, 
	joined_at DATETIME DEFAULT CURRENT_TIMESTAMP, 
	completed_at DATETIME, 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES users (id), 
	FOREIGN KEY(challenge_id) REFERENCES peer_challenges (id)
);
CREATE TABLE simulation_profiles (
	id INTEGER NOT NULL, 
	user_id INTEGER, 
	monthly_income FLOAT, 
	monthly_expenses FLOAT, 
	location VARCHAR, 
	family_size INTEGER, 
	goal VARCHAR, 
	existing_liabilities FLOAT, 
	income_type VARCHAR, 
	created_at DATETIME DEFAULT CURRENT_TIMESTAMP, 
	updated_at DATETIME, dependents INTEGER DEFAULT 0, 
	PRIMARY KEY (id), 
	UNIQUE (user_id), 
	FOREIGN KEY(user_id) REFERENCES users (id)
);
INSERT INTO simulation_profiles VALUES(1,4,200000.0,34444.0,'Bengaluru',4,'emergency',0.0,'fixed','2025-07-25 06:09:07',NULL,0);
INSERT INTO simulation_profiles VALUES(2,2,2000000.0,13333.0,'Bangalore',1,'emergency',0.0,'Fixed','2025-07-25 07:23:26','2025-07-25 08:47:58',0);
INSERT INTO simulation_profiles VALUES(3,7,1111111.0,122.0,'Bengaluru',1,'emergency',0.0,'fixed','2025-07-25 07:39:51',NULL,0);
INSERT INTO simulation_profiles VALUES(4,11,200000.0,4997.0,'Pune',3,'emergency',0.0,'Fixed','2025-07-25 09:39:55',NULL,0);
CREATE UNIQUE INDEX ix_users_email ON users (email);
CREATE UNIQUE INDEX ix_users_phone ON users (phone);
CREATE INDEX ix_users_id ON users (id);
CREATE INDEX ix_government_schemes_id ON government_schemes (id);
CREATE INDEX ix_local_agents_id ON local_agents (id);
CREATE INDEX ix_investment_filters_id ON investment_filters (id);
CREATE INDEX ix_financial_profiles_id ON financial_profiles (id);
CREATE INDEX ix_community_circles_id ON community_circles (id);
CREATE INDEX ix_savings_goals_id ON savings_goals (id);
CREATE INDEX ix_voice_interactions_id ON voice_interactions (id);
CREATE INDEX ix_financial_scores_id ON financial_scores (id);
CREATE INDEX ix_cultural_nudges_id ON cultural_nudges (id);
CREATE INDEX ix_community_memberships_id ON community_memberships (id);
CREATE INDEX ix_learning_content_id ON learning_content (id);
CREATE INDEX ix_peer_challenges_id ON peer_challenges (id);
CREATE INDEX ix_savings_transactions_id ON savings_transactions (id);
CREATE INDEX ix_challenge_participations_id ON challenge_participations (id);
CREATE INDEX ix_simulation_profiles_id ON simulation_profiles (id);
COMMIT;
