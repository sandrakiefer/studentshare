#!/bin/bash

# Set current google cloud project
gcloud config set project $1

# APIs für Cloud Functions aktivieren
gcloud services enable cloudfunctions.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable storage.googleapis.com
gcloud services enable run.googleapis.com

# Create instance
gcloud sql instances create studentshare-user-instance --database-version=MYSQL_8_0 --cpu=1 --memory=4GB --region=europe-west3 --root-password=w5UY5vSAWvxPqU9n

# Create database
gcloud sql databases create studentshare-user-db --instance=studentshare-user-instance

# Deploy code to Google Cloud Functions
gcloud functions deploy studentshare-users --runtime=nodejs16 --region=europe-west3 --source=. --entry-point=users --trigger-http --no-allow-unauthenticated --service-account=405612571601-compute@developer.gserviceaccount.com
gcloud functions add-iam-policy-binding studentshare-users --region=europe-west3 --member=serviceAccount:405612571601-compute@developer.gserviceaccount.com --role=roles/cloudfunctions.invoker
