import {useCallback, useState} from 'react';

export const useWhoWeServe = () => {
   const [whoWeServe, setWhoWeServe] = useState(
      `
      <TypographyFHG variant='fs18400' color='secondary'>
                              Let’s talk about who you service as a company. Be specific here according to target market
                              and geographic location
                           </TypographyFHG>
                           <br />
                           <TypographyFHG variant='fs18700' color='secondary'>
                              Target Market:
                           </TypographyFHG>
                           <ul>
                              <li>Age:</li>
                              <li>Gender:</li>
                           </ul>
                           <TypographyFHG variant='fs18700' color='secondary'>
                              Geographic:
                           </TypographyFHG>
                           <ul>
                              <li>State:</li>
                              <li>Country:</li>
                           </ul>`
   );

   const [editableWhoWeServe, setEditableWhoWeServe] = useState(false);

   const toggleEditableWhoWeServe = useCallback(() => {
      setEditableWhoWeServe((prev) => !prev);
   }, []);

   const handleChangeWhoWeServe = useCallback(
      (content) => () => {
         setWhoWeServe(content);
         toggleEditableWhoWeServe();
      },
      [toggleEditableWhoWeServe]
   );

   return {whoWeServe, setWhoWeServe, editableWhoWeServe, toggleEditableWhoWeServe, handleChangeWhoWeServe};
};
