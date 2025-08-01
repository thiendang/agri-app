import React from 'react';
import {BORDER_RADIUS_20, DARK_MODE_COLORS} from '../../../Constants';
import {DELETE_ICON} from '../../../Constants';
import {SCALE_APP} from '../../../Constants';
import {BUSINESS_PLAN_EDIT} from '../../../components/permission/PermissionAllow';
import usePermission from '../../../components/permission/usePermission';
import Grid2 from '../../../fhg/components/Grid';
import TypographyFHG from '../../../fhg/components/Typography';
import EditIcon from './EditIcon';
import {useToggle} from './hooks/useToggle';
import FormAddGoal from './FormAddGoal';
import numberFormatter from 'number-formatter';
import {CURRENCY_FULL_FORMAT, PERCENT_FORMAT_BEFORE} from '../../../Constants';
import Wrapper from './Wrapper';
import {convertTimeToLongFormat, convertTimeToShortFormat} from '../../../components/utils/helpers';
import {makeStyles, useTheme} from '@mui/styles';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import {Box} from '@mui/material';

const useStyles = makeStyles((theme) => ({
   view: {
      backgroundColor: theme.palette.mode === 'dark' ? DARK_MODE_COLORS.Background_1 : '#E2E8F0',
      justifyContent: 'center',
      alignItems: 'center',
   },
   border: {
      backgroundColor: theme.palette.mode === 'dark' ? DARK_MODE_COLORS.Background_1 : theme.palette.background.default,
      padding: theme.spacing(2.5),
      borderRadius: BORDER_RADIUS_20,
      boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.15)',
   },
   card: {
      boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25) !important',
   },
   editor: {
      color: theme.palette.secondary.main,
      fontSize: 18 * SCALE_APP,
   },
}));

const GoalItem = ({data, onComplete, onChange, onDelete}) => {
   const classes = useStyles();
   const theme = useTheme();
   const {isToggle, toggle} = useToggle();
   const hasPermission = usePermission(BUSINESS_PLAN_EDIT);
   const {id, name, futureDate, revenue, summary, profitNetDollars, profitNetPercent, completed} = data ?? {};

   if (isToggle && id)
      return (
         <FormAddGoal
            id={'edit-goal' + id}
            data={data}
            onClose={toggle}
            onSubmit={async (d) => {
               const done = await onChange(id)(d);
               if (done) toggle();
            }}
         />
      );

   return (
      <Grid2 item xs={12}>
         <Wrapper>
            <Box
               style={{
                  display: 'flex',
                  justifyContent: 'space-between',
               }}
               marginBottom={2.5}
            >
               <Box
                  style={{
                     display: 'flex',
                     alignItems: 'center',
                     height: 30 * SCALE_APP,
                  }}
               >
                  <TypographyFHG variant='h5' color='text.primary' style={{fontWeight: 'bold'}}>
                     {name}
                  </TypographyFHG>
                  <Box width={12 * SCALE_APP} />
                  {completed && (
                     <>
                        <CheckCircleOutlineRoundedIcon
                           style={{
                              width: 20 * SCALE_APP,
                              height: 20 * SCALE_APP,
                              color: theme.palette.secondary.main,
                           }}
                        />
                        <Box width={12 * SCALE_APP} />
                        <TypographyFHG variant='fs14700' color='text.primary' id='gamePlan.goal.complete' />
                     </>
                  )}
               </Box>
               <Box
                  style={{
                     display: 'flex',
                     alignItems: 'center',
                  }}
               >
                  <TypographyFHG variant='fs14400' color='text.primary' id='gamePlan.goal.lastEdit' />
                  <Box width={4 * SCALE_APP} />
                  <TypographyFHG variant='fs14400' color='text.primary'>
                     {convertTimeToShortFormat(data?.updatedDateTime)}
                  </TypographyFHG>
                  {!completed && hasPermission && <EditIcon onClick={toggle} />}
                  {!completed && hasPermission && (
                     <img
                        style={{
                           marginLeft: 20 * SCALE_APP,
                           cursor: 'pointer',
                        }}
                        src={DELETE_ICON}
                        onClick={onDelete}
                        alt='delete goal'
                     />
                  )}
               </Box>
            </Box>
            <Box display={'flex'} marginBottom={20 / 8}>
               <TypographyFHG variant='fs18700' color='text.primary' id='gamePlan.goal.futureDate' />
               <Box width={4 * SCALE_APP} />
               <TypographyFHG variant='fs18400' color='text.primary'>
                  {convertTimeToLongFormat(futureDate)}
               </TypographyFHG>
            </Box>
            <Box
               style={{
                  display: 'flex',
               }}
            >
               <TypographyFHG variant='fs18700' color='text.primary' id='gamePlan.goal.revenue' />
               <Box width={4 * SCALE_APP} />
               <TypographyFHG variant='fs18400' color='text.primary'>
                  {numberFormatter(CURRENCY_FULL_FORMAT, revenue)}
               </TypographyFHG>
            </Box>
            <Box display={'flex'} marginTop={5}>
               <Box
                  style={{
                     display: 'flex',
                     flexDirection: 'column',
                     flex: 0.5,
                  }}
               >
                  <Box className={classes.border}>
                     <Box marginBottom={20 / 8}>
                        <TypographyFHG variant='fs20700' color='text.primary' id='gamePlan.goal.profit' />
                     </Box>
                     <Box
                        style={{
                           display: 'flex',
                           justifyContent: 'space-between',
                        }}
                     >
                        <TypographyFHG variant='fs18700' color='text.primary' id='gamePlan.goal.net' />
                        <TypographyFHG variant='fs18400' color='text.primary'>
                           {numberFormatter(PERCENT_FORMAT_BEFORE, profitNetPercent)}
                        </TypographyFHG>
                     </Box>
                     <Box height={10 * SCALE_APP} />
                     <Box
                        style={{
                           display: 'flex',
                           justifyContent: 'space-between',
                        }}
                     >
                        <TypographyFHG variant='fs18700' color='text.primary' id='gamePlan.goal.net$' />
                        <TypographyFHG variant='fs18400' color='text.primary'>
                           {numberFormatter(CURRENCY_FULL_FORMAT, profitNetDollars)}
                        </TypographyFHG>
                     </Box>
                  </Box>
               </Box>
               <Box width={20 * SCALE_APP} />
               <Box
                  className={classes.border}
                  style={{
                     display: 'flex',
                     flexDirection: 'column',
                     flex: 0.5,
                  }}
               >
                  <Box marginBottom={20 / 8}>
                     <TypographyFHG variant='fs20700' color='text.primary' id='gamePlan.goal.measurables' />
                  </Box>
                  <div
                     dangerouslySetInnerHTML={{__html: summary?.replaceAll('<a href="', '<a href="//')}}
                     className={classes.editor}
                  />
               </Box>
            </Box>
         </Wrapper>
      </Grid2>
   );
};

export default GoalItem;
