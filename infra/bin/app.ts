import { join } from 'node:path'
import { App, Stack, Tags } from 'aws-cdk-lib'
import { Certificate, CertificateValidation } from 'aws-cdk-lib/aws-certificatemanager'
import { MediaStack } from '../lib/media-stack.ts'

const domainName = 'media.vynci.dev'

// us-east-1: CloudFront certificates must live there, and CDK is bootstrapped there
const env = { account: '111910761410', region: 'us-east-1' }

const app = new App()
Tags.of(app).add('project', 'vynci-dev')

// The certificate is validated by a CNAME added by hand at GoDaddy (vynci.dev's DNS host).
// Its stack stays in CREATE_IN_PROGRESS until that record exists, so it is kept separate
// from the media stack, which works on its *.cloudfront.net domain in the meantime.
const certStack = new Stack(app, 'VynciDevMediaCertStack', { env })
const certificate = new Certificate(certStack, 'Certificate', {
  domainName,
  validation: CertificateValidation.fromDns()
})

// Set to true in cdk.json once the certificate is issued
const attachDomain = app.node.tryGetContext('vynci:attachDomain') === true

new MediaStack(app, 'VynciDevMediaStack', {
  env,
  stageDir: join(import.meta.dirname, '..', '..', '.media-out', 'stage'),
  domain: attachDomain ? { name: domainName, certificate } : undefined
})
