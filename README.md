# Serverless NHL API Crawler

## Overview:

- This is a serverless crawler that runs on a cron job
- It Reads a date index from db and writes all relevant records for that given day
- It Increments the index after successfully writing the data

## Note:

- This project is a work in progress.

## Local Install:

- npm install -g serverless
- npm install in project folder
- Install Mongodb locally
- Add a .env file to the root directory with:
  - DB_USER=your-user
  - DB_PASS=your-password
  - DB_TARGET=your-connection-string
