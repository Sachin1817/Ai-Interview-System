import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, ExecuteQueryOptions, MutationRef, MutationPromise, DataConnectSettings } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;
export const dataConnectSettings: DataConnectSettings;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface CreateInterviewSessionData {
  interviewSession_insert: InterviewSession_Key;
}

export interface CreateQuestionData {
  question_insert: Question_Key;
}

export interface CreateResponseData {
  response_insert: Response_Key;
}

export interface CreateSkillMetricData {
  skillMetric_insert: SkillMetric_Key;
}

export interface DeleteInterviewSessionData {
  interviewSession_delete?: InterviewSession_Key | null;
}

export interface DeleteQuestionData {
  question_delete?: Question_Key | null;
}

export interface DeleteResponseData {
  response_delete?: Response_Key | null;
}

export interface DeleteSkillMetricData {
  skillMetric_delete?: SkillMetric_Key | null;
}

export interface DeleteUserData {
  user_delete?: User_Key | null;
}

export interface GetCurrentUserData {
  user?: {
    email: string;
    displayName: string;
    targetRole: string;
  };
}

export interface GetInterviewSessionData {
  interviewSession?: {
    jobRole: string;
    status: string;
    totalScore?: number | null;
  };
}

export interface GetQuestionData {
  question?: {
    content: string;
    sequenceNumber: number;
  };
}

export interface GetResponseData {
  response?: {
    content: string;
    score: number;
  };
}

export interface GetSkillMetricData {
  skillMetric?: {
    skillName: string;
    proficiencyScore: number;
  };
}

export interface InsertUserData {
  user_insert: User_Key;
}

export interface InterviewSession_Key {
  id: UUIDString;
  __typename?: 'InterviewSession_Key';
}

export interface ListMyInterviewSessionsData {
  interviewSessions: ({
    id: UUIDString;
    jobRole: string;
    createdAt: TimestampString;
  } & InterviewSession_Key)[];
}

export interface ListMySkillsData {
  skillMetrics: ({
    skillName: string;
    proficiencyScore: number;
  })[];
}

export interface ListQuestionsData {
  questions: ({
    content: string;
    sequenceNumber: number;
  })[];
}

export interface ListResponsesData {
  responses: ({
    content: string;
    score: number;
  })[];
}

export interface ListUsersData {
  users: ({
    displayName: string;
    targetRole: string;
  })[];
}

export interface Question_Key {
  id: UUIDString;
  __typename?: 'Question_Key';
}

export interface Response_Key {
  id: UUIDString;
  __typename?: 'Response_Key';
}

export interface SkillMetric_Key {
  id: UUIDString;
  __typename?: 'SkillMetric_Key';
}

export interface UpdateInterviewSessionData {
  interviewSession_update?: InterviewSession_Key | null;
}

export interface UpdateQuestionData {
  question_update?: Question_Key | null;
}

export interface UpdateResponseData {
  response_update?: Response_Key | null;
}

export interface UpdateSkillMetricData {
  skillMetric_update?: SkillMetric_Key | null;
}

export interface UpdateUserData {
  user_update?: User_Key | null;
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

interface InsertUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<InsertUserData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): MutationRef<InsertUserData, undefined>;
  operationName: string;
}
export const insertUserRef: InsertUserRef;

export function insertUser(): MutationPromise<InsertUserData, undefined>;
export function insertUser(dc: DataConnect): MutationPromise<InsertUserData, undefined>;

interface UpdateUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<UpdateUserData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): MutationRef<UpdateUserData, undefined>;
  operationName: string;
}
export const updateUserRef: UpdateUserRef;

export function updateUser(): MutationPromise<UpdateUserData, undefined>;
export function updateUser(dc: DataConnect): MutationPromise<UpdateUserData, undefined>;

interface DeleteUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<DeleteUserData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): MutationRef<DeleteUserData, undefined>;
  operationName: string;
}
export const deleteUserRef: DeleteUserRef;

export function deleteUser(): MutationPromise<DeleteUserData, undefined>;
export function deleteUser(dc: DataConnect): MutationPromise<DeleteUserData, undefined>;

