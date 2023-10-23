# Tomvisions Toolkit

In this repository is the code for the AWS DevOps Toolkit that I am building. It runs on the command line and it is constantly in progress. I will be regularly updating it when I have time.

Current functionaity for RDS

1) Reads the keys in a S3 bucket that is specified, parses the keys, and inserts the data in a database

2) Exports a database in AWS RDS and creates a snapshot. 

In progress: creating a temporary IAM role, and policy to give permission to the node app to copy over the snapshot into S3


Current functions for System Operations

1) Reads a folder of image files and renames then with a UUID format