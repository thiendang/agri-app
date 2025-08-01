import gql from 'graphql-tag';

export const CLIENT_FRAGMENT = gql`
   fragment clientInfo on Client {
      id
      addressLineOne
      addressLineTwo
      cityId
      contactName
      email
      freeTrialActive
      freeTrialExpires
      hubspotFormCompleted
      hubspotContactId
      isBank
      isFreemium
      name
      phone
      stateId
      zipCode
      note
      startMonth
      isDeleted
      franchiseId
      membershipIdList
      stripeCustomerId
      memberships {
         id
         name
      }
   }
`;

export const CLIENT_REPORT_FRAGMENT = gql`
   fragment clientReportInfo on Client {
      id
      addressLineOne
      addressLineTwo
      city {
         id
         name
      }
      contactName
      email
      name
      phone
      state {
         id
         name
      }
      zipCode
      note
      startMonth
      isDeleted
   }
`;

export const USER_FRAGMENT = gql`
   fragment userInfo on User {
      id
      contactName
      firstName
      lastName
      username
      email
      clientId
      entityIdList
      franchiseId
      isDeleted
      isExecutive
      client {
         hubspotFormCompleted
         freeTrialExpires
         freeTrialActive
      }
      cognitoSub
      profilePic {
         id: imageKey
         imageUpdateDateTime
         imageBucket
         imageFilename
         imageS3
      }
      roleIdList
      roles {
         id
         name
      }
      permissionIdList

      jointPermissions {
         id
         name
      }
      permissions {
         id
         name
      }
      noEmail
      location
      phonePrimary
      phoneSecondary
      aboutDescription
      createdDateTime
      addressLineOne
      addressLineTwo
      cityId
      stateId
      zipCode
      contactName
      dateOfBirth
      title
   }
`;

// lms
export const COURSE_FRAGMENT = gql`
   fragment courseInfo on Course {
      id
      name
      keywords
      description
      isActive
      orderIndex
      readByUser
      membershipIdList
      userCompletionPercent
      userCompletionPercentBySection
      imageName
      #      modules {
      #         id
      #         name
      #         sections {
      #            id
      #            name
      #            description
      #            transcript
      #            orderIndex
      #            usersRead {
      #               id
      #            }
      #            resources {
      #               id
      #               type
      #               label
      #               path_url
      #            }
      #         }
      #         orderIndex
      #      }
   }
`;

export const COURSE_SHORT_FRAGMENT = gql`
   fragment courseShortInfo on Course {
      id
      name
      description
      isActive
      orderIndex
   }
`;

export const COURSE_ALL_FRAGMENT = gql`
   fragment courseInfoAll on Course {
      id
      name
      orderIndex
      keywords
      description
      isActive
      readByUser
      imagePath
      imageName
      userCompletionPercentBySection
      membershipIdList
   }
`;

export const MODULE_FRAGMENT = gql`
   fragment moduleInfo on Module {
      id
      courseId
      name
      orderIndex
      readByUser
      isDeleted
      userCompletionPercent
   }
`;

// @deprecated Use RESOURCE_FRAGMENT
// export const RESOURCES_FRAGMENT = gql`
//    fragment resourcesInfo on Resources {
//       id
//       unit_id
//       label
//       type
//       path_url
//       isDeleted
//       original_filename
//    }
// `;
//
// export const RESOURCE_FRAGMENT = gql`
//    fragment resourceInfo on Resources {
//       id
//       sectionId: unit_id
//       label
//       type
//       url: path_url
//       isDeleted
//       filename: original_filename
//    }
// `;

export const SECTION_FRAGMENT = gql`
   fragment sectionInfo on Section {
      id
      moduleId
      name
      description
      transcript
      isDeleted
      orderIndex
      readByUser
      video
   }
`;

// lms end
export const TASK_FRAGMENT = gql`
   fragment taskInfo on Task {
      id
      dueDate
      isCompleted
      subject
      isDeleted
      clientId
      userId
      entityId
      repeatAmount
      repeatTask
      repeatInterval
      lastCompletionDateTime
   }
`;

