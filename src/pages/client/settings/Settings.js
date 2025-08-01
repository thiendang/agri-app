import {SaveOutlined} from '@mui/icons-material';
import {CardContent} from '@mui/material';
import {Card} from '@mui/material';
import {Stack} from '@mui/material';
import {Avatar, Box, Modal} from '@mui/material';
import Grid2 from '@mui/material/Unstable_Grid2';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import Header from '../../../components/Header';
import TextFieldLF from '../../../components/TextFieldLF';
import {DATE_FORMAT_KEYBOARD} from '../../../Constants';
import Form from '../../../fhg/components/edit/Form';
import ProgressButton from '../../../fhg/components/ProgressButton';
import TypographyFHG from '../../../fhg/components/Typography';
import {useRecoilValue, useSetRecoilState} from 'recoil';
import {userStatus} from '../../../fhg/components/security/AuthenticatedUser';
import {SCALE_APP} from '../../../Constants';
import {useTheme} from '@mui/styles';
import useEditData from '../../../fhg/components/edit/useEditData';
import useMutationLxFHG from '../../../fhg/hooks/data/useMutationFHG';
import {CITY_STATE_QUERY, USER_CREATE_UPDATE} from '../../../data/QueriesGL';
import ScrollStack from '../../../fhg/ScrollStack';
import {S3_URL, makeid} from '../chat/AddFilePopup';
import moment from 'moment';
import {Storage} from 'aws-amplify';
import ButtonFHG from '../../../fhg/components/ButtonFHG';
import useWidthRule from '../../../fhg/hooks/useWidthRule';
import Cropper from 'react-easy-crop';
import DatePickerFHG from '../../../fhg/components/DatePickerFHG2';
import AutocompleteMatchLXData from '../../../fhg/components/edit/AutocompleteMatchLXData';
import useQueryFHG from '../../../fhg/hooks/data/useQueryFHG';
import Loading from '../../../fhg/components/Loading';

