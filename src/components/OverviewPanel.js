import {Stack} from '@mui/material';
import {CardContent} from '@mui/material';
import {Card} from '@mui/material';
import Box from '@mui/material/Box';
import makeStyles from '@mui/styles/makeStyles';
import numberFormatter from 'number-formatter';
import React from 'react';
import {SCALE_APP} from '../Constants';
import {CURRENCY_FORMAT} from '../Constants';
import {PERCENT_FORMAT} from '../Constants';
import TypographyFHG from '../fhg/components/Typography';
import InfoPopup from '../fhg/components/InfoPopup';

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
      cardStyle1: {
         transition: theme.transitions.create(['height'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
         }),
         marginLeft: '4px',
         marginRight: '4px',
         '& .MuiCardContent-root:last-child': {
            paddingBottom: theme.spacing(2),
         },
      },
      valueStyle: {
         color: theme.palette.primary.main,
         wordBreak: 'break-all',
      },
      negativeValueStyle: {
         color: theme.palette.error.main,
      },
      help: {
         position: 'absolute',
         right: 4,
         top: 4,
         cursor: 'pointer',
      },
      averages: {
         position: 'absolute',
         right: 4,
         bottom: 4,
         cursor: 'pointer',
      },
   }),
   {name: 'OverviewPanelStyles'},
);

OverviewPanel.propTypes = {};

export default function OverviewPanel({
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
   horizontal = false,
   renderRightBottomIcon = null,
   averagesIcon = null,
   desAveragesKey = null,
   isShowAverages = false,
   values = null,
}) {
   const classes = useStyles();
   const hasSecondValue = titleKey2 || title2;
   const useValue = isNaN(value) ? 0 : value;
   const useValueClass = useValue >= 0 ? classes.valueStyle : classes.negativeValueStyle;
   const useValue2 = isNaN(value2) ? 0 : value2;
   const hasThirdValue = titleKeyThird || titleThird;
   const useValueThird = isNaN(valueThird) ? 0 : valueThird;
   const useValueThirdClass = useValueThird >= 0 ? classes.valueStyle : classes.negativeValueStyle;

   if (horizontal)
      return (
         <Card
            key={'OverviewPanel ' + titleKey + title}
            className={classes.cardStyle1}
            sx={{position: 'relative'}}
            overflow={'hidden'}
            square={false}
         >
            <CardContent
               sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignContent: 'center',
               }}
            >
               <Box>
                  <TypographyFHG id={titleKey} variant={'fs16500'} color='text.primary'>
                     {title}
                  </TypographyFHG>
                  <Stack direction={'row'} justifyContent={'space-between'} height={'fit-content'} flexWrap={'wrap'}>
                     <TypographyFHG variant={'fs18600'} className={useValueClass}>
                        {numberFormatter(format, useValue)}
                     </TypographyFHG>
                  </Stack>
               </Box>
               <Box sx={{width: '20px'}} />
               <Box>
                  {(titleKey2 || title2) && (
                     <TypographyFHG id={titleKey2} variant='fs16500' color='text.primary'>
                        {title2}
                     </TypographyFHG>
                  )}
                  {hasSecondValue && (
                     <Stack direction={'row'} justifyContent={'space-between'} height={'fit-content'} flexWrap={'wrap'}>
                        <TypographyFHG
                           variant='fs18600'
                           className={useValue2 >= 0 ? classes.valueStyle : classes.negativeValueStyle}
                        >
                           {numberFormatter(format, useValue2)}
                        </TypographyFHG>
                     </Stack>
                  )}
               </Box>
            </CardContent>
         </Card>
      );

   return (
      <Card
         key={'OverviewPanel ' + titleKey + title}
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
         {isShowAverages && (
            <Box className={classes.averages}>
               <InfoPopup labelKey={desAveragesKey} icon={averagesIcon} values={values} />
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
            <TypographyFHG id={titleKey} variant={!isThirdTitlePrimary ? 'fs16500' : 'fs12400'} color='text.primary'>
               {title}
            </TypographyFHG>
            <Stack direction={'row'} justifyContent={'space-between'} height={'fit-content'} flexWrap={'wrap'}>
               <TypographyFHG variant={!isThirdTitlePrimary ? 'fs24700' : 'fs18600'} className={useValueClass}>
                  {numberFormatter(format, useValue)}
               </TypographyFHG>
               {renderRightBottomIcon ? renderRightBottomIcon : null}
            </Stack>
            {(titleKey2 || title2) && (
               <TypographyFHG id={titleKey2} variant='fs12400' color='text.primary'>
                  {title2}
               </TypographyFHG>
            )}
            {hasSecondValue && (
               <Stack direction={'row'} justifyContent={'space-between'} height={'fit-content'} flexWrap={'wrap'}>
                  <TypographyFHG
                     variant='fs18600'
                     className={useValue2 >= 0 ? classes.valueStyle : classes.negativeValueStyle}
                  >
                     {numberFormatter(format, useValue2)}
                  </TypographyFHG>
               </Stack>
            )}
            {(titleKeyThird || titleThird) && (
               <TypographyFHG
                  id={titleKeyThird}
                  variant={isThirdTitlePrimary ? 'fs16500' : 'fs12400'}
                  color='text.primary'
               >
                  {titleThird}
               </TypographyFHG>
            )}
            {hasThirdValue && (
               <Stack direction={'row'} justifyContent={'space-between'} height={'fit-content'} flexWrap={'wrap'}>
                  <TypographyFHG variant={!isThirdTitlePrimary ? 'fs18600' : 'fs24700'} className={useValueThirdClass}>
                     {numberFormatter(format, useValueThird)}
                  </TypographyFHG>
               </Stack>
            )}
         </CardContent>
      </Card>
   );
}
