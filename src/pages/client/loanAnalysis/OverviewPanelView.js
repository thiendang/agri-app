import {CardContent} from '@mui/material';
import {Card} from '@mui/material';
import Box from '@mui/material/Box';
import makeStyles from '@mui/styles/makeStyles';
import numberFormatter from 'number-formatter';
import React from 'react';
import {CURRENCY_FORMAT, DARK_MODE_COLORS, SCALE_APP} from '../../../Constants';
import InfoPopup from '../../../fhg/components/InfoPopup';
import TypographyFHG from '../../../fhg/components/Typography';
import {useTheme} from '@mui/styles';

const useStyles = makeStyles(
   (theme) => ({
      cardStyle: {
         transition: theme.transitions.create(['height'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
         }),
         marginLeft: '4px',
         marginRight: '4px',
         '& .MuiCardContent-root:last-child': {
            paddingBottom: theme.spacing(2),
         },
         flex: '1 1',
      },
      valueStyle: {
         color: theme.palette.primary.main,
         wordBreak: 'break-all',
      },
      negativeValueStyle: {
         color: theme.palette.error.main,
      },
      changeStyleText: {
         color: '#02B15A',
         fontFamily: 'Inter, Arial, san-serif',
      },
      changeStyleTextNegative: {
         color: '#E41414',
         fontFamily: 'Inter, Arial, san-serif',
      },
      changeStylePositive: {
         backgroundColor: 'rgba(2, 177, 90, 0.15)',
         borderRadius: 4 * SCALE_APP,
      },
      changeStyleNegative: {
         backgroundColor: 'rgba(235, 0, 27, 0.15)',
         borderRadius: 4 * SCALE_APP,
      },
      help: {
         position: 'absolute',
         right: 4,
         top: 4,
         cursor: 'pointer',
      },
   }),
   {name: 'OverviewPanelStyles'},
);

OverviewPanelView.propTypes = {};

export default function OverviewPanelView({
   icon,
   titleKey,
   titleKey2,
   titleKeyThird,
   value = 0,
   value2 = 0,
   valueThird = 0,
   change,
   format = CURRENCY_FORMAT,
   title,
   title2,
   titleThird,
   maxWidth = 372,
   minWidth = 240,
   height = 127,
   dense = true,
   isThirdTitlePrimary = false,
   desKey,
}) {
   const classes = useStyles();
   // const hasSecondValue = titleKey2 || title2;
   const useValue = isNaN(value) ? 0 : value;
   const useValueClass = useValue >= 0 ? classes.valueStyle : classes.negativeValueStyle;
   const useValue2 = isNaN(value2) ? 0 : value2;
   // const hasThirdValue = titleKeyThird || titleThird;
   const useValueThird = isNaN(valueThird) ? 0 : valueThird;
   // const useValueThirdClass = useValueThird >= 0 ? classes.valueStyle : classes.negativeValueStyle;
   const theme = useTheme();

   return (
      <Card
         key={'OverviewPanelView ' + titleKey + title}
         className={classes.cardStyle}
         sx={{maxWidth, minWidth, width: '100%', position: 'relative'}}
         overflow={'hidden'}
         square={false}
      >
         {desKey && (
            <Box className={classes.help}>
               <InfoPopup labelKey={desKey} />
            </Box>
         )}
         <CardContent
            sx={{
               height: '100%',
               py: dense ? 2 : 4,
               display: 'flex',
               flexDirection: 'column',
               justifyContent: 'center',
               alignContent: 'center',
            }}
         >
            <Box
               sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
               }}
            >
               <Box
                  sx={{
                     width: '50px',
                     height: '50px',
                     borderRadius: '50px',
                     backgroundColor: theme.palette.mode === 'dark' ? DARK_MODE_COLORS.Card_2_Stroke : '#F1F4ED',
                     display: 'flex',
                     justifyContent: 'center',
                     alignItems: 'center',
                  }}
               >
                  <img
                     src={icon}
                     style={{
                        width: '30px',
                        height: '30px',
                     }}
                     alt='solar_hand-money-broken'
                  />
               </Box>
               <Box
                  sx={{
                     ml: '13px',
                     display: 'flex',
                     flexDirection: 'column',
                  }}
               >
                  <TypographyFHG id={titleKeyThird} variant={'fs20700'} color='text.primary' />
                  <TypographyFHG variant={'fs18700'} className={useValueClass}>
                     {numberFormatter(format, useValueThird)}
                  </TypographyFHG>
               </Box>
            </Box>
            <Box
               sx={{
                  marginTop: '12px',
                  height: '12px',
                  backgroundColor: '#769548',
                  borderRadius: '20px',
                  position: 'relative',
                  overflow: 'hidden',
               }}
            >
               <Box
                  sx={{
                     position: 'absolute',
                     height: '12px',
                     backgroundColor: theme.palette.mode === 'dark' ? '#ABC18D' : '#0D3B0C',
                     width: (useValue2 / useValue) * 100 + '%',
                  }}
               ></Box>
            </Box>
            <Box
               sx={{
                  mt: '12px',
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
               }}
            >
               <Box
                  sx={{
                     display: 'flex',
                     paddingBottom: '12px',
                  }}
               >
                  <img
                     style={{
                        width: '50px',
                        objectFit: 'contain',
                     }}
                     src='/images/border-left.png'
                     alt='left'
                  />
               </Box>
               <Box
                  sx={{
                     display: 'flex',
                     flexDirection: 'row',
                     alignItems: 'center',
                  }}
               >
                  <TypographyFHG id={titleKey} variant={'fs16400'} color='text.primary'>
                     <TypographyFHG variant={'fs16700'} color='text.primary'>
                        : {numberFormatter(format, useValue)}
                     </TypographyFHG>
                  </TypographyFHG>
               </Box>
               <Box
                  sx={{
                     display: 'flex',
                     paddingBottom: '12px',
                  }}
               >
                  <img
                     style={{
                        width: '50px',
                        objectFit: 'contain',
                     }}
                     src='/images/border-right.png'
                     alt='right'
                  />
               </Box>
            </Box>
            <Box
               sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  width: '80%',
                  alignSelf: 'center',
               }}
            >
               <Box
                  sx={{
                     marginTop: '24px',
                     display: 'flex',
                     flexDirection: 'row',
                  }}
               >
                  <Box
                     sx={{
                        width: '18px',
                        height: '18px',
                        backgroundColor: theme.palette.mode === 'dark' ? '#ABC18D' : '#0D3B0C',
                        borderRadius: '5px',
                        marginRight: '14px',
                     }}
                  />
                  <TypographyFHG id={titleKey2} variant='fs16400' color='text.primary'>
                     <TypographyFHG variant={'fs16700'} color={theme.palette.mode === 'dark' ? '#ABC18D' : '#0D3B0C'}>
                        : {numberFormatter(format, useValue2)}
                     </TypographyFHG>
                  </TypographyFHG>
               </Box>
               <Box
                  sx={{
                     marginTop: '12px',
                     display: 'flex',
                     flexDirection: 'row',
                  }}
               >
                  <Box
                     sx={{
                        width: '18px',
                        height: '18px',
                        backgroundColor: '#769548',
                        borderRadius: '5px',
                        marginRight: '14px',
                     }}
                  />
                  <TypographyFHG id={titleKeyThird} variant='fs16400' color='text.primary'>
                     <TypographyFHG variant={'fs16700'} color='#769548'>
                        : {numberFormatter(format, useValueThird)}
                     </TypographyFHG>
                  </TypographyFHG>
               </Box>
            </Box>
         </CardContent>
      </Card>
   );
}
