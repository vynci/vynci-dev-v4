# vynci.dev

Personal blog at [www.vynci.dev](https://www.vynci.dev). Next.js 16 (App Router, Cache Components),
Tailwind CSS 4, deployed on Vercel. Every page is prerendered at build time.

## Development

```sh
pnpm install
pnpm dev          # http://localhost:3000
```

| Command                        | What it does                                                                    |
| ------------------------------ | ------------------------------------------------------------------------------- |
| `pnpm build`                   | Production build. Fails if any route would render at request time.              |
| `pnpm test`                    | Unit tests for the content pipeline (Vitest)                                    |
| `pnpm e2e`                     | End-to-end and accessibility tests against the build (Playwright, local Chrome) |
| `pnpm seo:check [url]`         | SEO smoke test of a running build (default `http://localhost:3456`)             |
| `pnpm lint` / `pnpm typecheck` | ESLint + Prettier / TypeScript                                                  |

## Writing a post

Posts live in `posts/<slug>/index.md`. The folder name is the URL: `/posts/<slug>`.

```md
---
title: 'Rovy Part 4: …'
date: '2026-11-01'
authorName: 'Vince Elizaga'
authorPosition: 'Admin'
description: 'Optional; defaults to the first paragraph'
tags: ['iot', 'aws'] # optional
draft: true # optional; drafts show in `pnpm dev` only
---

## Overview

![Diagram](./architecture.png)
![Demo clip](./demo.mp4) <!-- videos use image syntax; they autoplay muted when in view -->
```

Images and videos sit next to `index.md` and are **not** committed: they are served from
`media.vynci.dev` (S3 + CloudFront). `pnpm dev` shows local files that are not uploaded yet.
Before publishing:

```sh
pnpm media:sync     # hash and measure new media, make video posters, update media-manifest.json
pnpm media:deploy   # upload through CDK (AWS profile with CDK access)
pnpm media:check    # verify every file is served by the CDN
git add posts media-manifest.json && git commit
```

The build fails if a post references media that is not in `media-manifest.json`. On a fresh
clone, `pnpm media:pull` downloads the originals into `posts/`.

## Infrastructure

`infra/` is a separate AWS CDK app (its own `package.json`, not installed by Vercel):
`VynciDevMediaStack` (private versioned S3 bucket behind CloudFront) and
`VynciDevMediaCertStack` (ACM certificate for `media.vynci.dev`). DNS is at GoDaddy.
