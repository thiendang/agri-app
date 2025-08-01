import {atom} from 'recoil';

export const TYPE_RIGHT = {
   editing: 'editing',
   new: 'new',
   report: 'report',
};

export const currentChatEditingStore = atom({
   key: 'currentChatRoomEditing',
   default: null,
});

export const typeForRightSideStore = atom({
   key: 'typeForRightSide',
   default: TYPE_RIGHT.new,
});

export const listChatRoomsStore = atom({
   key: 'listChatRoom',
   default: [],
});
