# timeboxing-microservices
all released microservices to time boxing 

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
