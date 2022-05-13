import { nanoid } from 'nanoid'

export function getSafeFileName(fileName: string) {
  const extension = fileName.substring(fileName.lastIndexOf('.'))
  return nanoid() + extension
}
