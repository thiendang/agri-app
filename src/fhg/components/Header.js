import {useEffect, useState} from 'react';

const Header = () => {
   const [isShrunk, setShrunk] = useState(false);

   useEffect(() => {
      const onScroll = () => {
         setShrunk((isShrunk) => {
            if (!isShrunk && (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20)) {
               return true;
            }

            if (isShrunk && document.body.scrollTop < 4 && document.documentElement.scrollTop < 4) {
               return false;
            }

            return isShrunk;
         });
      };

      window.addEventListener('scroll', onScroll);
      return () => window.removeEventListener('scroll', onScroll);
   }, []);

   return;
};

export default Header;
