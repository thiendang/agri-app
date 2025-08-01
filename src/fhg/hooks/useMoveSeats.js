import {useMemo} from 'react';
import {useRecoilValue} from 'recoil';
import {seatsState} from '../components/tree/TreeItemFHG';

export default function useMoveSeats(seat, parent, isMovable) {
   const seats = useRecoilValue(seatsState);

   return useMemo(() => {
      const seatsList = [];

      function collectSeats(node) {
         let list;

         if (node?.id === parent?.id) {
            list = parent?.seats;
         } else if (node?.id !== seat?.id) {
            seatsList.push({...node});
            list = node?.seats;
         }
         if (list?.length > 0) {
            for (const theSeat of list) {
               collectSeats(theSeat);
            }
         }
      }
      if (isMovable && seat && parent && seats?.seats?.length > 0) {
         collectSeats(seats);
      }
      return seatsList;
   }, [seat.name, seats]);
}
