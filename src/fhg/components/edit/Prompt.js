import React from 'react';
import PropTypes from 'prop-types';
import useMessage from '../../hooks/useMessage';
import usePrompt from '../../hooks/usePrompt';

/**
 * The component to prompt the user when leaving the page with unsaved changes.
 *
 * Reviewed:
 * @deprecated Use the hook usePrompt.
 */
export default function Prompt({when, messageKey = 'leavePage', message, values}) {
   const theMessage = useMessage(messageKey, message, values);
   usePrompt(theMessage, when);

   return null;
}

Prompt.propTypes = {
   when: PropTypes.bool.isRequired,
   message: PropTypes.string,
   messageKey: PropTypes.string,
};
