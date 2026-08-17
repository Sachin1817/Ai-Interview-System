import { InsertUserData, UpdateUserData, DeleteUserData, GetCurrentUserData, ListUsersData, CreateInterviewSessionData, UpdateInterviewSessionData, DeleteInterviewSessionData, GetInterviewSessionData, ListMyInterviewSessionsData, CreateQuestionData, UpdateQuestionData, DeleteQuestionData, GetQuestionData, ListQuestionsData, CreateResponseData, UpdateResponseData, DeleteResponseData, GetResponseData, ListResponsesData, CreateSkillMetricData, UpdateSkillMetricData, DeleteSkillMetricData, GetSkillMetricData, ListMySkillsData } from '../';
import { UseDataConnectQueryResult, useDataConnectQueryOptions, UseDataConnectMutationResult, useDataConnectMutationOptions} from '@tanstack-query-firebase/react/data-connect';
import { UseQueryResult, UseMutationResult} from '@tanstack/react-query';
import { DataConnect } from 'firebase/data-connect';
import { FirebaseError } from 'firebase/app';


export function useInsertUser(options?: useDataConnectMutationOptions<InsertUserData, FirebaseError, void>): UseDataConnectMutationResult<InsertUserData, undefined>;
export function useInsertUser(dc: DataConnect, options?: useDataConnectMutationOptions<InsertUserData, FirebaseError, void>): UseDataConnectMutationResult<InsertUserData, undefined>;

export function useUpdateUser(options?: useDataConnectMutationOptions<UpdateUserData, FirebaseError, void>): UseDataConnectMutationResult<UpdateUserData, undefined>;
export function useUpdateUser(dc: DataConnect, options?: useDataConnectMutationOptions<UpdateUserData, FirebaseError, void>): UseDataConnectMutationResult<UpdateUserData, undefined>;

export function useDeleteUser(options?: useDataConnectMutationOptions<DeleteUserData, FirebaseError, void>): UseDataConnectMutationResult<DeleteUserData, undefined>;
export function useDeleteUser(dc: DataConnect, options?: useDataConnectMutationOptions<DeleteUserData, FirebaseError, void>): UseDataConnectMutationResult<DeleteUserData, undefined>;

export function useGetCurrentUser(options?: useDataConnectQueryOptions<GetCurrentUserData>): UseDataConnectQueryResult<GetCurrentUserData, undefined>;
export function useGetCurrentUser(dc: DataConnect, options?: useDataConnectQueryOptions<GetCurrentUserData>): UseDataConnectQueryResult<GetCurrentUserData, undefined>;

export function useListUsers(options?: useDataConnectQueryOptions<ListUsersData>): UseDataConnectQueryResult<ListUsersData, undefined>;
export function useListUsers(dc: DataConnect, options?: useDataConnectQueryOptions<ListUsersData>): UseDataConnectQueryResult<ListUsersData, undefined>;

export function useCreateInterviewSession(options?: useDataConnectMutationOptions<CreateInterviewSessionData, FirebaseError, void>): UseDataConnectMutationResult<CreateInterviewSessionData, undefined>;
export function useCreateInterviewSession(dc: DataConnect, options?: useDataConnectMutationOptions<CreateInterviewSessionData, FirebaseError, void>): UseDataConnectMutationResult<CreateInterviewSessionData, undefined>;

export function useUpdateInterviewSession(options?: useDataConnectMutationOptions<UpdateInterviewSessionData, FirebaseError, void>): UseDataConnectMutationResult<UpdateInterviewSessionData, undefined>;
export function useUpdateInterviewSession(dc: DataConnect, options?: useDataConnectMutationOptions<UpdateInterviewSessionData, FirebaseError, void>): UseDataConnectMutationResult<UpdateInterviewSessionData, undefined>;

export function useDeleteInterviewSession(options?: useDataConnectMutationOptions<DeleteInterviewSessionData, FirebaseError, void>): UseDataConnectMutationResult<DeleteInterviewSessionData, undefined>;
export function useDeleteInterviewSession(dc: DataConnect, options?: useDataConnectMutationOptions<DeleteInterviewSessionData, FirebaseError, void>): UseDataConnectMutationResult<DeleteInterviewSessionData, undefined>;

export function useGetInterviewSession(options?: useDataConnectQueryOptions<GetInterviewSessionData>): UseDataConnectQueryResult<GetInterviewSessionData, undefined>;
export function useGetInterviewSession(dc: DataConnect, options?: useDataConnectQueryOptions<GetInterviewSessionData>): UseDataConnectQueryResult<GetInterviewSessionData, undefined>;

export function useListMyInterviewSessions(options?: useDataConnectQueryOptions<ListMyInterviewSessionsData>): UseDataConnectQueryResult<ListMyInterviewSessionsData, undefined>;
export function useListMyInterviewSessions(dc: DataConnect, options?: useDataConnectQueryOptions<ListMyInterviewSessionsData>): UseDataConnectQueryResult<ListMyInterviewSessionsData, undefined>;

export function useCreateQuestion(options?: useDataConnectMutationOptions<CreateQuestionData, FirebaseError, void>): UseDataConnectMutationResult<CreateQuestionData, undefined>;
export function useCreateQuestion(dc: DataConnect, options?: useDataConnectMutationOptions<CreateQuestionData, FirebaseError, void>): UseDataConnectMutationResult<CreateQuestionData, undefined>;

