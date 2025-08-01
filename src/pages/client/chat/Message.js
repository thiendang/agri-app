import React, {useCallback, useEffect, useState} from 'react';
import {isAudioURL, isImageURL} from '../../../utils/helpers';
import MessageText from './MessageText';
import MessageFile from './MessageFile';
import MessageImage from './MessageImage';
import MessageAudio from './MessageAudio';

const TYPE_MESSAGE = {
   text: 'text',
   image: 'image',
   file: 'file',
   audio: 'audio',
};

/**
 *  Message component
 * @param type message type
 * @param data data of message
 * @param read message status
 * @return {JSX.Element}
 * @constructor
 */
const Message = ({type, data, read}) => {
   const [typeMsg, setTypeMsg] = useState(null);

   const checkType = useCallback(async () => {
      if (data?.text) {
         return setTypeMsg(TYPE_MESSAGE.text);
      }
      if (data?.media) {
         const isImage = await isImageURL(data?.media);
         const isAudio = await isAudioURL(data?.media);
         if (isAudio) return setTypeMsg(TYPE_MESSAGE.audio);
         return setTypeMsg(isImage ? TYPE_MESSAGE.image : TYPE_MESSAGE.file);
      }
   }, [data?.media, data?.text]);

   useEffect(() => {
      checkType();
   }, [checkType]);

   if (typeMsg === TYPE_MESSAGE.text) return <MessageText type={type} data={data} read={read} />;
   if (typeMsg === TYPE_MESSAGE.file) return <MessageFile type={type} data={data} read={read} />;
   if (typeMsg === TYPE_MESSAGE.image) return <MessageImage type={type} data={data} read={read} />;
   if (typeMsg === TYPE_MESSAGE.audio) return <MessageAudio type={type} data={data} read={read} />;
   return null;
};

export default Message;
