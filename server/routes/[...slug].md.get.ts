import { queryCollection } from '@nuxt/content/server'

/** `/blog/hello-world.md` のような URL でブログ記事の生 Markdown を返す。 */
export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug') ?? ''
  const path = `/${slug}`

  const post = await queryCollection(event, 'blog').path(path).first()

  if (!post?.rawbody) {
    throw createError({ statusCode: 404, statusMessage: 'Not Found' })
  }

  const filename = slug.split('/').pop() ?? 'content'
  setResponseHeaders(event, {
    'Content-Type': 'text/plain; charset=utf-8',
    'Content-Disposition': `attachment; filename="${filename}.md"`,
  })

  return post.rawbody
})