interface GetCurrentUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetCurrentUserData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<GetCurrentUserData, undefined>;
  operationName: string;
}
export const getCurrentUserRef: GetCurrentUserRef;

export function getCurrentUser(options?: ExecuteQueryOptions): QueryPromise<GetCurrentUserData, undefined>;
export function getCurrentUser(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<GetCurrentUserData, undefined>;

interface ListUsersRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListUsersData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListUsersData, undefined>;
  operationName: string;
}
export const listUsersRef: ListUsersRef;

export function listUsers(options?: ExecuteQueryOptions): QueryPromise<ListUsersData, undefined>;
export function listUsers(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListUsersData, undefined>;

interface CreateInterviewSessionRef {
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<CreateInterviewSessionData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): MutationRef<CreateInterviewSessionData, undefined>;
  operationName: string;
}
export const createInterviewSessionRef: CreateInterviewSessionRef;

export function createInterviewSession(): MutationPromise<CreateInterviewSessionData, undefined>;
export function createInterviewSession(dc: DataConnect): MutationPromise<CreateInterviewSessionData, undefined>;

interface UpdateInterviewSessionRef {
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<UpdateInterviewSessionData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): MutationRef<UpdateInterviewSessionData, undefined>;
  operationName: string;
}
export const updateInterviewSessionRef: UpdateInterviewSessionRef;

export function updateInterviewSession(): MutationPromise<UpdateInterviewSessionData, undefined>;
export function updateInterviewSession(dc: DataConnect): MutationPromise<UpdateInterviewSessionData, undefined>;

interface DeleteInterviewSessionRef {
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<DeleteInterviewSessionData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): MutationRef<DeleteInterviewSessionData, undefined>;
  operationName: string;
}
export const deleteInterviewSessionRef: DeleteInterviewSessionRef;

export function deleteInterviewSession(): MutationPromise<DeleteInterviewSessionData, undefined>;
export function deleteInterviewSession(dc: DataConnect): MutationPromise<DeleteInterviewSessionData, undefined>;

interface GetInterviewSessionRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetInterviewSessionData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<GetInterviewSessionData, undefined>;
  operationName: string;
}
export const getInterviewSessionRef: GetInterviewSessionRef;

export function getInterviewSession(options?: ExecuteQueryOptions): QueryPromise<GetInterviewSessionData, undefined>;
export function getInterviewSession(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<GetInterviewSessionData, undefined>;

interface ListMyInterviewSessionsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListMyInterviewSessionsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListMyInterviewSessionsData, undefined>;
  operationName: string;
}
export const listMyInterviewSessionsRef: ListMyInterviewSessionsRef;

export function listMyInterviewSessions(options?: ExecuteQueryOptions): QueryPromise<ListMyInterviewSessionsData, undefined>;
export function listMyInterviewSessions(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListMyInterviewSessionsData, undefined>;

interface CreateQuestionRef {
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<CreateQuestionData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): MutationRef<CreateQuestionData, undefined>;
  operationName: string;
}
export const createQuestionRef: CreateQuestionRef;

export function createQuestion(): MutationPromise<CreateQuestionData, undefined>;
export function createQuestion(dc: DataConnect): MutationPromise<CreateQuestionData, undefined>;

interface UpdateQuestionRef {
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<UpdateQuestionData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): MutationRef<UpdateQuestionData, undefined>;
  operationName: string;
}
export const updateQuestionRef: UpdateQuestionRef;

export function updateQuestion(): MutationPromise<UpdateQuestionData, undefined>;
export function updateQuestion(dc: DataConnect): MutationPromise<UpdateQuestionData, undefined>;

interface DeleteQuestionRef {
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<DeleteQuestionData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): MutationRef<DeleteQuestionData, undefined>;
  operationName: string;
}
export const deleteQuestionRef: DeleteQuestionRef;

export function deleteQuestion(): MutationPromise<DeleteQuestionData, undefined>;
export function deleteQuestion(dc: DataConnect): MutationPromise<DeleteQuestionData, undefined>;

interface GetQuestionRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetQuestionData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<GetQuestionData, undefined>;
  operationName: string;
}
export const getQuestionRef: GetQuestionRef;

