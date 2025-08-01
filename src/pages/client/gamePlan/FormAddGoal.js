import React, {useCallback, useEffect, useState} from 'react';
import {BORDER_RADIUS_10} from '../../../Constants';
import {BORDER_RADIUS_20} from '../../../Constants';
import {SCALE_APP} from '../../../Constants';
import Grid2 from '../../../fhg/components/Grid';
import TypographyFHG from '../../../fhg/components/Typography';
import FillButton from './FillButton';
import OutLineButton from './OutLineButton';
import moment from 'moment';
import {DATE_SHORT_FORMAT, DEFAULT_SUMMARY} from '../../../Constants';
import Wrapper from './Wrapper';
import TextFieldLF from '../../../components/TextFieldLF';
import DatePickerFHG from '../../../fhg/components/DatePickerFHG';
import Editor from './Editor';
import {useToggle} from './hooks/useToggle';
import useEditData from '../../../fhg/components/edit/useEditData';
import {pick} from 'lodash';
import {makeStyles, useTheme} from '@mui/styles';
import {Box} from '@mui/material';

const useStyles = makeStyles((theme) => ({
   border: {
      boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.15)',
      padding: theme.spacing(2.5),
      borderRadius: BORDER_RADIUS_20,
      backgroundColor: theme.palette.background.default,
   },
   input: {
      borderRadius: BORDER_RADIUS_10,
      borderWidth: '0px',
      fontSize: 18 * SCALE_APP,
      height: 42 * SCALE_APP,
      backgroundColor: theme.palette.background.default,
      width: 136 * SCALE_APP,
      margin: '0px',
      '& .MuiOutlinedInput-root': {
         color: `${theme.palette.text.primary} !important`,
      },
   },
   input2: {
      borderRadius: BORDER_RADIUS_10,
      borderWidth: '0px',
      fontSize: 18 * SCALE_APP,
      backgroundColor: theme.palette.background.default,
      boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.25)',
      '& .MuiOutlinedInput-root': {
         color: `${theme.palette.text.primary} !important`,
      },
   },
   datePicker: {
      margin: '0px',
      width: 136 * SCALE_APP,
      backgroundColor: theme.palette.background.default,
      marginLeft: theme.spacing(1.25),
      '& .MuiButtonBase-root': {
         marginRight: '0px',
      },
      '& .MuiOutlinedInput-root': {
         color: `${theme.palette.text.primary} !important`,
      },
      '& .MuiSvgIcon-fontSizeMedium': {
         color: theme.palette.text.primary,
      },
   },
   editor: {
      '& .text-editor > .toolbar-common': {
         height: 45 * SCALE_APP,
         display: 'flex',
         alignItems: 'center',
         width: '100%',
      },
   },
}));

