import React, {useCallback, useEffect} from 'react';
import {useRecoilValue} from 'recoil';
import {BORDER_RADIUS_10} from '../../../Constants';
import {SCALE_APP} from '../../../Constants';
import {BUSINESS_PLAN_EDIT} from '../../../components/permission/PermissionAllow';
import usePermission from '../../../components/permission/usePermission';
import Grid from '../../../fhg/components/Grid';
import TypographyFHG from '../../../fhg/components/Typography';
import {pollState} from '../../../fhg/hooks/useSubscriptionPath';
import EditIcon from './EditIcon';
import {useGoals} from './hooks/useGoals';
import FormAddGoal from './FormAddGoal';
import GoalItem from './GoalItem';
import {useToggle} from './hooks/useToggle';
import FormEditGoalBottom from './FormEditGoalBottom';
import Wrapper from './Wrapper';
import {
   ENTITY_BY_ID_QUERY,
   ENTITY_UPDATE,
   GOAL_CREATE,
   GOAL_DELETE,
   GOAL_GET,
   GOAL_UPDATE,
   getGoalsRefetchQueries,
} from '../../../data/QueriesGL';
import useMutationFHG from '../../../fhg/hooks/data/useMutationFHG';
import {useCustomSearchParams} from '../../../fhg/hooks/useCustomSearchParams';
import {convertTimeToShortFormat, formatMoneyToNumber} from '../../../components/utils/helpers';
import useQueryFHG from '../../../fhg/hooks/data/useQueryFHG';
import {validate} from 'uuid';
import Loading from '../../../fhg/components/Loading';
import {pick} from 'lodash';
import {useErrorGamePlan} from './hooks/useError';
import {useIntl} from 'react-intl';
import {formatMessage} from '../../../fhg/utils/Utils';
import {useTheme} from '@mui/styles';
import {Box, Button} from '@mui/material';
import ControlPointRoundedIcon from '@mui/icons-material/ControlPointRounded';