export const TASK_HISTORY_FRAGMENT = gql`
   fragment taskHistoryInfo on TaskHistory {
      id
      dueDate
      completionDateTime
      taskId
      isDeleted
   }
`;

export const ENTITY_FRAGMENT = gql`
   fragment entityInfo on Entity {
      id
      name
      ein
      entityId
      description
      clientId
      isActive
      isDeleted
      ourWhyHeader
      ourWhyText
      whoWeServe
      whyUpdateDateTime
      whoUpdateDateTime
      impossibleGoal
      impossibleGoalDateTime
      isPrimary
      confirmedForKmi
   }
`;
// The properties of Client needed for the client queries. Always use the same properties to aid caching.
// export const FILE_FRAGMENT = gql`
//    fragment fileInfo on FileUpload {
//       id
//       clientId
//       entityId
//       tag
//       fileData {
//          id: fileHash
//          fileFilename
//          fileS3
//       }
//    }
// `;

export const ASSET_FRAGMENT = gql`
   fragment assetInfo on Asset {
      id
      assetId
      assetCategoryId
      snapshotDate
      assetCategory {
         id
         name
         term
      }
      entityId
      entity {
         id
         name
      }
      amount
      description
      isCollateral
      quantity
      head
      weight
      price
      year
      unitTypeId
      acres
      isRemoved
      startDate
      removedDate
      isDeleted
      bankId
      bank {
         id
         name
      }
      amountUpdatedDateTime
      updatedDateTime
      loanToValue
   }
`;

export const UNIT_TYPE_FRAGMENT = gql`
   fragment unitTypeInfo on UnitType {
      id
      name
   }
`;

export const LIABILITY_FRAGMENT = gql`
   fragment liabilityInfo on Liability {
      id
      liabilityId
      interestRate
      note
      bankId
      bank {
         id
         name
      }
      liabilityCategoryId
      liabilityCategory {
         id
         name
         term
      }
      entityId
      entity {
         id
         name
      }
      amount
      description
      isCollateral
      isRemoved
      payment
      paymentDueDate
      paymentMaturityDate
      startDate
      removedDate
      createdDateTime
      isDeleted
      updatedDateTime
      amountUpdatedDateTime
   }
`;

export const INCOME_FRAGMENT = gql`
   fragment incomeInfo on Income {
      id
      actual
      taxActual
      date
      #      description
      entityId
      expected
      incomeTypeId
      #      incomeType {
      #         id
      #         name
      #      }
      isDeleted
      noteActual
      noteExpected
   }
`;

export const INCOME_TYPE_FRAGMENT = gql`
   fragment incomeTypeInfo on IncomeType {
      id
      name
      entityId
      isTaxable
      isDeleted
      parentId
   }
`;

export const EXPENSE_FRAGMENT = gql`
   fragment expenseInfo on Expense {
      id
      actual
      taxActual
      date
      entityId
      expected
      expenseTypeId
      isDeleted
      noteActual
      noteExpected
   }
`;

export const EXPENSE_TYPE_FRAGMENT = gql`
   fragment expenseTypeInfo on ExpenseType {
      id
      name
      entityId
      isDeleted
      isTaxable
      parentId
   }
`;

export const BALANCE_REPORT_FRAGMENT = gql`
   fragment balanceReportInfo on BalanceReport {
      assets {
         current {
            categories {
               categoryName
               total
            }
            total
         }
         intermediate {
            categories {
               categoryName
               total
            }
            total
         }
         longTerm {
            categories {
               categoryName
               total
            }
            total
         }
      }
      liabilities {
         current {
            categories {
               categoryName
               total
               liabilities {
                  interestRate
               }
            }
            total
         }
         intermediate {
            categories {
               categoryName
               total
               liabilities {
                  interestRate
               }
            }
            total
         }
         longTerm {
            categories {
               categoryName
               total
               liabilities {
                  interestRate
               }
            }
         }
      }
      currentRatio
      equityAssetPercentage
      totalAssetCount
      totalAssets
      totalEquity
      totalEquityCount
      totalLiabilities
      totalLiabilityCount
      workingCapital
   }
`;

