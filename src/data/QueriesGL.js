import gql from 'graphql-tag';
import {DAYS_TO_DISPLAY_COMPLETED_TASKS} from '../Constants';
import {EXTEND_FREE_TRIAL_ACTION} from '../fhg/hooks/data/useMutationFHG';
import {ACTIVATE_FREE_TRIAL_ACTION} from '../fhg/hooks/data/useMutationFHG';
import {COPY_ACTION, UNDO_ACTION, REDO_ACTION} from '../fhg/hooks/data/useMutationFHG';
import {UNDELETE_ACTION, DELETE_ACTION, CREATE_UPDATE_ACTION} from '../fhg/hooks/data/useMutationFHG';
import {FIELD_METRICS_FRAGMENT} from './FragmentsGL';
import {KMI_DATA_FRAGMENT} from './FragmentsGL';
import {INVITE_FRAGMENT} from './FragmentsGL';
import {UNDO_HISTORY_FRAGMENT} from './FragmentsGL';
import {CROP_TYPE_TEMPLATE_FRAGMENT} from './FragmentsGL';
import {HUB_SPOT_FRAGMENT} from './FragmentsGL';
import {MEMBERSHIP_FRAGMENT} from './FragmentsGL';
import {COURSE_SHORT_FRAGMENT} from './FragmentsGL';
import {COURSE_ALL_FRAGMENT} from './FragmentsGL';
import {CHAT_MESSAGE, CHAT_ROOM, FRANCHISE_FRAGMENT} from './FragmentsGL';
import {ROLE_FRAGMENT} from './FragmentsGL';
import {PERMISSION_FRAGMENT} from './FragmentsGL';
import {
   CLIENT_REPORT_FRAGMENT,
   CORE_VALUE_FRAGMENT,
   GOAL_FRAGMENT,
   MEETING_FRAGMENT,
   NEW_TASK_FRAGMENT,
   TARGET_FRAGMENT,
   TARGET_GROUP_FRAGMENT,
} from './FragmentsGL';
import {FOLDER_FRAGMENT} from './FragmentsGL';
import {HEDGE_CONTRACT_FRAGMENT} from './FragmentsGL';
import {FUTURE_CONTRACT_FRAGMENT} from './FragmentsGL';
import {CASH_CONTRACT_FRAGMENT} from './FragmentsGL';
import {SEAT_FRAGMENT} from './FragmentsGL';
import {COURSE_FRAGMENT, MODULE_FRAGMENT, SECTION_FRAGMENT} from './FragmentsGL';
import {ENTITY_CASH_FLOW_FRAGMENT} from './FragmentsGL';
import {CASH_FLOW_FRAGMENT} from './FragmentsGL';
import {LOAN_ANALYSIS_FRAGMENT} from './FragmentsGL';
import {BALANCE_REPORT_FRAGMENT} from './FragmentsGL';
import {EXPENSE_TYPE_FRAGMENT} from './FragmentsGL';
import {INCOME_TYPE_FRAGMENT} from './FragmentsGL';
import {EXPENSE_FRAGMENT} from './FragmentsGL';
import {INCOME_FRAGMENT} from './FragmentsGL';
import {LIABILITY_FRAGMENT} from './FragmentsGL';
import {UNIT_TYPE_FRAGMENT} from './FragmentsGL';
import {TASK_HISTORY_FRAGMENT} from './FragmentsGL';
import {ASSET_FRAGMENT} from './FragmentsGL';
import {ENTITY_FRAGMENT} from './FragmentsGL';
import {USER_FRAGMENT} from './FragmentsGL';
import {TASK_FRAGMENT} from './FragmentsGL';
import {CLIENT_FRAGMENT} from './FragmentsGL';
import {FEEDBACK_FRAGMENT} from './FragmentsGL';

export const CITY_STATE_QUERY = gql`
   query getCityState {
      cities: city_All {
         id
         name
         isDeleted
      }
      states: state_All {
         id
         name
         abbreviation
         isDeleted
      }
   }
`;

export const getCityCacheQueries = () => {
   return [{query: CITY_STATE_QUERY, queryPath: 'cities'}];
};

export const CITY_CREATE_UPDATE = {
   mutation: gql`
      mutation cityCreateUpdate($id: UUID!, $name: String) {
         city: city_CreateUpdate(city: {id: $id, name: $name}) {
            id
            name
            isDeleted
         }
      }
   `,
   typeKey: 'city.type',
   actionKey: CREATE_UPDATE_ACTION,
};

// CLIENT
// export const CLIENT_ALL_QUERY = gql`
//    query getAllClients {
//       clients: client_All {
//          ...clientInfo
//       }
//    }
//    ${CLIENT_FRAGMENT}
// `;

export const CLIENT_ALL_WHERE_QUERY = gql`
   query getClientAllWhere($franchiseId: UUID, $isBank: [Boolean]) {
      clients: client_AllWhere(clientSearch: {franchiseId: $franchiseId, isBank: $isBank}) {
         ...clientInfo
      }
   }
   ${CLIENT_FRAGMENT}
`;

export const CLIENT_COUNT = gql`
   query getClientCount {
      clientCount: client_Count
   }
`;

export const CLIENT_BY_ID_QUERY = gql`
   query getClientById($clientId: UUID!) {
      client: client_ById(clientId: $clientId) {
         ...clientInfo
      }
   }
   ${CLIENT_FRAGMENT}
`;

export const CLIENT_BY_ID_REPORT_QUERY = gql`
   query getClientByIdReport($clientId: UUID!) {
      client: client_ById(clientId: $clientId) {
         ...clientReportInfo
      }
   }
   ${CLIENT_REPORT_FRAGMENT}
`;

export const getClientCacheQueries = (franchiseId, isBank = false) => {
   return [{query: CLIENT_ALL_WHERE_QUERY, variables: {franchiseId, isBank}, queryPath: 'clients'}];
};

export const CLIENT_CREATE_UPDATE = {
   mutation: gql`
      mutation clientCreateUpdate(
         $id: UUID!
         $cityId: UUID
         $stateId: UUID
         $name: String
         $addressLineOne: String
         $addressLineTwo: String
         $email: String
         $phone: String
         $zipCode: Int
         $contactName: String
         $note: String
         $startMonth: String
         $franchiseId: UUID
         $membershipIdList: [UUID]
      ) {
         client: client_CreateUpdate(
            client: {
               id: $id
               cityId: $cityId
               stateId: $stateId
               name: $name
               addressLineOne: $addressLineOne
               addressLineTwo: $addressLineTwo
               email: $email
               phone: $phone
               zipCode: $zipCode
               contactName: $contactName
               note: $note
               startMonth: $startMonth
               franchiseId: $franchiseId
               membershipIdList: $membershipIdList
            }
         ) {
            ...clientInfo
         }
      }
      ${CLIENT_FRAGMENT}
   `,
   typeKey: 'client.type',
   actionKey: CREATE_UPDATE_ACTION,
};

export const CLIENT_ACTIVATE_FREE_TRIAL = {
   mutation: gql`
      mutation clientActivateFreeTrial($clientId: UUID!) {
         client: client_ActivateFreeTrial(clientId: $clientId) {
            ...clientInfo
         }
      }
      ${CLIENT_FRAGMENT}
   `,
   typeKey: ACTIVATE_FREE_TRIAL_ACTION,
   actionKey: 'client.type',
};

export const CLIENT_EXTEND_FREE_TRIAL = {
   mutation: gql`
      mutation clientExtendFreeTrial($clientId: UUID!, $days: Int!) {
         client: client_ExtendFreeTrial(clientId: $clientId, days: $days) {
            ...clientInfo
         }
      }
      ${CLIENT_FRAGMENT}
   `,
   typeKey: EXTEND_FREE_TRIAL_ACTION,
   actionKey: 'client.type',
};

// Delete the client on the server.
export const CLIENT_DELETE = {
   mutation: gql`
      mutation ClientDelete($id: UUID!) {
         client_Delete(clientId: $id)
      }
   `,
   typeKey: 'client.type',
   actionKey: DELETE_ACTION,
};

// User

export const USER_CREATE_UPDATE = {
   mutation: gql`
      mutation userCreateUpdate(
         $id: UUID!
         $clientId: UUID
         $contactName: String
         $email: String
         $noEmail: Boolean
         $username: String
         $password: String
         $isExecutive: Boolean
         $permissionIdList: [UUID!]
         $roleIdList: [UUID!]
         $franchiseId: UUID
         $aboutDescription: String
         $location: String
         $phonePrimary: String
         $profilePicImageS3Data: ImageS3Data
         $addressLineOne: String
         $addressLineTwo: String
         $cityId: UUID
         $stateId: UUID
         $zipCode: Int
         $title: String
         $dateOfBirth: DateOnly
      ) {
         user: user_CreateUpdate(
            user: {
               id: $id
               clientId: $clientId
               contactName: $contactName
               email: $email
               noEmail: $noEmail
               username: $username
               password: $password
               isExecutive: $isExecutive
               permissionIdList: $permissionIdList
               roleIdList: $roleIdList
               franchiseId: $franchiseId
               aboutDescription: $aboutDescription
               location: $location
               phonePrimary: $phonePrimary
               profilePicImageS3Data: $profilePicImageS3Data
               addressLineOne: $addressLineOne
               addressLineTwo: $addressLineTwo
               cityId: $cityId
               stateId: $stateId
               zipCode: $zipCode
               title: $title
               dateOfBirth: $dateOfBirth
            }
         ) {
            ...userInfo
         }
      }
      ${USER_FRAGMENT}
   `,
   typeKey: 'user.type',
   actionKey: CREATE_UPDATE_ACTION,
   updateQueries: (variables) => {
      return [{query: USER_CLIENT_QUERY, variables, path: 'users'}];
   },
};

// Delete the user on the server.
export const USER_DELETE = {
   mutation: gql`
      mutation UserDelete($id: UUID!) {
         user_Delete(userId: $id)
      }
   `,
   typeKey: 'user.type',
   actionKey: DELETE_ACTION,
};

export const USER_CLIENT_QUERY = gql`
   query getUserAllWhere($clientId: [UUID], $id: [UUID], $cognitoSub: [String], $includeNonCognito: Boolean) {
      users: user_AllWhere(
         includeNonCognito: $includeNonCognito
         userSearch: {clientId: $clientId, id: $id, cognitoSub: $cognitoSub}
      ) {
         ...userInfo
      }
   }
   ${USER_FRAGMENT}
`;

export const LOGIN_USER_QUERY = gql`
   query getAdminUser($franchiseId: UUID) {
      users: user_AllWhere(userSearch: {clientId: null, franchiseId: $franchiseId}, includeNonCognito: false) {
         ...userInfo
      }
   }
   ${USER_FRAGMENT}
`;

export const getUserCacheQueries = (clientId = null) => {
   return [{query: USER_CLIENT_QUERY, variables: {clientId, includeNonCognito: true}, queryPath: 'users'}];
};

export const getLoginUserByClientCacheQueries = (clientId = null) => {
   return [{query: USER_CLIENT_QUERY, variables: {clientId}, queryPath: 'users'}];
};

export const getLoginUserCacheQueries = (franchiseId = null) => {
   const variables = franchiseId ? {franchiseId} : undefined;
   return [{query: LOGIN_USER_QUERY, variables, queryPath: 'users'}];
};

// course
export const COURSE_ALL_WHERE_QUERY = gql`
   query getCourseAllWhere($isActive: [Boolean], $sortOrder: [OrderSpec]) {
      courses: course_AllWhere(courseSearch: {isActive: $isActive}, sortOrder: $sortOrder) {
         ...courseInfoAll
      }
   }
   ${COURSE_ALL_FRAGMENT}
`;
export const COURSE_ACTIVE_WHERE_QUERY = gql`
   query getCourseAll($sortOrder: [OrderSpec], $isActive: [Boolean]) {
      courses: course_AllWhere(sortOrder: $sortOrder, courseSearch: {isActive: $isActive}) {
         ...courseInfo
      }
   }
   ${COURSE_FRAGMENT}
`;
// export const COURSE_ALL_QUERY_WHERE = gql`
//    query getCourseAll {
//       courses: course_All_with_modules {
//          id
//          name
//          description
//          active
//          modules {
//             id
//             course_id
//             name
//             order_no
//             units {
//                id
//                module_id
//                name
//                description
//                introVideo
//                transcript
//             }
//          }
//       }
//    }
// `;
export const COURSE_ALL_QUERY_WHERE_ID = gql`
   query getCourseById($id: [UUID], $active: [Boolean]) {
      courses: course_All_with_id(courseSearch: {id: $id, isActive: $active}) {
         id
         name
         description
         keywords
         isActive
         modules {
            id
            courseId
            name
            orderIndex
            sections {
               id
               moduleId
               name
               description
               introVideo: orderIndex
               transcript
            }
         }
      }
   }
`;
// export const COURSE_QUERY = gql`
//    query getCourseById($id: UUID, $active: Boolean!) {
//       courses: course_AllWhere(courseSearch: {id: $id, active: $active}) {
//          ...courseInfo
//       }
//    }
//    ${COURSE_FRAGMENT}
// `;
export const getCourseCacheQueries = () => {
   return [
      {query: COURSE_ACTIVE_WHERE_QUERY, queryPath: 'courses'},
      {
         query: COURSE_ACTIVE_WHERE_QUERY,
         variables: {sortOrder: [{direction: 'ASC', fieldName: 'orderIndex'}]},
         queryPath: 'courses',
      },
   ];
};

export const COURSE_CREATE_UPDATE = {
   mutation: gql`
      mutation courseCreateUpdate(
         $id: UUID!
         $name: String
         $description: String
         $keywords: String
         $membershipIdList: [UUID]
         $isActive: Boolean
         $orderIndex: Int
         $imageName: String
      ) {
         courses: course_CreateUpdate(
            course: {
               id: $id
               name: $name
               description: $description
               keywords: $keywords
               orderIndex: $orderIndex
               membershipIdList: $membershipIdList
               isActive: $isActive
               imageName: $imageName
            }
         ) {
            ...courseInfo
         }
      }
      ${COURSE_FRAGMENT}
   `,
   typeKey: 'lms.type',
   actionKey: CREATE_UPDATE_ACTION,
   updateQueries: getCourseCacheQueries,
};