const Goals = () => {
   const theme = useTheme();
   const {goals, setCompleted, setGoals} = useGoals();
   const {isToggle, toggle} = useToggle();
   const {isToggle: forBottom, toggle: tBottom} = useToggle();
   const [{entityId}] = useCustomSearchParams();
   const pollInterval = useRecoilValue(pollState);

   const [createGoal, {loading}] = useMutationFHG(GOAL_CREATE);
   const [data, {loading: loadingGet, refetch}] = useQueryFHG(GOAL_GET, {
      variables: {goalSearch: {entityId}},
      skip: !validate(entityId),
      pollInterval,
   });
   const hasPermission = usePermission(BUSINESS_PLAN_EDIT);

   const [entityData] = useQueryFHG(
      ENTITY_BY_ID_QUERY,
      {variables: {entityId}, skip: !validate(entityId)},
      'entity.type',
   );

   const [deleteGoal] = useMutationFHG(GOAL_DELETE);

   const [entityUpdate] = useMutationFHG(ENTITY_UPDATE);

   const {impossibleGoal, impossibleGoalDateTime} = entityData?.entity ?? {};

   const {setError} = useErrorGamePlan();

   const [updateGoalQuery, {loading: loadingUpdate}] = useMutationFHG(GOAL_UPDATE);

   useEffect(() => {
      setGoals(data?.goal_AllWhere ?? []);
   }, [data?.goal_AllWhere, setGoals]);

   const intl = useIntl();

   const handleUpdateImpossible = useCallback(
      async (data) => {
         try {
            if (!entityId)
               return setError({
                  isShow: true,
                  message: formatMessage(intl, 'gamePlan.goal.error.missEntity'),
               });
            await entityUpdate({
               variables: {
                  entityId,
                  entity: {
                     ...pick(entityData?.entity, ['name']),
                     impossibleGoal: data.content,
                  },
               },
            });
            return true;
         } catch (err) {
            return false;
         }
      },
      [entityId, setError, intl, entityUpdate, entityData?.entity],
   );

   const handleDeleteGoal = useCallback(
      (id) => async () => {
         try {
            await deleteGoal({
               variables: {
                  goalId: id,
               },
               refetchQueries: getGoalsRefetchQueries(entityId),
            });
         } catch (error) {}
      },
      [deleteGoal, entityId],
   );

   const onSubmit = useCallback(
      async (values) => {
         try {
            if (!entityId)
               return setError({
                  isShow: true,
                  message: formatMessage(intl, 'gamePlan.goal.error.missEntity'),
               });
            await createGoal({
               variables: {
                  input: {
                     entityId,
                     ...values,
                     revenue: formatMoneyToNumber(values.revenue),
                     profitNetDollars: formatMoneyToNumber(values.profitNetDollars),
                     profitNetPercent: formatMoneyToNumber(values.profitNetPercent),
                  },
               },
            });
            refetch({coreValueSearch: {entityId}});
            toggle();
            return true;
         } catch (e) {
            return false;
         }
      },
      [createGoal, entityId, intl, refetch, setError, toggle],
   );

   const handleEditGoal = useCallback(
      (id) => async (goal) => {
         try {
            if (!id) return;
            if (!entityId || entityId === 'undefined')
               return setError({
                  isShow: true,
                  message: formatMessage(intl, 'gamePlan.goal.error.missEntity'),
               });
            await updateGoalQuery({
               variables: {
                  goalId: id,
                  goal: {
                     ...pick(goal, ['name', 'summary', 'note']),
                     entityId,
                     futureDate: goal.futureDate,
                     revenue: formatMoneyToNumber(goal.revenue),
                     profitNetDollars: formatMoneyToNumber(goal.profitNetDollars),
                     profitNetPercent: formatMoneyToNumber(goal.profitNetPercent),
                  },
               },
            });
            return true;
         } catch (error) {
            return false;
         }
      },
      [entityId, intl, setError, updateGoalQuery],
   );

   const renderBottom = useCallback(() => {
      if (forBottom)
         return (
            <Grid item xs={12}>
               <Wrapper sx={{mt: 1.25}}>
                  <TypographyFHG variant='h5' id='gamePlan.goal.label.impossible' color='text.primary' />
                  <FormEditGoalBottom
                     onClose={tBottom}
                     data={{
                        content: impossibleGoal,
                     }}
                     onSubmit={handleUpdateImpossible}
                  />
               </Wrapper>
            </Grid>
         );

      return (
         <Grid item xs={12}>
            <Wrapper sx={{mt: 2.5}}>
               <Box
                  style={{
                     display: 'flex',
                     justifyContent: 'space-between',
                  }}
               >
                  <TypographyFHG variant='h5' id='gamePlan.goal.label.impossible' color='text.primary' />
                  <Box display='flex' alignItems='center'>
                     <TypographyFHG variant='fs14400' color='text.primary'>
                        {formatMessage(intl, 'gamePlan.goal.lastEdit')}{' '}
                        {convertTimeToShortFormat(impossibleGoalDateTime)}
                     </TypographyFHG>
                     {hasPermission && <EditIcon onClick={tBottom} />}
                  </Box>
               </Box>
               <Box display={'flex'} marginTop={49 / 8}>
                  <div
                     dangerouslySetInnerHTML={{__html: impossibleGoal?.replaceAll('<a href="', '<a href="//') ?? ''}}
                     style={{
                        color: theme.palette.text.primary,
                        fontSize: 18 * SCALE_APP,
                     }}
                  />
               </Box>
            </Wrapper>
         </Grid>
      );
   }, [forBottom, intl, tBottom, impossibleGoal, handleUpdateImpossible, impossibleGoalDateTime, theme]);

   const renderAddButton = useCallback(() => {
      if (hasPermission) {
         return (
            <Grid item xs={12}>
               <Box
                  style={{
                     height: 52 * SCALE_APP,
                     border: `2px dashed ${theme.palette.primary.main}`,
                     display: 'flex',
                     justifyContent: 'center',
                     alignItems: 'center',
                     borderRadius: BORDER_RADIUS_10,
                  }}
               >
                  <Button onClick={toggle}>
                     <Box
                        style={{
                           display: 'flex',
                           alignItems: 'center',
                        }}
                     >
                        <ControlPointRoundedIcon
                           style={{
                              width: 27.5 * SCALE_APP,
                              height: 27.5 * SCALE_APP,
                              color: theme.palette.primary.main,
                              marginRight: theme.spacing(1.25),
                           }}
                        />
                        <TypographyFHG variant='title' color='primary' id='gamePlan.goal.add' />
                     </Box>
                  </Button>
               </Box>
            </Grid>
         );
      } else {
         return null;
      }
   }, [theme.palette.primary.main, toggle]);

   return (
      <Grid item container>
         {(loadingUpdate || loading || loadingGet) && <Loading />}
         {goals.map((goal, index) => {
            return (
               <GoalItem
                  data={goal}
                  key={goal.id}
                  onComplete={setCompleted}
                  onChange={handleEditGoal}
                  onDelete={handleDeleteGoal(goal.id)}
               />
            );
         })}
         {isToggle && <FormAddGoal onClose={toggle} onSubmit={onSubmit} id='add-goal' />}
         {renderAddButton()}
         {renderBottom()}
      </Grid>
   );
};

export default Goals;
