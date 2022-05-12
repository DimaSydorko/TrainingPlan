import React, { useMemo, useState } from 'react'
import { Button } from '@mui/material'
import styles from './Exercises.module.scss'
// import { FB_Database } from '../../../../app/Utils/firebase'

interface ExerciseImage {
  name: string
}

const ExercisesPage = () => {
  const [uploadedFiles, setUploadedFiles] = useState<FileList | null>()
  const files = useMemo(() => (uploadedFiles ? Object.values(uploadedFiles) : []), [uploadedFiles])

  const onSubmit = () => {
    // FB_Database.child('/ExerciseImages').set({ names: files.map(e => e.name) })
  }

  return (
    <>
      <div>
        <input type={'file'} multiple onChange={file => setUploadedFiles(file.target.files)} />
        <div>U download</div>
        <div className={styles.exercisesContainer}>
          {files.map(img => {
            const dotPoss = img.name.indexOf('.')
            const imgName = img.name.slice(0, dotPoss)
            return (
              <div key={img.lastModified} className={styles.exerciseContainer}>
                <div className={styles.exercise}>
                  <img src={URL.createObjectURL(img)} alt='' className={styles.exerciseImage} />
                </div>
                {imgName}
              </div>
            )
          })}
        </div>
        <Button variant='contained' color='primary' onClick={onSubmit}>
          Send
        </Button>
      </div>
    </>
  )
}

export default ExercisesPage
