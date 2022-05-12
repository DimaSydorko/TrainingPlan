import React, { useState } from 'react'
import { PaletteMode, Tab, Tabs, ThemeProvider } from '@mui/material'
import { themeStyle } from './Theme/theme'
import styles from './App.module.scss'
import ExercisesPage from './Pages/ExercisesPage/ExercisesPage'

const App = () => {
  const [theme, setTheme] = useState<PaletteMode>('light')
  const [tab, setTab] = useState<number>(0)

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue)
  }

  return (
    <ThemeProvider theme={themeStyle(theme)}>
      <div className={styles.container}>
        <Tabs
          value={tab}
          onChange={handleChange}
          variant='scrollable'
          scrollButtons={false}
          orientation='vertical'
          aria-label='scrollable prevent tabs example'
          className={styles.tabMenu}
        >
          <Tab label='Exercises list' />
          <Tab label='Other' />
        </Tabs>
        <TabPanel value={tab} index={0}>
          <div className={styles.pageContainer}>
            <ExercisesPage />
          </div>
        </TabPanel>
        <TabPanel value={tab} index={1}>
          <div className={styles.pageContainer}>Item 2</div>
        </TabPanel>
      </div>
    </ThemeProvider>
  )
}

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

const TabPanel = React.memo((props: TabPanelProps) => {
  const { children, value, index, ...other } = props
  return (
    <div role='tabpanel' hidden={value !== index} id={`${index}`} aria-labelledby={`${index}`} {...other}>
      {value === index && <div>{children}</div>}
    </div>
  )
})

export default App
