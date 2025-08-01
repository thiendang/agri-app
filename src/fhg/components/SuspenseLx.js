import React from 'react';
import Loading from './Loading';

export default function SuspenseLx({e, C, children}) {
   return (
      <React.Suspense fallback={<Loading isLoading />}>
         {C && <C />}
         {e}
         {children}
      </React.Suspense>
   );
}
