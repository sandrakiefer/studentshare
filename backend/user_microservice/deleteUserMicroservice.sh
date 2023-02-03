#!/bin/bash

# Set current google cloud project
gcloud config set project $1

# Delete Google Cloud Function
yes |gcloud functions delete studentshare-users --region=europe-west3

# Delete database
yes |gcloud sql databases delete studentshare-user-db --instance=studentshare-user-instance

# Delete instance
yes |gcloud sql instances delete studentshare-user-instance