export function useUpdateQuestion(options?: useDataConnectMutationOptions<UpdateQuestionData, FirebaseError, void>): UseDataConnectMutationResult<UpdateQuestionData, undefined>;
export function useUpdateQuestion(dc: DataConnect, options?: useDataConnectMutationOptions<UpdateQuestionData, FirebaseError, void>): UseDataConnectMutationResult<UpdateQuestionData, undefined>;

export function useDeleteQuestion(options?: useDataConnectMutationOptions<DeleteQuestionData, FirebaseError, void>): UseDataConnectMutationResult<DeleteQuestionData, undefined>;
export function useDeleteQuestion(dc: DataConnect, options?: useDataConnectMutationOptions<DeleteQuestionData, FirebaseError, void>): UseDataConnectMutationResult<DeleteQuestionData, undefined>;

export function useGetQuestion(options?: useDataConnectQueryOptions<GetQuestionData>): UseDataConnectQueryResult<GetQuestionData, undefined>;
export function useGetQuestion(dc: DataConnect, options?: useDataConnectQueryOptions<GetQuestionData>): UseDataConnectQueryResult<GetQuestionData, undefined>;

export function useListQuestions(options?: useDataConnectQueryOptions<ListQuestionsData>): UseDataConnectQueryResult<ListQuestionsData, undefined>;
export function useListQuestions(dc: DataConnect, options?: useDataConnectQueryOptions<ListQuestionsData>): UseDataConnectQueryResult<ListQuestionsData, undefined>;

export function useCreateResponse(options?: useDataConnectMutationOptions<CreateResponseData, FirebaseError, void>): UseDataConnectMutationResult<CreateResponseData, undefined>;
export function useCreateResponse(dc: DataConnect, options?: useDataConnectMutationOptions<CreateResponseData, FirebaseError, void>): UseDataConnectMutationResult<CreateResponseData, undefined>;

export function useUpdateResponse(options?: useDataConnectMutationOptions<UpdateResponseData, FirebaseError, void>): UseDataConnectMutationResult<UpdateResponseData, undefined>;
export function useUpdateResponse(dc: DataConnect, options?: useDataConnectMutationOptions<UpdateResponseData, FirebaseError, void>): UseDataConnectMutationResult<UpdateResponseData, undefined>;

export function useDeleteResponse(options?: useDataConnectMutationOptions<DeleteResponseData, FirebaseError, void>): UseDataConnectMutationResult<DeleteResponseData, undefined>;
export function useDeleteResponse(dc: DataConnect, options?: useDataConnectMutationOptions<DeleteResponseData, FirebaseError, void>): UseDataConnectMutationResult<DeleteResponseData, undefined>;

export function useGetResponse(options?: useDataConnectQueryOptions<GetResponseData>): UseDataConnectQueryResult<GetResponseData, undefined>;
export function useGetResponse(dc: DataConnect, options?: useDataConnectQueryOptions<GetResponseData>): UseDataConnectQueryResult<GetResponseData, undefined>;

export function useListResponses(options?: useDataConnectQueryOptions<ListResponsesData>): UseDataConnectQueryResult<ListResponsesData, undefined>;
export function useListResponses(dc: DataConnect, options?: useDataConnectQueryOptions<ListResponsesData>): UseDataConnectQueryResult<ListResponsesData, undefined>;

export function useCreateSkillMetric(options?: useDataConnectMutationOptions<CreateSkillMetricData, FirebaseError, void>): UseDataConnectMutationResult<CreateSkillMetricData, undefined>;
export function useCreateSkillMetric(dc: DataConnect, options?: useDataConnectMutationOptions<CreateSkillMetricData, FirebaseError, void>): UseDataConnectMutationResult<CreateSkillMetricData, undefined>;

export function useUpdateSkillMetric(options?: useDataConnectMutationOptions<UpdateSkillMetricData, FirebaseError, void>): UseDataConnectMutationResult<UpdateSkillMetricData, undefined>;
export function useUpdateSkillMetric(dc: DataConnect, options?: useDataConnectMutationOptions<UpdateSkillMetricData, FirebaseError, void>): UseDataConnectMutationResult<UpdateSkillMetricData, undefined>;

export function useDeleteSkillMetric(options?: useDataConnectMutationOptions<DeleteSkillMetricData, FirebaseError, void>): UseDataConnectMutationResult<DeleteSkillMetricData, undefined>;
export function useDeleteSkillMetric(dc: DataConnect, options?: useDataConnectMutationOptions<DeleteSkillMetricData, FirebaseError, void>): UseDataConnectMutationResult<DeleteSkillMetricData, undefined>;

export function useGetSkillMetric(options?: useDataConnectQueryOptions<GetSkillMetricData>): UseDataConnectQueryResult<GetSkillMetricData, undefined>;
export function useGetSkillMetric(dc: DataConnect, options?: useDataConnectQueryOptions<GetSkillMetricData>): UseDataConnectQueryResult<GetSkillMetricData, undefined>;

export function useListMySkills(options?: useDataConnectQueryOptions<ListMySkillsData>): UseDataConnectQueryResult<ListMySkillsData, undefined>;
export function useListMySkills(dc: DataConnect, options?: useDataConnectQueryOptions<ListMySkillsData>): UseDataConnectQueryResult<ListMySkillsData, undefined>;