export const COURSE_MOVE = {
   mutation: gql`
      mutation courseCreateUpdate($id: UUID!, $orderIndex: Int) {
         courses: course_CreateUpdate(course: {id: $id, orderIndex: $orderIndex}) {
            ...courseInfo
         }
      }
      ${COURSE_FRAGMENT}
   `,
   typeKey: 'lms.type',
   actionKey: CREATE_UPDATE_ACTION,
};

// Delete the course.
export const COURSE_DELETE = {
   mutation: gql`
      mutation CourseDelete($id: UUID!) {
         course_Delete(courseId: $id)
      }
   `,
   typeKey: 'lms.type',
   actionKey: DELETE_ACTION,
   updateQueries: getCourseCacheQueries,
};
// mark as read
// export const MARK_AS_READ_QUERY = gql`
//    query getMarkAsRead_All($isDeleted: Boolean) {
//       markAsRead: markAsRead_AllWhere(markAsReadSearch: {isDeleted: $isDeleted}) {
//          id
//          unit_id
//          user_id
//       }
//    }
// `;

// export const MARK_AS_READ_WHERE = gql`
//    query getCourseById($unit_id: UUID, $isDeleted: Boolean) {
//       markAsRead: markAsRead_AllWhere(markAsReadSearch: {unit_id: $unit_id, isDeleted: $isDeleted}) {
//          id
//          unit_id
//          user_id
//       }
//    }
// `;
// export const getMarkAsReadQueries = (unit_id, isDeleted) => {
//    return [
//       {query: MARK_AS_READ_WHERE, variables: {unit_id: unit_id, isDeleted: isDeleted}, queryPath: 'markAsRead.type'},
//    ];
// };
export const MARK_AS_READ_CREATE = {
   mutation: gql`
      mutation markAsRead_CreateUpdate($id: UUID!, $unit_id: UUID) {
         markAsRead: markAsRead_CreateUpdate(markAsRead: {id: $id, unit_id: $unit_id}) {
            id
            unit_id
            user_id
         }
      }
   `,
   typeKey: 'markAsRead.type',
   actionKey: CREATE_UPDATE_ACTION,
};
export const MARK_AS_READ_DELETE = {
   mutation: gql`
      mutation markAsReadDelete($id: UUID!) {
         markAsRead_Delete(markAsReadId: $id)
      }
   `,
   typeKey: 'unit.type',
   actionKey: DELETE_ACTION,
};
// modules
export const MODULES_ALL_QUERY = gql`
   query getModuleAll {
      modules: module_All {
         ...moduleInfo
      }
   }
   ${MODULE_FRAGMENT}
`;

export const MODULES_ALL_WHERE_QUERY = gql`
   query getModuleAllWhere($courseId: [UUID], $sortOrder: [OrderSpec], $isDeleted: [Boolean]) {
      modules: module_AllWhere(moduleSearch: {courseId: $courseId, isDeleted: $isDeleted}, sortOrder: $sortOrder) {
         ...moduleInfo
      }
   }
   ${MODULE_FRAGMENT}
`;

/**
 * @deprecated use getModuleCacheQueries
 * @param course_id
 * @param isDeleted
 * @return {[{variables: {course_id, isDeleted}, queryPath: string, query: DocumentNode}]}
 */
export const getModelCacheQueries = (course_id, isDeleted) => {
   return [
      {query: MODULES_ALL_WHERE_QUERY, variables: {course_id: course_id, isDeleted: isDeleted}, queryPath: 'modules'},
   ];
};

export const getModuleCacheQueries = (variables) => {
   // return [{query: COURSE_BY_ID_QUERY, variables: {courseId: variables?.courseId}, queryPath: 'course.modules'}];
   return [{query: MODULES_ALL_WHERE_QUERY, variables, queryPath: 'modules'}];
};

export const MODULE_QUERY = gql`
   query getCourseById($id: [UUID], $isDeleted: [Boolean]) {
      modules: module_AllWhere(moduleSearch: {id: $id, isDeleted: $isDeleted}) {
         ...moduleInfo
      }
   }
   ${MODULE_FRAGMENT}
`;
export const MODULE_CREATE_UPDATE = {
   mutation: gql`
      mutation moduleCreateUpdate($courseId: UUID, $id: UUID!, $name: String, $orderIndex: Int) {
         modules: module_CreateUpdate(module: {id: $id, courseId: $courseId, name: $name, orderIndex: $orderIndex}) {
            ...moduleInfo
         }
      }
      ${MODULE_FRAGMENT}
   `,
   typeKey: 'module.type',
   actionKey: CREATE_UPDATE_ACTION,
   updateQueries: getModuleCacheQueries,
};

export const MODULE_DELETE = {
   mutation: gql`
      mutation ModuleDelete($id: UUID!) {
         module_Delete(moduleId: $id)
      }
   `,
   typeKey: 'module.type',
   actionKey: DELETE_ACTION,
   updateQueries: getModuleCacheQueries,
};

// Unit
// export const UNITS_QUERY_WHERE = gql`
//    query getUnitsAllWhere($module_id: UUID!, $isDeleted: Boolean!) {
//       units: units_AllWhere(unitSearch: {module_id: $module_id, isDeleted: $isDeleted}) {
//          ...unitInfo
//          resources {
//             id
//             unit_id
//             label
//             type
//             path_url
//             isDeleted
//             original_filename
//          }
//       }
//    }
//    ${UNITS_FRAGMENT}
// `;

// export const getUnitCacheQueries = (module_id, isDeleted) => {
//    return [{query: UNITS_QUERY_WHERE, variables: {module_id: module_id, isDeleted: isDeleted}, queryPath: 'units'}];
// };

// export const UNIT_RESOURCES_QUERY = gql`
//    query getUnitAndResourcesById($id: UUID, $isDeleted: Boolean!) {
//       units: units_Resources_AllWhere(unitSearch: {id: $id, isDeleted: $isDeleted}) {
//          ...unitInfo
//          resources {
//             id
//             unit_id
//             label
//             type
//             path_url
//             isDeleted
//             original_filename
//          }
//          markAsRead {
//             id
//             unit_id
//             user_id
//          }
//       }
//    }
//    ${UNITS_FRAGMENT}
// `;
// export const getUnitAllCacheQueries = (id, isDeleted) => {
//    return [{query: UNIT_RESOURCES_QUERY, variables: {id: id, isDeleted: isDeleted}, queryPath: 'units'}];
// };
// export const UNIT_CREATE_UPDATE = {
//    mutation: gql`
//       mutation unitCreateUpdate(
//          $module_id: UUID!
//          $id: UUID!
//          $name: String!
//          $description: String!
//          $transcript: String!
//          $fileLocation: String!
//          $originalFilename: String
//          $resources: String
//       ) {
//          units: unit_CreateUpdate(
//             unit: {
//                id: $id
//                module_id: $module_id
//                name: $name
//                description: $description
//                transcript: $transcript
//                fileS3Data: {fileLocation: $fileLocation, originalFilename: $originalFilename}
//                resources: $resources
//             }
//          ) {
//             ...unitInfo
//          }
//       }
//       ${UNITS_FRAGMENT}
//    `,
//    typeKey: 'unit.type',
//    actionKey: CREATE_UPDATE_ACTION,
// };
export const COURSE_BY_ID_QUERY = gql`
   query course_ById($courseId: UUID!) {
      course: course_ById(courseId: $courseId) {
         ...courseInfo
      }
   }
   ${COURSE_FRAGMENT}
`;

export const COURSE_SHORT_BY_ID_QUERY = gql`
   query courseShortById($courseId: UUID!) {
      course: course_ById(courseId: $courseId) {
         ...courseShortInfo
      }
   }
   ${COURSE_SHORT_FRAGMENT}
`;

// export const UNIT_CREATE_UPDATE = {
//    mutation: gql`
//       mutation unitCreateUpdate(
//          $module_id: UUID!
//          $id: UUID!
//          $name: String!
//          $description: String!
//          $transcript: String!
//          $fileLocation: String!
//          $originalFilename: String
//          $resources: String
//       ) {
//          units: unit_CreateUpdate(
//             unit: {
//                id: $id
//                module_id: $module_id
//                name: $name
//                description: $description
//                transcript: $transcript
//                fileS3Data: {fileLocation: $fileLocation, originalFilename: $originalFilename}
//                resources: $resources
//             }
//          ) {
//             ...unitInfo
//          }
//       }
//       ${UNITS_FRAGMENT}
//    `,
//    typeKey: 'unit.type',
//    actionKey: CREATE_UPDATE_ACTION,
// };

// export const UNIT_CREATE_UPDATE = {
//    mutation: gql`
//       mutation unitCreateUpdate($module_id: UUID!, $id: UUID!, $name: String!, $description: String!, $file: Upload!, $transcript: String!)
//       {
//          units: unit_CreateUpdate(unit: {id: $id, module_id: $module_id, name: $name, description: $description, file: $file, transcript: $transcript }) {
//             ...unitInfo
//          }
//       }
//       ${UNITS_FRAGMENT}
//    `,
//    typeKey: 'unit.type',
//    actionKey: CREATE_UPDATE_ACTION,
// };

export const UNIT_VIDEO_DELETE = {
   mutation: gql`
      mutation UnitVideoDelete($id: UUID!) {
         video_Delete(sectionId: $id)
      }
   `,
   typeKey: 'unit.type',
   actionKey: DELETE_ACTION,
};

// Section
export const SECTION_ALL_WHERE_QUERY = gql`
   query getSectionAllWhere($sectionId: [UUID], $moduleId: [UUID], $sortOrder: [OrderSpec]) {
      sections: section_AllWhere(sectionSearch: {id: $sectionId, moduleId: $moduleId}, sortOrder: $sortOrder) {
         ...sectionInfo
      }
   }
   ${SECTION_FRAGMENT}
`;

export const SECTION_ALL_QUERY = gql`
   query getSectionAll {
      sections: section_All {
         ...sectionInfo
      }
   }
   ${SECTION_FRAGMENT}
`;

export const SECTION_BY_ID_QUERY = gql`
   query getSectionById($sectionId: UUID!) {
      section: section_ById(sectionId: $sectionId) {
         ...sectionInfo
      }
   }
   ${SECTION_FRAGMENT}
`;

export const getSectionCacheQueries = (moduleId, isDeleted) => {
   return [
      {query: SECTION_ALL_WHERE_QUERY, variables: {module_id: moduleId, isDeleted: isDeleted}, queryPath: 'sections'},
   ];
};

export const getSectionAllCacheQueries = (variables) => {
   return [
      {
         query: SECTION_ALL_WHERE_QUERY,
         variables: {moduleId: variables?.moduleId, sortOrder: {direction: 'ASC', fieldName: 'orderIndex'}},
         queryPath: 'sections',
      },
      {
         query: MODULES_ALL_WHERE_QUERY,
         variables: {courseId: variables?.courseId, sortOrder: [{direction: 'ASC', fieldName: 'orderIndex'}]},
         queryPath: 'modules',
      },
   ];
};

export const getSectionRefetchQuery = (variables) => {
   return [
      // {query: SECTION_ALL_QUERY, queryPath: 'sections'},
      {query: SECTION_ALL_WHERE_QUERY, variables, queryPath: 'sections'},
   ];
};

export const SECTION_CREATE_UPDATE = {
   mutation: gql`
      mutation sectionCreateUpdate(
         $moduleId: UUID
         $id: UUID!
         $name: String
         $description: String
         $transcript: String
         $orderIndex: Int
         $video: String
      ) {
         section: section_CreateUpdate(
            section: {
               id: $id
               moduleId: $moduleId
               name: $name
               description: $description
               transcript: $transcript
               orderIndex: $orderIndex
               video: $video
            }
         ) {
            ...sectionInfo
         }
      }
      ${SECTION_FRAGMENT}
   `,
   typeKey: 'section.type',
   actionKey: CREATE_UPDATE_ACTION,
   updateQueries: getSectionAllCacheQueries,
};

export const SECTION_DELETE = {
   mutation: gql`
      mutation SectionDelete($id: UUID!) {
         section_Delete(sectionId: $id)
      }
   `,
   typeKey: 'section.type',
   actionKey: DELETE_ACTION,
   updateQueries: getSectionAllCacheQueries,
};

// export const SECTION_VIDEO_DELETE = {
//    mutation: gql`
//       mutation SectionVideoDelete($id: UUID!) {
//          video_Delete(sectionId: $id)
//       }
//    `,
//    typeKey: 'video.type',
//    actionKey: DELETE_ACTION,
// };

// resources
// export const RESOURCES_QUERY_WHERE = gql`
//    query getResourcesAllWhere($sectionId: UUID, $isDeleted: [Boolean]) {
//       resources: resource_AllWhere(resourceSearch: {sectionId: $sectionId, isDeleted: $isDeleted}) {
//          ...resourceInfo
//       }
//    }
//    ${RESOURCES_FRAGMENT}
// `;
// export const RESOURCES_CREATE_UPDATE = {
//    mutation: gql`
//       mutation resourceCreateUpdate($sectionId: UUID!, $label: String!) {
//          resources: resources_CreateUpdate(resources: {sectionId: $sectionId, label: $label}) {
//             ...resourcesInfo
//          }
//       }
//       ${RESOURCES_FRAGMENT}
//    `,
//    typeKey: 'resources.type',
//    actionKey: CREATE_UPDATE_ACTION,
// };
// export const getResourcesCacheQueries = (sectionId, isDeleted) => {
//    return [
//       {query: RESOURCES_QUERY_WHERE, variables: {sectionId: sectionId, isDeleted: isDeleted}, queryPath: 'resources'},
//    ];
// };
// export const RESOURCE_DELETE = {
//    mutation: gql`
//       mutation ResourceDelete($id: UUID!) {
//          resource_Delete(resourceId: $id)
//       }
//    `,
//    typeKey: 'resources.type',
//    actionKey: DELETE_ACTION,
// };

