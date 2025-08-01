import {stringify} from 'query-string';
import {useMemo} from 'react';
import * as React from 'react';
import {Link} from 'react-router-dom';

/**
 * The Link like react-router-dom link. The difference is that search can be an object and is a separate param.
 *
 * @param to {string} The pathname of the Link
 * @param search {string | object} The search for the Link
 * @param props All the remaining props are passed to Link
 * @return {Element} The Link element.
 * @constructor
 */
const LinkFHG = React.forwardRef(function LinkFHG({to, search, ...props}, ref) {
   const theTo = useMemo(() => {
      if (search && typeof to === 'string') {
         let searchString = typeof search === 'object' ? stringify(search, {skipNull: true}) : search;
         return {pathname: to, search: searchString};
      }
      return to;
   }, [search, to]);

   return <Link ref={ref} to={theTo} {...props} />;
});

export default LinkFHG;
