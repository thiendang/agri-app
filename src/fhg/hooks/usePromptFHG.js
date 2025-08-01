import uniqueId from 'lodash/uniqueId';
import PropTypes from 'prop-types';
import {useRef} from 'react';
import useMessage from './useMessage';
import usePrompt from './usePrompt';

useMessage.propTypes = {
   messageKey: PropTypes.string, // The id of the localized message.
   defaultMessage: PropTypes.string, // The default message if not localized.
   values: PropTypes.array, // Values to insert in the localized message.
};

export default function usePromptFHG(when, messageKey = 'leavePage', messageProp, values) {
   const message = useMessage(messageKey, messageProp, values);
   const uniqueIdRef = useRef(uniqueId()).current;

   return usePrompt(message, when, uniqueIdRef);
}
