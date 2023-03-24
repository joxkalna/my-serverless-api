import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

const s3Client = new S3Client({})
export const handler = async (event: any) => {
  const { id, content } = JSON.parse(event.body || '{}')
  if (!id || !content) {
    return { statusCode: 400, error: 'Validation failed' }
  }

  const command = new PutObjectCommand({
    Key: `${id}.txt`,
    ContentType: 'text/plain',
    Bucket: process.env.BUCKET_NAME,
    Body: content,
  })

  try {
    await s3Client.send(command)
  } catch (err) {
    console.log("I AMHERE")
    return { statusCode: 500, body: 'Oops:Unable to create a file' }
  }

  return { statusCode: 200, body: `${id}.txt created!` }
}