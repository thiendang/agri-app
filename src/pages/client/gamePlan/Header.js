import {makeStyles, useTheme} from '@mui/styles';
import React from 'react';
import {GAME_PLAN_INDEX, SCALE_APP} from '../../../Constants';
import TypographyFHG from '../../../fhg/components/Typography';
// import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import {Box, Popover} from '@mui/material';
import ExportChoiceButton from '../../../components/ExportChoiceButton';
import {useCustomSearchParams} from '../../../fhg/hooks/useCustomSearchParams';
import {DrawerMenuButton} from '../../../components/DrawerMenuButton';

const useStyles = makeStyles((theme) => ({
   title: {
      fontWeight: '700',
      fontSize: 40 * SCALE_APP,
      color: theme.palette.secondary.main,
   },
   subTitle: {
      fontWeight: '700',
      fontSize: 18 * SCALE_APP,
      color: theme.palette.primary.main,
      marginLeft: theme.spacing(1),
   },
   closeIcon: {
      fontSize: 25 * SCALE_APP,
      position: 'absolute',
      //   right: 10,
      //   top: 10,
      color: theme.palette.primary.main,
   },
   playIcon: {
      marginLeft: theme.spacing(4),
      height: 15 * SCALE_APP,
      width: 18 * SCALE_APP,
      color: theme.palette.primary.main,
   },
   container: {
      display: 'flex',
      alignItems: 'center',
      '&  .MuiPopover-paper': {
         borderRadius: `${15 * SCALE_APP}px !important`,
      },
      justifyContent: 'space-between',
   },
}));

const Header = () => {
   const classes = useStyles();

   const [anchorEl, setAnchorEl] = React.useState(null);

   const [{clientId, entityId}] = useCustomSearchParams();

   const handleClick = (event) => {
      setAnchorEl(event.currentTarget);
   };

   const handleClose = () => {
      setAnchorEl(null);
   };

   const open = Boolean(anchorEl);
   const id = open ? 'simple-popover' : undefined;

   const theme = useTheme();

   return (
      <div className={classes.container}>
         <div style={{position: 'relative', display: 'flex', alignItems: 'center'}}>
            <DrawerMenuButton />
            <TypographyFHG
               className='title-page'
               variant='h4'
               component={'span'}
               id='gamePlan.label'
               style={{
                  fontWeight: 'bold',
                  color: theme.palette.text.primary,
               }}
            />
            {/* <HelpOutlineIcon className={classes.closeIcon} onClick={handleClick} aria-describedby={id} /> */}
         </div>
         <ExportChoiceButton selectedIndex={GAME_PLAN_INDEX} disabled={!entityId || !clientId} />
         <Popover
            id={id}
            open={open}
            anchorEl={anchorEl}
            onClose={handleClose}
            anchorOrigin={{
               vertical: 'top',
               horizontal: 'right',
            }}
         >
            <Box
               style={{
                  maxWidth: 449 * SCALE_APP,
                  backgroundColor: '#FFFFFF',
               }}
               padding={3.125}
            >
               <TypographyFHG color='secondary' variant='fs18400' id='gamePlan.helper.title' />
            </Box>
         </Popover>
      </div>
   );
};

export default Header;
