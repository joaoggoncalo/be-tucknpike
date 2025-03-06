## Project setup

```bash
$ npm install
```

## Setup Instructions

### 1. Create a PostgreSQL Database

1. Install PostgreSQL on your machine if you haven't already.
2. Create a new database (example, `tucknpike`) using pgAdmin or the SQL Shell:
   ```sql
   CREATE DATABASE tucknpike;
   ```
   
### 2. Configure Environment Variables

1. In the root of the project, rename the .env.example file to .env.
2. Fill the environment variables in the .env file with your database credentials.

### 3. Intall dependencies

```bash
$ npm install
```

### 4. Start the application

```bash
$ npm run start:dev
```
By default, the server will run on port 3001.

### 5. Testing the endpoints
Use the Swagger UI to test the endpoints. Access http://localhost:3001/api/ to test the endpoints.

1. Create a coach with the following JSON:
{
  "name": "John Doe",
  "email": "john@example.com"
}
2. Create a gymnast with the following JSON:
{
  "name": "Alice Smith",
  "email": "alice@example.com"
}
3. To associate a gymnast with a coach, use the dedicated endpoint:
POST /coaches/{coachId}/gymnasts/{gymnastId}



Note: Currently I'm using synchronize true while connecting to the database. This is not recommended for production environments, I'm just using it for debug purposes. In the future this will be changed to real migrations.

