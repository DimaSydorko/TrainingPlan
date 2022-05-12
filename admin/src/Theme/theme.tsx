import { createTheme, PaletteMode } from '@mui/material'
import { amber, blue, grey } from '@mui/material/colors'
import { colors } from './colors'

export const themeStyle = (mode: PaletteMode) =>
  createTheme({
    typography: {
      h3: {
        fontSize: 36,
        margin: 'auto'
      }
    },
    components: {
      MuiTabs: {
        styleOverrides: {
          root: {
            background: colors.menu
          }
        }
      }
    },
    palette: {
      mode,
      ...(mode === 'light'
        ? {
            primary: blue,
            divider: blue[200],
            text: {
              primary: blue[500],
              secondary: grey[400]
            }
          }
        : {
            primary: amber,
            divider: amber[200],
            text: {
              primary: amber[900],
              secondary: amber[800]
            }
          })
    }
  })