export const LOAN_ANALYSIS_FRAGMENT = gql`
   fragment loanAnalysisInfo on LoanAnalysis {
      id
      assets {
         id
         bankLoanValue
         current {
            id
            bankLoanValue
            marketValue
            loanToValue
            bankLoanValue
            categories {
               id
               categoryName
               bankLoanValue
               marketValue
               loanToValue
            }
         }
         intermediate {
            id
            bankLoanValue
            loanToValue
            marketValue
            categories {
               id
               categoryName
               bankLoanValue
               marketValue
               loanToValue
            }
         }
         loanToValue
         longTerm {
            id
            bankLoanValue
            loanToValue
            marketValue
            categories {
               id
               categoryName
               bankLoanValue
               marketValue
               loanToValue
            }
         }
         marketValue
         totalAssets: marketValue
      }
      assetsPBP {
         id
         bankLoanValue
         current {
            id
            bankLoanValue
            marketValue
            loanToValue
            bankLoanValue
            categories {
               id
               categoryName
               bankLoanValue
               marketValue
               loanToValue
            }
         }
         intermediate {
            id
            bankLoanValue
            loanToValue
            marketValue
            categories {
               id
               categoryName
               bankLoanValue
               marketValue
               loanToValue
            }
         }
         loanToValue
         longTerm {
            id
            bankLoanValue
            loanToValue
            marketValue
            categories {
               id
               categoryName
               bankLoanValue
               marketValue
               loanToValue
            }
         }
         marketValue
         totalAssets: marketValue
      }
      liabilities {
         id
         totalLiabilities: marketValue
         current {
            id
            subtotalLiabilities: marketValue
            categories {
               id
               categoryName
               currentBalance: marketValue
            }
         }
         intermediate {
            id
            subtotalLiabilities: marketValue
            categories {
               id
               categoryName
               currentBalance: marketValue
            }
         }
         loanToValue
         longTerm {
            id
            subtotalLiabilities: marketValue
            categories {
               id
               categoryName
               currentBalance: marketValue
            }
         }
      }
      liabilitiesPBP {
         id
         totalLiabilities: marketValue
         current {
            id
            subtotalLiabilities: marketValue
            categories {
               id
               categoryName
               currentBalance: marketValue
            }
         }
         intermediate {
            id
            subtotalLiabilities: marketValue
            categories {
               id
               categoryName
               currentBalance: marketValue
            }
         }
         loanToValue
         longTerm {
            id
            subtotalLiabilities: marketValue
            categories {
               id
               categoryName
               currentBalance: marketValue
            }
         }
      }
      clientLeverage
      lessTotalLiabilities
      totalBankSafetyNet
      potentialBorrowingPower
      totalBankSafetyNetPBP
      bankDetails {
         id
         assets {
            id
            bankLoanValue
            current {
               id
               bankLoanValue
               marketValue
               loanToValue
               bankLoanValue
               categories {
                  id
                  categoryName
                  bankLoanValue
                  marketValue
                  loanToValue
               }
            }
            intermediate {
               id
               bankLoanValue
               loanToValue
               marketValue
               categories {
                  id
                  categoryName
                  bankLoanValue
                  marketValue
                  loanToValue
               }
            }
            loanToValue
            longTerm {
               id
               bankLoanValue
               loanToValue
               marketValue
               categories {
                  id
                  categoryName
                  bankLoanValue
                  marketValue
                  loanToValue
               }
            }
            marketValue
            totalAssets: marketValue
         }
         assetsPBP {
            id
            bankLoanValue
            current {
               id
               bankLoanValue
               marketValue
               loanToValue
               bankLoanValue
               categories {
                  id
                  categoryName
                  bankLoanValue
                  marketValue
                  loanToValue
               }
            }
            intermediate {
               id
               bankLoanValue
               loanToValue
               marketValue
               categories {
                  id
                  categoryName
                  bankLoanValue
                  marketValue
                  loanToValue
               }
            }
            loanToValue
            longTerm {
               id
               bankLoanValue
               loanToValue
               marketValue
               categories {
                  id
                  categoryName
                  bankLoanValue
                  marketValue
                  loanToValue
               }
            }
            marketValue
            totalAssets: marketValue
         }
         liabilities {
            id
            totalLiabilities: marketValue
            current {
               id
               subtotalLiabilities: marketValue
               categories {
                  id
                  categoryName
                  currentBalance: marketValue
               }
            }
            intermediate {
               id
               subtotalLiabilities: marketValue
               categories {
                  id
                  categoryName
                  currentBalance: marketValue
               }
            }
            loanToValue
            longTerm {
               id
               subtotalLiabilities: marketValue
               categories {
                  id
                  categoryName
                  currentBalance: marketValue
               }
            }
         }
         liabilitiesPBP {
            id
            totalLiabilities: marketValue
            current {
               id
               subtotalLiabilities: marketValue
               categories {
                  id
                  categoryName
                  currentBalance: marketValue
               }
            }
            intermediate {
               id
               subtotalLiabilities: marketValue
               categories {
                  id
                  categoryName
                  currentBalance: marketValue
               }
            }
            loanToValue
            longTerm {
               id
               subtotalLiabilities: marketValue
               categories {
                  id
                  categoryName
                  currentBalance: marketValue
               }
            }
         }
         clientLeverage
         lessTotalLiabilities
         totalBankSafetyNet
         potentialBorrowingPower
         totalBankSafetyNetPBP
      }
   }
`;

