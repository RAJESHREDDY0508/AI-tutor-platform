-- Initialises all service databases on first Docker Compose startup.
-- Executed by the postgres container's docker-entrypoint-initdb.d mechanism.

CREATE DATABASE ai_tutor_sessions;
CREATE DATABASE ai_tutor_curriculum;
CREATE DATABASE ai_tutor_homework;
CREATE DATABASE ai_tutor_analytics;
CREATE DATABASE ai_tutor_payments;

-- Grant all privileges to the default postgres user
GRANT ALL PRIVILEGES ON DATABASE ai_tutor_auth TO postgres;
GRANT ALL PRIVILEGES ON DATABASE ai_tutor_sessions TO postgres;
GRANT ALL PRIVILEGES ON DATABASE ai_tutor_curriculum TO postgres;
GRANT ALL PRIVILEGES ON DATABASE ai_tutor_homework TO postgres;
GRANT ALL PRIVILEGES ON DATABASE ai_tutor_analytics TO postgres;
GRANT ALL PRIVILEGES ON DATABASE ai_tutor_payments TO postgres;
