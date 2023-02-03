#!/bin/bash

# Set current google cloud project
gcloud config set project $1

# APIs aktivieren
gcloud services enable apigateway.googleapis.com
gcloud services enable servicemanagement.googleapis.com
gcloud services enable servicecontrol.googleapis.com
gcloud services enable storage.googleapis.com

# Create google cloud storage bucket and upload key file
gcloud storage buckets create gs://studentshare-key-bucket --project=$1 --location=europe-west3 --default-storage-class=STANDARD --no-public-access-prevention  --uniform-bucket-level-access
gsutil iam ch allUsers:roles/storage.objectViewer gs://studentshare-key-bucket
gcloud storage cp ./StudentSharePublicKeyJWK.json gs://studentshare-key-bucket

# Create API Gateway
gcloud api-gateway apis create studentshare-api-backend --project=$1
gcloud api-gateway api-configs create studentshare-api-backend-config --api=studentshare-api-backend --openapi-spec=openapi-config.yaml --project=$1 --backend-auth-service-account=405612571601-compute@developer.gserviceaccount.com 
gcloud api-gateway gateways create studentshare-api-backend-gateway --api=studentshare-api-backend --api-config=studentshare-api-backend-config --location=europe-west1 --project=$1
