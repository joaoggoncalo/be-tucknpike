## Project setup

```bash
$ npm install
```

## Setup Instructions

2. If you want to run it through docker
2.1 Environment Configuration
Create Environment File:
Go to /docker and copy the example environment file:

```bash'
$ cp .env.example .env
```

Run the command to start the containers:

```bash
$ docker-compose up --build
```

After this, the backend is accessible through localhost:3001. 
You can also access localhost:3001/api to see the API Specifications.

3. If you want to run it locally
3.1 Install Dependencies
Install the required npm packages:

```bash
$ npm install
```

3.2 Environment Configuration
Create Environment File:
In the root directory, copy the example environment file:


4. Start the application
By default, the server will run on port 3001.
(The .env variables are mentioned in the installation guide)


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


   
## Migrations

To create a new migration, use the following command:

```bash
npm run migration:generate src/migrations/{migration_name}
```

This will create a new migration file in the `src/migrations` directory. 

To run the migrations, use the following command:

```bash
npm run migration:run
```

To revert the last migration, use the following command:

```bash
npm run migration:revert
```


## Tests
To run the tests, use the following command:

```bash
npm run test
```