-- FinTwin Plus Database Schema
-- Complete SQL commands for SQLite database

-- Enable foreign key constraints
PRAGMA foreign_keys = ON;

-- Users table
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email VARCHAR(255) NOT NULL UNIQUE,
    hashed_password VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Financial profiles table
CREATE TABLE financial_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    monthly_income FLOAT,
    monthly_expenses FLOAT,
    current_savings FLOAT,
    debt_amount FLOAT,
    risk_tolerance VARCHAR(50),
    investment_experience VARCHAR(50),
    financial_goals TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Simulation profiles table
CREATE TABLE simulation_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    age INTEGER,
    income FLOAT,
    expenses FLOAT,
    savings FLOAT,
    debt FLOAT,
    dependents INTEGER,
    risk_tolerance VARCHAR(50),
    investment_experience VARCHAR(50),
    goals TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Community circles table
CREATE TABLE community_circles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    created_by INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Community membership table
CREATE TABLE community_membership (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    circle_id INTEGER NOT NULL,
    role VARCHAR(50) DEFAULT 'member',
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (circle_id) REFERENCES community_circles(id),
    UNIQUE(user_id, circle_id)
);

-- Savings goals table
CREATE TABLE savings_goals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    target_amount FLOAT NOT NULL,
    current_amount FLOAT DEFAULT 0,
    target_date DATE,
    category VARCHAR(100),
    description TEXT,
    is_achieved BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Government schemes table
CREATE TABLE government_schemes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    eligibility_criteria TEXT,
    benefits TEXT,
    application_process TEXT,
    category VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Learning content table
CREATE TABLE learning_content (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(100),
    difficulty_level VARCHAR(50),
    estimated_time INTEGER,
    tags TEXT,
    is_published BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Financial scores table
CREATE TABLE financial_scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    score INTEGER NOT NULL,
    category VARCHAR(100),
    factors TEXT,
    recommendations TEXT,
    calculated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Cultural nudges table
CREATE TABLE cultural_nudges (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    nudge_type VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    cultural_context VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Peer challenges table
CREATE TABLE peer_challenges (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    challenge_type VARCHAR(100),
    target_amount FLOAT,
    duration_days INTEGER,
    created_by INTEGER NOT NULL,
    circle_id INTEGER,
    start_date DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (circle_id) REFERENCES community_circles(id)
);

-- Challenge participation table
CREATE TABLE challenge_participation (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    challenge_id INTEGER NOT NULL,
    progress FLOAT DEFAULT 0,
    is_completed BOOLEAN DEFAULT FALSE,
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (challenge_id) REFERENCES peer_challenges(id),
    UNIQUE(user_id, challenge_id)
);

-- Voice interactions table
CREATE TABLE voice_interactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    query_text TEXT NOT NULL,
    response_text TEXT NOT NULL,
    interaction_type VARCHAR(100),
    confidence_score FLOAT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Investment filters table
CREATE TABLE investment_filters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    filter_name VARCHAR(255) NOT NULL,
    criteria TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Savings transactions table
CREATE TABLE savings_transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    goal_id INTEGER,
    amount FLOAT NOT NULL,
    transaction_type VARCHAR(50) NOT NULL,
    description TEXT,
    transaction_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (goal_id) REFERENCES savings_goals(id)
);

-- Local agents table
CREATE TABLE local_agents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255) NOT NULL,
    specialization VARCHAR(255),
    location VARCHAR(255),
    contact_info TEXT,
    rating FLOAT,
    is_available BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_financial_profiles_user_id ON financial_profiles(user_id);
CREATE INDEX idx_simulation_profiles_user_id ON simulation_profiles(user_id);
CREATE INDEX idx_community_membership_user_id ON community_membership(user_id);
CREATE INDEX idx_community_membership_circle_id ON community_membership(circle_id);
CREATE INDEX idx_savings_goals_user_id ON savings_goals(user_id);
CREATE INDEX idx_financial_scores_user_id ON financial_scores(user_id);
CREATE INDEX idx_cultural_nudges_user_id ON cultural_nudges(user_id);
CREATE INDEX idx_challenge_participation_user_id ON challenge_participation(user_id);
CREATE INDEX idx_challenge_participation_challenge_id ON challenge_participation(challenge_id);
CREATE INDEX idx_voice_interactions_user_id ON voice_interactions(user_id);
CREATE INDEX idx_investment_filters_user_id ON investment_filters(user_id);
CREATE INDEX idx_savings_transactions_user_id ON savings_transactions(user_id);
CREATE INDEX idx_savings_transactions_goal_id ON savings_transactions(goal_id);