export const ProfileEditView = () => {
   const user = useRecoilValue(userStatus);
   const setUserStatus = useSetRecoilState(userStatus);
   const navigate = useNavigate();

   const [editValues, handleChange, {defaultValues, handleDateChange, resetValues, currentValues}] = useEditData({
      ...user,
      countryId: 'US',
   });

   const [optionsData] = useQueryFHG(CITY_STATE_QUERY, undefined, 'options.type');

   const {cities = [], states = []} = optionsData || {};

   const [updateUser] = useMutationLxFHG(USER_CREATE_UPDATE);

   const isSmallWidth = useWidthRule('down', 'sm');

   const [file, setFile] = useState(null);
   const [fileUrl, setFileUrl] = useState(null);
   const [loading, setLoading] = useState(false);
   const [blob, setBlob] = useState(null);

   useEffect(() => {
      resetValues({...user, countryId: 'US'});
   }, [resetValues, user]);

   useEffect(() => {
      // create the preview
      let objectUrl = null;
      try {
         objectUrl = URL.createObjectURL(file);
         setFileUrl(objectUrl);
      } catch (error) {}
      // free memory when ever this component is unmounted
      return () => URL.revokeObjectURL(objectUrl);
   }, [file]);

   const handleFile = useCallback(async () => {
      let upload = null;
      try {
         if (typeof file !== 'undefined' && file) {
            const ext = file.name.substring(file.name.lastIndexOf('.') + 1, file.name.length);
            const fileName = `${moment().unix() + makeid(5)}.${ext}`;
            const insertKey = `user/${user.id}/${fileName}`;

            await Storage.put(insertKey, blob, {
               level: 'public',
               contentType: file.type,
               errorCallback: (err) => {
                  console.error('Unexpected error while uploading', err);
               },
               contentEncoding: 'base64',
            });
            const url = `${S3_URL}${insertKey}`;
            setUserStatus((prev) => ({
               ...prev,
               profilePic: {
                  imageS3: url,
               },
            }));
            return url;
         } else {
            return null;
         }
      } catch (err) {
         Storage.cancel(upload);
         console.log(err);
         return null;
      }
   }, [file, blob, setUserStatus, user.id]);

   const handleCancel = useCallback(() => {
      navigate('..');
   }, [navigate]);

   const handleSave = useCallback(async () => {
      try {
         setLoading(true);
         const imageUrl = await handleFile();
         const payload = currentValues;
         if (payload.zipCode) payload.zipCode = Number(payload.zipCode);
         if (imageUrl) {
            payload.profilePicImageS3Data = {
               imageLocation: imageUrl,
            };
         }
         await updateUser({
            variables: {
               ...payload,
            },
         });
         setUserStatus((prev) => ({...prev, ...editValues}));
         handleCancel();
      } catch (error) {
         console.log({error});
      } finally {
         setLoading(false);
      }
   }, [handleFile, currentValues, updateUser, setUserStatus, handleCancel, editValues]);

   const fileInputRef = useRef(null);

   const handleFileUpload = async () => {
      setFile(fileInputRef.current.files[0]);
      if (fileInputRef.current.files[0]) {
         setOpen(true);
      }
   };

   const [open, setOpen] = React.useState(false);

   const [crop, setCrop] = useState({x: 0, y: 0});
   const [zoom, setZoom] = useState(1);
   const [cropImage, setCropImage] = useState({x: 0, y: 0});

   const onCropComplete = (croppedArea, croppedAreaPixels) => {
      setCropImage(croppedAreaPixels);
   };

   const handleClose = () => setOpen(false);

   const handleCropDone = async () => {
      try {
         const {url, blob} = await getCroppedImg(fileUrl, cropImage, 0);
         setFileUrl(url);
         setBlob(blob);
         setOpen(false);
      } catch (e) {
         console.error(e);
      }
   };

   const theme = useTheme();

   return (
      <Stack flex={1} flexDirection='column' height={'100%'} width={'100%'} overflow={'hidden'}>
         <Header idTitle={'settings.title'} sx={{flex: '0 0'}} showDrawerMenuButton={false} />

         <Form
            onSubmit={handleSave}
            style={{display: 'flex', flex: '1 1', flexDirection: 'column', overflow: 'hidden'}}
         >
            <ScrollStack width={'100%'} height={'100%'} innerStackProps={{pr: 1}}>
               <Card sx={{mb: 4, flex: 'none', mt: 0.5, mx: 0.25}}>
                  <CardContent>
                     <TypographyFHG variant='fs20700' id={'setting.personalInformation.label'} />
                     <Stack flexDirection={'row'} gap={3} sx={{mt: 3}}>
                        <Stack
                           flexDirection={'column'}
                           alignItems={'center'}
                           mb={isSmallWidth ? '12px' : 0}
                           flex={'0 0'}
                        >
                           <Avatar
                              src={fileUrl ?? user?.profilePic?.imageS3}
                              style={{
                                 width: SCALE_APP * 128,
                                 height: SCALE_APP * 128,
                              }}
                           />
                           <label for='file-input'>
                              <Box
                                 sx={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                    mt: 1,
                                 }}
                              >
                                 <TypographyFHG variant='fs12500' color='#769548' id={'setting.changePhoto.label'} />
                              </Box>
                              <input
                                 ref={fileInputRef}
                                 id='file-input'
                                 type='file'
                                 name='file'
                                 style={{
                                    display: 'none',
                                 }}
                                 onChange={handleFileUpload}
                                 onClick={(e) => (e.target.value = null)}
                                 accept='.png, .jpg, .jpeg'
                              />
                           </label>
                        </Stack>
                        <Grid2 container flex={'1 1'} spacing={1}>
                           <TextFieldLF
                              key={defaultValues.contactName}
                              labelKey='settings.contactName'
                              placeholderKey='settings.contactName'
                              onChange={handleChange}
                              defaultValue={defaultValues.contactName}
                              value={editValues.contactName}
                              name='contactName'
                              layout={{xs: 12}}
                           />

                           <TextFieldLF
                              key={defaultValues.title}
                              labelKey='settings.title.field'
                              placeholderKey='settings.title.placeholder'
                              helpKey={'setting.title.message'}
                              onChange={handleChange}
                              defaultValue={defaultValues.title}
                              value={editValues.title}
                              name='title'
                              type='text'
                              required
                              layout={{xs: 12, md: 6}}
                           />
                           <DatePickerFHG
                              key={defaultValues.dateOfBirth}
                              onChange={handleDateChange}
                              clearable
                              format={DATE_FORMAT_KEYBOARD}
                              labelKey='settings.birth.field'
                              placeholderKey='settings.birth.placeholder'
                              defaultValue={defaultValues.dateOfBirth}
                              value={editValues.dateOfBirth}
                              name='dateOfBirth'
                              layout={{xs: 12, md: 6}}
                           />
                        </Grid2>
                     </Stack>
                     <Modal
                        open={open}
                        onClose={handleClose}
                        aria-labelledby='parent-modal-title'
                        aria-describedby='parent-modal-description'
                     >
                        <Box
                           display='flex'
                           justifyContent='center'
                           alignItems='center'
                           style={{
                              width: '100%',
                              height: '100%',
                           }}
                        >
                           <Box sx={{width: 400, height: 400, position: 'relative'}}>
                              {fileUrl && (
                                 <Cropper
                                    image={fileUrl}
                                    crop={crop}
                                    zoom={zoom}
                                    aspect={1}
                                    onCropChange={setCrop}
                                    onCropComplete={onCropComplete}
                                    onZoomChange={setZoom}
                                    cropShape='round'
                                    showGrid={false}
                                 />
                              )}
                              <Box
                                 sx={{
                                    position: 'absolute',
                                    bottom: -40,
                                    left: 0,
                                    right: 0,
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                 }}
                              >
                                 <ButtonFHG variant='contained' labelKey='Done' onClick={handleCropDone} />
                              </Box>
                           </Box>
                        </Box>
                     </Modal>
                  </CardContent>
               </Card>
               <Card sx={{mb: 4, flex: 'none', mt: 0.5, mx: 0.25}}>
                  <CardContent>
                     <TypographyFHG id={'settings.about'} variant='fs20700' />
                     <TextFieldLF
                        key={defaultValues.aboutDescription}
                        placeholderKey='settings.aboutDescriptionPlaceholder'
                        onChange={handleChange}
                        defaultValue={defaultValues.aboutDescription}
                        value={editValues.aboutDescription}
                        name='aboutDescription'
                        rows={8}
                        multiline
                        sx={{mt: 3}}
                     />
                  </CardContent>
               </Card>
               <Card sx={{mb: 4, flex: 'none', mt: 0.5, mx: 0.25}}>
                  <CardContent>
                     <TypographyFHG color='text.primary' variant='fs18700' id={'setting.address.label'} />
                     <Grid2 container spacing={1}>
                        <TextFieldLF
                           key={defaultValues.addressLineOne}
                           labelKey='settings.addr1.field'
                           placeholderKey='settings.addr1.placeholder'
                           onChange={handleChange}
                           defaultValue={defaultValues.addressLineOne}
                           value={editValues.addressLineOne}
                           name='addressLineOne'
                           layout={{xs: 12, md: 6}}
                        />
                        <TextFieldLF
                           key={defaultValues.addressLineTwo}
                           labelKey='settings.addr2.field'
                           placeholderKey='settings.addr2.placeholder'
                           onChange={handleChange}
                           defaultValue={defaultValues.addressLineTwo}
                           value={editValues.addressLineTwo}
                           name='addressLineTwo'
                           layout={{xs: 12, md: 6}}
                        />

                        <AutocompleteMatchLXData
                           key={defaultValues.cityId}
                           labelKey='settings.city.field'
                           placeholderKey='settings.city.placeholder'
                           onChange={handleChange}
                           defaultValue={defaultValues.cityId}
                           value={editValues.cityId}
                           name='cityId'
                           options={cities}
                           textFieldProps={{variant: 'outlined'}}
                           matchSorterProps={{keys: ['_default', 'name']}}
                           noOptionsText={
                              <div>
                                 <div>No city.</div>
                              </div>
                           }
                           inputProps={{style: {backgroundColor: theme.palette.background.default}}}
                           disableClearable
                           layout={{xs: 12, sm: 6, md: 4}}
                        />
                        <AutocompleteMatchLXData
                           key={defaultValues.stateId}
                           labelKey='settings.state.field'
                           placeholderKey='settings.state.placeholder'
                           onChange={handleChange}
                           defaultValue={defaultValues.stateId}
                           value={editValues.stateId}
                           name='stateId'
                           options={states}
                           textFieldProps={{variant: 'outlined'}}
                           matchSorterProps={{keys: ['_default', 'name']}}
                           noOptionsText={
                              <div>
                                 <div>No State.</div>
                              </div>
                           }
                           inputProps={{style: {backgroundColor: theme.palette.background.default}}}
                           disableClearable
                           layout={{xs: 12, sm: 6, md: 4}}
                        />

                        <TextFieldLF
                           key={defaultValues.zipCode}
                           labelKey='settings.zip.field'
                           placeholderKey='settings.zip.placeholder'
                           onChange={handleChange}
                           defaultValue={defaultValues.zipCode}
                           value={editValues.zipCode}
                           name='zipCode'
                           inputProps={{
                              'data-type': 'number',
                              maxLength: 5,
                              pattern: '[0-9]{5}',
                              title: 'Five digit zip code',
                           }}
                           layout={{xs: 12, sm: 6, md: 4}}
                        />
                        <AutocompleteMatchLXData
                           key={defaultValues.countryId}
                           labelKey='settings.country.field'
                           placeholderKey='settings.country.placeholder'
                           onChange={handleChange}
                           defaultValue={defaultValues.countryId}
                           value={editValues.countryId}
                           name='countryId'
                           options={[
                              {
                                 id: 'US',
                                 name: 'United States',
                              },
                           ]}
                           textFieldProps={{variant: 'outlined'}}
                           matchSorterProps={{keys: ['_default', 'name']}}
                           noOptionsText={
                              <div>
                                 <div>No country.</div>
                              </div>
                           }
                           inputProps={{style: {backgroundColor: theme.palette.background.default}}}
                           disableClearable
                           layout={{xs: 12, sm: 6, md: 12}}
                        />
                     </Grid2>
                  </CardContent>
               </Card>
               {/*</Stack>*/}
            </ScrollStack>
            <Stack flexDirection={'row'} sx={{mt: 4}}>
               <ProgressButton
                  labelKey={'setting.save.label'}
                  variant='contained'
                  type={'submit'}
                  disabled={loading}
                  isProgress={loading}
                  startIcon={<SaveOutlined />}
                  sx={{mr: 3}}
               />
               <ButtonFHG variant='outlined' labelKey='cancel.button' onClick={handleCancel} disabled={loading} />
            </Stack>
         </Form>
         <Loading isLoading={loading} hasBackdrop />
      </Stack>
   );
};

