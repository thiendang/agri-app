import PropTypes from 'prop-types';
import {useIntl} from 'react-intl';
import {useSetRecoilState} from 'recoil';
import {titleStatus} from '../components/WebAppBar';
import {formatMessage} from '../utils/Utils';
import {useEffect} from 'react';
import {Mixpanel} from '../utils/Mixpanel';

/**
 * The component used as a placeholder for not implemented components.
 *
 * Reviewed:
 */
export default function usePageTitle({title, titleKey, values}) {
   const intl = useIntl();
   const setTitleStatus = useSetRecoilState(titleStatus);

   useEffect(() => {
      return () => {
         setTitleStatus({titleKey: undefined, titleValues: undefined});
         document.title = '';
      };
   }, [setTitleStatus]);

   useEffect(() => {
      const appTitle = formatMessage(intl, 'application.title', '');
      const titleLabel = titleKey ? formatMessage(intl, titleKey, title, values) : title || '';
      setTitleStatus((status) => ({...status, titleKey, titleValues: values}));

      const pageTitle = appTitle ? `${appTitle} - ${titleLabel}` : titleLabel;
      document.title = pageTitle;

      Mixpanel.track('page_view', {page: pageTitle});
   }, [title, titleKey, values, intl, setTitleStatus]);
}

usePageTitle.propTypes = {
   appTitleKey: PropTypes.string,
   title: PropTypes.string,
   titleKey: PropTypes.string,
   values: PropTypes.any,
};
