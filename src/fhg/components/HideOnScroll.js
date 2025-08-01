import {useScrollTrigger} from '@mui/material';
import {Slide} from '@mui/material';
import PropTypes from 'prop-types';

export function HideOnScroll({children}) {
   const trigger = useScrollTrigger();

   return (
      <Slide appear={false} direction='down' in={!trigger}>
         {children}
      </Slide>
   );
}

HideOnScroll.propTypes = {
   children: PropTypes.element.isRequired,
};
