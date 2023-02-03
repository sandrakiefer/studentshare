#!/bin/bash

# Variables (TODO: edit for your own project)
PROJECT_ID=studentshare

# Set current google cloud project
gcloud config set project $PROJECT_ID

# API Gateway
cd ./backend/api_gateway
sh createApiGateway.sh "$PROJECT_ID"
cd ./../..

# Microservice user
cd ./backend/user_microservice
sh createUserMicroservice.sh "$PROJECT_ID"
cd ./../..

# Microservice files
cd ./backend/file_microservice
sh createFileMicroservice.sh "$PROJECT_ID"
cd ./../..

# Microservice chats
cd ./backend/chat_microservice
sh createChatMicroservice.sh "$PROJECT_ID"
cd ./../..

# Website
cd ./frontend
sh createWebsite.sh "$PROJECT_ID"
cd ./..

# Output Adress Backend & Frontend
BACKEND=$(gcloud api-gateway gateways describe studentshare-api-backend-gateway --location=europe-west1 --project=$PROJECT_ID --format='get(defaultHostname)')
echo "Backend zu errreichen unter: https://$BACKEND"
echo "Frontend zu erreichen unter: https://website-dot-$PROJECT_ID.ey.r.appspot.com"
