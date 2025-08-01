import {List, Button} from '@mui/material';
import {ListItem} from '@mui/material';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import makeStyles from '@mui/styles/makeStyles';
import {AddCircleOutlineOutlined} from '@mui/icons-material';
import {Delete, Close} from '@mui/icons-material';
import {Edit} from '@mui/icons-material';
import update from 'immutability-helper';
import {map} from 'lodash';
import {omit} from 'lodash';
import {defer} from 'lodash';
import {useRef} from 'react';
import React, {useState, useCallback} from 'react';
import {useEffect} from 'react';
import {useNavigate, useLocation} from 'react-router-dom';
import {validate} from 'uuid';
import {v4 as uuid} from 'uuid';
import TextFieldLF from '../../../components/TextFieldLF';
import {getSeatCacheQueries} from '../../../data/QueriesGL';
import {SEAT_CREATE_UPDATE} from '../../../data/QueriesGL';
import {SEAT_BY_ID_QUERY} from '../../../data/QueriesGL';
import ButtonFHG from '../../../fhg/components/ButtonFHG';
import Form from '../../../fhg/components/edit/Form';
import Prompt from '../../../fhg/components/edit/Prompt';
import useEditData from '../../../fhg/components/edit/useEditData';
import Grid from '../../../fhg/components/Grid';
import DragItem from '../../../fhg/components/list/DragItem';
import ProgressButton from '../../../fhg/components/ProgressButton';
import TypographyFHG from '../../../fhg/components/Typography';
import useMutationFHG from '../../../fhg/hooks/data/useMutationFHG';
import useQueryFHG from '../../../fhg/hooks/data/useQueryFHG';
import {useCustomSearchParams} from '../../../fhg/hooks/useCustomSearchParams';
import useKeyDown from '../../../fhg/hooks/useKeyDown';
import {cacheUpdate} from '../../../fhg/utils/DataUtil';
import {removeOne} from '../../../fhg/utils/Utils';

const useStyles = makeStyles(
   (theme) => ({
      paperStyle: {
         maxHeight: `calc(100% - 1px)`,
         margin: theme.spacing(0, 0, 0, 2),
      },
      formStyle: {
         maxHeight: '100%',
         overflow: 'hidden',
         // minHeight: 320,
         width: '100%',
         display: 'flex',
         flexDirection: 'column',
      },
      infoRootStyle: {
         height: 'fit-content',
         '& > *': {
            marginRight: theme.spacing(1),
         },
         overflow: 'auto',
         marginBottom: theme.spacing(1),
      },
      fileFrameStyle: {
         height: 'fit-content',
         // minHeight: 180,
         // maxHeight: '50%',
         '& > *': {
            marginRight: theme.spacing(1),
         },
         overflow: 'auto',
         marginBottom: theme.spacing(1),
      },
      infoInnerStyle: {
         padding: theme.spacing(0, 2),
         // minHeight: 200,
      },
      buttonPanelStyle: {
         marginLeft: -8,
         borderTop: `solid 1px ${theme.palette.divider}`,
         padding: theme.spacing(2),
         '& > *': {
            marginRight: theme.spacing(1),
         },
      },
      titleStyle: {
         padding: theme.spacing(3, 2, 0),
      },
      frameStyle: {
         // padding: theme.spacing(4, 0),
      },
      '::placeholder': {
         color: '#707070 !important',
      },
      dividerStyle: {
         marginBottom: theme.spacing(2),
         width: '100%',
      },
      uploadStyle: {
         position: 'sticky',
         bottom: 0,
         backgroundColor: theme.palette.background.paper,
         marginTop: theme.spacing(2),
         padding: theme.spacing(0, 2),
      },
      fadeArea: {
         cursor: 'default',
         '&:hover $fadeIn': {
            opacity: 1,
            transition: '1s',
            transitionDelay: '0.2s',
         },
      },
      fadeIn: {
         opacity: 0,
         marginTop: 'auto',
         marginBottom: 'auto',
      },
      descriptionStyle: {
         '& p': {
            marginBlockStart: 0,
            marginBlockEnd: 0,
         },
      },
   }),
   {name: 'SeatEditStyles'}
);

