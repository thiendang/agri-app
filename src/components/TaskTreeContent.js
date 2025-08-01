import IconButton from '@mui/material/IconButton';
import {useTheme} from '@mui/material/styles';
import {Edit} from '@mui/icons-material';
import {Delete} from '@mui/icons-material';
import * as PropTypes from 'prop-types';
import React from 'react';
import {TASK_EDIT} from '../Constants';
import {TASK_DELETE} from '../data/QueriesGL';
import {getTaskCacheQueries} from '../data/QueriesGL';
import ConfirmIconButton from '../fhg/components/ConfirmIconButton';
import Grid from '../fhg/components/Grid';
import TypographyFHG from '../fhg/components/Typography';
import useMutationFHG from '../fhg/hooks/data/useMutationFHG';
import {useCustomSearchParams} from '../fhg/hooks/useCustomSearchParams';
import useNavigateSearch from '../fhg/hooks/useNavigateSearch';
import {cacheDelete} from '../fhg/utils/DataUtil';

TaskTreeContent.propTypes = {
   classes: PropTypes.any,
   task: PropTypes.any,
};

export default function TaskTreeContent({task, classes}) {
   const [{clientId}] = useCustomSearchParams();
   const navigate = useNavigateSearch();
   const theme = useTheme();

   const [taskDelete] = useMutationFHG(TASK_DELETE);

   const handleEditTask = (event) => {
      if (event) {
         event.stopPropagation();
         event.preventDefault();
      }

      navigate(TASK_EDIT, {replace: true}, {id: task.id});
   };

   const handleDeleteTask = async (event) => {
      if (event) {
         event.stopPropagation();
         event.preventDefault();
      }
      await taskDelete({
         variables: {id: task.id},
         optimisticResponse: {task_Delete: 1},
         update: cacheDelete(getTaskCacheQueries(clientId), task.id),
      });
   };

   return (
      <Grid container direction={'row'} justifyContent={'space-between'} className={classes.fadeArea} wrap={'nowrap'}>
         <Grid item>
            <TypographyFHG
               variant='subtitle1'
               color={'textPrimary'}
               className={classes.treeLabelStyle}
               onClick={handleEditTask}
            >
               {task?.subject}
            </TypographyFHG>
         </Grid>
         <Grid item resizable={false}>
            <ConfirmIconButton
               className={`${classes.fadeIn} ${classes.deleteButtonStyle}`}
               onConfirm={handleDeleteTask}
               values={{type: 'task', name: task?.subject}}
               messageKey={'confirmRemoveValue.message'}
               buttonLabelKey={'delete.button'}
               size={'small'}
               submitStyle={classes.deleteColorStyle}
               style={{float: 'right'}}
               buttonTypographyProps={{
                  color: theme.palette.error.dark,
                  style: {textDecoration: 'underline'},
               }}
            >
               <Delete fontSize={'small'} />
            </ConfirmIconButton>
            <IconButton size={'small'} onClick={handleEditTask} className={classes.fadeIn}>
               <Edit fontSize={'small'} />
            </IconButton>
         </Grid>
      </Grid>
   );
}
