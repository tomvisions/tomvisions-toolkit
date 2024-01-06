# Tomvisions Toolkit

In this repository is the code for the AWS DevOps Toolkit that I am building. It runs on the command line and it is constantly in progress. I will be regularly updating it when I have time.

How to install toolkit.

```
npm install -g tomvisions-toolkit
```

Current functionaity for RDS

1) import - Reads the keys in a S3 bucket that is specified, parses the keys, and inserts the data in a database

```
tomvisions-toolkit rds import --bucket <bucket name> --prefix <key prefix> --config <database config file>
```

The database config file consists of the following JSON

{
    "DB_HOST":"hostname",
    "DATABASE":"database name",
    "USERNAME":"user to connect as",
    "PASSWORD":"password t use"
}


2) export - Exports a database in AWS RDS and creates a snapshot, and then exports it into S3. Temporarily creates IAM role, policies and kms keys for the operaiton 

```
tomvisons-toolkit rds export --instance <database instance to take snapshot from> --bucket <bucket to store the snapshot to>
```

3) Deletes RDS snapshots based on prefix
```
tomvisons-toolkit rds delete --prefix <prefix of the snapshots you wish to delete>
```

Current functionaity for S3

1) delete - Deletes s3 buckets based on prefix given. If bucket is not empty, it will automatically delete all keys within.

```
tomvisions-toolkit s3 delete --prefix <bucket prefix> 
```

Current functionaity for IAM

1) delete - Deletes IAM users/roles/polices based on prefix

```
tomvisions-toolkit s3 delete --prefix <IAM user/role/policy prefix> --type <type to delete: user, role, policy> 
```

Current functionaity for SYSTEM 

1) rename - Renames all images files to UUID format while keeping the file extension

```
tomvisions-toolkit system rename --source <source folder> --destination <destination folder> --type <uuid>
```

And more functionalit to come

