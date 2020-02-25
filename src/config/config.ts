// aws settings for Postgres DB, s3 bucket
export const config = {
  "dev": {
    // process.env has access to all bash environment variables, which
    // I define in ~/.profile
    "username": process.env.DB_DEV_USERNAME,
    "password": process.env.DB_DEV_PASSWORD,
    "database": process.env.DB_DEV,
    //"host": "charliedb1.cwmm1cptaa94.us-east-1.rds.amazonaws.com",
    "host": process.env.DB_DEV_HOST,
    "dialect": process.env.DB_DIALECT,
    "aws_region": process.env.AWS_REGION,
    "aws_profile": process.env.UDAGRAM_DEV_PROFILE,
    "aws_media_bucket": process.env.S3_UDAGRAM_DEV
  },
  "prod": {
    "username": "",
    "password": "",
    "database": "udagram_prod",
    "host": "",
    "dialect": "postgres"
  },
  "jwt": {
    "secret": process.env.JWT_SECRET
  }
}
