#!/bin/bash

# Set current google cloud project
gcloud config set project $1

# Create google cloud storage bucket and upload key file
# gcloud storage buckets create gs://studentshare-fileshare-bucket --project=$1 --location=europe-west3 --default-storage-class=STANDARD --no-public-access-prevention  --uniform-bucket-level-access

# Create google cloud run service
gcloud builds submit --tag gcr.io/$1/student-fileshare-api --project=$1
gcloud run deploy student-fileshare-api --image=gcr.io/$1/student-fileshare-api --platform=managed --region=europe-west3 --project=$1 --no-allow-unauthenticated
gcloud run services add-iam-policy-binding student-fileshare-api --region=europe-west3 --member=serviceAccount:405612571601-compute@developer.gserviceaccount.com --role=roles/run.invoker
