#!/bin/bash

# Set current google cloud project
gcloud config set project $1

# Delete google cloud run service
yes |gcloud run services delete student-fileshare-api --region europe-west3
yes |gcloud container images delete gcr.io/$1/student-fileshare-api

# Delete Bucket and key file
# If bucket delete, delete firstore collection manually
# yes |gcloud storage rm --recursive gs://studentshare-fileshare-bucket