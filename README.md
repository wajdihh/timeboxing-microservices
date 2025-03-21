# timeboxing-microservices
all released microservices to time boxing

## Install project

Firstly, install docker, docker compose, make and your favorite IDE, then
clone the project and install the following libs.

```
> git clone https://github.com/wajdihh/timeboxing-microservices.git

> cd timeboxing-microservices

> brew install just

> brew install node

> cp infra/docker/.env.sample  infra/docker/.env.local (Mandatory)
> cp infra/docker/.env.sample  infra/docker/.env.dev
> cp infra/docker/.env.sample  infra/docker/.env.prod
> cp infra/docker/.env.sample  infra/docker/.env.staging

> just build 

```

You can watch the logs with :

```
just logs-all 
just logs {{service name}} (e.g., "just logs identity-service")
```

You have to call `just down` and `make up` when changing docker configuration.

## Debugging

You can either debug with a remote :

```
just up debug
```

And attach any process remote debugger with port todo and host localhost.

### Commit Message Format


#### <a name="commit-header"></a>Commit Message Header

```
<type>(scope)(Sys Ref): <short summary>
  │      │        │             │
  │      │        │             └─⫸ Summary in present tense. Not capitalized.
  │      │        │
  │      │        └─⫸ Commit System ticket ID (aka Jira)  (optional)
  │      │
  │      └─⫸ microservice name
  │
  └─⫸ Commit Type: build|chore|docs|feat|fix|perf|refactor|test
```

Exp:  
* **feat(auth)(JIRA-342): add JWT refresh token support**
* **fix(task-service): resolve issue with task deletion**

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



# NOTES

### start the project
```
npm run start:dev # in console
just up {{env}} # inside container (e.g., "just up watch / debug")

npm run start
```

### open this url to consult docs (SWAGGER)
http://localhost:3000/api

## How to kill running process 
```sh
lsof -i :3000
kill -9 PID
```

# URL

### Identity Service API:
* Base URL: http://localhost:3000/api
* Metrics endpoint: http://localhost:3000/api/metrics
* Swagger docs: http://localhost:3000/api

### Monitoring Tools:
* Prometheus: http://localhost:9090
* Grafana: http://localhost:3001
* cAdvisor: http://localhost:8080

### To remimber 
#### Debug docker 
inside the root folder run 
> docker build --target builder -t debug-builder -f microservices/identity-service/Dockerfile .

> docker run --rm -it debug-builder sh (enter in SH mode in # Build stage )

