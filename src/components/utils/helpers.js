import moment from 'moment';
import {v4 as uuidv4} from 'uuid';
import {DATE_SHORT_FORMAT} from '../../Constants';

export const createUUID = () => uuidv4();

// export const formatCurrency = (num, sym) => `${sym}${num?.toLocaleString()}`;

// export const filterMeetingsResolved = (meetings) => {
//    if (!meetings) return [];
//    return meetings?.filter((meeting) => {
//       return meeting?.isCompleted;
//    });
// };

export const convertTimeToShortFormat = (time) => {
   if (!time) return '';
   return moment(time).format(DATE_SHORT_FORMAT);
};

export const convertTimeToLongFormat = (time) => {
   return moment(time ?? new Date()).format('MMMM DD, YYYY');
};

export const formatMoneyToNumber = (value) => {
   if (!value) return 0;
   return Number(String(value)?.replace(/,/g, ''));
};

export const getLatestDate = (dates) => {
   dates?.sort((a, b) => {
      const t1 = moment(a);
      const t2 = moment(b);
      if (t1.isAfter(t2)) return -1;
      if (t1.isBefore(t2)) return 1;
      return 0;
   });
   return (dates || [])?.[0] || '';
};

export const getInitialsName = (string) => {
   var names = string.split(' '),
      initials = names[0].substring(0, 1).toUpperCase();

   if (names.length > 1) {
      initials += names[names.length - 1].substring(0, 1).toUpperCase();
   }
   return initials;
};
