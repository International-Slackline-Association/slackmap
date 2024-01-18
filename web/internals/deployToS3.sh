# Enable printing executed commands
set x

aws_profile=$AWS_PROFILE
s3_bucket=slackmap-ui-prod
cf_id=EDKDKUGISVIJL

echo Profile: $aws_profile
echo S3_Bucket: $s3_bucket
echo CloudFront Distribution: $cf_id

if [ -z "$aws_profile" ]; then
  echo AWS_PROFILE not found
  exit
fi
if [ -z "$s3_bucket" ]; then
  echo S3_BUCKET not found
  exit
fi

echo Synching Build Folder: $s3_bucket...
aws s3 sync dist/ s3://$s3_bucket --delete --cache-control max-age=86400,public

echo Adjusting cache...
aws s3 cp s3://$s3_bucket/index.html s3://$s3_bucket/index.html --metadata-directive REPLACE --cache-control max-age=0,no-cache,no-store,must-revalidate --content-type text/html

if [ ! -z "$cf_id" ]; then
    echo Invalidating cloudfront cache
    aws cloudfront create-invalidation --distribution-id $cf_id --paths "/*" --no-cli-pager
fi