// Tasks
export const TASK_CREATE_UPDATE = {
   mutation: gql`
      mutation TaskCreateUpdate(
         $id: UUID!
         $clientId: UUID!
         $dueDate: DateOnly
         $description: String
         $isCompleted: Boolean
         $subject: String
         $userId: UUID
         $entityId: UUID
         $repeatAmount: Int
         $repeatDayOf: Int
         $repeatInterval: String
         $repeatTask: Boolean
      ) {
         task: task_CreateUpdate(
            task: {
               id: $id
               clientId: $clientId
               subject: $subject
               description: $description
               isCompleted: $isCompleted
               dueDate: $dueDate
               userId: $userId
               entityId: $entityId
               repeatAmount: $repeatAmount
               repeatDayOf: $repeatDayOf
               repeatInterval: $repeatInterval
               repeatTask: $repeatTask
            }
         ) {
            ...taskInfo
         }
      }
      ${TASK_FRAGMENT}
   `,
   typeKey: 'task.type',
   actionKey: CREATE_UPDATE_ACTION,
};

export const TASK_CLIENT_QUERY = gql`
   query getTaskAllWhere($clientId: [UUID], $entityId: [UUID]) {
      tasks: task_AllWhere(taskSearch: {clientId: $clientId, entityId: $entityId}) {
         ...taskInfo
      }
   }
   ${TASK_FRAGMENT}
`;

export const TASK_QUERY = gql`
   query getTask($taskId: UUID!) {
      task: task_ById(taskId: $taskId) {
         ...taskInfo
      }
   }
   ${TASK_FRAGMENT}
`;

// Delete the task on the server.
export const TASK_DELETE = {
   mutation: gql`
      mutation TaskDelete($id: UUID!) {
         task_Delete(taskId: $id)
      }
   `,
   typeKey: 'task.type',
   actionKey: DELETE_ACTION,
};

export const TASK_CURRENT_QUERY = gql`
   query getTasksCurrent($clientId: UUID!, $entityId: [UUID], $completedDays: Int) {
      tasks: task_AllCurrent(clientId: $clientId, completedDays: $completedDays, taskSearch: {entityId: $entityId}) {
         ...taskInfo
      }
   }
   ${TASK_FRAGMENT}
`;

export const getTaskCacheQueries = (clientId, taskId) => {
   const queries = [
      {query: TASK_CLIENT_QUERY, variables: {clientId}, queryPath: 'tasks'},
      {
         query: TASK_CURRENT_QUERY,
         variables: {clientId, completedDays: DAYS_TO_DISPLAY_COMPLETED_TASKS},
         queryPath: 'tasks',
      },
      {query: TASK_CURRENT_QUERY, variables: {clientId, completedDays: 0}, queryPath: 'tasks'},
   ];

   if (taskId) {
      queries.push({query: TASK_HISTORY_TASK_QUERY, variables: {taskId}, queryPath: 'taskHistory'});
   }

   return queries;
};

export const TASK_HISTORY_TASK_QUERY = gql`
   query getTaskHistoryAllWhere($taskId: [UUID], $limit: Int, $offset: Int, $completionDateTime: [Timestamp]) {
      taskHistory: taskHistory_AllWhere(
         limit: $limit
         offset: $offset
         taskHistorySearch: {taskId: $taskId, completionDateTime: $completionDateTime}
      ) {
         ...taskHistoryInfo
      }
   }
   ${TASK_HISTORY_FRAGMENT}
`;

export const TASK_HISTORY_DELETE = {
   mutation: gql`
      mutation taskHistoryDelete($id: UUID!) {
         taskHistory_Delete(taskHistoryId: $id)
      }
   `,
   typeKey: 'taskHistory.type',
   actionKey: DELETE_ACTION,
};

export const getTaskHistoryCacheQueries = (taskId, completionDateTime) => {
   const queries = [{query: TASK_HISTORY_TASK_QUERY, variables: {taskId}, queryPath: 'taskHistory'}];

   if (completionDateTime) {
      queries.push({query: TASK_HISTORY_TASK_QUERY, variables: {taskId, completionDateTime}, queryPath: 'taskHistory'});
   }

   return queries;
};
// Entities

export const ENTITY_CREATE_UPDATE = {
   mutation: gql`
      mutation entityCreateUpdate(
         $id: UUID!
         $name: String
         $ein: String
         $clientId: UUID
         $entityId: UUID
         $isActive: Boolean
         $description: String
         $ourWhyHeader: String
         $ourWhyText: String
         $whoWeServe: String
         $impossibleGoal: String
         $isPrimary: Boolean
      ) {
         entity: entity_CreateUpdate(
            entity: {
               id: $id
               name: $name
               ein: $ein
               entityId: $entityId
               clientId: $clientId
               description: $description
               isActive: $isActive
               ourWhyHeader: $ourWhyHeader
               ourWhyText: $ourWhyText
               whoWeServe: $whoWeServe
               impossibleGoal: $impossibleGoal
               isPrimary: $isPrimary
            }
         ) {
            ...entityInfo
         }
      }
      ${ENTITY_FRAGMENT}
   `,
   typeKey: 'entity.type',
   actionKey: CREATE_UPDATE_ACTION,
};

export const ENTITY_UPDATE = {
   mutation: gql`
      mutation entityUpdate($entityId: UUID!, $entity: EntityUpdateInput!) {
         entity: entity_Update(entityId: $entityId, entity: $entity) {
            ...entityInfo
         }
      }
      ${ENTITY_FRAGMENT}
   `,
};

// Delete the entity on the server.
export const ENTITY_DELETE = {
   mutation: gql`
      mutation EntityDelete($id: UUID!) {
         entity_Delete(entityId: $id)
      }
   `,
   typeKey: 'entity.type',
   actionKey: DELETE_ACTION,
};

export const ENTITY_CLIENT_QUERY = gql`
   query getEntityAllWhere($clientId: [UUID], $entityId: [UUID], $id: [UUID], $isActive: [Boolean]) {
      entities: entity_AllWhere(
         entitySearch: {clientId: $clientId, entityId: $entityId, id: $id, isActive: $isActive}
      ) {
         ...entityInfo
      }
   }
   ${ENTITY_FRAGMENT}
`;

export const ENTITY_BY_ID_QUERY = gql`
   query getEntityById($entityId: UUID!) {
      entity: entity_ById(entityId: $entityId) {
         ...entityInfo
      }
   }
   ${ENTITY_FRAGMENT}
`;

export const getEntityCacheQueries = (clientId) => {
   return [{query: ENTITY_CLIENT_QUERY, variables: {clientId}, queryPath: 'entities'}];
};

// Create or update a file with the given properties.
// export const FILE_CREATE = {
//    mutation: gql`
//       mutation FileCreate(
//          $id: UUID!
//          $clientId: UUID!
//          $entityId: UUID
//          $tag: String
//          $userId: UUID
//          $fileLocation: String!
//          $originalFilename: String
//       ) {
//          file: fileUpload_CreateUpdate(
//             fileUpload: {
//                id: $id
//                clientId: $clientId
//                entityId: $entityId
//                userId: $userId
//                tag: $tag
//                fileS3Data: {fileLocation: $fileLocation, originalFilename: $originalFilename}
//             }
//          ) {
//             ...fileInfo
//          }
//       }
//       ${FILE_FRAGMENT}
//    `,
//    typeKey: 'file.type',
//    actionKey: CREATE_UPDATE_ACTION,
// };

// Delete a client .
// export const FILE_DELETE = {
//    mutation: gql`
//       mutation FileDelete($id: UUID!) {
//          fileUpload_Delete(fileUploadId: $id)
//       }
//    `,
//    typeKey: 'file.type',
//    actionKey: DELETE_ACTION,
// };

// export const FILE_ENTITY_QUERY = gql`
//    query getFileAllWhere($clientId: [UUID], $entityId: [UUID], $tag: [String], $userId: [UUID]) {
//       files: fileUpload_AllWhere(
//          fileUploadSearch: {clientId: $clientId, entityId: $entityId, tag: $tag, userId: $userId}
//       ) {
//          ...fileInfo
//       }
//    }
//    ${FILE_FRAGMENT}
// `;

// export const getFileCacheQueries = (clientId, entityId, tag) => {
//    return [{query: FILE_ENTITY_QUERY, variables: {clientId, entityId, tag}, queryPath: 'files'}];
// };

// Assets
export const ASSETS_ENTITY_QUERY = gql`
   query getAssetsAllWhere($entityId: [UUID], $historyDate: DateOnly) {
      assets: asset_AllWhere(assetSearch: {entityId: $entityId}, historyDate: $historyDate) {
         ...assetInfo
      }
   }
   ${ASSET_FRAGMENT}
`;

export const ASSETS_BANK_ENTITY_QUERY = gql`
   query getAssetsAllWhere($assetSearch: AssetSearchInput, $historyDate: DateOnly) {
      assets: asset_AllWhere(assetSearch: $assetSearch, historyDate: $historyDate) {
         ...assetInfo
      }
   }
   ${ASSET_FRAGMENT}
`;

export const ASSET_QUERY = gql`
   query getAssetById($assetId: UUID!, $historyDate: DateOnly) {
      asset: asset_ById(assetId: $assetId, historyDate: $historyDate) {
         ...assetInfo
      }
   }
   ${ASSET_FRAGMENT}
`;

export const getAssetRefetchQueries = (entityId, assetId, historyDate, clientId) => {
   return [
      {query: ASSETS_ENTITY_QUERY, variables: {entityId, historyDate}, queryPath: 'assets'},
      {query: ASSET_QUERY, variables: {assetId, historyDate}, queryPath: 'asset'},
      {query: BANK_ALL_WHERE_QUERY, variables: {clientId}},
      {query: BALANCE_SHEET_QUERY, variables: {entityId, historyDate}, queryPath: 'balanceSheet'},
   ];
};

export const ASSET_CREATE_UPDATE = {
   mutation: gql`
      mutation assetCreateUpdate(
         $id: UUID!
         $assetCategoryId: UUID
         $assetCategory: String
         $entityId: UUID
         $amount: Float
         $acres: Float
         $head: Int
         $weight: Float
         $price: Float
         $quantity: Float
         $year: Int
         $description: String
         $isCollateral: Boolean
         $unitTypeId: UUID
         $isRemoved: Boolean
         $startDate: DateOnly
         $removedDate: DateOnly
         $historyDate: DateOnly
         $bankId: UUID
         $bank: String
         $loanToValue: Float
      ) {
         asset: asset_CreateUpdate(
            historyDate: $historyDate
            asset: {
               id: $id
               assetCategoryId: $assetCategoryId
               assetCategory: $assetCategory
               entityId: $entityId
               amount: $amount
               head: $head
               weight: $weight
               price: $price
               quantity: $quantity
               description: $description
               year: $year
               isCollateral: $isCollateral
               unitTypeId: $unitTypeId
               acres: $acres
               isRemoved: $isRemoved
               startDate: $startDate
               removedDate: $removedDate
               bankId: $bankId
               bank: $bank
               loanToValue: $loanToValue
            }
         ) {
            ...assetInfo
         }
      }
      ${ASSET_FRAGMENT}
   `,
   typeKey: 'asset.type',
};

export const ASSET_DELETE = {
   mutation: gql`
      mutation assetDelete($id: UUID!) {
         asset_Delete(assetId: $id)
      }
   `,
   typeKey: 'asset.type',
   actionKey: DELETE_ACTION,
};

export const ASSET_CATEGORY_QUERY = gql`
   query getAssetsCategories {
      assetCategories: assetCategory_All {
         id
         name
         term
         loanToValue
      }
   }
`;

export const UNIT_TYPE_QUERY = gql`
   query getUnitTypes {
      unitList: unitType_All {
         id
         name
      }
   }
`;

// Create or update a file with the given properties.
export const UNIT_TYPE_CREATE_UPDATE = {
   mutation: gql`
      mutation UnitTypeCreate($id: UUID!, $name: String) {
         unitType: unitType_CreateUpdate(unitType: {id: $id, name: $name}) {
            ...unitTypeInfo
         }
      }
      ${UNIT_TYPE_FRAGMENT}
   `,
   typeKey: 'unitType.type',
   actionKey: CREATE_UPDATE_ACTION,
};

export const getUnitTypeCacheQueries = () => {
   return [{query: UNIT_TYPE_QUERY}];
};

//Liabilities
export const LIABILITIES_ENTITY_QUERY = gql`
   query getLiabilitiesAllWhere($entityId: [UUID], $historyDate: DateOnly) {
      liabilities: liability_AllWhere(liabilitySearch: {entityId: $entityId}, historyDate: $historyDate) {
         ...liabilityInfo
      }
   }
   ${LIABILITY_FRAGMENT}
`;

export const LIABILITY_QUERY = gql`
   query getLiabilityById($liabilityId: UUID!, $historyDate: DateOnly) {
      liability: liability_ById(liabilityId: $liabilityId, historyDate: $historyDate) {
         ...liabilityInfo
      }
   }
   ${LIABILITY_FRAGMENT}
`;

export const getLiabilityRefetchQueries = (entityId, liabilityId, historyDate, clientId) => {
   return [
      {query: LIABILITIES_ENTITY_QUERY, variables: {entityId, historyDate}, queryPath: 'liabilities'},
      {query: LIABILITY_QUERY, variables: {liabilityId, historyDate}, queryPath: 'liability'},
      {query: LIABILITY_TYPE_QUERY},
      {query: BANK_ALL_WHERE_QUERY, variables: {clientId}},
      {query: BALANCE_SHEET_QUERY, variables: {entityId, historyDate}, queryPath: 'balanceSheet'},
   ];
};

