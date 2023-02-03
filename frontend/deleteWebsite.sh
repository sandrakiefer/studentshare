#!/bin/bash

# Set current google cloud project
gcloud config set project $1

# Delete website app engine
yes |gcloud app services delete website
