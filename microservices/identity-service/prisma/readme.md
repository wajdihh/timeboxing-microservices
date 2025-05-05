# Optional sanity check
NODE_ENV=local npm run showenv   

# Step 1: generate client
NODE_ENV=local npm run prisma:generate

# Step 2: apply DB migrations
NODE_ENV=local npm run prisma:migrate