export const LIABILITY_CREATE_UPDATE = {
   mutation: gql`
      mutation liabilityCreateUpdate(
         $id: UUID!
         $liabilityCategoryId: UUID
         $liabilityCategory: String
         $entityId: UUID
         $amount: Float
         $description: String
         $isCollateral: Boolean
         $date: DateOnly
         $interestRate: Float
         $note: String
         $bank: String
         $bankId: UUID
         $payment: Float
         $paymentDueDate: String
         $paymentMaturityDate: DateOnly
         $isRemoved: Boolean
         $startDate: DateOnly
         $removedDate: DateOnly
         $historyDate: DateOnly
      ) {
         liability: liability_CreateUpdate(
            liability: {
               id: $id
               liabilityCategoryId: $liabilityCategoryId
               liabilityCategory: $liabilityCategory
               entityId: $entityId
               amount: $amount
               description: $description
               isCollateral: $isCollateral
               date: $date
               interestRate: $interestRate
               note: $note
               bankId: $bankId
               bank: $bank
               payment: $payment
               paymentDueDate: $paymentDueDate
               paymentMaturityDate: $paymentMaturityDate
               isRemoved: $isRemoved
               startDate: $startDate
               removedDate: $removedDate
            }
            historyDate: $historyDate
         ) {
            ...liabilityInfo
         }
      }
      ${LIABILITY_FRAGMENT}
   `,
   typeKey: 'liability.type',
};

export const LIABILITY_DELETE = {
   mutation: gql`
      mutation liabilityDelete($id: UUID!) {
         liability_Delete(liabilityId: $id)
      }
   `,
   typeKey: 'liability.type',
   actionKey: DELETE_ACTION,
};

export const LIABILITY_CATEGORY_QUERY = gql`
   query getLiabilitiesCategories {
      liabilityCategories: liabilityCategory_All {
         id
         name
         term
      }
   }
`;

export const LIABILITY_TYPE_QUERY = gql`
   query getLiabilitiesTypes {
      liabilityTypes: liabilityType_All {
         id
         name
      }
   }
`;

export const BANK_ALL_WHERE_QUERY = gql`
   query getBanksAllWhere($clientId: [UUID]) {
      banks: bank_AllWhere(bankSearch: {clientId: $clientId}) {
         id
         name
      }
   }
`;

// Income
export const INCOME_CREATE_UPDATE = {
   mutation: gql`
      mutation incomeCreateUpdate(
         $entityId: UUID!
         $incomeTypeId: UUID!
         $description: String
         $date: DateOnly!
         $noteActual: String
         $noteExpected: String
         $expected: Float
         $actual: Float
         $taxActual: Float
      ) {
         income: income_CreateUpdate(
            income: {
               entityId: $entityId
               incomeTypeId: $incomeTypeId
               description: $description
               date: $date
               noteActual: $noteActual
               noteExpected: $noteExpected
               expected: $expected
               actual: $actual
               taxActual: $taxActual
            }
         ) {
            ...incomeInfo
         }
      }
      ${INCOME_FRAGMENT}
   `,
   typeKey: 'income.type',
};

export const INCOME_DELETE = {
   mutation: gql`
      mutation incomeDelete($id: UUID!) {
         income_Delete(incomeId: $id)
      }
   `,
   typeKey: 'income.type',
   actionKey: DELETE_ACTION,
};

export const getIncomeUpdateQueries = () => {
   return [
      // {query: INCOME_TYPE_QUERY},
      // {query: INCOME_QUERY, variables: {entityId, firstDate, lastDate}, queryPath: 'income'},
   ];
};

// Create or update an income type.
export const INCOME_TYPE_ALL_WHERE_QUERY = gql`
   query getIncomeTypeAllWhere($id: [UUID], $parentId: [UUID], $entityId: [UUID], $isTaxable: [Boolean]) {
      incomeTypes: incomeType_AllWhere(
         incomeTypeSearch: {id: $id, entityId: $entityId, parentId: $parentId, isTaxable: $isTaxable}
      ) {
         ...incomeTypeInfo
      }
   }
   ${INCOME_TYPE_FRAGMENT}
`;

export const INCOME_TYPE_CREATE_UPDATE = {
   mutation: gql`
      mutation IncomeTypeCreateUpdate(
         $id: UUID!
         $parentId: UUID
         $name: String
         $entityId: UUID
         $isTaxable: Boolean
         $year: Int
      ) {
         incomeType: incomeType_CreateUpdate(
            incomeType: {id: $id, name: $name, parentId: $parentId, entityId: $entityId, isTaxable: $isTaxable}
            year: $year
         ) {
            ...incomeTypeInfo
         }
      }
      ${INCOME_TYPE_FRAGMENT}
   `,
   typeKey: 'incomeType.type',
   actionKey: CREATE_UPDATE_ACTION,
};

export const INCOME_TYPE_DELETE = {
   mutation: gql`
      mutation incomeTypeDelete($id: UUID!, $year: Int) {
         incomeType_Delete(incomeTypeId: $id, year: $year)
      }
   `,
   typeKey: 'incomeType.type',
   actionKey: DELETE_ACTION,
};

export const INCOME_TYPE_UNDELETE = {
   mutation: gql`
      mutation incomeTypeUndelete($id: UUID!, $year: Int) {
         incomeType_UnDelete(incomeTypeId: $id, year: $year)
      }
   `,
   typeKey: 'incomeType.type',
   actionKey: UNDELETE_ACTION,
};

export const getIncomeTypeUpdateQueries = () => {
   return [
      // {query: INCOME_TYPE_QUERY, queryPath: 'incomeTypes',},
   ];
};

// Expense
export const EXPENSE_TYPE_ALL_WHERE_QUERY = gql`
   query getExpenseTypeAllWhere($id: [UUID], $parentId: [UUID], $entityId: [UUID], $isTaxable: [Boolean]) {
      expenseTypes: expenseType_AllWhere(
         expenseTypeSearch: {id: $id, parentId: $parentId, entityId: $entityId, isTaxable: $isTaxable}
      ) {
         ...expenseTypeInfo
      }
   }
   ${EXPENSE_TYPE_FRAGMENT}
`;

export const EXPENSE_CREATE_UPDATE = {
   mutation: gql`
      mutation expenseCreateUpdate(
         $entityId: UUID!
         $expenseTypeId: UUID!
         $description: String
         $date: DateOnly!
         $noteActual: String
         $noteExpected: String
         $expected: Float
         $actual: Float
         $taxActual: Float
      ) {
         expense: expense_CreateUpdate(
            expense: {
               entityId: $entityId
               expenseTypeId: $expenseTypeId
               description: $description
               date: $date
               noteActual: $noteActual
               noteExpected: $noteExpected
               expected: $expected
               actual: $actual
               taxActual: $taxActual
            }
         ) {
            ...expenseInfo
         }
      }
      ${EXPENSE_FRAGMENT}
   `,
   typeKey: 'expense.type',
};

export const EXPENSE_DELETE = {
   mutation: gql`
      mutation expenseDelete($id: UUID!) {
         expense_Delete(expenseId: $id)
      }
   `,
   typeKey: 'expense.type',
   actionKey: DELETE_ACTION,
};

// Create or update an expense type.
export const EXPENSE_TYPE_CREATE_UPDATE = {
   mutation: gql`
      mutation ExpenseTypeCreateUpdate(
         $id: UUID!
         $parentId: UUID
         $name: String
         $entityId: UUID
         $isTaxable: Boolean
         $year: Int
      ) {
         expenseType: expenseType_CreateUpdate(
            expenseType: {id: $id, name: $name, parentId: $parentId, entityId: $entityId, isTaxable: $isTaxable}
            year: $year
         ) {
            ...expenseTypeInfo
         }
      }
      ${EXPENSE_TYPE_FRAGMENT}
   `,
   typeKey: 'expenseType.type',
   actionKey: CREATE_UPDATE_ACTION,
};

export const EXPENSE_TYPE_CREATE_SUBCATEGORY = {
   mutation: gql`
      mutation ExpenseTypeCreateUpdate(
         $id: UUID!
         $parentId: UUID
         $name: String
         $entityId: UUID
         $isTaxable: Boolean
         $year: Int
         $incomes: [IncomeMultiCreateUpdateInput]
         $expenses: [ExpenseMultiCreateUpdateInput]
      ) {
         expenseType: expenseType_CreateUpdate(
            expenseType: {id: $id, name: $name, parentId: $parentId, entityId: $entityId, isTaxable: $isTaxable}
            year: $year
         ) {
            ...expenseTypeInfo
         }
         cashFlow_MultiEdit(incomes: $incomes, expenses: $expenses) {
            incomes {
               id
               success
               entityId
               typeId
               typeName
               date
            }
            expenses {
               id
               success
               entityId
               typeId
               typeName
               date
            }
         }
      }
      ${EXPENSE_TYPE_FRAGMENT}
   `,
   typeKey: 'expenseType.type',
   actionKey: CREATE_UPDATE_ACTION,
};

export const EXPENSE_TYPE_DELETE = {
   mutation: gql`
      mutation expenseTypeDelete($id: UUID!, $year: Int) {
         expenseType_Delete(expenseTypeId: $id, year: $year)
      }
   `,
   typeKey: 'expenseType.type',
   actionKey: DELETE_ACTION,
};

export const EXPENSE_TYPE_UNDELETE = {
   mutation: gql`
      mutation expenseTypeUndelete($id: UUID!, $year: Int) {
         expenseType_UnDelete(expenseTypeId: $id, year: $year)
      }
   `,
   typeKey: 'expenseType.type',
   actionKey: UNDELETE_ACTION,
};

export const getExpenseUpdateQueries = () => {
   return [
      // {query: EXPENSE_QUERY, variables: {entityId, firstDate, lastDate}, queryPath: 'expenses'},
   ];
};

export const getExpenseTypeUpdateQueries = () => {
   return [
      // {query: EXPENSE_TYPE_QUERY, variables: {entityId}, queryPath: 'expenseTypes'},
   ];
};

export const BALANCE_SHEET_QUERY = gql`
   query getBalanceReportQuery($date: DateOnly, $entityId: [UUID]) {
      balanceSheet: balanceReport(date: $date, entityId: $entityId) {
         ...balanceReportInfo
      }
   }
   ${BALANCE_REPORT_FRAGMENT}
`;

export const LOAN_ANALYSIS_QUERY = gql`
   query getLoanAnalysisQuery($date: DateOnly, $entityId: [UUID]) {
      loanAnalysis: loanAnalysis(date: $date, entityId: $entityId) {
         ...loanAnalysisInfo
      }
   }
   ${LOAN_ANALYSIS_FRAGMENT}
`;

export const CASH_FLOW_QUERY = gql`
   query getCashFlowQuery($year: Int, $entityId: [UUID]) {
      cashFlow: cashFlowReport(year: $year, entityId: $entityId, expenseTypeExclusions: ["Depreciation"]) {
         ...cashFlowInfo
      }
   }
   ${CASH_FLOW_FRAGMENT}
`;

export const TAXABLE_CASH_FLOW_QUERY = gql`
   query getCashFlowQuery(
      $year: Int
      $entityId: [UUID]
      $expenseTypeExclusions: [String]
      $incomeTypeExclusions: [String]
   ) {
      cashFlow: cashFlowReport(
         year: $year
         entityId: $entityId
         expenseTypeExclusions: $expenseTypeExclusions
         incomeTypeExclusions: $incomeTypeExclusions
      ) {
         ...cashFlowInfo
      }
   }
   ${CASH_FLOW_FRAGMENT}
`;

export const ENTITY_CASH_FLOW_ALL_WHERE_QUERY = gql`
   query getEntityCashFlowAllWhere($entityId: [UUID], $year: [Int]) {
      entityCashFlow: entityCashFlow_AllWhere(entityCashFlowSearch: {entityId: $entityId, year: $year}) {
         ...entityCashFlowInfo
      }
   }
   ${ENTITY_CASH_FLOW_FRAGMENT}
`;

// const ENTITY_CASH_FLOW_ = gql`
//    mutation entityCashFlow($: String, $: String, $: String, $: String, $: String)
//    {
//       entityCashFlow: entityCashFlow_(entityCashFlow: {: $, : $, : $, : $, : $}) {
//          ...entityCashFlow
//       }
//    }
//    ${ENTITY_CASH_FLOW_FRAGMENT}
// `;

export const ENTITY_CASH_FLOW_CREATE_UPDATE = {
   mutation: gql`
      mutation entityCashFlowCreateUpdate(
         $id: UUID!
         $year: Int!
         $entityId: UUID!
         $actualOperatingLoanBalance: Float
         $expectedOperatingLoanBalance: Float
         $operatingLoanLimit: Float
         $carryoverIncome: Float
         $taxLock: Boolean
         $carryoverIncomeNote: String
         $isCashOnly: Boolean
      ) {
         entityCashFlow: entityCashFlow_CreateUpdate(
            entityCashFlow: {
               id: $id
               year: $year
               entityId: $entityId
               actualOperatingLoanBalance: $actualOperatingLoanBalance
               expectedOperatingLoanBalance: $expectedOperatingLoanBalance
               operatingLoanLimit: $operatingLoanLimit
               carryoverIncome: $carryoverIncome
               taxLock: $taxLock
               carryoverIncomeNote: $carryoverIncomeNote
               isCashOnly: $isCashOnly
            }
         ) {
            ...entityCashFlowInfo
         }
      }
      ${ENTITY_CASH_FLOW_FRAGMENT}
   `,
   typeKey: 'cashFlow.type',
   actionKey: CREATE_UPDATE_ACTION,
};

export const CASH_FLOW_CARRY_OVER = {
   mutation: gql`
      mutation entityCashFlowCarryOver($year: Int!, $entityId: UUID!) {
         cashFlowCarryOver(entityId: [$entityId], year: $year)
      }
   `,
   typeKey: 'copyCashFlow.type',
   actionKey: COPY_ACTION,
};

export const getCashFlowReportRefetchQueries = (entityId, year) => () => {
   return [
      {query: ENTITY_CASH_FLOW_ALL_WHERE_QUERY, variables: {entityId, year}, queryPath: 'entityCashFlow'},
      {query: CASH_FLOW_QUERY, variables: {entityId, year}, queryPath: 'entityCashFlow'},
   ];
};

