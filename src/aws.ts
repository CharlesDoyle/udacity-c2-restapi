import AWS = require('aws-sdk');
// make a config dir with config file in it
import { config } from './config/config';

// config.dev holds our Postgres DB configurations
const c = config.dev;  // c is a json object with configurations for the s3 bucket

//Configure AWS
// pull my default profile credentials from 
//var credentials = new AWS.SharedIniFileCredentials({profile: c.aws_profile});
//AWS.config.credentials = credentials;

// if config.ts/aws_profile is not set to DEPLOYED then use the 
// bash environment variable value for my aws profile.  This is the profile
// I will use when working locally on this app, the charlie profile
// that is an administrator. AWS.SharedIniFileCredentials() looks
// as default in ~/.aws/credentials of my local machine for my aws credentials.
// When this code is deployed on AWS, I will set the env. variable for
// my profile to DEPLOYED, so this conditional fails.
// When the code is deployed, I will be using the IAM roles attached
// to the app to set my profile, so this statement is not needed.
if(c.aws_profile !== "DEPLOYED") {
  // when working locally, use my awscli default IAM credentials 
  var credentials = new AWS.SharedIniFileCredentials({profile: 'default'});
  AWS.config.credentials = credentials;
  // now I have an AWS object that knows my AWS account, so I can 
  // programatically access aws resources.
}


// an s3 object with our AWS region and ARN for my s3 bucket
// I can now access my real s3 bucket with the s3 object
export const s3 = new AWS.S3({
  signatureVersion: 'v4',
  region: c.aws_region,
  params: {Bucket: c.aws_media_bucket}
});


/* getGetSignedUrl generates an aws signed url to retreive an item
 * @Params
 *    key: string - the filename to be put into the s3 bucket
 * @Returns:
 *    a url as a string
 */
// not a middleware function.  It's exported so this aws.ts module can be
// imported to another module like feed.router.ts
// when we call getGetSignedUrl(key), it will return a SignedURL string for retrieving from our DB
// key will be a filename of an image that we want to get from out bucket, so we are sending a permission slip
// key: string  (this is typescript for 'key param is a string type')
// getGetSignedUrl(key)   key is the only param, and is a string type
// : string{   this means the return type is 'string'  (url will be a string)
export function getGetSignedUrl( key: string ): string{

  const signedUrlExpireSeconds = 60 * 5
    // get a custom SignedURL object from s3, with the three fields
    const url: string = s3.getSignedUrl('getObject', {
        Bucket: c.aws_media_bucket,
        Key: key,
        Expires: signedUrlExpireSeconds
      });

    return url;
}

/* getPutSignedUrl generates an aws signed url to put an item
 * @Params
 *    key: string - the filename to be retreived from s3 bucket
 * @Returns:
 *    a url as a string
 */
export function getPutSignedUrl( key: string ){

    const signedUrlExpireSeconds = 60 * 5
    // get a signed-url so I can upload to my s3 bucket
    const url = s3.getSignedUrl('putObject', {
      Bucket: c.aws_media_bucket,
      Key: key,
      Expires: signedUrlExpireSeconds
    });
    return url;
}
