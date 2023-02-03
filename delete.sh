#!/bin/bash

# Variables (TODO: edit for your own project)
PROJECT_ID=studentshare

# Set current google cloud project
gcloud config set project $PROJECT_ID

# API Gateway
cd ./backend/api_gateway
sh deleteApiGateway.sh "$PROJECT_ID"
cd ./../..

# Microservice user
cd ./backend/user_microservice
sh deleteUserMicroservice.sh "$PROJECT_ID"
cd ./../..

# Microservice files
cd ./backend/file_microservice
sh deleteFileMicroservice.sh "$PROJECT_ID"
cd ./../..

# Microservice chats
cd ./backend/chat_microservice
sh deleteChatMicroservice.sh "$PROJECT_ID"
cd ./../..

# Website
cd ./frontend
sh deleteWebsite.sh "$PROJECT_ID"
cd ./..
