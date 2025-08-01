import React from 'react';
import {SCALE_APP} from '../../../Constants';
import {BUSINESS_PLAN_EDIT} from '../../../components/permission/PermissionAllow';
import usePermission from '../../../components/permission/usePermission';
import TypographyFHG from '../../../fhg/components/Typography';
import EditIcon from './EditIcon';
import {useToggle} from './hooks/useToggle';
import FormAddCoreValue from './FormAddCoreValue';
import {useTheme} from '@mui/styles';
import {Box, Divider} from '@mui/material';
import DragIndicatorIcon from '@mui/icons-material/DragIndicatorRounded';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';

const CoreValueItem = ({data, onRemove, onUpdate, onCreate}) => {
   const hasPermission = usePermission(BUSINESS_PLAN_EDIT);
   const theme = useTheme();
   const {name, description} = data ?? {};
   const {isToggle, toggle} = useToggle();
   if (isToggle)
      return (
         <Box flex={1}>
            <FormAddCoreValue data={data} onCancel={toggle} onSubmit={onUpdate} onCreate={onCreate} />
         </Box>
      );
   return (
      <Box flex={1}>
         <Box
            style={{
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'space-between',
            }}
            paddingTop={2.5}
            paddingBottom={2}
         >
            <Box
               style={{
                  display: 'flex',
                  alignItems: 'center',
                  flex: 0.6,
               }}
            >
               {hasPermission && (
                  <DragIndicatorIcon
                     style={{
                        color: theme.palette.primary.main,
                        marginRight: theme.spacing(2),
                        display: hasPermission ? 'block' : 'none',
                     }}
                  />
               )}
               <TypographyFHG variant='fs18700' color='text.primary'>
                  {name}
               </TypographyFHG>
            </Box>
            <Box
               style={{
                  display: 'flex',
                  flex: 0.4,
                  justifyContent: 'space-between',
               }}
            >
               <Box flex={0.8}>
                  <TypographyFHG variant='fs18400' color='text.primary'>
                     {description}
                  </TypographyFHG>
               </Box>
               <Box display={hasPermission ? 'flex' : 'none'} flex={0.2} alignItems='center'>
                  <EditIcon onClick={toggle} />
                  <Box width={10 * SCALE_APP} />
                  <DeleteOutlineOutlinedIcon
                     style={{
                        width: 18 * SCALE_APP,
                        height: 18 * SCALE_APP,
                        color: theme.palette.primary.main,
                     }}
                     onMouseDown={onRemove(data.id)}
                  />
               </Box>
            </Box>
         </Box>
         <Divider />
      </Box>
   );
};

export default CoreValueItem;
