import React, {useCallback, useRef} from 'react';
import ReactQuill, {Quill} from 'react-quill';
import Emoji from 'quill-emoji';
import {makeStyles, useTheme} from '@mui/styles';
import {Box} from '@mui/material';
import {SCALE_APP} from '../../../Constants';
import moment from 'moment';
import {Storage} from 'aws-amplify';
import {makeid, S3_URL} from '../chat/AddFilePopup';
import {useRecoilValue} from 'recoil';
import {userStatus} from '../../../fhg/components/security/AuthenticatedUser';
// import 'react-quill/dist/quill.snow.css';
// import 'quill-emoji/dist/quill-emoji.css';

Quill.register('modules/emoji', Emoji);

const useStyles = makeStyles((theme) => ({
   container: {
      '& .text-editor .quill > .ql-snow': {
         borderWidth: '0px',
         height: 236 * SCALE_APP,
      },
      '& .text-editor > .toolbar-common': {
         paddingLeft: '0px',
      },
      '& .toolbar-common > *': {
         paddingLeft: '0px',
         stroke: `${theme.palette.primary.main}`,
      },
      '& > .ql-snow ': {
         stroke: `${theme.palette.primary.main}`,
      },
      '& .ql-editor': {
         backgroundColor: theme.palette.background.paper4,
      },
   },
}));

const CustomToolbar = ({idToolBar}) => (
   <div id={idToolBar} className='toolbar-common'>
      <button className='ql-bold' />
      <button className='ql-italic' />
      <button className='ql-underline' />
      <button className='ql-link' />
      <button className='ql-image' />
      <button className='ql-emoji' />
      <button className='ql-list' value='ordered' />
      <button className='ql-list' value='bullet' />
      <button className='ql-indent' value='-1' />
      <button className='ql-indent' value='+1' />
   </div>
);

const Editor = ({value, onChange, id}) => {
   const classes = useStyles();
   const theme = useTheme();
   const quillRef = useRef(null);
   const user = useRecoilValue(userStatus);

   const handleFile = useCallback(async (file, blob) => {
      let upload = null;
      try {
         if (typeof file !== 'undefined' && file) {
            const ext = file.name.substring(file.name.lastIndexOf('.') + 1, file.name.length);
            const fileName = `${moment().unix() + makeid(5)}.${ext}`;
            const insertKey = `user/${user.id}-${fileName}`;

            upload = await Storage.put(insertKey, file, {
               level: 'public',
               contentType: file.type,
               errorCallback: (err) => {
                  console.error('Unexpected error while uploading', err);
               },
               contentEncoding: 'base64',
            });
            console.log('upload', upload);

            const url = `${S3_URL}${insertKey}`;
            return url;
         } else {
            return null;
         }
      } catch (err) {
         Storage.cancel(upload);
         console.log(err);
         return null;
      }
   }, []);

   const imageHandler = useCallback(() => {
      const input = document.createElement('input');
      input.setAttribute('type', 'file');
      input.setAttribute('accept', 'image/*');
      input.click();
      input.onchange = async () => {
         if (input !== null && input.files !== null) {
            const file = input.files[0];
            const url = await handleFile(file);
            const quill = quillRef.current;
            if (quill) {
               const range = quill.getEditorSelection();
               range && quill.getEditor().insertEmbed(range.index, 'image', url);
            }
         }
      };
   }, []);

   const modules = {
      toolbar: {
         container: `#${id}`,
         handlers: {
            image: imageHandler,
         },
      },
      clipboard: {
         matchVisual: false,
      },
      'emoji-toolbar': true,
      'emoji-shortname': true,
   };

   return (
      <Box className={classes.container}>
         <div className='text-editor'>
            <ReactQuill
               ref={quillRef}
               theme='snow'
               value={value}
               onChange={onChange}
               modules={modules}
               style={{
                  fontSize: 18 * SCALE_APP,
                  fontWeight: '400',
                  color: theme.palette.text.primary,
               }}
            />
            <CustomToolbar idToolBar={id} />
         </div>
      </Box>
   );
};

export default Editor;
