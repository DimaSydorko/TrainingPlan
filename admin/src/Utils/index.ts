import { nanoid } from 'nanoid'

export function getSafeFileName(fileName: string) {
  const name = getFileName(fileName)
  const extension = fileName.substring(fileName.lastIndexOf('.'))
  return name + '_' + nanoid() + extension
}

export function getFileName(fileName: string) {
  return fileName.slice(0, fileName.lastIndexOf('.'))
}