export function getQuestion(options?: ExecuteQueryOptions): QueryPromise<GetQuestionData, undefined>;
export function getQuestion(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<GetQuestionData, undefined>;

interface ListQuestionsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListQuestionsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListQuestionsData, undefined>;
  operationName: string;
}
export const listQuestionsRef: ListQuestionsRef;

export function listQuestions(options?: ExecuteQueryOptions): QueryPromise<ListQuestionsData, undefined>;
export function listQuestions(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListQuestionsData, undefined>;

interface CreateResponseRef {
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<CreateResponseData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): MutationRef<CreateResponseData, undefined>;
  operationName: string;
}
export const createResponseRef: CreateResponseRef;

export function createResponse(): MutationPromise<CreateResponseData, undefined>;
export function createResponse(dc: DataConnect): MutationPromise<CreateResponseData, undefined>;

interface UpdateResponseRef {
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<UpdateResponseData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): MutationRef<UpdateResponseData, undefined>;
  operationName: string;
}
export const updateResponseRef: UpdateResponseRef;

export function updateResponse(): MutationPromise<UpdateResponseData, undefined>;
export function updateResponse(dc: DataConnect): MutationPromise<UpdateResponseData, undefined>;

interface DeleteResponseRef {
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<DeleteResponseData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): MutationRef<DeleteResponseData, undefined>;
  operationName: string;
}
export const deleteResponseRef: DeleteResponseRef;

export function deleteResponse(): MutationPromise<DeleteResponseData, undefined>;
export function deleteResponse(dc: DataConnect): MutationPromise<DeleteResponseData, undefined>;

interface GetResponseRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetResponseData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<GetResponseData, undefined>;
  operationName: string;
}
export const getResponseRef: GetResponseRef;

export function getResponse(options?: ExecuteQueryOptions): QueryPromise<GetResponseData, undefined>;
export function getResponse(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<GetResponseData, undefined>;

interface ListResponsesRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListResponsesData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListResponsesData, undefined>;
  operationName: string;
}
export const listResponsesRef: ListResponsesRef;

export function listResponses(options?: ExecuteQueryOptions): QueryPromise<ListResponsesData, undefined>;
export function listResponses(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListResponsesData, undefined>;

interface CreateSkillMetricRef {
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<CreateSkillMetricData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): MutationRef<CreateSkillMetricData, undefined>;
  operationName: string;
}
export const createSkillMetricRef: CreateSkillMetricRef;

export function createSkillMetric(): MutationPromise<CreateSkillMetricData, undefined>;
export function createSkillMetric(dc: DataConnect): MutationPromise<CreateSkillMetricData, undefined>;

interface UpdateSkillMetricRef {
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<UpdateSkillMetricData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): MutationRef<UpdateSkillMetricData, undefined>;
  operationName: string;
}
export const updateSkillMetricRef: UpdateSkillMetricRef;

export function updateSkillMetric(): MutationPromise<UpdateSkillMetricData, undefined>;
export function updateSkillMetric(dc: DataConnect): MutationPromise<UpdateSkillMetricData, undefined>;

interface DeleteSkillMetricRef {
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<DeleteSkillMetricData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): MutationRef<DeleteSkillMetricData, undefined>;
  operationName: string;
}
export const deleteSkillMetricRef: DeleteSkillMetricRef;

export function deleteSkillMetric(): MutationPromise<DeleteSkillMetricData, undefined>;
export function deleteSkillMetric(dc: DataConnect): MutationPromise<DeleteSkillMetricData, undefined>;

interface GetSkillMetricRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetSkillMetricData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<GetSkillMetricData, undefined>;
  operationName: string;
}
export const getSkillMetricRef: GetSkillMetricRef;

export function getSkillMetric(options?: ExecuteQueryOptions): QueryPromise<GetSkillMetricData, undefined>;
export function getSkillMetric(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<GetSkillMetricData, undefined>;

interface ListMySkillsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListMySkillsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListMySkillsData, undefined>;
  operationName: string;
}
export const listMySkillsRef: ListMySkillsRef;

export function listMySkills(options?: ExecuteQueryOptions): QueryPromise<ListMySkillsData, undefined>;
export function listMySkills(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListMySkillsData, undefined>;

