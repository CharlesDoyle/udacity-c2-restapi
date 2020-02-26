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
// bash environment variable value for my aws profile.
// I will use the charlie_udagram_dev profile when this app is run locally.
// This profile has privileges on my S3 bucket
// AWS.SharedIniFileCredentials() looks in ~/.aws/credentials of
// my local machine for my aws credentials, and I tell it which profile
// to use (charlie or charlie_udagram_dev)
// When this code is deployed on AWS, I will set the env. variable for
// aws_profile to DEPLOYED, so this conditional fails.
// When the code is cloud deployed, the EB environment will have an 
// EC2 role with my policy_s3_udagram_media_dev role attached, which
// gives the environment permissions to use my s3_udagram_dev bucket
if(c.aws_profile !== "DEPLOYED") {
  // when working locally, use my awscli default IAM credentials 
  //  AWS.SharedIniFileCredentials looks in ~/.aws/credentials and
  // defaults to the default profile if I don't pass a profile key:value
  // I can use any of my defined credentials from that file, including:
  // {profile: 'default'} or {profile: 'charlie-udagram-dev'} or probably 
  // I don't have to pass an object, because it defaults to the default profile
  var credentials = new AWS.SharedIniFileCredentials({profile: c.aws_profile});
  AWS.config.credentials = credentials;
  // now I have an AWS object that knows my AWS account, so I can 
  // programatically access my s3 bucket and get a signed-url.
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
