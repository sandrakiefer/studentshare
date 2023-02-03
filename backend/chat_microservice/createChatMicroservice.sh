#!/bin/bash

# Set current google cloud project
gcloud config set project $1

# Deploy to google cloud app engine
yes |gcloud app deploy
