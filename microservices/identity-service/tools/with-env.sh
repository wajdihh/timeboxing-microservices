#!/bin/bash

# Default to local if NODE_ENV is not set
export NODE_ENV=${NODE_ENV:-local}

echo "Using NODE_ENV=$NODE_ENV"
dotenv -e "../../infra/docker/.env.$NODE_ENV" -- "$@"
