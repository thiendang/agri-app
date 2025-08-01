import {
   ThemeProvider as MuiThemeProvider,
   StyledEngineProvider,
   createTheme,
   responsiveFontSizes,
} from '@mui/material/styles';
import React, {useEffect} from 'react';
import {BORDER_RADIUS_10, DARK_MODE_COLORS} from '../Constants';
import {SCALE_APP} from '../Constants';
import {BORDER_RADIUS} from '../Constants';
import {ERROR_COLOR, WARNING_COLOR, SUCCESS_COLOR, PRIMARY_COLOR} from '../Constants';
import {useRecoilState} from 'recoil';
import {darkModeAtom} from '../pages/client/settings/Appearance';

export default function ThemeProvider({children, scale = SCALE_APP}) {
   const [darkMode, setDarkMode] = useRecoilState(darkModeAtom);

   useEffect(() => {
      if (!localStorage.getItem('darkMode')) {
         setDarkMode(true);
         localStorage.setItem('darkMode', true);
      } else {
         setDarkMode(localStorage.getItem('darkMode') === 'true');
      }
   }, [setDarkMode]);

   let useTheme = React.useMemo(() => {
      const materialTheme = {
         components: {
            MuiButton: {
               styleOverrides: {
                  textSizeLarge: {
                     fontSize: `${1 * scale}rem`,
                  },
               },
            },
            MuiTabs: {
               styleOverrides: {
                  root: {
                     marginTop: `${24 * scale}px !important`,
                  },
               },
            },
            MuiTab: {
               styleOverrides: {
                  root: {
                     fontSize: 18 * scale,
                     fontWeight: 600,
                     color: '#9C9C9C',
                  },
               },
            },
            MuiAppBar: {
               styleOverrides: {
                  root: {
                     backgroundColor: '#FFFFFF',

                     boxShadow: '0px 1px 1px 0px rgb(0 0 0 / 14%), 0px 1px 3px 0px rgb(0 0 0 / 12%)',
                  },
               },
            },
            MuiDialog: {
               styleOverrides: {
                  paper: '#ffffff',
               },
            },
            MuiOutlinedInput: {
               styleOverrides: {
                  root: {
                     boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
                     borderRadius: BORDER_RADIUS_10,
                  },
                  notchedOutline: {
                     borderColor: 'white',
                     borderWidth: 0,
                  },
               },
            },
            MuiFormControl: {
               styleOverrides: {
                  fullWidth: {
                     paddingLeft: 2,
                     paddingRight: 2,
                  },
               },
            },
            MuiAutocomplete: {
               styleOverrides: {
                  fullWidth: {
                     paddingLeft: 2,
                     paddingRight: 2,
                  },
                  paper: {
                     backgroundColor: 'white',
                  },
               },
            },
            MuiCard: {
               styleOverrides: {
                  root: {
                     background: '#FFFFFF',
                     boxShadow: '0px 6px 14px rgba(0, 0, 0, 0.1)',
                     // borderRadius: 10,
                  },
               },
            },
            MuiPaper: {
               styleOverrides: {
                  rounded: {
                     borderRadius: BORDER_RADIUS_10,
                  },
               },
            },
            MuiTableFooter: {
               styleOverrides: {
                  root: {
                     backgroundColor: '#FFFFFF',
                     borderBottomLeftRadius: BORDER_RADIUS,
                     borderBottomRightRadius: BORDER_RADIUS,
                  },
               },
            },
            MuiTableHead: {
               styleOverrides: {
                  root: {
                     backgroundColor: '#FFFFFF',
                  },
               },
            },
            MuiTableCell: {
               styleOverrides: {
                  root: {
                     color: PRIMARY_COLOR,
                     fontSize: 18 * scale,
                     fontWeight: 500,
                     padding: 16 * scale,
                  },
                  body: {
                     color: '#1E242B',
                  },
                  head: {
                     fontWeight: 500,
                     fontSize: 18 * scale,
                     color: '#6F9132',
                     backgroundColor: '#FFFFFF',
                  },
               },
            },
         },
         spacing: (factor) => `${0.5 * scale * factor}rem`,
         palette: {
            primary: {
               light: '#85AC5B',
               main: PRIMARY_COLOR,
               dark: '#527928',
               green: '#769548',
               stroke: 'rgba(0, 0, 0, 0.12)',
               stroke2: 'rgba(224, 224, 224, 1)',
               stroke3: 'rgba(194, 197, 200, 0.4)',
            },
            secondary: {
               light: '#aaaaaa',
               main: '#000000',
               dark: '#000000',
               light1: 'rgba(224, 224, 224, 1)',
            },
            background: {
               default: '#FFFFFF',
               background2: '#FFFFFF',
               paper: '#F4F4F4',
               grey: '#FBFBFB',
               lightGreen: '#F1F4ED',
               neutralGray: '#E2E8F0',
               dark: '#444444',
               main: '#FBFBFB',
               lightGrey: '#FBFBFB',
               brightGreen: '#D0F789',
               paper2: '#FAFAFA',
               paper3: '#FAFAFA',
               paper4: '#FFFFFF',
               transparent: '#f0f6e9',
               transparent2: '#f0f0f0',
               selectedRow: '#f0f6e9',
               selectedCell: '#f0f6e9',
               selectedCellFocus: '#f0f6e9',
               avatar: '#000',
               expandCell: 'rgba(240,246,233,0.6)',
               popover: '#FFFFFF',
            },
            text: {
               primary: '#000000',
               secondary: '#527928',
               gray: '#475569',
               white: '#FFFFFF',
               black05: 'rgba(0, 0, 0, 0.5)',
               grey: '#999999',
               black: '#000000',
               darkGrey: '#999999',
               green: '#769548',
               labelMenuDrawer: '#769548',
               disabled: '#c0c0c0',
               tertiary: '#707070',
            },
            table: {
               header: {
                  primary: '#FFFFFF',
                  secondary: '#F0F5EA',
                  // secondary: 'rgba(223,235,209,0.41)',
                  third: '#F1F4ED',
               },
            },
            error: {
               main: ERROR_COLOR,
               dark: ERROR_COLOR,
            },
            warning: {
               main: WARNING_COLOR,
            },
            success: {
               main: SUCCESS_COLOR,
            },
            gamePlan: {
               background: '#E2E8F0',
            },
         },
         typography: {
            fontFamily: '"Inter", "Arial", "Roboto", "Helvetica", sans-serif',
            fontSize: 14 * scale,
            subtitle1: {
               fontSize: `${1.125 * scale}rem`,
            },
            titleSmall: {
               '@media (min-width:600px)': {
                  fontSize: `${scale}rem`,
               },
               '@media (min-width:900px)': {
                  fontSize: `${1.1 * scale}rem`,
               },
               '@media (min-width:1200px)': {
                  fontSize: `${1.125 * scale}rem`,
               },
            },
            button: {
               textTransform: 'none',
            },
            fs12400: {
               fontSize: `${12 * scale}px !important`,
               fontWeight: 400,
            },
            fs12500: {
               fontSize: `${12 * scale}px !important`,
               fontWeight: 500,
            },
            fs28700: {
               fontSize: `${28 * scale}px !important`,
               fontWeight: 700,
            },
            fs48700: {
               fontSize: `${48 * scale}px !important`,
               fontWeight: 700,
            },
            fs24500: {
               fontSize: `${24 * scale}px !important`,
               fontWeight: 500,
            },
            fs18400: {
               fontSize: `${18 * scale}px !important`,
               fontWeight: 400,
            },
            fs18600: {
               fontSize: `${18 * scale}px !important`,
               fontWeight: 600,

               '@media (min-width:600px)': {
                  fontSize: `${14 * scale}px !important`,
               },
               '@media (min-width:900px)': {
                  fontSize: `${16 * scale}px !important`,
               },
               '@media (min-width:1200px)': {
                  fontSize: `${18 * scale}px !important`,
               },
            },
            fs24700: {
               fontSize: `${24 * scale}px !important`,
               fontWeight: 700,
               '@media (min-width:600px)': {
                  fontSize: `${20 * scale}px !important`,
               },
               '@media (min-width:900px)': {
                  fontSize: `${22 * scale}px !important`,
               },
               '@media (min-width:1200px)': {
                  fontSize: `${24 * scale}px !important`,
               },
            },
            fs16700: {
               fontSize: `${16 * scale}px !important`,
               fontWeight: 700,
            },
            fs20500: {
               fontSize: `${20 * scale}px !important`,
               fontWeight: 500,
            },
            fs18700: {
               fontSize: `${18 * scale}px !important`,
               fontWeight: 700,
            },
            fs16500: {
               fontSize: `${16 * scale}px !important`,
               fontWeight: 400,
            },
            fs16400: {
               fontSize: `${16 * scale}px !important`,
               fontWeight: 400,
            },
            fs24400: {
               fontSize: `${24 * scale}px !important`,
               fontWeight: 400,
            },
            fs18500: {
               fontSize: `${18 * scale}px !important`,
               fontWeight: 500,
            },
            ///////////
            title: {
               fontSize: `${24 * scale}px !important`,
               fontWeight: 500,
               lineHeight: `${18 * scale}px`,
            },
            fs14400: {
               fontSize: `${14 * scale}px !important`,
               fontWeight: 400,
               lineHeight: `${17 * scale}px`,
            },
            fs14700: {
               fontSize: `${14 * scale}px !important`,
               fontWeight: 700,
            },
            fs30700: {
               fontSize: `${30 * scale}px !important`,
               fontWeight: 700,
            },
            fs30400: {
               fontSize: `${30 * scale}px !important`,
               fontWeight: 500,
            },
            fs20400: {
               fontSize: `${20 * scale}px !important`,
               fontWeight: 400 * scale,
            },
            fs20700: {
               fontSize: `${20 * scale}px !important`,
               fontWeight: 700,
            },
            fs24600: {
               fontSize: `${24 * scale}px !important`,
               fontWeight: 600,
            },
            fs40700: {
               fontSize: `${40 * scale}px !important`,
               fontWeight: 700,
            },
            fs32400: {
               fontSize: `${40 * scale}px !important`,
               fontWeight: 400,
            },

            h5: {
               fontWeight: 400,
               fontSize: `${1.25 * scale}rem !important`,
               lineHeight: 1.334 * scale,
               '@media (min-width:600px)': {
                  fontSize: `${1.3118 * scale}rem !important`,
               },
               '@media (min-width:900px)': {
                  fontSize: `${1.4993 * scale}rem !important`,
               },
               '@media (min-width:1200px)': {
                  fontSize: `${1.4993 * scale}rem !important`,
               },
            },
            ///////////
         },
         shape: {
            borderRadius: 4 * scale,
         },
         breakpoints: {
            values: {
               xs: 0,
               sm: 600,
               md: 900,
               lg: 1200,
               xl: 1536,
               tablet: 1100,
            },
         },
      };

      const darkTheme = {
         ...materialTheme,
         palette: {
            ...materialTheme.palette,
            mode: 'dark',
            background: {
               default: '#1D1D1D',
               background2: '#212121',
               paper: '#303030',
               grey: '#FBFBFB',
               lightGreen: '#F1F4ED',
               neutralGray: '#E2E8F0',
               dark: '#444444',
               main: '#FBFBFB',
               lightGrey: '#FBFBFB',
               brightGreen: '#D0F789',
               icon: '#454545',
               paper2: '#1D1D1D',
               paper3: '#303030',
               paper4: '#1D1D1D',
               transparent: 'transparent',
               transparent2: 'transparent',
               selectedRow: '#4C5343',
               selectedCell: '#4C5343',
               selectedCellFocus: '#1D1D1D',
               avatar: 'rgb(76, 83, 67)',
               expandCell: '#3D4434',
               popover: '#000000',
            },
            primary: {
               light: '#4C5343',
               main: PRIMARY_COLOR,
               dark: '#9AB96C',
               green: '#769548',
               stroke: '#434343',
               stroke2: '#434343',
               darkGreen: '#ABC18D',
               stroke3: '#434343',
            },
            text: {
               primary: '#fff',
               secondary: '#9AB96C',
               gray: '#c8c8c8',
               white: '#FFFFFF',
               black05: 'rgba(0, 0, 0, 0.5)',
               grey: '#999999',
               black: '#000000',
               darkGrey: '#999999',
               green: '#769548',
               labelMenuDrawer: '#fff',
               tertiary: 'rgba(240,240,240)',
            },
            secondary: {
               light: '#aaaaaa',
               main: '#FFFFFF',
               dark: '#FFFFFF',
               light1: 'rgba(224, 224, 224, 1)',
            },
            table: {
               header: {
                  secondary: 'rgb(76, 83, 67)',
               },
            },
            error: {
               main: '#FF6961',
               dark: '#FF6961',
            },
         },
         components: {
            ...materialTheme.components,
            MuiAutocomplete: {
               styleOverrides: {
                  fullWidth: {
                     paddingLeft: 2,
                     paddingRight: 2,
                  },
                  paper: {
                     backgroundColor: 'white',
                     color: '#000',
                  },
                  listbox: {
                     backgroundColor: DARK_MODE_COLORS.Background_1,
                     color: '#fff',
                  },
                  noOptions: {
                     color: '#fff',
                     backgroundColor: DARK_MODE_COLORS.Background_1,
                  },
               },
            },
            MuiCard: {
               styleOverrides: {
                  root: {
                     background: '#303030',
                     border: '1px solid #434343',
                  },
               },
            },
            MuiDrawer: {
               styleOverrides: {
                  paper: {
                     backgroundColor: DARK_MODE_COLORS.Background_1,
                     color: '#fff',
                  },
               },
            },
            MuiInputBase: {
               styleOverrides: {
                  input: {
                     color: '#fff',
                  },
               },
            },
            MuiLink: {
               styleOverrides: {
                  root: {
                     color: '#9FCEE2 !important',
                  },
               },
            },

            MuiSvgIcon: {
               styleOverrides: {
                  fontSizeSmall: {
                     color: '#fff',
                  },
                  root: {
                     color: '#fff',
                  },
               },
            },
            MuiOutlinedInput: {
               styleOverrides: {
                  root: {
                     border: `1px solid ${DARK_MODE_COLORS.Card_2_Stroke}`,
                     borderRadius: '8px',
                  },
               },
            },
            MuiInputLabel: {
               styleOverrides: {
                  formControl: {
                     backgroundColor: DARK_MODE_COLORS.Background_1,
                  },
                  root: {
                     backgroundColor: 'transparent !important',
                  },
               },
            },
            MuiCssBaseline: {
               styleOverrides: {
                  body: {
                     scrollbarColor: '#6b6b6b #2b2b2b',
                     '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
                        backgroundColor: '#2b2b2b',
                     },
                  },
               },
            },
         },
      };

      return responsiveFontSizes(createTheme(darkMode ? darkTheme : materialTheme));
   }, [darkMode, scale]);

   return (
      <StyledEngineProvider injectFirst>
         <MuiThemeProvider theme={useTheme}>{children}</MuiThemeProvider>
      </StyledEngineProvider>
   );
}
