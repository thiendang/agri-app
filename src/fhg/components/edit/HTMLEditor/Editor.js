import React from 'react';
import ReactQuill, {Quill} from 'react-quill';
import Emoji from 'quill-emoji';
import {makeStyles} from '@mui/styles';
import {Box} from '@mui/material';
import {PRIMARY_COLOR} from '../../../../Constants';
import {BORDER_RADIUS_10} from '../../../../Constants';
import {SCALE_APP} from '../../../../Constants';
import {useTheme} from '@mui/material/styles';

Quill.register('modules/emoji', Emoji);

const useStyles = makeStyles((theme) => ({
   frameStyle: {
      boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
      border: '2px solid transparent !important',
      borderRadius: BORDER_RADIUS_10,
      '&:focus-within': {
         borderColor: `${PRIMARY_COLOR} !important`,
      },
   },
   // snowContainer: {
   //    '& .quill > .ql-snow': {
   //       borderWidth: '0px',
   //       height: 236 * SCALE_APP,
   //    },
   //    '&  > .toolbar-common': {
   //       paddingLeft: '0px',
   //    },
   //    '& .toolbar-common > *': {
   //       paddingLeft: '0px',
   //       stroke: `${theme.palette.primary.main}`,
   //    },
   //    '& > .ql-snow ': {
   //       stroke: `${theme.palette.primary.main}`,
   //    },
   //    '& .ql-container.ql-snow': {
   //       boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1) !important',
   //    },
   //    '& .ql-snow .ql-tooltip': {
   //       borderRadius: 10 * SCALE_APP,
   //       backgroundColor: 'orange !important',
   //       // boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1) !important',
   //       boxShadow: '0px 4px 10px purple !important',
   //    },
   //    '& .ql-snow .ql-tooltip.ql-editing a.ql-action::after': {
   //       color: 'orange',
   //       // color: '#769548',
   //    },
   //    '& .ql-container.ql-snow:focus-within:after': {
   //       content: '',
   //       position: 'absolute',
   //       top: 0,
   //       left: 0,
   //       width: '100%',
   //       height: '100%',
   //       zIndex: 1,
   //       border: '2px solid #769548 !important',
   //       borderRadius: 10 * SCALE_APP,
   //    },
   // },
}));

const CustomToolbar = ({idToolBar, hasEmojiTool, hasImageTool}) => (
   <div id={idToolBar} className='toolbar-common'>
      <span className='ql-formats'>
         <button className='ql-bold' />
         <button className='ql-italic' />
         <button className='ql-underline' />
         <button className='ql-link' />
         {hasImageTool && <button className='ql-image' />}
         {hasEmojiTool && <button className='ql-emoji' />}
         <button className='ql-list' value='ordered' />
         <button className='ql-list' value='bullet' />
         <button className='ql-indent' value='-1' />
         <button className='ql-indent' value='+1' />
      </span>
   </div>
);

const Editor = ({
   value,
   onChange,
   id,
   sx,
   hasEmojiTool = true,
   hasImageTool = true,
   maxHeight = 300,
   minHeight = 200,
   ...props
}) => {
   const classes = useStyles();
   const theme = useTheme();

   return (
      <Box
         width={'100%'}
         display={'flex'}
         maxHeight={maxHeight}
         minHeight={minHeight}
         overflow={'visible'}
         flexDirection={'column'}
      >
         <Box
            className={classes.frameStyle}
            width={'100%'}
            height={'100%'}
            display={'flex'}
            overflow={'hidden'}
            flexDirection={'column'}
         >
            <Box
               id='quillBox'
               className={theme.palette.mode === 'dark' ? 'dark' : ''}
               width={'100%'}
               {...props}
               sx={sx}
               flex={'1 1'}
               overflow={'auto'}
            >
               <ReactQuill
                  theme='snow'
                  bounds={'#quillBox'}
                  value={value}
                  onChange={onChange}
                  modules={editorModule(id, hasEmojiTool)}
                  formats={Editor.formats}
                  style={{fontSize: 18 * SCALE_APP, fontWeight: '400'}}
               />
            </Box>
         </Box>
         <CustomToolbar idToolBar={id} sx={{flex: '0 0'}} hasEmojiTool={hasEmojiTool} hasImageTool={hasImageTool} />
      </Box>
   );
};

function editorModule(id, hasEmojiTool) {
   return {
      toolbar: {
         container: `#${id}`,
      },
      clipboard: {
         matchVisual: false,
      },
      'emoji-toolbar': hasEmojiTool,
      //    'emoji-textarea': true,
      'emoji-shortname': true,
   };
}

export default Editor;