export const getEntityCashFlowRefetchQueries = (entityId, year) => () => {
   return [{query: ENTITY_CASH_FLOW_ALL_WHERE_QUERY, variables: {entityId, year}, queryPath: 'entityCashFlow'}];
};

export const SEAT_ALL_WHERE_QUERY = gql`
   query getSeatAllWhere($id: [UUID], $entityId: [UUID]) {
      seats: seat_AllWhere(seatSearch: {id: $id, entityId: $entityId}) {
         ...seatInfo
      }
   }
   ${SEAT_FRAGMENT}
`;

export const SEAT_BY_ID_QUERY = gql`
   query getSeatById($seatId: UUID!) {
      seat: seat_ById(seatId: $seatId) {
         ...seatInfo
      }
   }
   ${SEAT_FRAGMENT}
`;
export const SEAT_DELETE = {
   mutation: gql`
      mutation seatDelete($id: UUID!) {
         seat_Delete(seatId: $id)
      }
   `,
   typeKey: 'accountability.type',
   actionKey: DELETE_ACTION,
};

export const SEAT_CREATE_UPDATE = {
   mutation: gql`
      mutation seatCreateUpdate(
         $id: UUID!
         $entityId: UUID
         $userIdList: [UUID]
         $seatId: UUID
         $name: String
         $order: Int
         $responsibilities: [ResponsibilityInput]
      ) {
         seat: seat_CreateUpdate(
            seat: {
               id: $id
               entityId: $entityId
               userIdList: $userIdList
               seatId: $seatId
               name: $name
               order: $order
               responsibilities: $responsibilities
            }
         ) {
            ...seatInfo
         }
      }
      ${SEAT_FRAGMENT}
   `,
   typeKey: 'accountability.type',
   actionKey: CREATE_UPDATE_ACTION,
};

export const getSeatCacheQueries = (entityId) => {
   return [{query: SEAT_ALL_WHERE_QUERY, variables: {entityId}, queryPath: 'seats'}];
};

// Folder

export const FOLDER_CREATE_UPDATE = {
   mutation: gql`
      mutation folderCreateUpdate($id: UUID!, $name: String, $description: String) {
         folder: folderTemplate_CreateUpdate(folderTemplate: {id: $id, name: $name, description: $description}) {
            ...folderInfo
         }
      }
      ${FOLDER_FRAGMENT}
   `,
   typeKey: 'folder.type',
   actionKey: CREATE_UPDATE_ACTION,
};

// Delete the folder on the server.
export const FOLDER_DELETE = {
   mutation: gql`
      mutation folderDelete($id: UUID!) {
         folderTemplate_Delete(folderTemplateId: $id)
      }
   `,
   typeKey: 'folder.type',
   actionKey: DELETE_ACTION,
};

export const FOLDER_UNDELETE = {
   mutation: gql`
      mutation expenseTypeUndelete($id: UUID!) {
         folderTemplate_UnDelete(folderTemplateId: $id)
      }
   `,
   typeKey: 'folder.type',
   actionKey: UNDELETE_ACTION,
};

export const FOLDER_QUERY = gql`
   query getFolderAll {
      folders: folderTemplate_All {
         ...folderInfo
      }
   }
   ${FOLDER_FRAGMENT}
`;

export const FOLDER_BY_ID_QUERY = gql`
   query getFolderById($folderId: UUID!) {
      folder: folderTemplate_ById(folderTemplateId: $folderId) {
         ...folderInfo
      }
   }
   ${FOLDER_FRAGMENT}
`;

export const getFolderCacheQueries = () => {
   return [{query: FOLDER_QUERY, queryPath: 'folders'}];
};

// Contracts & Hedges
export const CASH_CONTRACTS_ENTITY_QUERY = gql`
   query getCashContractsAllWhere($entityId: [UUID], $historyDate: DateOnly) {
      cashContracts: cashContract_AllWhere(cashContractSearch: {entityId: $entityId}, historyDate: $historyDate) {
         ...cashContractInfo
      }
   }
   ${CASH_CONTRACT_FRAGMENT}
`;

export const FUTURE_CONTRACTS_ENTITY_QUERY = gql`
   query getFutureContractsAllWhere($entityId: [UUID], $historyDate: DateOnly) {
      futureContracts: futuresContract_AllWhere(
         futuresContractSearch: {entityId: $entityId}
         historyDate: $historyDate
      ) {
         ...futureContractInfo
      }
   }
   ${FUTURE_CONTRACT_FRAGMENT}
`;

export const HEDGE_CONTRACTS_ENTITY_QUERY = gql`
   query getHedgeContractsAllWhere($entityId: [UUID], $historyDate: DateOnly) {
      hedgeContracts: hedgesContract_AllWhere(hedgesContractSearch: {entityId: $entityId}, historyDate: $historyDate) {
         ...hedgeContractInfo
      }
   }
   ${HEDGE_CONTRACT_FRAGMENT}
`;

export const CASH_CONTRACT_BY_ID_QUERY = gql`
   query getCashContractById($contractId: UUID!, $historyDate: DateOnly) {
      contract: cashContract_ById(cashContractId: $contractId, historyDate: $historyDate) {
         ...cashContractInfo
      }
   }
   ${CASH_CONTRACT_FRAGMENT}
`;

export const FUTURE_CONTRACT_BY_ID_QUERY = gql`
   query getFutureContractById($contractId: UUID!, $historyDate: DateOnly) {
      contract: futuresContract_ById(futuresContractId: $contractId, historyDate: $historyDate) {
         ...futureContractInfo
      }
   }
   ${FUTURE_CONTRACT_FRAGMENT}
`;

export const HEDGE_CONTRACT_BY_ID_QUERY = gql`
   query getHedgeContractById($contractId: UUID!, $historyDate: DateOnly) {
      contract: hedgesContract_ById(hedgesContractId: $contractId, historyDate: $historyDate) {
         ...hedgeContractInfo
      }
   }
   ${HEDGE_CONTRACT_FRAGMENT}
`;

export const getCashContractRefetchQueries = (entityId, historyDate) => {
   return [{query: CASH_CONTRACTS_ENTITY_QUERY, variables: {entityId, historyDate}, queryPath: 'cashContracts'}];
};

export const getFutureContractRefetchQueries = (entityId, historyDate) => {
   return [{query: FUTURE_CONTRACTS_ENTITY_QUERY, variables: {entityId, historyDate}, queryPath: 'futureContracts'}];
};

export const getHedgeContractRefetchQueries = (entityId, historyDate) => {
   return [{query: HEDGE_CONTRACTS_ENTITY_QUERY, variables: {entityId, historyDate}, queryPath: 'hedgeContracts'}];
};

// export const getContractRefetchQueries = (entityId, contractId, historyDate) => {
//    return [
//       {query: CASH_CONTRACTS_ENTITY_QUERY, variables: {entityId, historyDate}, queryPath: 'cashContracts'},
//       {query: FUTURE_CONTRACTS_ENTITY_QUERY, variables: {entityId, historyDate}, queryPath: 'futureContracts'},
//       {query: HEDGE_CONTRACTS_ENTITY_QUERY, variables: {entityId, historyDate}, queryPath: 'hedgeContracts'},
//    ];
// };

export const CASH_CONTRACT_CREATE_UPDATE = {
   mutation: gql`
      mutation cashContractCreateUpdate(
         $contractId: UUID!
         $bushelsSold: Float
         $contractNumber: Int
         $crop: String
         $date: DateOnly
         $deliveryLocation: String
         $deliveryMonth: Int
         $description: String
         $entityId: UUID
         $isDelivered: Boolean
         $isNew: Boolean
         $isRemoved: Boolean
         $price: Float
         $removedDate: DateOnly
         $startDate: DateOnly
         $historyDate: DateOnly
      ) {
         cashContract: cashContract_CreateUpdate(
            historyDate: $historyDate
            cashContract: {
               id: $contractId
               bushelsSold: $bushelsSold
               contractNumber: $contractNumber
               crop: $crop
               date: $date
               deliveryLocation: $deliveryLocation
               deliveryMonth: $deliveryMonth
               description: $description
               entityId: $entityId
               isDelivered: $isDelivered
               isNew: $isNew
               isRemoved: $isRemoved
               price: $price
               removedDate: $removedDate
               startDate: $startDate
            }
         ) {
            ...cashContractInfo
         }
      }
      ${CASH_CONTRACT_FRAGMENT}
   `,
   typeKey: 'contract.type',
};

export const FUTURE_CONTRACT_CREATE_UPDATE = {
   mutation: gql`
      mutation futureContractCreateUpdate(
         $id: UUID!
         $bushels: Float
         $cashPrice: Float
         $contractNumber: Int
         $crop: String
         $date: DateOnly
         $deliveryLocation: String
         $description: String
         $entityId: UUID
         $estimatedBasis: Float
         $futuresPrice: Float
         $isRemoved: Boolean
         $month: Int
         $note: String
         $removedDate: DateOnly
         $startDate: DateOnly
         $historyDate: DateOnly
         $year: Int
      ) {
         futureContract: futuresContract_CreateUpdate(
            historyDate: $historyDate
            futuresContract: {
               id: $id
               bushels: $bushels
               cashPrice: $cashPrice
               contractNumber: $contractNumber
               crop: $crop
               date: $date
               deliveryLocation: $deliveryLocation
               description: $description
               entityId: $entityId
               estimatedBasis: $estimatedBasis
               futuresPrice: $futuresPrice
               isRemoved: $isRemoved
               month: $month
               note: $note
               removedDate: $removedDate
               startDate: $startDate
               year: $year
            }
         ) {
            ...futureContractInfo
         }
      }
      ${FUTURE_CONTRACT_FRAGMENT}
   `,
   typeKey: 'contract.type',
};

export const HEDGE_CONTRACT_CREATE_UPDATE = {
   mutation: gql`
      mutation hedgeContractCreateUpdate(
         $id: UUID!
         $bushels: Float
         $contractNumber: Int
         $crop: String
         $currentMarketValue: Float
         $description: String
         $entityId: UUID
         $isRemoved: Boolean
         $month: Int
         $note: String
         $removedDate: DateOnly
         $startDate: DateOnly
         $strikeCost: Float
         $strikePrice: Float
         $historyDate: DateOnly
         $year: Int
      ) {
         hedgeContract: hedgesContract_CreateUpdate(
            historyDate: $historyDate
            hedgesContract: {
               id: $id
               bushels: $bushels
               contractNumber: $contractNumber
               crop: $crop
               currentMarketValue: $currentMarketValue
               description: $description
               entityId: $entityId
               isRemoved: $isRemoved
               month: $month
               note: $note
               removedDate: $removedDate
               startDate: $startDate
               strikeCost: $strikeCost
               strikePrice: $strikePrice
               year: $year
            }
         ) {
            ...hedgeContractInfo
         }
      }
      ${HEDGE_CONTRACT_FRAGMENT}
   `,
   typeKey: 'contract.type',
};

export const CASH_CONTRACT_DELETE = {
   mutation: gql`
      mutation cashContractDelete($contractId: UUID!) {
         cashContract_Delete(cashContractId: $contractId)
      }
   `,
   typeKey: 'contract.type',
   actionKey: DELETE_ACTION,
};

export const FUTURE_CONTRACT_DELETE = {
   mutation: gql`
      mutation futureContractDelete($contractId: UUID!) {
         futuresContract_Delete(futuresContractId: $contractId)
      }
   `,
   typeKey: 'contract.type',
   actionKey: DELETE_ACTION,
};

export const HEDGE_CONTRACT_DELETE = {
   mutation: gql`
      mutation hedgeContractDelete($contractId: UUID!) {
         hedgesContract_Delete(hedgesContractId: $contractId)
      }
   `,
   typeKey: 'contract.type',
   actionKey: DELETE_ACTION,
};

export const CORE_VALUE_CREATE = {
   mutation: gql`
      mutation createCoreValue($input: CoreValueCreateInput!) {
         coreValue_Create(coreValue: $input) {
            ...coreValueInfo
         }
      }
      ${CORE_VALUE_FRAGMENT}
   `,
   typeKey: CREATE_UPDATE_ACTION,
   actionKey: 'coreValue.type',
};

export const CORE_VALUE_GET = gql`
   query getCoreValue(
      $coreValueSearch: CoreValueSearchInput
      $limit: Int
      $offset: Int
      $includeDeleted: Boolean
      $sortOrder: [OrderSpec]
   ) {
      coreValue_AllWhere(
         coreValueSearch: $coreValueSearch
         limit: $limit
         offset: $offset
         includeDeleted: $includeDeleted
         sortOrder: $sortOrder
      ) {
         ...coreValueInfo
      }
   }
   ${CORE_VALUE_FRAGMENT}
`;

export const CORE_VALUE_UPDATE = {
   mutation: gql`
      mutation updateCoreValue($coreValueId: UUID!, $coreValue: CoreValueUpdateInput!) {
         coreValue_Update(coreValueId: $coreValueId, coreValue: $coreValue) {
            ...coreValueInfo
         }
      }
      ${CORE_VALUE_FRAGMENT}
   `,
   typeKey: CREATE_UPDATE_ACTION,
   actionKey: 'coreValue.type',
};

export const CORE_VALUE_DELETE = {
   mutation: gql`
      mutation deleteCoreValue($coreValueId: UUID!) {
         coreValue_Delete(coreValueId: $coreValueId)
      }
   `,
   typeKey: DELETE_ACTION,
   actionKey: 'coreValue.type',
};

export const GOAL_CREATE = {
   mutation: gql`
      mutation createGoal($input: GoalCreateInput!) {
         goal_Create(goal: $input) {
            ...goalInfo
         }
      }
      ${GOAL_FRAGMENT}
   `,
   typeKey: CREATE_UPDATE_ACTION,
   actionKey: 'goal.type',
};

