import { existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { CfnOutput, RemovalPolicy, Size, Stack } from 'aws-cdk-lib'
import type { StackProps } from 'aws-cdk-lib'
import type { ICertificate } from 'aws-cdk-lib/aws-certificatemanager'
import {
  CachePolicy,
  Distribution,
  HttpVersion,
  PriceClass,
  SecurityPolicyProtocol,
  ViewerProtocolPolicy
} from 'aws-cdk-lib/aws-cloudfront'
import { S3BucketOrigin } from 'aws-cdk-lib/aws-cloudfront-origins'
import { BlockPublicAccess, Bucket, BucketEncryption } from 'aws-cdk-lib/aws-s3'
import { BucketDeployment, CacheControl, Source } from 'aws-cdk-lib/aws-s3-deployment'
import type { Construct } from 'constructs'

export interface MediaStackProps extends StackProps {
  // Directory holding staged files as posts/<slug>/<name>.<hash>.<ext> (written by media:sync)
  stageDir: string
  // Custom domain, attached once its certificate is validated
  domain?: { name: string; certificate: ICertificate }
}

export class MediaStack extends Stack {
  constructor(scope: Construct, id: string, props: MediaStackProps) {
    super(scope, id, props)

    const bucket = new Bucket(this, 'Bucket', {
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      encryption: BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      versioned: true,
      removalPolicy: RemovalPolicy.RETAIN
    })

    const distribution = new Distribution(this, 'Distribution', {
      comment: 'media.vynci.dev',
      defaultBehavior: {
        origin: S3BucketOrigin.withOriginAccessControl(bucket),
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: CachePolicy.CACHING_OPTIMIZED,
        compress: true
      },
      httpVersion: HttpVersion.HTTP2_AND_3,
      priceClass: PriceClass.PRICE_CLASS_100,
      ...(props.domain && {
        domainNames: [props.domain.name],
        certificate: props.domain.certificate,
        minimumProtocolVersion: SecurityPolicyProtocol.TLS_V1_2_2021
      })
    })

    // One deployment per post, so CDK only re-uploads posts whose media changed.
    // Keys are content-addressed: never prune, never invalidate.
    const postsDir = join(props.stageDir, 'posts')
    const slugs = existsSync(postsDir)
      ? readdirSync(postsDir, { withFileTypes: true })
          .filter((entry) => entry.isDirectory())
          .map((entry) => entry.name)
      : []

    for (const slug of slugs) {
      new BucketDeployment(this, `Posts-${slug}`, {
        sources: [Source.asset(join(postsDir, slug))],
        destinationBucket: bucket,
        destinationKeyPrefix: `posts/${slug}/`,
        prune: false,
        retainOnDelete: true,
        cacheControl: [CacheControl.fromString('public, max-age=31536000, immutable')],
        memoryLimit: 1024,
        ephemeralStorageSize: Size.gibibytes(2)
      })
    }

    new CfnOutput(this, 'BucketName', { value: bucket.bucketName })
    new CfnOutput(this, 'DistributionId', { value: distribution.distributionId })
    new CfnOutput(this, 'DistributionDomainName', { value: distribution.distributionDomainName })
  }
}