export const createImage = (url) =>
   new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.setAttribute('crossOrigin', 'anonymous'); // needed to avoid cross-origin issues on CodeSandbox
      image.src = url;
   });

export function getRadianAngle(degreeValue) {
   return (degreeValue * Math.PI) / 180;
}

/**
 * Returns the new bounding area of a rotated rectangle.
 */
export function rotateSize(width, height, rotation) {
   const rotRad = getRadianAngle(rotation);

   return {
      width: Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
      height: Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
   };
}

/**
 * This function was adapted from the one in the ReadMe of https://github.com/DominicTobias/react-image-crop
 */
export default async function getCroppedImg(
   imageSrc,
   pixelCrop,
   rotation = 0,
   flip = {horizontal: false, vertical: false},
) {
   const image = await createImage(imageSrc);
   const canvas = document.createElement('canvas');
   const ctx = canvas.getContext('2d');

   if (!ctx) {
      return null;
   }

   const rotRad = getRadianAngle(rotation);

   // calculate bounding box of the rotated image
   const {width: bBoxWidth, height: bBoxHeight} = rotateSize(image.width, image.height, rotation);

   // set canvas size to match the bounding box
   canvas.width = bBoxWidth;
   canvas.height = bBoxHeight;

   // translate canvas context to a central location to allow rotating and flipping around the center
   ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
   ctx.rotate(rotRad);
   ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1);
   ctx.translate(-image.width / 2, -image.height / 2);

   // draw rotated image
   ctx.drawImage(image, 0, 0);

   const croppedCanvas = document.createElement('canvas');

   const croppedCtx = croppedCanvas.getContext('2d');

   if (!croppedCtx) {
      return null;
   }

   // Set the size of the cropped canvas
   croppedCanvas.width = pixelCrop.width;
   croppedCanvas.height = pixelCrop.height;

   // Draw the cropped image onto the new canvas
   croppedCtx.drawImage(
      canvas,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height,
   );

   // As Base64 string
   // return croppedCanvas.toDataURL('image/jpeg');

   // As a blob
   return new Promise((resolve) => {
      croppedCanvas.toBlob((file) => {
         resolve({
            url: URL.createObjectURL(file),
            blob: file,
         });
      }, 'image/jpeg');
   });
}