const FormAddGoal = ({onClose, data, onSubmit, id}) => {
   const theme = useTheme();
   const classes = useStyles();
   const {isToggle, toggle} = useToggle();

   const [editValues, handleChange, {defaultValues, setValue, getValue}] = useEditData({
      ...data,
      revenue: data?.revenue || 0,
      futureDate: data?.futureDate || null,
      profitNetDollars: data?.profitNetDollars || 0,
      profitNetPercent: data?.profitNetPercent || 0,
   });

   const [summary, setSummary] = useState('');

   useEffect(() => {
      if (data) {
         setValue('revenue', data?.revenue || 0);
         setValue('profitNetDollars', data?.profitNetDollars || 0);
         setValue('profitNetPercent', data?.profitNetPercent || 0);
         setValue('futureDate', data?.futureDate || null);
         setValue('name', data?.name || 0);
         setSummary(data?.summary || DEFAULT_SUMMARY);
      }
   }, [data]);

   const handleSave = useCallback(async () => {
      toggle();
      await onSubmit(
         pick({...defaultValues, ...editValues, summary}, [
            'name',
            'summary',
            'profitNetDollars',
            'profitNetPercent',
            'revenue',
            'futureDate',
         ]),
      );
      toggle();
   }, [toggle, onSubmit, defaultValues, editValues, summary]);

   useEffect(() => {
      const revenue = getValue('revenue');
      const profitNetPercent = getValue('profitNetPercent');
      setValue('profitNetDollars', (revenue * profitNetPercent) / 100, true);
   }, [editValues.revenue, editValues.profitNetPercent]);

   return (
      <Grid2 item xs={12}>
         <Wrapper>
            <Box
               style={{
                  display: 'flex',
                  alignItems: 'center',
               }}
            >
               <TypographyFHG variant='fs18700' color='text.primary' id='gamePlan.goal.name' />
               <Box display='flex' alignItems='center' marginLeft={1.25}>
                  <TextFieldLF
                     name='name'
                     placeholderKey='gamePlan.goal.title'
                     className={classes.input}
                     onChange={handleChange}
                     defaultValue={defaultValues.name}
                     value={editValues.name}
                  />
               </Box>
            </Box>
            <Box
               marginTop={2.5}
               style={{
                  display: 'flex',
                  alignItems: 'center',
               }}
            >
               <TypographyFHG variant='fs18700' color='text.primary' id='gamePlan.goal.futureDate' />
               <DatePickerFHG
                  name='futureDate'
                  className={classes.datePicker}
                  showToolbar={false}
                  defaultValue={defaultValues.futureDate ? moment(defaultValues.futureDate, 'YYYY-MM-DD') : null}
                  value={editValues.futureDate ? moment(editValues.futureDate, 'YYYY-MM-DD') : null}
                  onChange={handleChange}
                  format={DATE_SHORT_FORMAT}
                  disableFuture={false}
               />
            </Box>
            <Box
               marginTop={2.5}
               style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyItems: 'center',
               }}
            >
               <TypographyFHG variant='fs18700' color='text.primary' id='gamePlan.goal.revenue' />
               <Box
                  style={{
                     display: 'flex',
                     alignItems: 'center',
                  }}
                  marginLeft={1.25}
               >
                  <TextFieldLF
                     name='revenue'
                     type='text'
                     className={classes.input}
                     onChange={handleChange}
                     defaultValue={defaultValues.revenue || ''}
                     value={editValues.revenue}
                     isFormattedNumber
                     placeholder='0'
                  />
               </Box>
            </Box>
            <Box
               style={{
                  display: 'flex',
               }}
               marginTop={5}
            >
               <Box
                  style={{
                     display: 'flex',
                     flexDirection: 'column',
                     flex: 0.5,
                  }}
               >
                  <Box className={classes.border}>
                     <Box marginBottom={2.5}>
                        <TypographyFHG variant='fs20700' color='text.primary' id='gamePlan.goal.profit' />
                     </Box>
                     <Box
                        style={{
                           display: 'flex',
                           justifyContent: 'space-between',
                           alignItems: 'center',
                        }}
                     >
                        <TypographyFHG variant='fs18700' color='text.primary' id='gamePlan.goal.net' />
                        <Box
                           style={{
                              display: 'flex',
                              alignItems: 'center',
                           }}
                        >
                           <TypographyFHG variant='fs18400' color='text.primary'>
                              %
                           </TypographyFHG>
                           <Box
                              marginLeft={1.25}
                              style={{
                                 height: 44 * SCALE_APP,
                                 width: 156 * SCALE_APP,
                                 display: 'flex',
                                 alignItems: 'center',
                              }}
                           >
                              <TextFieldLF
                                 name='profitNetPercent'
                                 type='text'
                                 className={classes.input}
                                 onChange={handleChange}
                                 defaultValue={defaultValues.profitNetPercent || ''}
                                 value={editValues.profitNetPercent}
                                 isFormattedNumber
                                 placeholder='0'
                              />
                           </Box>
                        </Box>
                     </Box>
                     <Box height={20 * SCALE_APP} />
                     <Box
                        style={{
                           display: 'flex',
                           justifyContent: 'space-between',
                           alignItems: 'center',
                        }}
                     >
                        <TypographyFHG variant='fs18700' color='text.primary' id='gamePlan.goal.net$' />
                        <Box
                           style={{
                              display: 'flex',
                              alignItems: 'center',
                           }}
                        >
                           <TypographyFHG variant='fs18400' color='text.primary'>
                              $
                           </TypographyFHG>
                           <Box
                              marginLeft={1.25}
                              style={{
                                 width: 156 * SCALE_APP,
                                 height: 44 * SCALE_APP,
                                 display: 'flex',
                                 alignItems: 'center',
                              }}
                           >
                              <TextFieldLF
                                 type='text'
                                 className={classes.input}
                                 name='profitNetDollars'
                                 onChange={handleChange}
                                 defaultValue={defaultValues.profitNetDollars}
                                 value={editValues.profitNetDollars}
                                 isFormattedNumber
                                 disabled
                              />
                           </Box>
                        </Box>
                     </Box>
                  </Box>
               </Box>
               <Box width={20 * SCALE_APP} />
               <Box
                  className={classes.border}
                  style={{
                     paddingBottom: '0px !important',
                     display: 'flex',
                     flexDirection: 'column',
                     flex: 0.5,
                  }}
               >
                  <Box marginBottom={2.5}>
                     <TypographyFHG variant='fs20700' color='text.primary' id='gamePlan.goal.measurables' />
                  </Box>
                  <Box
                     className={classes.editor}
                     style={{
                        width: '100%',
                     }}
                  >
                     {id && <Editor name='summary' value={summary} onChange={setSummary} id={id} />}
                  </Box>
               </Box>
            </Box>
            <Box
               style={{
                  display: 'flex',
                  justifyContent: 'end',
               }}
               marginTop={2.5}
            >
               <OutLineButton label='Cancel' onClick={onClose} />
               <Box width={10 * SCALE_APP} />
               <FillButton label='Save' onClick={handleSave} disabled={isToggle} />
            </Box>
         </Wrapper>
      </Grid2>
   );
};

export default FormAddGoal;