export const GOAL_GET = gql`
   query getGoal(
      $goalSearch: GoalSearchInput
      $limit: Int
      $offset: Int
      $includeDeleted: Boolean
      $sortOrder: [OrderSpec]
   ) {
      goal_AllWhere(
         goalSearch: $goalSearch
         limit: $limit
         offset: $offset
         includeDeleted: $includeDeleted
         sortOrder: $sortOrder
      ) {
         ...goalInfo
      }
   }
   ${GOAL_FRAGMENT}
`;

export const GOAL_UPDATE = {
   mutation: gql`
      mutation updateGoal($goalId: UUID!, $goal: GoalUpdateInput!) {
         goal_Update(goalId: $goalId, goal: $goal) {
            ...goalInfo
         }
      }
      ${GOAL_FRAGMENT}
   `,
   typeKey: CREATE_UPDATE_ACTION,
   actionKey: 'goal.type',
};

export const TARGET_GROUP_GET = gql`
   query getTargetGroup(
      $targetGroupSearch: TargetGroupSearchInput
      $limit: Int
      $offset: Int
      $includeDeleted: Boolean
      $sortOrder: [OrderSpec]
   ) {
      targetGroup_AllWhere(
         targetGroupSearch: $targetGroupSearch
         limit: $limit
         offset: $offset
         includeDeleted: $includeDeleted
         sortOrder: $sortOrder
      ) {
         id
         hash
         entityId
         name
         description
         length
         isArchived
         targets {
            id
            hash
            entityId
            targetGroupId
            assignedToId
            orderIndex
            note
            dueDate
            isCompleted
            assignee {
               id
               lastName
               firstName
               username
               contactName
               path_url
            }
            isDeleted
            createdByUserId
            createdDateTime
            updatedByUserId
            updatedDateTime
         }
         createdDateTime
         updatedByUserId
         updatedDateTime
      }
   }
`;

export const TARGET_GROUP_CREATE = {
   mutation: gql`
      mutation createTargetGroup($input: TargetGroupCreateInput!) {
         targetGroup_Create(targetGroup: $input) {
            ...tgInfo
         }
      }
      ${TARGET_GROUP_FRAGMENT}
   `,
   typeKey: CREATE_UPDATE_ACTION,
   actionKey: 'rockGroup.type',
};

export const TARGET_GROUP_UPDATE = {
   mutation: gql`
      mutation updateTargetGroup($targetGroupId: UUID!, $targetGroup: TargetGroupUpdateInput!) {
         targetGroup_Update(targetGroupId: $targetGroupId, targetGroup: $targetGroup) {
            ...tgInfo
         }
      }
      ${TARGET_GROUP_FRAGMENT}
   `,
   typeKey: CREATE_UPDATE_ACTION,
   actionKey: 'rockGroup.type',
};

export const TARGET_CREATE = {
   mutation: gql`
      mutation createTarget($input: TargetCreateInput!) {
         target_Create(target: $input) {
            ...targetInfo
         }
      }
      ${TARGET_FRAGMENT}
   `,
   typeKey: CREATE_UPDATE_ACTION,
   actionKey: 'rock.type',
};

export const TARGET_UPDATE = {
   mutation: gql`
      mutation updateTarget($input: TargetUpdateInput!, $targetId: UUID!) {
         target_Update(target: $input, targetId: $targetId) {
            ...targetInfo
         }
      }
      ${TARGET_FRAGMENT}
   `,
   typeKey: CREATE_UPDATE_ACTION,
   actionKey: 'rock.type',
};

export const DELETE_TARGET = {
   mutation: gql`
      mutation deleteTarget($targetId: UUID!) {
         target_Delete(targetId: $targetId)
      }
   `,
   typeKey: DELETE_ACTION,
   actionKey: 'rock.type',
};

export const DELETE_TARGET_GROUP = {
   mutation: gql`
      mutation deleteTargetGroup($targetGroupId: UUID!) {
         targetGroup_Delete(targetGroupId: $targetGroupId)
      }
   `,
   typeKey: CREATE_UPDATE_ACTION,
   actionKey: 'rockGroup.type',
};

export const TEAM_MEETING_GET = gql`
   query getTeamMeeting(
      $teamMeetingNoteSearch: TeamMeetingNoteSearchInput
      $limit: Int
      $offset: Int
      $includeDeleted: Boolean
      $sortOrder: [OrderSpec]
   ) {
      teamMeetingNote_AllWhere(
         teamMeetingNoteSearch: $teamMeetingNoteSearch
         limit: $limit
         offset: $offset
         includeDeleted: $includeDeleted
         sortOrder: $sortOrder
      ) {
         ...meetingInfo
      }
   }
   ${MEETING_FRAGMENT}
`;

export const MEETING_NOTE_CREATE = {
   mutation: gql`
      mutation createMeetingNote($input: TeamMeetingNoteCreateInput!) {
         teamMeetingNote_Create(teamMeetingNote: $input) {
            ...meetingInfo
         }
      }
      ${MEETING_FRAGMENT}
   `,
   typeKey: CREATE_UPDATE_ACTION,
   actionKey: 'meetingNote.type',
};

export const MEETING_NOTE_UPDATE = {
   mutation: gql`
      mutation updateMeetingNote($teamMeetingNoteId: UUID!, $teamMeetingNote: TeamMeetingNoteUpdateInput!) {
         teamMeetingNote_Update(teamMeetingNoteId: $teamMeetingNoteId, teamMeetingNote: $teamMeetingNote) {
            ...meetingInfo
         }
      }
      ${MEETING_FRAGMENT}
   `,
   typeKey: CREATE_UPDATE_ACTION,
   actionKey: 'meetingNote.type',
};

export const DELETE_MEETING = {
   mutation: gql`
      mutation deleteMeeting($teamMeetingNoteId: UUID!) {
         teamMeetingNote_Delete(teamMeetingNoteId: $teamMeetingNoteId)
      }
   `,
   typeKey: DELETE_ACTION,
   actionKey: 'meetingNote.type',
};

export const STATUS_GET = gql`
   query getStatus($limit: Int, $offset: Int, $includeDeleted: Boolean) {
      status_All(limit: $limit, offset: $offset, includeDeleted: $includeDeleted) {
         id
         name
      }
   }
`;

export const TASK_GET = gql`
   query getTask($taskSearch: TaskSearchInput, $limit: Int, $offset: Int, $includeDeleted: Boolean) {
      task_AllWhere(taskSearch: $taskSearch, limit: $limit, offset: $offset, includeDeleted: $includeDeleted) {
         ...taskInfo
      }
   }
   ${NEW_TASK_FRAGMENT}
`;

export const TASK_CREATE = {
   mutation: gql`
      mutation createTask($task: TaskCreateInput!) {
         task_Create(task: $task) {
            ...taskInfo
         }
      }
      ${NEW_TASK_FRAGMENT}
   `,
   typeKey: CREATE_UPDATE_ACTION,
   actionKey: 'task.type',
};

export const TASK_UPDATE = {
   mutation: gql`
      mutation updateTask($taskId: UUID!, $task: TaskUpdateInput!) {
         task_Update(taskId: $taskId, task: $task) {
            ...taskInfo
         }
      }
      ${NEW_TASK_FRAGMENT}
   `,
   typeKey: CREATE_UPDATE_ACTION,
   actionKey: 'task.type',
};

export const DELETE_TASK = {
   mutation: gql`
      mutation deleteTask($taskId: UUID!) {
         task_Delete(taskId: $taskId)
      }
   `,
   typeKey: DELETE_ACTION,
   actionKey: 'task.type',
};

// export const COMPLETE_TASK = {
//    mutation: gql`
//       mutation completeTask($taskId: UUID!) {
//          task_Complete(taskId: $taskId)
//       }
//    `,
//    typeKey: CREATE_UPDATE_ACTION,
//    actionKey: 'task.type',
// };

// export const getTargetGroupsCacheQueries = (entityId) => {
//    return [
//       {
//          query: TARGET_GROUP_GET,
//          variables: {
//             targetGroupSearch: {entityId},
//          },
//          queryPath: 'targetGroup_AllWhere',
//       },
//    ];
// };

export const getCoreValuesCacheQueries = (entityId) => {
   return [
      {
         query: CORE_VALUE_GET,
         variables: {
            coreValueSearch: {entityId},
         },
         queryPath: 'coreValue_AllWhere',
      },
   ];
};

export const getTeamMeetingQueries = (entityId, category) => {
   return [
      {
         query: TEAM_MEETING_GET,
         variables: {teamMeetingNoteSearch: {entityId, category}},
         queryPath: 'teamMeetingNote_AllWhere',
      },
   ];
};

export const getTaskQueries = (clientId, entityId) => {
   return [
      {
         query: TASK_GET,
         variables: {
            taskSearch: {
               clientId,
               entityId,
            },
         },
         queryPath: 'task_AllWhere',
      },
   ];
};

export const PERMISSION_CREATE_UPDATE = {
   mutation: gql`
      mutation permissionCreateUpdate($id: UUID!, $name: String) {
         permission: permission_CreateUpdate(permission: {id: $id, name: $name}) {
            ...permissionInfo
         }
      }
      ${PERMISSION_FRAGMENT}
   `,
   typeKey: CREATE_UPDATE_ACTION,
   actionKey: 'permission.type',
};

export const PERMISSION_ALL_QUERY = gql`
   query getPermissionAll {
      permissions: permission_All {
         ...permissionInfo
      }
   }
   ${PERMISSION_FRAGMENT}
`;

export const ROLE_ALL_QUERY = gql`
   query getRoleAll {
      roles: role_All {
         ...roleInfo
      }
   }
   ${ROLE_FRAGMENT}
`;

// FRANCHISE
export const FRANCHISE_ALL_QUERY = gql`
   query getAllFranchises {
      franchises: franchise_All {
         ...franchiseInfo
      }
   }
   ${FRANCHISE_FRAGMENT}
`;

export const FRANCHISE_ALL_WHERE_QUERY = gql`
   query getFranchiseAllWhere($name: [String]) {
      franchises: franchise_AllWhere(franchiseSearch: {name: $name}) {
         ...franchiseInfo
      }
   }
   ${FRANCHISE_FRAGMENT}
`;

export const FRANCHISE_BY_ID_QUERY = gql`
   query getFranchiseById($franchiseId: UUID!) {
      franchise: franchise_ById(franchiseId: $franchiseId) {
         ...franchiseInfo
      }
   }
   ${FRANCHISE_FRAGMENT}
`;

export const getFranchiseCacheQueries = () => {
   return [{query: FRANCHISE_ALL_QUERY, queryPath: 'franchises'}];
};

// Change cityId and stateId to UUID when server is fixed.
export const FRANCHISE_CREATE_UPDATE = {
   mutation: gql`
      mutation franchiseCreateUpdate(
         $id: UUID!
         $cityId: UUID
         $stateId: UUID
         $name: String
         $contactName: String
         $addressLineOne: String
         $addressLineTwo: String
         $phone: String
         $zipCode: String
         $email: String
      ) {
         franchise: franchise_CreateUpdate(
            franchise: {
               id: $id
               cityId: $cityId
               stateId: $stateId
               name: $name
               addressLineOne: $addressLineOne
               addressLineTwo: $addressLineTwo
               phone: $phone
               zipCode: $zipCode
               contactName: $contactName
               email: $email
            }
         ) {
            ...franchiseInfo
         }
      }
      ${FRANCHISE_FRAGMENT}
   `,
   typeKey: 'franchise.type',
   actionKey: CREATE_UPDATE_ACTION,
};

// Delete the franchise on the server.
export const FRANCHISE_DELETE = {
   mutation: gql`
      mutation FranchiseDelete($id: UUID!) {
         franchise_Delete(franchiseId: $id)
      }
   `,
   typeKey: 'franchise.type',
   actionKey: DELETE_ACTION,
};

export const CHAT_ROOM_ALL_WHERE = gql`
   query getAllChatRoom(
      $chatRoomSearch: ChatRoomSearchInput
      $limit: Int
      $offset: Int
      $includeDeleted: Boolean
      $memberOnly: Boolean = false
      $userId: [UUID]
      $sortOrder: [OrderSpec]
   ) {
      chatRooms: chatRoom_AllWhere(
         chatRoomSearch: $chatRoomSearch
         limit: $limit
         offset: $offset
         includeDeleted: $includeDeleted
         userId: $userId
         sortOrder: $sortOrder
         memberOnly: $memberOnly
      ) {
         ...chatRoom
      }
   }
   ${CHAT_ROOM}
`;

export const CHAT_ROOM_BY_ID_QUERY = gql`
   query getChatRoomById($chatRoomId: UUID!) {
      chatRoom: chatRoom_ById(chatRoomId: $chatRoomId) {
         ...chatRoom
      }
   }
   ${CHAT_ROOM}
`;

export const CHAT_MESSAGE_CREATE_UPDATE = {
   mutation: gql`
      mutation addChatMessage($chatMessage: ChatMessageCreateInput!) {
         chatMessage_Create(chatMessage: $chatMessage) {
            ...chatMessage
         }
      }
      ${CHAT_MESSAGE}
   `,
   typeKey: CREATE_UPDATE_ACTION,
   actionKey: 'chat.type',
};

export const MESSAGE_POSTED_SUBSCRIPTION = gql`
   subscription newMessage($chatRoomId: UUID!) {
      chatMessage_MessagePosted(chatRoomId: $chatRoomId) {
         ...chatMessage
      }
   }
   ${CHAT_MESSAGE}
`;

export const ADDED_TO_ROOM_SUBSCRIPTION = gql`
   subscription addedToRoom($userId: UUID!) {
      chatRoom_AddedToRoom(userId: $userId) {
         ...chatRoom
      }
   }
   ${CHAT_ROOM}
`;

export const CREATE_ROOM_SUBSCRIPTION = gql`
   subscription chatRoom_Created {
      chatRoom_Created {
         ...chatRoom
      }
   }
   ${CHAT_ROOM}
`;