-- Insert initial government schemes data
INSERT INTO government_schemes (name, description, eligibility_criteria, benefits, application_process, category) VALUES
('Public Provident Fund (PPF)', 'Long-term savings scheme with tax benefits', 'Indian citizen, minimum age 18', '15-year lock-in, tax deduction under 80C, tax-free returns', 'Open account at bank/post office', 'Tax Saving'),
('Employee Provident Fund (EPF)', 'Retirement savings for salaried employees', 'Salaried employee in organized sector', 'Employer contribution, tax benefits, retirement corpus', 'Automatic deduction from salary', 'Retirement'),
('National Pension System (NPS)', 'Pension and retirement planning', 'Indian citizen, age 18-70', 'Tax benefits, market-linked returns, pension at retirement', 'Online/offline application', 'Retirement'),
('Sukanya Samriddhi Yojana', 'Savings scheme for girl child', 'Girl child below 10 years', 'High interest rate, tax benefits, education/marriage expenses', 'Open account at bank/post office', 'Child Welfare'),
('Pradhan Mantri Jan Dhan Yojana', 'Financial inclusion program', 'Indian citizen without bank account', 'Zero balance account, insurance, overdraft facility', 'Visit bank with documents', 'Financial Inclusion'),
('Atal Pension Yojana', 'Pension scheme for unorganized sector', 'Age 18-40, unorganized sector worker', 'Guaranteed pension, government co-contribution', 'Through bank/post office', 'Pension'),
('Kisan Vikas Patra', 'Savings certificate scheme', 'Indian citizen', 'Fixed returns, doubles money in specific period', 'Purchase from bank/post office', 'Savings'),
('National Savings Certificate', 'Tax-saving investment', 'Indian citizen', '5-year lock-in, tax deduction under 80C', 'Purchase from post office', 'Tax Saving'),
('Senior Citizens Savings Scheme', 'Savings scheme for senior citizens', 'Age 60 and above', 'Higher interest rate, quarterly interest payout', 'Open account at bank/post office', 'Senior Citizens'),
('Pradhan Mantri Mudra Yojana', 'Micro-finance for small businesses', 'Small business owners, entrepreneurs', 'Collateral-free loans up to 10 lakhs', 'Apply through banks/NBFCs', 'Business Loan');

-- Insert initial learning content data
INSERT INTO learning_content (title, content, category, difficulty_level, estimated_time, tags) VALUES
('Understanding Compound Interest', 'Learn how compound interest works and why it''s called the 8th wonder of the world. Understand the power of starting early and consistent investing.', 'Basics', 'Beginner', 15, 'compound interest,investing,basics'),
('Emergency Fund Planning', 'Discover why emergency funds are crucial and how to build one. Learn the 3-6 months rule and where to keep your emergency money.', 'Planning', 'Beginner', 20, 'emergency fund,planning,savings'),
('Introduction to Mutual Funds', 'Get started with mutual funds - what they are, types, benefits, and how to choose the right ones for your goals.', 'Investing', 'Intermediate', 25, 'mutual funds,investing,SIP'),
('Tax Planning Strategies', 'Learn about various tax-saving instruments under Section 80C and other sections. Optimize your tax liability legally.', 'Tax Planning', 'Intermediate', 30, 'tax planning,80C,tax saving'),
('Retirement Planning Basics', 'Start planning for your retirement early. Understand different retirement instruments and calculate how much you need.', 'Retirement', 'Intermediate', 35, 'retirement,planning,pension'),
('Understanding Stock Markets', 'Learn the basics of stock markets, how they work, and fundamental concepts every investor should know.', 'Investing', 'Intermediate', 40, 'stocks,equity,markets'),
('Insurance Planning', 'Understand different types of insurance - life, health, term - and how much coverage you need for financial security.', 'Insurance', 'Beginner', 25, 'insurance,life insurance,health insurance'),
('Debt Management', 'Learn strategies to manage and eliminate debt effectively. Understand good debt vs bad debt and repayment strategies.', 'Debt Management', 'Beginner', 20, 'debt,loans,credit cards'),
('Goal-Based Investing', 'Learn how to invest based on your financial goals. Different goals require different investment strategies and time horizons.', 'Planning', 'Intermediate', 30, 'goals,investing,planning'),
('Understanding Credit Scores', 'Learn what credit scores are, how they''re calculated, and how to improve and maintain a good credit score.', 'Credit', 'Beginner', 15, 'credit score,CIBIL,credit history');

-- Schema update commands (if needed)
-- ALTER TABLE simulation_profiles ADD COLUMN dependents INTEGER;

-- Triggers for updating timestamps
CREATE TRIGGER update_users_timestamp 
    AFTER UPDATE ON users
    BEGIN
        UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER update_financial_profiles_timestamp 
    AFTER UPDATE ON financial_profiles
    BEGIN
        UPDATE financial_profiles SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER update_simulation_profiles_timestamp 
    AFTER UPDATE ON simulation_profiles
    BEGIN
        UPDATE simulation_profiles SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER update_community_circles_timestamp 
    AFTER UPDATE ON community_circles
    BEGIN
        UPDATE community_circles SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER update_savings_goals_timestamp 
    AFTER UPDATE ON savings_goals
    BEGIN
        UPDATE savings_goals SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER update_government_schemes_timestamp 
    AFTER UPDATE ON government_schemes
    BEGIN
        UPDATE government_schemes SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER update_learning_content_timestamp 
    AFTER UPDATE ON learning_content
    BEGIN
        UPDATE learning_content SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER update_cultural_nudges_timestamp 
    AFTER UPDATE ON cultural_nudges
    BEGIN
        UPDATE cultural_nudges SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER update_peer_challenges_timestamp 
    AFTER UPDATE ON peer_challenges
    BEGIN
        UPDATE peer_challenges SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER update_investment_filters_timestamp 
    AFTER UPDATE ON investment_filters
    BEGIN
        UPDATE investment_filters SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER update_local_agents_timestamp 
    AFTER UPDATE ON local_agents
    BEGIN
        UPDATE local_agents SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

-- End of schema