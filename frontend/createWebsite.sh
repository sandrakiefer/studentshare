#!/bin/bash

# Delete old build first
rm -rf ./dist

# Build static website from vue3 project
npm run build

# Set current google cloud project
gcloud config set project $1

# Deploy to google cloud app engine
yes |gcloud app deploy
