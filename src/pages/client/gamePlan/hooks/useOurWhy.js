import {useCallback, useState} from 'react';
import {useIntl} from 'react-intl';
import {formatMessage} from '../../../../fhg/utils/Utils';

export const useOurWhy = () => {
   const intl = useIntl();

   const [ourWhy, setOurWhy] = useState({
      title: formatMessage(intl, 'gamePlan.coreValue.title.whyOur'),
      content: formatMessage(intl, 'gamePlan.coreValue.description.whyOur'),
   });

   const [editable, setEditable] = useState(false);

   const toggleEditable = useCallback(() => {
      setEditable((prev) => !prev);
   }, []);

   const handleChangeOurWhy = useCallback(
      (content) => () => {
         setOurWhy(content);
         toggleEditable();
      },
      [toggleEditable]
   );

   return {ourWhy, setOurWhy, editable, toggleEditable, handleChangeOurWhy};
};