const CASH_FLOW_SEGMENT_FRAGMENT = gql`
   fragment cashFlowSegmentInfo on CashFlowInfo {
      id
      actual
      taxActual
      expected
      noteActual
      noteExpected
   }
`;

const CASH_FLOW_INCOME_EXPENSE_INFO = gql`
   fragment cashFlowIncomeExpenseInfo on CashFlowIncomeExpenseInfo {
      id
      jan {
         ...cashFlowSegmentInfo
      }
      feb {
         ...cashFlowSegmentInfo
      }
      mar {
         ...cashFlowSegmentInfo
      }
      apr {
         ...cashFlowSegmentInfo
      }
      may {
         ...cashFlowSegmentInfo
      }
      jun {
         ...cashFlowSegmentInfo
      }
      jul {
         ...cashFlowSegmentInfo
      }
      aug {
         ...cashFlowSegmentInfo
      }
      sep {
         ...cashFlowSegmentInfo
      }
      oct {
         ...cashFlowSegmentInfo
      }
      nov {
         ...cashFlowSegmentInfo
      }
      dec {
         ...cashFlowSegmentInfo
      }
      annual {
         ...cashFlowSegmentInfo
      }
      typeName
      typeId
      entityId
      hasSubcategories
      subcategories {
         id
         jan {
            ...cashFlowSegmentInfo
         }
         feb {
            ...cashFlowSegmentInfo
         }
         mar {
            ...cashFlowSegmentInfo
         }
         apr {
            ...cashFlowSegmentInfo
         }
         may {
            ...cashFlowSegmentInfo
         }
         jun {
            ...cashFlowSegmentInfo
         }
         jul {
            ...cashFlowSegmentInfo
         }
         aug {
            ...cashFlowSegmentInfo
         }
         sep {
            ...cashFlowSegmentInfo
         }
         oct {
            ...cashFlowSegmentInfo
         }
         nov {
            ...cashFlowSegmentInfo
         }
         dec {
            ...cashFlowSegmentInfo
         }
         annual {
            ...cashFlowSegmentInfo
         }
         typeName
         typeId
         entityId
         hasSubcategories
      }
   }
`;

export const CASH_FLOW_FRAGMENT = gql`
   fragment cashFlowInfo on CashFlowReport {
      id
      actualOperatingLoanBalanceEnd
      actualYTDCashFlow
      expectedOperatingLoanBalanceEnd
      expectedYTDCashFlow
      monthOrder
      startMonth
      income {
         ...cashFlowIncomeExpenseInfo
      }
      incomeGlobal {
         ...cashFlowIncomeExpenseInfo
      }
      expenses {
         ...cashFlowIncomeExpenseInfo
      }
      expenseGlobal {
         ...cashFlowIncomeExpenseInfo
      }
      netCashFlow {
         ...cashFlowIncomeExpenseInfo
      }
      operatingLoanBalance {
         ...cashFlowIncomeExpenseInfo
      }
   }
   ${CASH_FLOW_INCOME_EXPENSE_INFO}
   ${CASH_FLOW_SEGMENT_FRAGMENT}
`;

