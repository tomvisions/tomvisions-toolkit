# Tomvisions Toolkit

In this repository is the code for the AWS DevOps Toolkit that I am building. It runs on the command line and it is constantly in progress. I will be regularly updating it when I have time.

Current functionaity for RDS

1) Reads the keys in a S3 bucket that is specified, parses the keys, and inserts the data in a database

2) Exports a database in AWS RDS and creates a snapshot, and then exports it into S3. Temporarily creates IAM role, policies and kms keys for the operaiton 

3) Deletes RDS snapshots based on prefix

Current functionaity for IAM
1) Deletes IAM roles based on prefix
2) Delete IAM policies based on prefix

Current functions for System Operations

1) Reads a folder of image files and renames them with a UUID format