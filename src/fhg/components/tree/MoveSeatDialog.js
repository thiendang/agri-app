import {useState} from 'react';
import React from 'react';
import useMoveSeats from '../../hooks/useMoveSeats';
import ModalDialog from '../dialog/ModalDialog';
import AutocompleteMatchLXData from '../edit/AutocompleteMatchLXData';

/**
 * Dialog to move a seat to a new parent seat.
 *
 * @param seat The seat to move.
 * @param parent The parent of the seat to move.
 * @param onClose The callback when the dialog is closed. (The dialog will not close itself.)
 * @param onSubmit The callback when the new parent is selected and submitted.
 * @return {JSX.Element}
 * @constructor
 */
export default function MoveSeatDialog({seat, parent, onClose, onSubmit}) {
   const [newParent, setNewParent] = useState();
   const currentSeats = useMoveSeats(seat, parent, true);

   /**
    * Submit the changes to the callback.
    */
   const handleSubmit = () => {
      onSubmit(seat, newParent);
   };

   /**
    * OnChange for the autocomplete, store the new parent selected.
    * @param event The selection event.
    * @param newParent The new parent seat.
    */
   const handleChange = (event, newParent) => {
      setNewParent(newParent);
   };

   return (
      <ModalDialog
         open={true}
         onClose={onClose}
         onSubmit={handleSubmit}
         titleKey={'seat.moveSeat.title'}
         messageKey={'seat.moveSeat.message'}
         messageValues={{seatName: seat?.name}}
         submitKey={'seat.moveSeat.button'}
         maxWidth={'sm'}
         fullWidth={true}
         isEnabled={!!newParent}
      >
         <AutocompleteMatchLXData
            name={'name'}
            variant={'standard'}
            options={currentSeats}
            labelKey='seat.seat.label'
            onChange={handleChange}
            matchSorterProps={{keys: ['name']}}
         />
      </ModalDialog>
   );
}
