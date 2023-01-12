# JIRA APP SERVER

Simple server created for Jira App. 

## Installation and Run

1. Create postgres database 'jira_db' 

2. Create .env.development file with data:

TEST_BASE_URL="http://localhost:8081/"

TOKEN_SECRET=secret_token_for_jsonwebtoken

DATABASE_URL="postgresql://user:password@localhost:5432/jira_db?schema=public"

Remember to use your own user and password values. Change port number if needed.

3. Instal packages using:

npm install

4. Start application using:

dotenv -e .env.development npm start


## Testing

1. Install and run docker.

2. Create .env.test file with data:

TEST_BASE_URL="http://localhost:8081/"

TOKEN_SECRET=secret_token_for_jsonwebtoken

DATABASE_URL="postgresql://prisma:prisma@localhost:5433/tests"


3. Run app using: 

dotenv -e .env.test npm start

4. Run test using:

npm test