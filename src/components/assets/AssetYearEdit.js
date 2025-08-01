import {Collapse} from '@mui/material';
import moment from 'moment';
import React from 'react';
import {YEAR_FORMAT} from '../../Constants';
import DatePickerFHG2 from '../../fhg/components/DatePickerFHG2';
import TextFieldLF from '../TextFieldLF';

export default function AssetYearEdit({open, onChange, isSaving, defaultValues, getValue}) {
   const handleChange = (moment) => {
      onChange?.({target: {name: 'year'}}, moment, 'date-picker');
   };

   return (
      <Collapse id='datesId' in={open} timeout='auto' unmountOnExit style={{width: '100%'}}>
         <DatePickerFHG2
            name={'year'}
            views={['year']}
            format={YEAR_FORMAT}
            labelKey={'asset.year.label'}
            value={moment(getValue('year'), YEAR_FORMAT)}
            onChange={handleChange}
            disabled={isSaving}
            fullWidth
            required
         />
         <TextFieldLF
            key={'amount' + defaultValues?.id}
            internalKey={'amount' + defaultValues?.id}
            isFormattedNumber
            name={'amount'}
            labelTemplate={'asset.{name}.label'}
            onChange={onChange}
            value={getValue('amount')}
            disabled={isSaving}
            inputProps={{prefix: '$'}}
            required
         />
      </Collapse>
   );
}
