import {useEffect} from 'react';
import React from 'react';
import {Outlet} from 'react-router-dom';
import {useRecoilValue} from 'recoil';
import {FRANCHISE_EDIT} from '../Constants';
import {useCustomSearchParams} from '../fhg/hooks/useCustomSearchParams';
import useNavigateSearch from '../fhg/hooks/useNavigateSearch';
import usePageTitle from '../fhg/hooks/usePageTitle';
import {userRoleState} from '../pages/Main';

export default function Franchises() {
   const [{franchiseId: franchiseIdProp}] = useCustomSearchParams();
   const {franchiseId: franchiseIdState} = useRecoilValue(userRoleState);
   const useFranchiseId = franchiseIdProp || franchiseIdState;

   const navigate = useNavigateSearch();

   usePageTitle({titleKey: 'franchise.title2.label'});

   useEffect(() => {
      if (useFranchiseId) {
         navigate(FRANCHISE_EDIT, undefined, null);
      }
      // cannot have navigate.
      // eslint-disable-next-line
   }, [useFranchiseId]);

   return <Outlet />;
}
