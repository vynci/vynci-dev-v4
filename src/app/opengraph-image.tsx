import { ogContentType, ogImage, ogSize } from '@/lib/og'
import * as site from '@/lib/site'

export const alt = `${site.name}: software and hardware engineering notes`
export const size = ogSize
export const contentType = ogContentType

export default function Image() {
  return ogImage({ title: site.name, footer: 'Cloud · Serverless · IoT · Robotics' })
}