export const RENAME_ROOM_SUBSCRIPTION = gql`
   subscription chatRoom_Renamed {
      chatRoom_Renamed {
         ...chatRoom
      }
   }
   ${CHAT_ROOM}
`;

export const DROPPED_FROM_ROOM_SUBSCRIPTION = gql`
   subscription droppedFromRoom($userId: UUID!) {
      chatRoom_DroppedFromRoom(userId: $userId) {
         ...chatRoom
      }
   }
   ${CHAT_ROOM}
`;

export const MESSAGE_READ_SUBSCRIPTION = gql`
   subscription chatMessage_MessageRead($chatRoomId: UUID!) {
      chatMessage_MessageRead(chatRoomId: $chatRoomId) {
         ...userInfo
      }
   }
   ${USER_FRAGMENT}
`;

export const CHAT_ROOM_UPDATE = {
   mutation: gql`
      mutation updateChatRoom($chatRoomId: UUID!, $chatRoom: ChatRoomUpdateInput!, $userId: [UUID!]) {
         chatRoom_Update(chatRoomId: $chatRoomId, chatRoom: $chatRoom, userId: $userId) {
            ...chatRoom
         }
      }
      ${CHAT_ROOM}
   `,
   typeKey: CREATE_UPDATE_ACTION,
   actionKey: 'chat.type',
};

export const CHAT_ROOM_CREATE = {
   mutation: gql`
      mutation createChatRoom($chatRoom: ChatRoomCreateInput!, $userId: [UUID!]) {
         chatRoom_Create(chatRoom: $chatRoom, userId: $userId) {
            ...chatRoom
         }
      }
      ${CHAT_ROOM}
   `,
   typeKey: CREATE_UPDATE_ACTION,
   actionKey: 'chat.type',
};

export const CHAT_ROOM_DELETE = {
   mutation: gql`
      mutation deleteChatRoom($chatRoomId: UUID!) {
         chatRoom_Delete(chatRoomId: $chatRoomId)
      }
   `,
   typeKey: DELETE_ACTION,
   actionKey: 'chat.type',
};

export const REMOVE_USER_CHAT_ROOM = {
   mutation: gql`
      mutation dropUserChatRoom($chatRoomId: UUID!, $userId: [UUID!]) {
         chatRoom_DropUsers(chatRoomId: $chatRoomId, userId: $userId) {
            id
            status
         }
      }
   `,
   typeKey: DELETE_ACTION,
   actionKey: 'chat.type',
};

export const LEAVE_USER_CHAT_ROOM = {
   mutation: gql`
      mutation leaveUserChatRoom($chatRoomId: UUID!) {
         chatRoom_Leave(chatRoomId: $chatRoomId)
      }
   `,
   typeKey: DELETE_ACTION,
   actionKey: 'chat.type',
};

export const UPLOAD_IMAGE_S3 = {
   mutation: gql`
      mutation uploadImageS3($fileUpload: FileUploadCreateInput!) {
         fileUpload_Create(fileUpload: $fileUpload) {
            id
            fileData {
               fileS3
               fileFilename
            }
         }
      }
   `,
   typeKey: DELETE_ACTION,
   actionKey: 'chat.type',
};

export const PIN_CHAT_ROOM = {
   mutation: gql`
      mutation user_PinChatRoom($chatRoomId: UUID!) {
         user_PinChatRoom(chatRoomId: $chatRoomId) {
            id
         }
      }
   `,
   typeKey: CREATE_UPDATE_ACTION,
   actionKey: 'chat.type',
};

export const UN_PIN_CHAT_ROOM = {
   mutation: gql`
      mutation user_UnPinChatRoom($chatRoomId: UUID!) {
         user_UnPinChatRoom(chatRoomId: $chatRoomId) {
            id
         }
      }
   `,
   typeKey: CREATE_UPDATE_ACTION,
   actionKey: 'chat.type',
};

export const JOIN_CHAT_ROOM = {
   mutation: gql`
      mutation chatRoom_Join($chatRoomId: UUID!) {
         chatRoom_Join(chatRoomId: $chatRoomId)
      }
   `,
   typeKey: CREATE_UPDATE_ACTION,
   actionKey: 'chat.type',
};

export const CHAT_MESSAGE_UPDATE = {
   mutation: gql`
      mutation chatMessage_Update($chatMessageId: UUID!, $chatMessage: ChatMessageUpdateInput!) {
         chatMessage_Update(chatMessageId: $chatMessageId, chatMessage: $chatMessage) {
            ...chatMessage
         }
      }
      ${CHAT_MESSAGE}
   `,
   typeKey: CREATE_UPDATE_ACTION,
   actionKey: 'chat.type',
};

export const FEEDBACK_CREATE = {
   mutation: gql`
      mutation feedback_Create($feedback: FeedbackCreateInput!) {
         feedback_Create(feedback: $feedback) {
            id
         }
      }
   `,
   typeKey: CREATE_UPDATE_ACTION,
   actionKey: 'feedback.type',
};

export const FEEDBACK_ALL_QUERY = gql`
   query feedback_All($limit: Int, $offset: Int, $includeDeleted: Boolean) {
      feedback_All(limit: $limit, offset: $offset, includeDeleted: $includeDeleted) {
         ...feedback
      }
   }
   ${FEEDBACK_FRAGMENT}
`;

// Delete the bank.
export const BANK_DELETE = {
   mutation: gql`
      mutation bankDelete($bankId: UUID!, $clientId: UUID) {
         bank_Delete(bankId: $bankId, clientId: $clientId)
      }
   `,
   typeKey: DELETE_ACTION,
   actionKey: 'bank.type',
};

export const getBanksRefetchQueries = (clientId) => {
   return [{query: BANK_ALL_WHERE_QUERY, variables: {clientId}}];
};

export const PATH_UPDATE = {
   mutation: gql`
      mutation updatePath($clientId: UUID!, $path: String!) {
         updatePath(clientId: $clientId, path: $path)
      }
   `,
   typeKey: CREATE_UPDATE_ACTION,
   actionKey: 'path.type',
};

export const PATH_READ_SUBSCRIPTION = gql`
   subscription establishViewSync($clientId: UUID!) {
      establishViewSync(clientId: $clientId) {
         id
         path
         pathStats {
            id
            userCount
         }
      }
   }
`;
export const SECTIONS_MARK_AS_READ = {
   mutation: gql`
      mutation section_MarkAsRead($userId: UUID, $sectionId: UUID!) {
         section_MarkAsRead(userId: $userId, sectionId: $sectionId)
      }
   `,
   typeKey: 'markAsRead.type',
   path: 'section_MarkAsRead',
   actionKey: CREATE_UPDATE_ACTION,
   updateQueries: getSectionAllCacheQueries,
};

export const SECTIONS_UNMARK_AS_READ = {
   mutation: gql`
      mutation section_UnmarkAsRead($userId: UUID, $sectionId: UUID!) {
         section_UnMarkAsRead(userId: $userId, sectionId: $sectionId)
      }
   `,
   typeKey: 'markAsRead.type',
   path: 'section_UnmarkAsRead',
   actionKey: CREATE_UPDATE_ACTION,
   updateQueries: getSectionAllCacheQueries,
};

export const MODULE_MARK_AS_READ = {
   mutation: gql`
      mutation module_MarkAsRead($userId: UUID, $moduleId: UUID!) {
         markAsRead: module_MarkAsRead(userId: $userId, moduleId: $moduleId)
      }
   `,
   typeKey: 'markAsRead.type',
   actionKey: CREATE_UPDATE_ACTION,
};

export const MODULE_UN_MARK_AS_READ = {
   mutation: gql`
      mutation module_UnMarkAsRead($userId: UUID, $moduleId: UUID!) {
         markAsRead: module_UnMarkAsRead(userId: $userId, moduleId: $moduleId)
      }
   `,
   typeKey: 'markAsRead.type',
   actionKey: CREATE_UPDATE_ACTION,
};

export const COURSE_MARK_AS_READ = {
   mutation: gql`
      mutation course_MarkAsRead($userId: UUID, $courseId: UUID!) {
         markAsRead: course_MarkAsRead(userId: $userId, courseId: $courseId)
      }
   `,
   typeKey: 'markAsRead.type',
   actionKey: CREATE_UPDATE_ACTION,
};

export const course_UnMarkAsRead = {
   mutation: gql`
      mutation module_UnMarkAsRead($userId: UUID, $courseId: UUID!) {
         markAsRead: module_UnMarkAsRead(userId: $userId, courseId: $courseId)
      }
   `,
   typeKey: 'markAsRead.type',
   actionKey: CREATE_UPDATE_ACTION,
};

export const COURSE_CREATE = {
   mutation: gql`
      mutation course_Create($course: CourseCreateInput!) {
         course_Create(course: $course) {
            ...courseInfo
         }
      }
      ${COURSE_FRAGMENT}
   `,
   typeKey: CREATE_UPDATE_ACTION,
   actionKey: 'task.type',
};

export const MEMBERSHIP_ALL_QUERY = gql`
   query getMembershipAll {
      memberships: membership_All {
         ...membershipInfo
      }
   }
   ${MEMBERSHIP_FRAGMENT}
`;

export const MEMBERSHIPS_ALL_WHERE_QUERY = gql`
   query getMembershipsAllWhere($membershipIdList: [UUID]) {
      memberships: membership_AllWhere(membershipSearch: {id: $membershipIdList}) {
         ...membershipInfo
      }
   }
   ${MEMBERSHIP_FRAGMENT}
`;

export const HUB_SPOT_FORMS_ALL_QUERY = gql`
   query getHubSpotFormsAll {
      hubSpotForms: hubSpot_GetForms {
         ...hubSpotInfo
      }
   }
   ${HUB_SPOT_FRAGMENT}
`;

export const HUBSPOT_SUBMIT_FORM = {
   mutation: gql`
      mutation hubSpotSubmitForm($formId: UUID!, $cookie: String, $fields: [HubSpotFormField]!) {
         success: hubSpot_SubmitForm(formData: {cookie: $cookie, fields: $fields, formId: $formId})
      }
   `,
   typeKey: 'hubspot.type',
   actionKey: CREATE_UPDATE_ACTION,
};

export const MULTI_CASHFLOW_UPDATE = {
   mutation: gql`
      mutation cashFlow_MultiEdit(
         $incomes: [IncomeMultiCreateUpdateInput]
         $expenses: [ExpenseMultiCreateUpdateInput]
      ) {
         cashFlow_MultiEdit(incomes: $incomes, expenses: $expenses) {
            incomes {
               id
               success
               entityId
               typeId
               typeName
               date
            }
            expenses {
               id
               success
               entityId
               typeId
               typeName
               date
            }
         }
      }
   `,
};

export const GOAL_DELETE = {
   mutation: gql`
      mutation goalDelete($goalId: UUID!) {
         goal_Delete(goalId: $goalId)
      }
   `,
   typeKey: DELETE_ACTION,
   actionKey: 'goal.type',
};

export const getGoalsRefetchQueries = (entityId) => {
   return [{query: GOAL_GET, variables: {goalSearch: {entityId}}}];
};

export const FIELD_METRICS_BY_CROP_QUERY = gql`
   query fieldMetricsByCrop($entityId: [UUID], $year: Int, $cropTypeId: [UUID], $splitByField: Boolean) {
      fieldMetricsByCrop: fieldMetricsByCrop(
         entityId: $entityId
         year: $year
         cropTypeId: $cropTypeId
         splitByField: $splitByField
      ) {
         fieldMetricsGroup {
            id
            fieldName
            cropType
            acres
            projectedYield
            actualYield
            production
            projectedAcp
            actualAcp
            projectedRevenue
            actualRevenue
            projectedCost
            actualCost
            projectedBreakevenYield
            actualBreakevenYield
            projectedBreakevenPrice
            actualBreakevenPrice
            roi
            averageCashPrice
            projectedProfitAndLossPerAcre
            actualProfitAndLossPerAcre
            projectedProfitAndLoss
            actualProfitAndLoss
            cropTypeId
            fieldId
         }
         fieldMetricsGroupTotals {
            id
            fieldName
            cropType
            acres
            projectedYield
            actualYield
            production
            projectedAcp
            actualAcp
            projectedRevenue
            actualRevenue
            projectedCost
            actualCost
            projectedBreakevenYield
            actualBreakevenYield
            roi
            averageCashPrice
            projectedProfitAndLossPerAcre
            actualProfitAndLossPerAcre
            projectedProfitAndLoss
            actualProfitAndLoss
         }
      }
   }
`;

export const FIELD_METRICS_BY_FIELD_QUERY = gql`
   query fieldMetricsByField($entityId: [UUID], $year: Int, $fieldId: [UUID]) {
      fieldMetricsByField: fieldMetricsByField(entityId: $entityId, year: $year, fieldId: $fieldId) {
         fieldMetricsGroup {
            id
            fieldName
            cropType
            acres
            projectedYield
            actualYield
            production
            projectedAcp
            actualAcp
            projectedRevenue
            actualRevenue
            projectedCost
            actualCost
            projectedBreakevenYield
            actualBreakevenYield
            roi
            averageCashPrice
            projectedProfitAndLossPerAcre
            actualProfitAndLossPerAcre
            projectedProfitAndLoss
            actualProfitAndLoss
            cropTypeId
            fieldId
         }
         fieldMetricsGroupTotals {
            id
            fieldName
            cropType
            acres
            projectedYield
            actualYield
            production
            projectedAcp
            actualAcp
            projectedRevenue
            actualRevenue
            projectedCost
            actualCost
            projectedBreakevenYield
            actualBreakevenYield
            roi
            averageCashPrice
            projectedProfitAndLossPerAcre
            actualProfitAndLossPerAcre
            projectedProfitAndLoss
            actualProfitAndLoss
            fieldId
         }
      }
   }
`;