export const ENTITY_CASH_FLOW_FRAGMENT = gql`
   fragment entityCashFlowInfo on EntityCashFlow {
      id
      actualOperatingLoanBalance
      date
      entityId
      expectedOperatingLoanBalance
      taxLock
      operatingLoanLimit
      carryoverIncome
      year
      carryoverIncomeNote
      franchiseId
      isCashOnly
   }
`;

export const SEAT_FRAGMENT = gql`
   fragment seatInfo on Seat {
      id
      name
      responsibilities {
         name
         description
      }
      order
      seatId
      userIdList
      entityId
      isDeleted
      createdDateTime
   }
`;

export const FOLDER_FRAGMENT = gql`
   fragment folderInfo on FolderTemplate {
      id
      name
      description
      isDeleted
   }
`;

export const CASH_CONTRACT_FRAGMENT = gql`
   fragment cashContractInfo on CashContract {
      id
      bushelsSold
      contractId: cashContractId
      contractNumber
      crop
      date
      deliveryLocation
      deliveryMonth
      description
      entityId
      entity {
         id
         name
      }
      isDeleted
      isDelivered
      isHistorical
      isNew
      isRemoved
      price
      removedDate
      snapshotDate
      startDate
   }
`;

export const FUTURE_CONTRACT_FRAGMENT = gql`
   fragment futureContractInfo on FuturesContract {
      id
      bushels
      cashPrice
      contractNumber
      crop
      date
      deliveryLocation
      description
      entityId
      entity {
         id
         name
      }
      estimatedBasis
      contractId: futuresContractId
      futuresPrice
      isDeleted
      isHistorical
      isRemoved
      month
      removedDate
      snapshotDate
      startDate
      year
   }
`;

export const HEDGE_CONTRACT_FRAGMENT = gql`
   fragment hedgeContractInfo on HedgesContract {
      id
      bushels
      contractNumber
      crop
      currentMarketValue
      date
      description
      entityId
      entity {
         id
         name
      }
      contractId: hedgesContractId
      isDeleted
      isHistorical
      isRemoved
      month
      removedDate
      snapshotDate
      startDate
      strikeCost
      strikePrice
      year
   }
`;

export const CORE_VALUE_FRAGMENT = gql`
   fragment coreValueInfo on CoreValue {
      id
      hash
      entityId
      name
      description
      orderIndex
      isDeleted
      createdByUserId
      createdDateTime
      updatedByUserId
      updatedDateTime
   }
`;

export const GOAL_FRAGMENT = gql`
   fragment goalInfo on Goal {
      id
      hash
      entityId
      name
      summary
      note
      futureDate
      revenue
      profitNetDollars
      profitNetPercent
      isDeleted
      createdByUserId
      createdDateTime
      updatedByUserId
      updatedDateTime
   }
`;

export const TARGET_GROUP_FRAGMENT = gql`
   fragment tgInfo on TargetGroup {
      id
      hash
      entityId
      name
      description
      length
      isArchived
      isDeleted
      createdByUserId
      createdDateTime
      updatedByUserId
      updatedDateTime
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
            username
            contactName
            firstName
            lastName
         }
         isDeleted
         createdByUserId
         createdDateTime
         updatedByUserId
         updatedDateTime
      }
   }
`;

export const TARGET_FRAGMENT = gql`
   fragment targetInfo on Target {
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
         firstName
         lastName
      }
      isDeleted
      createdByUserId
      createdDateTime
      updatedByUserId
      updatedDateTime
   }
`;

export const MEETING_FRAGMENT = gql`
   fragment meetingInfo on TeamMeetingNote {
      id
      hash
      entityId
      assignedToId
      statusId
      category
      orderIndex
      note
      dueDate
      isCompleted
      assignee {
         id
         contactName
      }
      isDeleted
      createdByUserId
      createdDateTime
      updatedByUserId
      updatedDateTime
      description
   }
`;

