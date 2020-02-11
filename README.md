# Serverless NHL API Crawler

## Overview:

- This is a serverless application that has two functions
  1. Async jobs that run on a cron schedule and crawl nhl data into mongodb collections
  2. RESTful APIs to surface that data in logical and optimized interface
- This app is intended to run against a mongodb atlas cluster or some other hosted mongo solution

## Note:

- This project is a work in progress.

## Local Install:

- npm install -g serverless
- create mongodb atlas cluster
- git clone project
- npm install
- Add a .env file to the root directory with:
  - DB_USER=your-user
  - DB_PASS=your-password
  - DB_TARGET=your-connection-string