export const FIELD_METRICS_CREATE_UPDATE = {
   mutation: gql`
      mutation fieldMetrics_CreateUpdate($fieldMetrics: FieldMetricsCreateUpdateInput!) {
         fieldMetrics_CreateUpdate(fieldMetrics: $fieldMetrics) {
            id
            date
            actualYield
            actualAcp
            entityId
            cropTypeId
            fieldId
            description
            acres
            projectedYield
         }
      }
   `,
   typeKey: CREATE_UPDATE_ACTION,
   actionKey: 'fieldMetrics.type',
};

export const CROP_TYPE_TEMPLATE_LIST = gql`
   query cropTypeTemplateList($clientId: UUID) {
      cropTypeTemplate: cropTypeTemplateList(clientId: $clientId) {
         ...cropTypeTemplateInfo
      }
   }
   ${CROP_TYPE_TEMPLATE_FRAGMENT}
`;

export const CROP_TYPE_ALL_QUERY = gql`
   query cropType_All($limit: Int, $offset: Int, $includeDeleted: Boolean) {
      cropType_All(limit: $limit, offset: $offset, includeDeleted: $includeDeleted) {
         id
         franchiseId
         hash
         name
         isDeleted
         createdByUserId
         createdDateTime
         updatedByUserId
         updatedDateTime
      }
   }
`;

export const FIELD_ALL_QUERY = gql`
   query field_AllWhere($limit: Int, $offset: Int, $includeDeleted: Boolean, $fieldSearch: FieldSearchInput) {
      field_AllWhere(limit: $limit, offset: $offset, includeDeleted: $includeDeleted, fieldSearch: $fieldSearch) {
         id
         franchiseId
         hash
         entityId
         cropTypeId
         description
         name
         acres
         startDate
         endDate
      }
   }
`;

export const FIELD_METRIC_ALL_WHERE_QUERY = gql`
   query getFieldMetricAllWhere($fieldId: UUID) {
      fieldMetrics: fieldMetrics_AllWhere(fieldMetricsSearch: {fieldId: $fieldId}) {
         ...fieldMetricsInfo
      }
   }
   ${FIELD_METRICS_FRAGMENT}
`;

export const FIELD_METRICS_BY_ID_QUERY = gql`
   query getFieldMetricsById($fieldMetricsId: UUID!) {
      fieldMetrics: fieldMetrics_ById(fieldMetricsId: $fieldMetricsId) {
         ...fieldMetricsInfo
      }
   }
   ${FIELD_METRICS_FRAGMENT}
`;

export const FIELD_METRICS_ALL_QUERY = gql`
   query fieldMetrics_AllWhere(
      $fieldMetricsSearch: FieldMetricsSearchInput
      $limit: Int
      $offset: Int
      $includeDeleted: Boolean
   ) {
      fieldMetrics_AllWhere(
         fieldMetricsSearch: $fieldMetricsSearch
         limit: $limit
         offset: $offset
         includeDeleted: $includeDeleted
      ) {
         id
         hash
         franchiseId
         entityId
         cropTypeId
         description
         date
         projectedYield
         actualYield
         projectedAcp
         actualAcp
         projectedCost
         isDeleted
         createdByUserId
         createdDateTime
         updatedByUserId
         updatedDateTime
      }
   }
`;

export const getFieldMetricsCropRefetchQueries = (entityId, year) => {
   return [
      // {
      //    query: CROP_TYPE_ALL_QUERY,
      //    variables: {includeDeleted: false},
      // },
      {
         query: FIELD_METRICS_BY_CROP_QUERY,
         variables: {entityId, year, splitByField: false},
         queryPath: 'fieldMetricsByCrop',
      },
      {
         query: FIELD_METRICS_BY_FIELD_QUERY,
         variables: {entityId, year},
         queryPath: 'fieldMetricsByField',
      },
   ];
};

// const CROP_TYPE_BY_ID_QUERY = gql`
//    query getCropTypeById($cropTypeId: UUID!) {
//       cropType: cropType_ById(cropTypeId: $cropTypeId) {
//          ...cropTypeInfo
//       }
//    }
//    ${CROP_TYPE_FRAGMENT}
// `;

export const CROP_TYPE_CREATE_UPDATE = {
   mutation: gql`
      mutation cropType_Create($cropType: CropTypeCreateInput!) {
         cropType_Create(cropType: $cropType) {
            id
            franchiseId
            clientId
            hash
            name
            isDeleted
            createdByUserId
            createdDateTime
            updatedByUserId
            updatedDateTime
         }
      }
   `,
   typeKey: CREATE_UPDATE_ACTION,
   actionKey: 'cropType.type',
};

export const CROP_TYPE_TEMPLATE_LIST_QUERY = gql`
   query cropCostTypeTemplateList($entityId: [UUID], $showByField: Boolean) {
      cropCostTypeTemplateList(entityId: $entityId, showByField: $showByField) {
         id
         franchiseId
         hash
         entityId
         description
         name
         parentId
         hasSubcategories
         subcategories {
            id
            name
         }
         startDate
         endDate
         costPerAcreSum
         cropCosts {
            id
            costPerAcre
            cropTypeId
            cropCostTypeId
            field {
               id
            }
            cropType {
               id
            }
            note
         }
         isDeleted
         createdByUserId
         createdDateTime
         updatedByUserId
         updatedDateTime
      }
   }
`;

export const CROP_COST_CREATE_UPDATE = {
   mutation: gql`
      mutation cropCost_CreateUpdate($cropCost: CropCostCreateUpdateInput!) {
         cropCost_CreateUpdate(cropCost: $cropCost) {
            id
            franchiseId
            entityId
            cropTypeId
            cropCostTypeId
            description
            name
            isSum
            fieldId
         }
      }
   `,
   typeKey: CREATE_UPDATE_ACTION,
   actionKey: 'cropType.type',
};

export const CROP_COST_TYPE_CREATE_UPDATE = {
   mutation: gql`
      mutation cropCostType_CreateUpdate($cropCostType: CropCostTypeCreateUpdateInput!) {
         cropCostType_CreateUpdate(cropCostType: $cropCostType) {
            id
         }
      }
   `,
   typeKey: CREATE_UPDATE_ACTION,
   actionKey: 'cropType.type',
};

export const MEMBERSHIP_BY_ID_QUERY = gql`
   query getMembershipById($membershipId: UUID!) {
      membership: membership_ById(membershipId: $membershipId) {
         ...membershipInfo
      }
   }
   ${MEMBERSHIP_FRAGMENT}
`;

export const MEMBERSHIP_CREATE_UPDATE = {
   mutation: gql`
      mutation membershipCreateUpdate(
         $id: UUID!
         $name: String
         $description: String
         $stripeProductId: String
         $permissionIdList: [UUID]
      ) {
         membership: membership_CreateUpdate(
            membership: {
               id: $id
               name: $name
               description: $description
               stripeProductId: $stripeProductId
               permissionIdList: $permissionIdList
            }
         ) {
            ...membershipInfo
         }
      }
      ${MEMBERSHIP_FRAGMENT}
   `,
   typeKey: CREATE_UPDATE_ACTION,
   actionKey: 'membership.type',
   updateQueries: () => {
      return [{query: MEMBERSHIP_ALL_QUERY, queryPath: 'memberships'}];
   },
};

export const MEMBERSHIP_DELETE = {
   mutation: gql`
      mutation membershipDelete($id: UUID!) {
         membership_Delete(membershipId: $id)
      }
   `,
   typeKey: 'membership.type',
   actionKey: DELETE_ACTION,
};

export const getMembershipQueries = () => {
   return [{query: MEMBERSHIP_ALL_QUERY, queryPath: 'memberships'}];
};

export const FIELD_CREATE_UPDATE = {
   mutation: gql`
      mutation field_Create($field: FieldCreateInput!) {
         field_Create(field: $field) {
            id
         }
      }
   `,
   typeKey: CREATE_UPDATE_ACTION,
};
// Deletion of fields is now performed by setting isRemoved = true instead of using the delete mutation
export const FIELD_REMOVE = {
   mutation: gql`
      mutation field_Remove($fieldId: UUID!, $reportDate: DateOnly) {
         field_CreateUpdate(field: {id: $fieldId, isRemoved: true, removedDate: $reportDate}) {
            id
         }
      }
   `,
   typeKey: CREATE_UPDATE_ACTION,
};
export const FIELD_DELETE = {
   mutation: gql`
      mutation field_Delete($fieldId: UUID!) {
         field_Delete(fieldId: $fieldId)
      }
   `,
   typeKey: DELETE_ACTION,
};

export const FIELD_UPDATE = {
   mutation: gql`
      mutation field_Update($fieldId: UUID!, $field: FieldUpdateInput!) {
         field_Update(fieldId: $fieldId, field: $field) {
            id
         }
      }
   `,
   typeKey: CREATE_UPDATE_ACTION,
};

export const CROP_COST_TYPE_CREATE = {
   mutation: gql`
      mutation cropCostType_Create($cropCostType: CropCostTypeCreateInput!) {
         cropCostType_Create(cropCostType: $cropCostType) {
            id
         }
      }
   `,
   typeKey: CREATE_UPDATE_ACTION,
   actionKey: 'cropType.type',
};

export const CROP_TYPE_UPDATE = {
   mutation: gql`
      mutation cropType_Update($cropTypeId: UUID!, $cropType: CropTypeUpdateInput!) {
         cropType_Update(cropTypeId: $cropTypeId, cropType: $cropType) {
            id
            franchiseId
            clientId
            hash
            name
            isDeleted
            createdByUserId
            createdDateTime
            updatedByUserId
            updatedDateTime
         }
      }
   `,
   typeKey: CREATE_UPDATE_ACTION,
   actionKey: 'cropType.type',
};

export const CROP_COST_UPDATE = {
   mutation: gql`
      mutation cropCost_Update($cropCostId: UUID!, $cropCost: CropCostUpdateInput!) {
         cropCost_Update(cropCostId: $cropCostId, cropCost: $cropCost) {
            id
         }
      }
   `,
   typeKey: CREATE_UPDATE_ACTION,
   actionKey: 'cropType.type',
};

export const UNDO_MOST_RECENT = {
   mutation: gql`
      mutation undoMostRecent($path: String, $franchiseId: UUID!, $clientId: UUID, $entityId: UUID) {
         undo_MostRecent(
            undoHistory: {path: $path, franchiseId: $franchiseId, clientId: $clientId, entityId: $entityId}
         )
      }
   `,
   typeKey: UNDO_ACTION,
   actionKey: 'undo.type',
};

export const UNDO_MOST_RECENT_CHECK = gql`
   query undoMostRecentCheck($path: String, $franchiseId: UUID!, $clientId: UUID, $entityId: UUID) {
      undoHistory: undo_MostRecentCheck(
         undoHistory: {path: $path, franchiseId: $franchiseId, clientId: $clientId, entityId: $entityId}
      ) {
         ...undoHistoryInfo
      }
   }
   ${UNDO_HISTORY_FRAGMENT}
`;

export const REDO_MOST_RECENT = {
   mutation: gql`
      mutation redoMostRecent($path: String, $franchiseId: UUID!, $clientId: UUID, $entityId: UUID) {
         redo_MostRecent(
            undoHistory: {path: $path, franchiseId: $franchiseId, clientId: $clientId, entityId: $entityId}
         )
      }
   `,
   typeKey: REDO_ACTION,
   actionKey: 'redo.type',
};

export const REDO_MOST_RECENT_CHECK = gql`
   query redoMostRecentCheck($path: String, $franchiseId: UUID!, $clientId: UUID, $entityId: UUID) {
      undoHistory: redo_MostRecentCheck(
         undoHistory: {path: $path, franchiseId: $franchiseId, clientId: $clientId, entityId: $entityId}
      ) {
         ...undoHistoryInfo
      }
   }
   ${UNDO_HISTORY_FRAGMENT}
`;

export const BALANCE_REPORT_KMI_DATA_QUERY = gql`
   query getBalanceReportKmiDataQuery($endDate: DateOnly, $entityId: [UUID]) {
      balanceReport_KmiData(endDate: $endDate, entityId: $entityId) {
         ...kmiDataInfo
      }
   }
   ${KMI_DATA_FRAGMENT}
`;

export const INVITE_CREATE_UPDATE = {
   mutation: gql`
      mutation inviteCreateUpdate($id: UUID!, $clientId: UUID, $toEmail: String, $inviteSent: Boolean) {
         invite: invite_CreateUpdate(
            invite: {id: $id, clientId: $clientId, toEmail: $toEmail, inviteSent: $inviteSent}
         ) {
            ...inviteInfo
         }
      }
      ${INVITE_FRAGMENT}
   `,
   typeKey: CREATE_UPDATE_ACTION,
   actionKey: 'invite.type',
   updateQueries: (variables) => {
      return [
         {query: INVITE_ALL_WHERE_QUERY, variables: {clientId: variables?.clientId}, path: 'invitations'},
         {
            query: INVITE_ALL_WHERE_QUERY,
            variables: {franchiseId: variables?.franchiseId, clientId: null},
            path: 'invitations',
         },
      ];
   },
};

// Delete the invite on the server.
export const INVITE_DELETE = {
   mutation: gql`
      mutation InviteDelete($id: UUID!) {
         invite_Delete(inviteId: $id)
      }
   `,
   typeKey: 'invite.type',
   actionKey: DELETE_ACTION,
   updateQueries: (variables) => {
      return [
         {
            query: INVITE_ALL_WHERE_QUERY,
            variables: {clientId: variables?.clientId},
            path: 'invitations',
            queryPath: 'invitations',
         },
         {
            query: INVITE_ALL_WHERE_QUERY,
            variables: {franchiseId: variables?.franchiseId, clientId: null},
            path: 'invitations',
            queryPath: 'invitations',
         },
      ];
   },
};

export const INVITE_ALL_WHERE_QUERY = gql`
   query getInviteAllWhere($franchiseId: [UUID], $clientId: [UUID], $id: [UUID]) {
      invitations: invite_AllWhere(inviteSearch: {franchiseId: $franchiseId, clientId: $clientId, id: $id}) {
         ...inviteInfo
      }
   }
   ${INVITE_FRAGMENT}
`;
