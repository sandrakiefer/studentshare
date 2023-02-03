#!/bin/bash

# Set current google cloud project
gcloud config set project $1

# Delete API Gateway
yes |gcloud api-gateway gateways delete studentshare-api-backend-gateway --location=europe-west1 --project=$1
yes |gcloud api-gateway api-configs delete studentshare-api-backend-config --api=studentshare-api-backend --project=$1
yes |gcloud api-gateway apis delete studentshare-api-backend --project=$1

# Delete Bucket and key file
yes |gcloud storage rm --recursive gs://studentshare-key-bucket/
