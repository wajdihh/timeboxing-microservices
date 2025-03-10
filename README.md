# timeboxing-microservices
all released microservices to time boxing

## Install project

Firstly, install docker, docker compose, make and your favorite IDE, then
clone the project.

```
todo
```

You can watch the logs with :

```
make logs
```

You have to call `just down` and `make up` when changing docker configuration.

## Debugging

You can either debug with a remote :

```
todo : make debug
```

And attach any process remote debugger with port todo and host localhost.

### Commit Message Format


#### <a name="commit-header"></a>Commit Message Header

```
<type>(<HD-XXXX>): <short summary>
  │       │             │
  │       │             └─⫸ Summary in present tense. Not capitalized. No period at the end.
  │       │
  │       └─⫸ Commit Jira ticket ID 
  │
  └─⫸ Commit Type: build|chore|docs|feat|fix|perf|refactor|test
```

The `<type>` and `<summary>` fields are mandatory, the `(<scope>)` field is optional.

##### Type

Must be one of the following:

* **build**: Changes that affect the build system or external dependencies
* **chore**: Changes to our CI configuration files and scripts (examples: GitLab)
* **docs**: Documentation only changes
* **feat**: A new feature
* **fix**: A bug fix
* **perf**: A code change that improves performance
* **refactor**: A code change that neither fixes a bug nor adds a feature
* **test**: Adding missing tests or correcting existing tests

##### Summary

Use the summary field to provide a succinct description of the change:

* use the imperative, present tense: "change" not "changed" nor "changes"
* don't capitalize the first letter
* no dot (.) at the end


# NOTES

### start the project
```
npm run start:dev

npm run start
```

### open this url
http://localhost:3000/api


# Notes:

### install swagger
npm install --save @nestjs/swagger

### change main code as explained here
https://docs.nestjs.com/openapi/introduction

### the open api json schema is exposed here
http://localhost:3000/open-api-json

### the open api UI is exposed here
http://localhost:3000/open-api


## validation was added using these instructions:
npm i --save class-validator class-transformer
(see doc: https://docs.nestjs.com/techniques/validation)


## End-to-end cucumber tests
add cucumber.yaml file:
```
let common = [
  "test/acceptance/features/**/*.feature", // Specify our feature files"--require-module ts-node/register", // Load TypeScript module
  "--require-module ts-node/register",
  "--require test/acceptance/step-definitions/**/*.ts", // Load step definitions
  "--format progress-bar", // Load custom formatter
  "--format @cucumber/pretty-formatter", // Load custom formatter
].join(" ");

module.exports = {
  default: common,
};

```


npm i -D @types/cucumber cucumber @cucumber/pretty-formatter cucumber-tsflow chai @types/chai

in package.json, add script:
```
"test:bdd": "cucumber-js -p default"
```


Launch gherkin tests with this command:

```
npm run test:bdd
```

# e2e tests

Launch e2e tests with this command:

```
npm run test:e2e
```

# Unit tests

Launch unit tests with this command:

```
npm run test
```


## Step to not forget 
# timeboxing-microservices
all released microservices to time boxing 

## Step to not forget 
install justfile 
```sh
brew install just
```
## How to kill running process 
```sh
lsof -i :3000
kill -9 PID
```
# Structure
hexagonal-nest/
├── src/
│   ├── core/                 
│   │   ├── domain/           
│   │   ├── ports/            
│   │   ├── usecases/         
│   ├── infrastructure/       
│   │   ├── repository/       
│   │   ├── dto/              
│   ├── api/                  
│   │   ├── hello.controller.ts  
│   │   ├── dto/              
│   ├── modules/              
│   │   ├── hello.module.ts   
│   ├── config/               
│   ├── main.ts               
│   ├── app.module.ts         
├── test/                     
│   ├── unit/
│   ├── integration/
├── requests/                 # ✅ Store .http files here
│   ├── hello.http            # .http file for testing Hello API
│   ├── auth.http             # .http file for authentication API
│   ├── user.http             # .http file for user-related APIs
