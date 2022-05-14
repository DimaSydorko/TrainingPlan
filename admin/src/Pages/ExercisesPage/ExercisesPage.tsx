import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Button, IconButton, Tab, Tabs } from '@mui/material'
import firebase, { FB_Database, FB_Store } from 'Utils/firebase'
import { filters, FirebaseDatabase, FirebaseStorage } from 'Utils/constants'
import { StoredExerciseImage } from 'Utils/types'
import { getFileName, getSafeFileName } from 'Utils'
import Loading from 'Common/Loading'
import styles from './Exercises.module.scss'

const iconButtonStyle = {
  position: 'absolute',
  top: 0,
  right: 0,
  height: '25px',
  width: '25px'
}

const ExercisesPage = () => {
  const [storedExerciseImages, setStoredExerciseImages] = useState<StoredExerciseImage[]>([])
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [filterTab, setFilterTab] = useState<number>(0)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const hiddenFileInput = useRef<HTMLElement | null>(null) as React.MutableRefObject<HTMLInputElement>
  const uploadTask = useRef<firebase.storage.UploadTask | undefined>()

  const getData = useCallback(async () => {
    const snapshot = await FB_Database.ref(FirebaseDatabase.ExerciseImages).get()
    const newStoredExerciseImages = Array.isArray(snapshot.val()) ? snapshot.val() : []
    setStoredExerciseImages(newStoredExerciseImages as StoredExerciseImage[])
  }, [])

  useEffect(() => {
    getData()
  }, [getData])

  const onSubmit = () => {
    const storedFiles: StoredExerciseImage[] = []
    setIsLoading(true)
    const onFinishUpload = () => {
      const newExerciseImages: StoredExerciseImage[] = [...storedExerciseImages, ...storedFiles]
      FB_Database.ref()
        .child(FirebaseDatabase.ExerciseImages)
        .update(newExerciseImages)
        .catch(err => console.error(err))
      setUploadedFiles([])
      setIsLoading(false)
      getData()
    }

    uploadedFiles.forEach(file => {
      const safeFileName = getSafeFileName(file.name)
      const name = getFileName(file.name)
      const currentUploadTask = FB_Store.ref().child(`${FirebaseStorage.Exercises}/${safeFileName}`).put(file)
      uploadTask.current = currentUploadTask

      currentUploadTask.on(
        'state_changed',
        function onProgress() {},
        function onError(error) {
          if (error.code === 'storage/canceled') return
          throw error
        },
        function onFinished() {
          const uploadedFileRef = currentUploadTask.snapshot.ref
          uploadedFileRef
            .getDownloadURL()
            .then(downloadUrl => {
              storedFiles.push({
                fileName: name,
                storageKey: uploadedFileRef.fullPath,
                filter: filters[filterTab],
                downloadUrl
              })
              if (storedFiles.length === uploadedFiles.length) {
                onFinishUpload()
              }
            })
            .catch(error => {
              setIsLoading(false)
              throw error
            })
        }
      )
    })
  }

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setFilterTab(newValue)
  }
  const handleClick = () => {
    hiddenFileInput.current && hiddenFileInput.current.click()
  }

  const onFileUpload = (files: FileList | null) => {
    setUploadedFiles(p => {
      const newUploadedFiles: File[] = [...Object.values(files ? files : {})]
      const newFiles: File[] = newUploadedFiles
        ?.filter(file => !p.find(f => file.name === f.name))
        .filter(file =>
          !storedExerciseImages.find(f => f.fileName === getFileName(file.name))
            ? file
            : console.log(`File with Name: '${file.name} already exist`)
        )
      return [...p, ...newFiles]
    })
  }

  const onDeleteImage = async (key: string) => {
    const newExerciseImages = storedExerciseImages?.filter(file => file.storageKey !== key)
    setIsLoading(true)
    await Promise.all([
      FB_Store.ref(key)
        .delete()
        .catch(err => console.error(err)),
      FB_Database.ref()
        .child(FirebaseDatabase.ExerciseImages)
        .set(newExerciseImages)
        .catch(err => console.error(err))
    ])
    await getData()
    setIsLoading(false)
  }

  return (
    <>
      <div className={styles.header}>
        <Button
          variant='contained'
          color='primary'
          disabled={!uploadedFiles.length}
          className={styles.confirmButton}
          onClick={onSubmit}
        >
          Send
        </Button>
        <Tabs
          value={filterTab}
          onChange={handleChange}
          scrollButtons={false}
          aria-label='scrollable prevent tabs example'
          style={{
            background: '#636363'
          }}
        >
          {filters.map(filter => (
            <Tab key={filter} label={filter} />
          ))}
        </Tabs>
        <Button
          variant='contained'
          color='secondary'
          className={styles.confirmButton}
          onClick={() => setUploadedFiles([])}
          disabled={!uploadedFiles.length}
        >
          Clear
        </Button>
      </div>
      <div onClick={handleClick} className={styles.uploadSpace}>
        + Upload Files
      </div>
      <input
        type='file'
        ref={hiddenFileInput}
        multiple
        style={{ display: 'none' }}
        onChange={file => onFileUpload(file.target.files)}
      />
      {uploadedFiles?.length !== 0 && (
        <>
          <div className={styles.textHeader}>Uploaded</div>
          <div className={styles.exercisesContainer}>
            {uploadedFiles.map(img => {
              return (
                <div key={img.lastModified} className={styles.exerciseContainer}>
                  <div className={styles.exercise}>
                    <img src={URL.createObjectURL(img)} alt='' className={styles.exerciseImage} />
                  </div>
                  {getFileName(img.name)}
                </div>
              )
            })}
          </div>
        </>
      )}
      {storedExerciseImages?.length !== 0 && (
        <>
          <div className={styles.textHeader}>Stored: "{filters[filterTab]}"</div>
          <div className={styles.exercisesContainer}>
            {storedExerciseImages
              ?.filter(f => f.filter === filters[filterTab])
              .map(img => (
                <div key={img.storageKey} className={styles.exerciseContainer}>
                  <IconButton
                    onClick={() => onDeleteImage(img.storageKey)}
                    style={{
                      ...(iconButtonStyle as any),
                      color: 'red',
                      background: 'rgba(255,0,0,0.15)'
                    }}
                  >
                    x
                  </IconButton>
                  <div className={styles.exercise}>
                    <img src={img.downloadUrl} alt='' className={styles.exerciseImage} />
                  </div>
                  {img.fileName}
                </div>
              ))}
          </div>
        </>
      )}
      {isLoading && <Loading />}
    </>
  )
}

export default ExercisesPage
