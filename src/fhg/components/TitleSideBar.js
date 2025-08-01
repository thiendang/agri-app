// import {MenuItem} from '@mui/material';
// import Select from '@mui/material/Select';
// import makeStyles from '@mui/styles/makeStyles';
// import sortBy from 'lodash/sortBy';
// import {useState} from 'react';
// import React from 'react';
// import {useNavigate} from 'react-router-dom';
// import {useLocation} from 'react-router-dom';
// import {validate} from 'uuid';
// import {ENTITY_CLIENT_QUERY} from '../../data/QueriesGL';
// import Typography from '../../fhg/components/Typography';
// import TypographyFHG from '../../fhg/components/Typography';
// import {useCustomSearchParams} from '../hooks/useCustomSearchParams';
// import useQueryFHG from '../../fhg/hooks/data/useQueryFHG';
// import find from 'lodash/find';
// import {useEffect} from 'react';
//
// const useStyles = makeStyles(
//    (theme) => ({
//       buttonStyle: {
//          marginRight: theme.spacing(2),
//          [theme.breakpoints.down('md')]: {
//             marginRight: theme.spacing(1),
//             padding: theme.spacing(0.5),
//          },
//          [theme.breakpoints.down('sm')]: {
//             marginRight: theme.spacing(0),
//             padding: theme.spacing(0.5),
//          },
//       },
//       titleStyle: {
//          color: theme.palette.text.primary,
//       },
//       hyphenStyle: {
//          lineHeight: '44px',
//       },
//       placeholderStyle: {
//          color: '#999999 !important',
//          fontSize: '16px',
//       },
//       entityStyle: {
//          textDecoration: 'underline',
//          marginLeft: theme.spacing(1),
//          fontSize: '16px',
//          color: '#999999 !important',
//       },
//       rootSearch: {
//          padding: '2px 4px',
//          display: 'flex',
//          alignItems: 'center',
//          width: '90%',
//          height: '40px',
//          margin: '1px auto',
//       },
//       searchDiv: {
//          width: '100%',
//       },
//       input: {
//          marginLeft: theme.spacing(1),
//          flex: 1,
//       },
//       divider: {
//          height: 28,
//          margin: 4,
//       },
//       sideBarDropdown: {
//          background: '#FBFBFB',
//          boxShadow: '0px 0px 10px rgb(0 0 0 / 15%)',
//          borderRadius: '10px',
//          padding: '0 15px',
//          width: '100%',
//          margin: '7px 5px',
//       },
//    }),
//    {name: 'WebAppBarKLAStyles'}
// );
//
// /**
//  * The AppBar with search and export to CSV capabilities.
//  */
// export default function TitleSideBar() {
//    const {clientId, entityId} = useCustomSearchParams();
//    const classes = useStyles();
//    const navigate = useNavigate();
//    const location = useLocation();
//
//    const [search, setSearch] = useState('');
//    useEffect(() => {
//       if (search?.length > 0) {
//          setSearch('');
//       }
//    }, [location?.state?.search, search?.length]);
//
//    const [entitiesData] = useQueryFHG(ENTITY_CLIENT_QUERY, {variables: {clientId}, skip: !validate(clientId)});
//    const entities = sortBy(entitiesData?.entities || [], 'name');
//
//    const [isEntityMenuOpen, setIsEntityMenuOpen] = useState(false);
//    const [selectedEntity, setSelectedEntity] = useState(find(entitiesData?.entities, {id: entityId}));
//
//    useEffect(() => {
//       if (entityId && entitiesData?.entities?.length > 0) {
//          setSelectedEntity(find(entitiesData.entities, {id: entityId}));
//       } else {
//          setSelectedEntity(undefined);
//       }
//    }, [entityId, entitiesData]);
//
//    const handleMenu = () => {
//       setIsEntityMenuOpen(true);
//    };
//
//    const handleClose = () => {
//       setIsEntityMenuOpen(false);
//    };
//
//    const handleEntityChange = (event) => {
//       const pathParts = location.pathname.split('/');
//       const entityIndex = pathParts.indexOf('entity');
//
//       localStorage.entityId = event.target.value;
//
//       if (entityIndex < 0) {
//          //Add the new entityId.
//          pathParts.push('entity');
//          pathParts.push(event.target.value);
//       } else {
//          //Replace with the new entityId.
//          pathParts[entityIndex + 1] = event.target.value;
//       }
//
//       const path = pathParts.join('/');
//       navigate(path);
//    };
//
//    return (
//       <Select
//          open={isEntityMenuOpen}
//          className={classes.selectStyle}
//          onClose={handleClose}
//          onOpen={handleMenu}
//          placeholder={'Select Entity'}
//          renderValue={() => {
//             if (selectedEntity) {
//                return (
//                   <Typography variant={'h6'} className={classes.entityStyle}>
//                      {selectedEntity?.name}
//                   </Typography>
//                );
//             }
//          }}
//          disableUnderline={true}
//          // displayEmpty={true}
//          // value={''}
//          onChange={handleEntityChange}
//       >
//          {entities?.length > 0 ? (
//             entities?.map((entity) => (
//                <MenuItem key={entity.id} value={entity.id}>
//                   <TypographyFHG variant='menuItem'>{entity.name}</TypographyFHG>
//                </MenuItem>
//             ))
//          ) : (
//             <MenuItem key={'No Entity'} value={-1} disabled>
//                <TypographyFHG>No Entities</TypographyFHG>
//             </MenuItem>
//          )}
//       </Select>
//    );
// }