export const NEW_TASK_FRAGMENT = gql`
   fragment taskInfo on Task {
      id
      hash
      clientId
      userId
      entityId
      statusId
      subject
      description
      priority
      dueDate
      repeatTask
      repeatInterval
      repeatAmount
      repeatDayOf
      lastCompletionDateTime
      isCompleted
      client {
         id
         contactName
      }
      user {
         id
         contactName
         path_url
      }
      isDeleted
      createdByUserId
      createdDateTime
      updatedByUserId
      updatedDateTime
   }
`;

export const PERMISSION_FRAGMENT = gql`
   fragment permissionInfo on Permission {
      id
      name
   }
`;

export const ROLE_FRAGMENT = gql`
   fragment roleInfo on Role {
      id
      name
   }
`;

export const FRANCHISE_FRAGMENT = gql`
   fragment franchiseInfo on Franchise {
      id
      name
      phone
      email
      contactName
      addressLineOne
      addressLineTwo
      isDeleted
      cityId
      stateId
      zipCode
   }
`;

export const CHAT_ROOM = gql`
   fragment chatRoom on ChatRoom {
      id
      hash
      name
      image
      type
      users {
         id
         firstName
         lastName
         path_url
         profilePic {
            imageS3
         }
         contactName
      }
      chatMessages {
         id
         text
         media
         authorId
         author {
            id
            firstName
            lastName
            path_url
            profilePic {
               imageS3
            }
            contactName
         }
         readUsers {
            id
         }
         isDeleted
         createdByUserId
         createdDateTime
         updatedByUserId
         updatedDateTime
      }
      isDeleted
      createdByUserId
      createdDateTime
      updatedByUserId
      updatedDateTime
      pinnedByUser
   }
`;

export const CHAT_MESSAGE = gql`
   fragment chatMessage on ChatMessage {
      id
      text
      media
      authorId
      author {
         id
         firstName
         lastName
         path_url
         profilePic {
            imageS3
         }
         contactName
      }
      chatRoom {
         id
      }
      isDeleted
      createdByUserId
      createdDateTime
      updatedByUserId
      updatedDateTime
   }
`;

export const FEEDBACK_FRAGMENT = gql`
   fragment feedback on Feedback {
      id
      subject
      text
      createdByUser {
         id
         username
         firstName
         lastName
      }
      createdByUserId
      createdDateTime
   }
`;

export const HUB_SPOT_FRAGMENT = gql`
   fragment hubSpotInfo on HubSpot {
      id
      responseData
   }
`;

export const MEMBERSHIP_FRAGMENT = gql`
   fragment membershipInfo on Membership {
      id
      name
      description
      permissionIdList
      stripeProductId
      permissions {
         id
         name
      }
   }
`;

export const CROP_TYPE_TEMPLATE_FRAGMENT = gql`
   fragment cropTypeTemplateInfo on CropTypeTemplate {
      id
      groupName
      types {
         id
         name
      }
   }
`;

export const UNDO_HISTORY_FRAGMENT = gql`
   fragment undoHistoryInfo on UndoHistory {
      id
      path
      entityId
      clientId
      franchiseId
   }
`;

export const KMI_DATA_FRAGMENT = gql`
   fragment kmiDataInfo on KmiData {
      id
      assetHistory {
         id
         entityId
         totalAssets {
            id
            date
            value
         }
      }
      totalAssets
      totalCurrentAssets
      totalIntermediateAssets
      totalLongTermAssets
      totalLiabilities
      totalCurrentLiabilities
      totalIntermediateLiabilities
      totalLongTermLiabilities
      totalEquity
      currentRatio
      workingCapital
      equityAssetRatio
      debtAssetRatio
   }
`;

export const FIELD_METRICS_FRAGMENT = gql`
   fragment fieldMetricsInfo on FieldMetrics {
      id
      acres
      cropTypeId
      fieldId
      description
   }
`;

export const CROP_TYPE_FRAGMENT = gql`
   fragment cropTypeInfo on CropType {
      id
      name
      clientId
      franchiseId
   }
`;

export const INVITE_FRAGMENT = gql`
   fragment inviteInfo on Invite {
      id
      tableName
      franchiseId
      clientId
      toEmail
      inviteSent
      inviteUsed
   }
`;
