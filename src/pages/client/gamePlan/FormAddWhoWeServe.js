import React, {useCallback} from 'react';
import {BORDER_RADIUS_10} from '../../../Constants';
import {SCALE_APP} from '../../../Constants';
import FillButton from './FillButton';
import OutLineButton from './OutLineButton';
import Editor from './Editor';
import {useToggle} from './hooks/useToggle';
import {useIntl} from 'react-intl';
import {formatMessage} from '../../../fhg/utils/Utils';
import {makeStyles} from '@mui/styles';
import {Box} from '@mui/material';

const useStyles = makeStyles((theme) => ({
   editor: {
      position: 'relative',
      '& .text-editor > .toolbar-common': {
         height: 45 * SCALE_APP,
         position: 'absolute',
         display: 'flex',
         alignItems: 'center',
         width: '100%',
         bottom: -50 * SCALE_APP,
      },
      '& .text-editor .quill > .ql-snow': {
         height: 412 * SCALE_APP,
      },
   },
}));

const FormAddWhoWeServe = ({data, onCancel, onSubmit}) => {
   const classes = useStyles();

   const [value, setValue] = React.useState(data);

   const {isToggle, toggle} = useToggle();

   const handleSubmit = useCallback(async () => {
      toggle();
      const done = await onSubmit(value)();
      toggle();
      done && onCancel();
   }, [onCancel, onSubmit, value, toggle]);

   const intl = useIntl();

   return (
      <Box display='flex' flexDirection='column' marginTop={10 / 8}>
         <Box className={classes.editor}>
            <Editor onChange={setValue} value={value} id='FormAddWhoWeServe' />
         </Box>
         <Box display='flex' justifyContent='end' marginBottom={10 / 8} marginTop={10 / 8}>
            <OutLineButton label={formatMessage(intl, 'cancel.button')} onClick={onCancel} />
            <Box width={10 * SCALE_APP} />
            <FillButton label={formatMessage(intl, 'save.label')} onClick={handleSubmit} disabled={isToggle} />
         </Box>
      </Box>
   );
};

export default FormAddWhoWeServe;
