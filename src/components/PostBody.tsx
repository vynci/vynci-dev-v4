import type { Element, Root } from 'hast'
import { toJsxRuntime, type Components } from 'hast-util-to-jsx-runtime'
import { Fragment, jsx, jsxs } from 'react/jsx-runtime'
import { visit } from 'unist-util-visit'
import { PostImage } from './PostImage'
import { PostVideo } from './PostVideo'

// Renders a post's hast tree, with images through next/image and videos through PostVideo
export function PostBody({ hast }: { hast: Root }) {
  const lcpImage = firstImageSrc(hast)

  const components: Partial<Components> = {
    img: (props) => <PostImage {...props} eager={props.src === lcpImage} />,
    video: PostVideo
  }

  return toJsxRuntime(hast, { Fragment, jsx, jsxs, components })
}

function firstImageSrc(hast: Root): string | undefined {
  let src: string | undefined
  visit(hast, 'element', (node: Element) => {
    if (src === undefined && node.tagName === 'img') src = String(node.properties.src)
  })
  return src
}
