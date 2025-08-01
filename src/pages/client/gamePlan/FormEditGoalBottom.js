import React, {useCallback} from 'react';
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
   },
}));

const FormEditGoalBottom = ({onClose, data, onSubmit}) => {
   const classes = useStyles();
   const [content, setContent] = React.useState(data.content);

   const {isToggle, toggle} = useToggle();

   const handleSubmit = useCallback(async () => {
      toggle();
      await onSubmit({content});
      onClose();
      toggle();
   }, [content, onClose, onSubmit, toggle]);

   const intl = useIntl();

   return (
      <Box>
         <Box width='99%' marginTop={2.5} className={classes.editor}>
            <Editor id={`FormEditGoalBottom`} value={content} onChange={(value) => setContent(value)} />
         </Box>
         <Box display='flex' justifyContent='end' marginTop={1.25}>
            <OutLineButton label={formatMessage(intl, 'cancel.button')} onClick={onClose} />
            <Box width={10 * SCALE_APP} />
            <FillButton loading={isToggle} label='save.label' onClick={handleSubmit} />
         </Box>
      </Box>
   );
};

export default FormEditGoalBottom;
