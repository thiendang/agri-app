import {isObject} from 'lodash';
import {stringify} from 'query-string';
import {useMemo} from 'react';
import React from 'react';
import {Navigate} from 'react-router-dom';
import {useParams} from 'react-router-dom';

export default function Redirect({to, ...options}) {
   const params = useParams();

   const updateTo = useMemo(() => {
      if (to && params && Object.keys(params).length > 0) {
         if (params['*']) {
            delete params['*'];
         }
         const search = stringify(params);
         let updatedPath;

         if (isObject(to)) {
            updatedPath = {...to, search};
         } else {
            updatedPath = {pathname: to, search};
         }
         return updatedPath;
      } else {
         return {pathname: to};
      }
   }, [params, to]);

   return <Navigate to={{...updateTo}} {...options} replace />;
}
