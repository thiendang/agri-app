import {CloudUpload} from '@mui/icons-material';
import {useTheme} from '@mui/material';
import {Alert} from '@mui/material';
import {Snackbar} from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import makeStyles from '@mui/styles/makeStyles';

import React, {useMemo, useState, useCallback} from 'react';
import {useDropzone} from 'react-dropzone';

import FHGTypography from './Typography';

const useStyles = makeStyles(
   (theme) => ({
      baseStyle: {
         flex: 1,
         display: 'flex',
         flexDirection: 'column',
         alignItems: 'center',
         padding: theme.spacing(0.5),
         borderWidth: 2,
         borderRadius: 2,
         borderColor: '#eeeeee',
         borderStyle: 'dashed',
         backgroundColor: theme.palette.background.paper3,
         color: theme.palette.mode === 'dark' ? '#eeeeee' : '#bdbdbd',
         outline: 'none',
         transition: 'border .24s ease-in-out',
      },
      thumbsContainer: {
         maxWidth: '100%',
         maxHeight: '150px',
         objectFit: 'cover',
         objectPosition: 'center',
      },
   }),
   {name: 'EntityEditStyles'},
);

const activeStyle = {
   borderColor: '#2196f3',
};

const acceptStyle = {
   borderColor: '#00e676',
};

const rejectStyle = {
   borderColor: '#ff1744',
};

export default function StyledDropZone({
   label,
   placeholderKey,
   image: imageProp,
   maxFiles = 1,
   accept,
   onDrop,
   ...otherProps
}) {
   const classes = useStyles();
   const theme = useTheme();
   const [isUploading, setIsUploading] = useState(false);

   const handleDrop = useCallback(
      async (accepted, rejected) => {
         // let newImage;
         //
         if (accepted && accepted.length > 0) {
            try {
               setIsUploading(true);
               await onDrop?.(accepted, rejected);
            } catch (e) {
               console.log(e);
            } finally {
               setIsUploading(false);
            }
         }
      },
      [onDrop],
   );
   const {getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject} = useDropzone({
      maxFiles,
      accept,
      onDrop: handleDrop,
   });

   const style = useMemo(
      () => ({
         ...(isDragActive ? activeStyle : {}),
         ...(isDragAccept ? acceptStyle : {}),
         ...(isDragReject ? rejectStyle : {}),
      }),
      [isDragActive, isDragReject, isDragAccept],
   );

   const handleClose = useCallback(() => {
      // handleCloseMenu();
      // setIsRenameDialogOpen(false);
      // setRenameValue(undefined);
   }, []);
   const handleUploadFile = () => {};

   return (
      <>
         <Box className='container' {...otherProps}>
            <div {...getRootProps({style, className: classes.baseStyle})}>
               <input {...getInputProps()} />

               <Button color='primary' onClick={handleUploadFile} style={{marginRight: theme.spacing(2)}}>
                  <CloudUpload style={{marginRight: theme.spacing(1)}} />
                  Upload {label}
               </Button>

               <FHGTypography id={placeholderKey} />
            </div>
         </Box>
         {isDragActive && (
            <>
               <Snackbar open={true} onClose={handleClose} anchorOrigin={{vertical: 'bottom', horizontal: 'center'}}>
                  <Alert severity='info'>Drop file(s) to instantly upload</Alert>
               </Snackbar>
            </>
         )}
         {isUploading && (
            <>
               <Snackbar open={true} onClose={handleClose} anchorOrigin={{vertical: 'bottom', horizontal: 'center'}}>
                  <Alert severity='info'>Uploading file(s)</Alert>
               </Snackbar>
            </>
         )}
      </>
   );
}
