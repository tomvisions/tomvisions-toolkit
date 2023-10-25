import {iam} from './commands/common/iam';
import * as uuid from 'uuid';


const roleName = `role-rds-export-${uuid.v4()}`;
const policyName = `policy-rds-export-${uuid.v4()}`;
const policy2 = `{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "VisualEditor0",
            "Effect": "Allow",
            "Action": "s3:*",
            "Resource": [
                "arn:aws:s3:::tomvisions-original-images",
                "arn:aws:s3:::tomvisions-original-images/*"
            ]
        }
    ]
}`
const policyAssume = `{
    "Version": "2012-10-17",
    "Statement": [{
        "Effect": "Allow",
        "Principal": {
            "Service": "rds.amazonaws.com"
        },
        "Action": "sts:AssumeRole"
    }]
}`

iam.createIAMRole(roleName, policyName, policy2, policyAssume);