export default function SeatEdit() {
   const [{entityId}, , searchAsString] = useCustomSearchParams();
   const classes = useStyles();
   const navigate = useNavigate();
   const location = useLocation();
   const seatId = location?.state?.id;
   const isNew = !seatId;
   const parentSeatId = !seatId && location?.state?.parentSeatId;

   const editItem = {
      id: uuid(),
      name: '',
      seatId: parentSeatId,
      userIdList: null,
      entityId,
   };
   const [isSaving, setIsSaving] = useState(false);

   const [
      editValues,
      handleChange,
      {setEditValues, isChanged = false, setIsChanged, defaultValues, setDefaultValues, resetValues},
   ] = useEditData(isNew ? editItem : undefined, isNew ? ['id', 'seatId', 'entityId'] : undefined);
   const [isEditing, setEditing] = useState(undefined);
   const responsibilitiesRef = useRef([]);
   const [isRoleChanged, setIsRoleChanged] = useState(false);
   const [refresh, setRefresh] = useState(Date.now());

   const [
      ,
      handleRoleChange,
      {getValue: getRoleValue, setDefaultValues: setDefaultRoleValues, resetValues: resetRoleValues},
   ] = useEditData();

   const [seatData] = useQueryFHG(SEAT_BY_ID_QUERY, {variables: {seatId}, skip: !validate(seatId)}, 'seat.type');

   const [seatCreateUpdate] = useMutationFHG(SEAT_CREATE_UPDATE);

   useEffect(() => {
      if (seatData?.seat) {
         const responsibilities = seatData?.seat?.responsibilities || [];
         setDefaultValues(seatData?.seat);
         responsibilitiesRef.current = map(responsibilities, (item) => omit(item, '__typename'));
         setRefresh(Date.now());
      }
   }, [seatData, setDefaultValues]);

   const handleClose = useCallback(() => {
      resetValues();
      defer(() => {
         navigate(
            {pathname: '..', search: searchAsString},
            {replace: true, state: {edit: undefined, id: undefined, selectSeatId: parentSeatId}}
         );
      });
   }, [resetValues, navigate, location, parentSeatId]);

   useKeyDown(handleClose);

   const handleSubmit = useCallback(async () => {
      if (isChanged || isRoleChanged) {
         try {
            let variables = {...editValues};
            if (isRoleChanged) {
               variables.responsibilities = responsibilitiesRef.current;
            }
            setIsSaving(true);
            await seatCreateUpdate({
               variables,
               optimisticResponse: {
                  __typename: 'Mutation',
                  seat: {
                     __typename: 'Seat',
                     ...defaultValues,
                     ...variables,
                     entityId,
                     seatId: parentSeatId || '',
                     isDeleted: false,
                  },
               },
               update: isNew ? cacheUpdate(getSeatCacheQueries(entityId), editValues.id, 'seat') : undefined,
            });
            navigate(location, {replace: true, state: {...location.state, id: editValues.id}});
            setIsChanged(false);
            setEditValues({});
            setDefaultValues(editValues);
            handleClose();
         } catch (e) {
            //Intentionally left blank
         } finally {
            setIsSaving(false);
         }
      } else {
         handleClose();
      }
   }, [
      isChanged,
      isRoleChanged,
      refresh,
      editValues,
      seatCreateUpdate,
      defaultValues,
      entityId,
      parentSeatId,
      isNew,
      location,
      navigate,
      setIsChanged,
      setEditValues,
      setDefaultValues,
      handleClose,
   ]);

   const handleDeleteRole = (index) => () => {
      removeOne(responsibilitiesRef.current, index);
      setIsRoleChanged(true);
      setRefresh(Date.now());
   };

   const handleRoleEdit = (index) => () => {
      setDefaultRoleValues({...responsibilitiesRef.current[index]});
      setEditing(index);
   };

   const handleRoleClose = () => {
      if (responsibilitiesRef.current?.[responsibilitiesRef.current?.length - 1] === '') {
         responsibilitiesRef.current.pop();
      }
      resetRoleValues();
      setEditing(undefined);
   };

   const handleAddResponsibility = () => {
      responsibilitiesRef.current.push('');
      setEditing(responsibilitiesRef.current.length - 1);
      setRefresh(Date.now());
   };

   const handleRoleSubmit = () => {
      const name = getRoleValue('name');
      const description = getRoleValue('description');

      if (name === '' || name === undefined) {
         handleDeleteRole(isEditing)();
      } else {
         responsibilitiesRef.current[isEditing] = {name, description};
         setIsRoleChanged(true);
         setRefresh(Date.now());
         resetRoleValues();
      }
      setEditing(undefined);
   };

   const handleKey = (event) => {
      if (event.key === 'Escape') {
         event.preventDefault();
         handleRoleClose();
      } else if (event.key === 'Enter') {
         event.preventDefault();
         const index = isEditing;
         handleRoleSubmit();
         if (index < responsibilitiesRef.current?.length - 1) {
            handleRoleEdit(index + 1)();
         }
      } else if (event.key === 'Tab') {
         if (event.target.name === 'description') {
            event?.preventDefault();
            event?.stopPropagation();
            const index = isEditing;

            handleRoleSubmit();
            if (index < responsibilitiesRef.current?.length - 1) {
               handleRoleEdit(index + 1)();
            }
         }
      }
   };
   useKeyDown(handleClose);

   const move = useCallback((dragIndex, hoverIndex) => {
      const responsibilities = [...(responsibilitiesRef.current || [])];

      responsibilitiesRef.current = update(responsibilities, {
         $splice: [
            [dragIndex, 1],
            [hoverIndex, 0, responsibilities[dragIndex]],
         ],
      });
      setIsRoleChanged(true);
      setRefresh(Date.now());
   }, []);

   return (
      <Grid
         container
         fullWidth
         fullHeight
         className={classes.frameStyle}
         direction={'column'}
         overflow={'visible'}
         wrap={'nowrap'}
      >
         <TypographyFHG
            variant={'h5'}
            id={'seat.title.label'}
            color={'textSecondary'}
            gutterBottom
            className={classes.titleStyle}
         />
         <Form onSubmit={handleSubmit} className={classes.formStyle}>
            <Prompt when={isChanged} />
            <Grid name={'Seat Edit Root'} container item fullWidth className={classes.infoRootStyle}>
               <Grid name={'Seat Edit Root'} container item fullWidth className={classes.infoInnerStyle}>
                  <TextFieldLF
                     key={'name' + defaultValues.id}
                     name={'name'}
                     autoFocus
                     required
                     labelKey='seat.name.label'
                     defaultValue={defaultValues.name}
                     value={editValues.name}
                     onChange={handleChange}
                  />
               </Grid>
               <Grid
                  name={'Task Edit Root'}
                  container
                  item
                  fullWidth
                  className={classes.fileFrameStyle}
                  overflow={'visible'}
                  resizable
               >
                  <Divider light className={classes.dividerStyle} />
                  <Box justifyContent='space-between' display='flex' flexDirection='row' flexWrap='nowrap'>
                     <TypographyFHG
                        variant={'h6'}
                        color='textSecondary'
                        id={'seat.responsibilities.label'}
                        className={classes.infoInnerStyle}
                     />
                  </Box>
                  <List key={refresh} dense style={{width: '100%'}}>
                     {responsibilitiesRef.current?.length > 0 &&
                        responsibilitiesRef.current.map((responsibility, index) => (
                           <DragItem
                              key={'ListItem' + responsibility?.name}
                              index={index}
                              className={classes.fadeArea}
                              move={move}
                              dropItem={responsibility}
                              disable={isEditing !== undefined}
                           >
                              <Box flexDirection={'column'} display={'flex'} width={'100%'}>
                                 <Box
                                    justifyContent='space-between'
                                    alignItems={'center'}
                                    display={isEditing === index ? 'none' : 'flex'}
                                    flexDirection='row'
                                    flexWrap='nowrap'
                                    width={'100%'}
                                    onDoubleClick={handleRoleEdit(index)}
                                 >
                                    <Box display={'flex'} flexDirection={'column'}>
                                       <TypographyFHG style={{cursor: 'move', fontWeight: 600}} variant={'body2'}>
                                          {responsibility.name || 'Untitled'}
                                       </TypographyFHG>
                                       <TypographyFHG
                                          className={classes.descriptionStyle}
                                          style={{marginLeft: 8}}
                                          variant={'body2'}
                                          id={'break.message'}
                                          hasLineBreaks
                                          values={{message: responsibility.description}}
                                       />
                                    </Box>
                                    <Box
                                       justifyContent='space-between'
                                       display={isEditing === undefined ? 'flex' : 'none'}
                                       flexDirection='row'
                                       flexWrap='nowrap'
                                       className={classes.fadeIn}
                                    >
                                       <IconButton
                                          size={'small'}
                                          style={{marginRight: 8}}
                                          onClick={handleRoleEdit(index)}
                                       >
                                          <Edit style={{fontSize: 16}} />
                                       </IconButton>
                                       <IconButton size={'small'} onClick={handleDeleteRole(index)}>
                                          <Delete style={{fontSize: 16}} />
                                       </IconButton>
                                    </Box>
                                 </Box>
                                 <Box
                                    display={isEditing === index ? 'flex' : 'none'}
                                    flexDirection={'column'}
                                    width={'100%'}
                                    flex={'1 1 auto'}
                                    position={'relative'}
                                 >
                                    <Box position={'absolute'} right={8} flex={'0 0'} marginTop={-1}>
                                       <IconButton size={'small'} onClick={handleRoleClose}>
                                          <Close style={{fontSize: 16}} />
                                       </IconButton>
                                    </Box>
                                    <Box display={'flex'} flexDirection={'column'} flex={'1 1'} width={'100%'}>
                                       <TextFieldLF
                                          name='name'
                                          labelKey={'seat.role.label'}
                                          value={getRoleValue('name')}
                                          onFocus={({target}) => target.select()}
                                          onKeyDown={handleKey}
                                          autoFocus
                                          style={{marginRight: 8}}
                                          onChange={handleRoleChange}
                                          size='small'
                                       />
                                       <TextFieldLF
                                          name='description'
                                          labelKey={'seat.roleDescription.label'}
                                          value={getRoleValue('description')}
                                          onChange={handleRoleChange}
                                          multiline
                                          rows={2}
                                          rowsMax={4}
                                       />
                                    </Box>
                                    <Box display='flex' flexDirection='row' justifyContent={'flex-start'}>
                                       <Button
                                          size={'small'}
                                          onClick={handleRoleSubmit}
                                          variant={'contained'}
                                          color={'primary'}
                                       >
                                          Ok
                                       </Button>
                                    </Box>
                                 </Box>
                              </Box>
                           </DragItem>
                        ))}
                     <ListItem
                        onClick={handleAddResponsibility}
                        style={{
                           display: isEditing !== undefined ? 'none' : undefined,
                           color: '#A3A3A3',
                           cursor: 'pointer',
                        }}
                     >
                        <AddCircleOutlineOutlined style={{marginRight: 4}} />
                        <TypographyFHG id={'seat.addRole.label'} />
                     </ListItem>
                  </List>
               </Grid>
            </Grid>
            <Grid
               container
               item
               direction={'row'}
               fullWidth
               className={classes.buttonPanelStyle}
               overflow={'visible'}
               resizable={false}
            >
               <ProgressButton
                  isProgress={isSaving}
                  variant='text'
                  color='primary'
                  type={'submit'}
                  size='large'
                  labelKey='save.label'
                  disabled={isSaving || !(isChanged || isRoleChanged)}
               />
               <ButtonFHG
                  variant='text'
                  size={'large'}
                  labelKey={'cancel.button'}
                  disabled={isSaving}
                  onClick={() => handleClose()}
               />
            </Grid>
         </Form>
      </Grid>
   );
}
