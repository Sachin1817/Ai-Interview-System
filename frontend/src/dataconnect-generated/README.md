# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `example`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

**If you're looking for the `React README`, you can find it at [`dataconnect-generated/react/README.md`](./react/README.md)**

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*GetCurrentUser*](#getcurrentuser)
  - [*ListUsers*](#listusers)
  - [*GetInterviewSession*](#getinterviewsession)
  - [*ListMyInterviewSessions*](#listmyinterviewsessions)
  - [*GetQuestion*](#getquestion)
  - [*ListQuestions*](#listquestions)
  - [*GetResponse*](#getresponse)
  - [*ListResponses*](#listresponses)
  - [*GetSkillMetric*](#getskillmetric)
  - [*ListMySkills*](#listmyskills)
- [**Mutations**](#mutations)
  - [*InsertUser*](#insertuser)
  - [*UpdateUser*](#updateuser)
  - [*DeleteUser*](#deleteuser)
  - [*CreateInterviewSession*](#createinterviewsession)
  - [*UpdateInterviewSession*](#updateinterviewsession)
  - [*DeleteInterviewSession*](#deleteinterviewsession)
  - [*CreateQuestion*](#createquestion)
  - [*UpdateQuestion*](#updatequestion)
  - [*DeleteQuestion*](#deletequestion)
  - [*CreateResponse*](#createresponse)
  - [*UpdateResponse*](#updateresponse)
  - [*DeleteResponse*](#deleteresponse)
  - [*CreateSkillMetric*](#createskillmetric)
  - [*UpdateSkillMetric*](#updateskillmetric)
  - [*DeleteSkillMetric*](#deleteskillmetric)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `example`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@dataconnect/generated` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## GetCurrentUser
You can execute the `GetCurrentUser` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getCurrentUser(options?: ExecuteQueryOptions): QueryPromise<GetCurrentUserData, undefined>;

interface GetCurrentUserRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetCurrentUserData, undefined>;
}
export const getCurrentUserRef: GetCurrentUserRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getCurrentUser(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<GetCurrentUserData, undefined>;

interface GetCurrentUserRef {
  ...
  (dc: DataConnect): QueryRef<GetCurrentUserData, undefined>;
}
export const getCurrentUserRef: GetCurrentUserRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getCurrentUserRef:
```typescript
const name = getCurrentUserRef.operationName;
console.log(name);
```

### Variables
The `GetCurrentUser` query has no variables.
### Return Type
Recall that executing the `GetCurrentUser` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetCurrentUserData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetCurrentUserData {
  user?: {
    email: string;
    displayName: string;
    targetRole: string;
  };
}
```
### Using `GetCurrentUser`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getCurrentUser } from '@dataconnect/generated';


// Call the `getCurrentUser()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getCurrentUser();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getCurrentUser(dataConnect);

console.log(data.user);

// Or, you can use the `Promise` API.
getCurrentUser().then((response) => {
  const data = response.data;
  console.log(data.user);
});
```

### Using `GetCurrentUser`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getCurrentUserRef } from '@dataconnect/generated';


// Call the `getCurrentUserRef()` function to get a reference to the query.
const ref = getCurrentUserRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getCurrentUserRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.user);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.user);
});
```

## ListUsers
You can execute the `ListUsers` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listUsers(options?: ExecuteQueryOptions): QueryPromise<ListUsersData, undefined>;

interface ListUsersRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListUsersData, undefined>;
}
export const listUsersRef: ListUsersRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listUsers(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListUsersData, undefined>;

interface ListUsersRef {
  ...
  (dc: DataConnect): QueryRef<ListUsersData, undefined>;
}
export const listUsersRef: ListUsersRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listUsersRef:
```typescript
const name = listUsersRef.operationName;
console.log(name);
```

### Variables
The `ListUsers` query has no variables.
### Return Type
Recall that executing the `ListUsers` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListUsersData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListUsersData {
  users: ({
    displayName: string;
    targetRole: string;
  })[];
}
```
### Using `ListUsers`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listUsers } from '@dataconnect/generated';


// Call the `listUsers()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listUsers();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listUsers(dataConnect);

console.log(data.users);

// Or, you can use the `Promise` API.
listUsers().then((response) => {
  const data = response.data;
  console.log(data.users);
});
```

### Using `ListUsers`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listUsersRef } from '@dataconnect/generated';


// Call the `listUsersRef()` function to get a reference to the query.
const ref = listUsersRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listUsersRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.users);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.users);
});
```

## GetInterviewSession
You can execute the `GetInterviewSession` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getInterviewSession(options?: ExecuteQueryOptions): QueryPromise<GetInterviewSessionData, undefined>;

interface GetInterviewSessionRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetInterviewSessionData, undefined>;
}
export const getInterviewSessionRef: GetInterviewSessionRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getInterviewSession(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<GetInterviewSessionData, undefined>;

interface GetInterviewSessionRef {
  ...
  (dc: DataConnect): QueryRef<GetInterviewSessionData, undefined>;
}
export const getInterviewSessionRef: GetInterviewSessionRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getInterviewSessionRef:
```typescript
const name = getInterviewSessionRef.operationName;
console.log(name);
```

### Variables
The `GetInterviewSession` query has no variables.
### Return Type
Recall that executing the `GetInterviewSession` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetInterviewSessionData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetInterviewSessionData {
  interviewSession?: {
    jobRole: string;
    status: string;
    totalScore?: number | null;
  };
}
```
### Using `GetInterviewSession`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getInterviewSession } from '@dataconnect/generated';


// Call the `getInterviewSession()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getInterviewSession();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getInterviewSession(dataConnect);

console.log(data.interviewSession);

// Or, you can use the `Promise` API.
getInterviewSession().then((response) => {
  const data = response.data;
  console.log(data.interviewSession);
});
```

### Using `GetInterviewSession`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getInterviewSessionRef } from '@dataconnect/generated';


// Call the `getInterviewSessionRef()` function to get a reference to the query.
const ref = getInterviewSessionRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getInterviewSessionRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.interviewSession);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.interviewSession);
});
```

## ListMyInterviewSessions
You can execute the `ListMyInterviewSessions` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listMyInterviewSessions(options?: ExecuteQueryOptions): QueryPromise<ListMyInterviewSessionsData, undefined>;

interface ListMyInterviewSessionsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListMyInterviewSessionsData, undefined>;
}
export const listMyInterviewSessionsRef: ListMyInterviewSessionsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listMyInterviewSessions(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListMyInterviewSessionsData, undefined>;

interface ListMyInterviewSessionsRef {
  ...
  (dc: DataConnect): QueryRef<ListMyInterviewSessionsData, undefined>;
}
export const listMyInterviewSessionsRef: ListMyInterviewSessionsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listMyInterviewSessionsRef:
```typescript
const name = listMyInterviewSessionsRef.operationName;
console.log(name);
```

### Variables
The `ListMyInterviewSessions` query has no variables.
### Return Type
Recall that executing the `ListMyInterviewSessions` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListMyInterviewSessionsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListMyInterviewSessionsData {
  interviewSessions: ({
    id: UUIDString;
    jobRole: string;
    createdAt: TimestampString;
  } & InterviewSession_Key)[];
}
```
### Using `ListMyInterviewSessions`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listMyInterviewSessions } from '@dataconnect/generated';


// Call the `listMyInterviewSessions()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listMyInterviewSessions();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listMyInterviewSessions(dataConnect);

console.log(data.interviewSessions);

// Or, you can use the `Promise` API.
listMyInterviewSessions().then((response) => {
  const data = response.data;
  console.log(data.interviewSessions);
});
```

### Using `ListMyInterviewSessions`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listMyInterviewSessionsRef } from '@dataconnect/generated';


// Call the `listMyInterviewSessionsRef()` function to get a reference to the query.
const ref = listMyInterviewSessionsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listMyInterviewSessionsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.interviewSessions);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.interviewSessions);
});
```

## GetQuestion
You can execute the `GetQuestion` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getQuestion(options?: ExecuteQueryOptions): QueryPromise<GetQuestionData, undefined>;

interface GetQuestionRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetQuestionData, undefined>;
}
export const getQuestionRef: GetQuestionRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getQuestion(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<GetQuestionData, undefined>;

interface GetQuestionRef {
  ...
  (dc: DataConnect): QueryRef<GetQuestionData, undefined>;
}
export const getQuestionRef: GetQuestionRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getQuestionRef:
```typescript
const name = getQuestionRef.operationName;
console.log(name);
```

### Variables
The `GetQuestion` query has no variables.
### Return Type
Recall that executing the `GetQuestion` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetQuestionData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetQuestionData {
  question?: {
    content: string;
    sequenceNumber: number;
  };
}
```
### Using `GetQuestion`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getQuestion } from '@dataconnect/generated';


// Call the `getQuestion()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getQuestion();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getQuestion(dataConnect);

console.log(data.question);

// Or, you can use the `Promise` API.
getQuestion().then((response) => {
  const data = response.data;
  console.log(data.question);
});
```

### Using `GetQuestion`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getQuestionRef } from '@dataconnect/generated';


// Call the `getQuestionRef()` function to get a reference to the query.
const ref = getQuestionRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getQuestionRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.question);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.question);
});
```

## ListQuestions
You can execute the `ListQuestions` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listQuestions(options?: ExecuteQueryOptions): QueryPromise<ListQuestionsData, undefined>;

interface ListQuestionsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListQuestionsData, undefined>;
}
export const listQuestionsRef: ListQuestionsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listQuestions(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListQuestionsData, undefined>;

interface ListQuestionsRef {
  ...
  (dc: DataConnect): QueryRef<ListQuestionsData, undefined>;
}
export const listQuestionsRef: ListQuestionsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listQuestionsRef:
```typescript
const name = listQuestionsRef.operationName;
console.log(name);
```

### Variables
The `ListQuestions` query has no variables.
### Return Type
Recall that executing the `ListQuestions` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListQuestionsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListQuestionsData {
  questions: ({
    content: string;
    sequenceNumber: number;
  })[];
}
```
### Using `ListQuestions`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listQuestions } from '@dataconnect/generated';


// Call the `listQuestions()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listQuestions();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listQuestions(dataConnect);

console.log(data.questions);

// Or, you can use the `Promise` API.
listQuestions().then((response) => {
  const data = response.data;
  console.log(data.questions);
});
```

### Using `ListQuestions`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listQuestionsRef } from '@dataconnect/generated';


// Call the `listQuestionsRef()` function to get a reference to the query.
const ref = listQuestionsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listQuestionsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.questions);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.questions);
});
```

## GetResponse
You can execute the `GetResponse` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getResponse(options?: ExecuteQueryOptions): QueryPromise<GetResponseData, undefined>;

interface GetResponseRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetResponseData, undefined>;
}
export const getResponseRef: GetResponseRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getResponse(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<GetResponseData, undefined>;

interface GetResponseRef {
  ...
  (dc: DataConnect): QueryRef<GetResponseData, undefined>;
}
export const getResponseRef: GetResponseRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getResponseRef:
```typescript
const name = getResponseRef.operationName;
console.log(name);
```

### Variables
The `GetResponse` query has no variables.
### Return Type
Recall that executing the `GetResponse` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetResponseData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetResponseData {
  response?: {
    content: string;
    score: number;
  };
}
```
### Using `GetResponse`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getResponse } from '@dataconnect/generated';


// Call the `getResponse()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getResponse();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getResponse(dataConnect);

console.log(data.response);

// Or, you can use the `Promise` API.
getResponse().then((response) => {
  const data = response.data;
  console.log(data.response);
});
```

### Using `GetResponse`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getResponseRef } from '@dataconnect/generated';


// Call the `getResponseRef()` function to get a reference to the query.
const ref = getResponseRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getResponseRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.response);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.response);
});
```

## ListResponses
You can execute the `ListResponses` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listResponses(options?: ExecuteQueryOptions): QueryPromise<ListResponsesData, undefined>;

interface ListResponsesRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListResponsesData, undefined>;
}
export const listResponsesRef: ListResponsesRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listResponses(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListResponsesData, undefined>;

interface ListResponsesRef {
  ...
  (dc: DataConnect): QueryRef<ListResponsesData, undefined>;
}
export const listResponsesRef: ListResponsesRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listResponsesRef:
```typescript
const name = listResponsesRef.operationName;
console.log(name);
```

### Variables
The `ListResponses` query has no variables.
### Return Type
Recall that executing the `ListResponses` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListResponsesData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListResponsesData {
  responses: ({
    content: string;
    score: number;
  })[];
}
```
### Using `ListResponses`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listResponses } from '@dataconnect/generated';


// Call the `listResponses()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listResponses();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listResponses(dataConnect);

console.log(data.responses);

// Or, you can use the `Promise` API.
listResponses().then((response) => {
  const data = response.data;
  console.log(data.responses);
});
```

### Using `ListResponses`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listResponsesRef } from '@dataconnect/generated';


// Call the `listResponsesRef()` function to get a reference to the query.
const ref = listResponsesRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listResponsesRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.responses);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.responses);
});
```

## GetSkillMetric
You can execute the `GetSkillMetric` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getSkillMetric(options?: ExecuteQueryOptions): QueryPromise<GetSkillMetricData, undefined>;

interface GetSkillMetricRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetSkillMetricData, undefined>;
}
export const getSkillMetricRef: GetSkillMetricRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getSkillMetric(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<GetSkillMetricData, undefined>;

interface GetSkillMetricRef {
  ...
  (dc: DataConnect): QueryRef<GetSkillMetricData, undefined>;
}
export const getSkillMetricRef: GetSkillMetricRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getSkillMetricRef:
```typescript
const name = getSkillMetricRef.operationName;
console.log(name);
```

### Variables
The `GetSkillMetric` query has no variables.
### Return Type
Recall that executing the `GetSkillMetric` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetSkillMetricData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetSkillMetricData {
  skillMetric?: {
    skillName: string;
    proficiencyScore: number;
  };
}
```
### Using `GetSkillMetric`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getSkillMetric } from '@dataconnect/generated';


// Call the `getSkillMetric()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getSkillMetric();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getSkillMetric(dataConnect);

console.log(data.skillMetric);

// Or, you can use the `Promise` API.
getSkillMetric().then((response) => {
  const data = response.data;
  console.log(data.skillMetric);
});
```

### Using `GetSkillMetric`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getSkillMetricRef } from '@dataconnect/generated';


// Call the `getSkillMetricRef()` function to get a reference to the query.
const ref = getSkillMetricRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getSkillMetricRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.skillMetric);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.skillMetric);
});
```

## ListMySkills
You can execute the `ListMySkills` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listMySkills(options?: ExecuteQueryOptions): QueryPromise<ListMySkillsData, undefined>;

interface ListMySkillsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListMySkillsData, undefined>;
}
export const listMySkillsRef: ListMySkillsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listMySkills(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListMySkillsData, undefined>;

interface ListMySkillsRef {
  ...
  (dc: DataConnect): QueryRef<ListMySkillsData, undefined>;
}
export const listMySkillsRef: ListMySkillsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listMySkillsRef:
```typescript
const name = listMySkillsRef.operationName;
console.log(name);
```

### Variables
The `ListMySkills` query has no variables.
### Return Type
Recall that executing the `ListMySkills` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListMySkillsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListMySkillsData {
  skillMetrics: ({
    skillName: string;
    proficiencyScore: number;
  })[];
}
```
### Using `ListMySkills`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listMySkills } from '@dataconnect/generated';


// Call the `listMySkills()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listMySkills();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listMySkills(dataConnect);

console.log(data.skillMetrics);

// Or, you can use the `Promise` API.
listMySkills().then((response) => {
  const data = response.data;
  console.log(data.skillMetrics);
});
```

### Using `ListMySkills`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listMySkillsRef } from '@dataconnect/generated';


// Call the `listMySkillsRef()` function to get a reference to the query.
const ref = listMySkillsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listMySkillsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.skillMetrics);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.skillMetrics);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## InsertUser
You can execute the `InsertUser` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
insertUser(): MutationPromise<InsertUserData, undefined>;

interface InsertUserRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<InsertUserData, undefined>;
}
export const insertUserRef: InsertUserRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
insertUser(dc: DataConnect): MutationPromise<InsertUserData, undefined>;

interface InsertUserRef {
  ...
  (dc: DataConnect): MutationRef<InsertUserData, undefined>;
}
export const insertUserRef: InsertUserRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the insertUserRef:
```typescript
const name = insertUserRef.operationName;
console.log(name);
```

### Variables
The `InsertUser` mutation has no variables.
### Return Type
Recall that executing the `InsertUser` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `InsertUserData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface InsertUserData {
  user_insert: User_Key;
}
```
### Using `InsertUser`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, insertUser } from '@dataconnect/generated';


// Call the `insertUser()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await insertUser();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await insertUser(dataConnect);

console.log(data.user_insert);

// Or, you can use the `Promise` API.
insertUser().then((response) => {
  const data = response.data;
  console.log(data.user_insert);
});
```

### Using `InsertUser`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, insertUserRef } from '@dataconnect/generated';


// Call the `insertUserRef()` function to get a reference to the mutation.
const ref = insertUserRef();

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = insertUserRef(dataConnect);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.user_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.user_insert);
});
```

## UpdateUser
You can execute the `UpdateUser` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updateUser(): MutationPromise<UpdateUserData, undefined>;

interface UpdateUserRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<UpdateUserData, undefined>;
}
export const updateUserRef: UpdateUserRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateUser(dc: DataConnect): MutationPromise<UpdateUserData, undefined>;

interface UpdateUserRef {
  ...
  (dc: DataConnect): MutationRef<UpdateUserData, undefined>;
}
export const updateUserRef: UpdateUserRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateUserRef:
```typescript
const name = updateUserRef.operationName;
console.log(name);
```

### Variables
The `UpdateUser` mutation has no variables.
### Return Type
Recall that executing the `UpdateUser` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateUserData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateUserData {
  user_update?: User_Key | null;
}
```
### Using `UpdateUser`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateUser } from '@dataconnect/generated';


// Call the `updateUser()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateUser();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateUser(dataConnect);

console.log(data.user_update);

// Or, you can use the `Promise` API.
updateUser().then((response) => {
  const data = response.data;
  console.log(data.user_update);
});
```

### Using `UpdateUser`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateUserRef } from '@dataconnect/generated';


// Call the `updateUserRef()` function to get a reference to the mutation.
const ref = updateUserRef();

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateUserRef(dataConnect);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.user_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.user_update);
});
```

## DeleteUser
You can execute the `DeleteUser` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
deleteUser(): MutationPromise<DeleteUserData, undefined>;

interface DeleteUserRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<DeleteUserData, undefined>;
}
export const deleteUserRef: DeleteUserRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
deleteUser(dc: DataConnect): MutationPromise<DeleteUserData, undefined>;

interface DeleteUserRef {
  ...
  (dc: DataConnect): MutationRef<DeleteUserData, undefined>;
}
export const deleteUserRef: DeleteUserRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the deleteUserRef:
```typescript
const name = deleteUserRef.operationName;
console.log(name);
```

### Variables
The `DeleteUser` mutation has no variables.
### Return Type
Recall that executing the `DeleteUser` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `DeleteUserData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface DeleteUserData {
  user_delete?: User_Key | null;
}
```
### Using `DeleteUser`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, deleteUser } from '@dataconnect/generated';


// Call the `deleteUser()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await deleteUser();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await deleteUser(dataConnect);

console.log(data.user_delete);

// Or, you can use the `Promise` API.
deleteUser().then((response) => {
  const data = response.data;
  console.log(data.user_delete);
});
```

### Using `DeleteUser`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, deleteUserRef } from '@dataconnect/generated';


// Call the `deleteUserRef()` function to get a reference to the mutation.
const ref = deleteUserRef();

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = deleteUserRef(dataConnect);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.user_delete);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.user_delete);
});
```

## CreateInterviewSession
You can execute the `CreateInterviewSession` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createInterviewSession(): MutationPromise<CreateInterviewSessionData, undefined>;

interface CreateInterviewSessionRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<CreateInterviewSessionData, undefined>;
}
export const createInterviewSessionRef: CreateInterviewSessionRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createInterviewSession(dc: DataConnect): MutationPromise<CreateInterviewSessionData, undefined>;

interface CreateInterviewSessionRef {
  ...
  (dc: DataConnect): MutationRef<CreateInterviewSessionData, undefined>;
}
export const createInterviewSessionRef: CreateInterviewSessionRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createInterviewSessionRef:
```typescript
const name = createInterviewSessionRef.operationName;
console.log(name);
```

### Variables
The `CreateInterviewSession` mutation has no variables.
### Return Type
Recall that executing the `CreateInterviewSession` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateInterviewSessionData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateInterviewSessionData {
  interviewSession_insert: InterviewSession_Key;
}
```
### Using `CreateInterviewSession`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createInterviewSession } from '@dataconnect/generated';


// Call the `createInterviewSession()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createInterviewSession();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createInterviewSession(dataConnect);

console.log(data.interviewSession_insert);

// Or, you can use the `Promise` API.
createInterviewSession().then((response) => {
  const data = response.data;
  console.log(data.interviewSession_insert);
});
```

### Using `CreateInterviewSession`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createInterviewSessionRef } from '@dataconnect/generated';


// Call the `createInterviewSessionRef()` function to get a reference to the mutation.
const ref = createInterviewSessionRef();

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createInterviewSessionRef(dataConnect);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.interviewSession_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.interviewSession_insert);
});
```

## UpdateInterviewSession
You can execute the `UpdateInterviewSession` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updateInterviewSession(): MutationPromise<UpdateInterviewSessionData, undefined>;

interface UpdateInterviewSessionRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<UpdateInterviewSessionData, undefined>;
}
export const updateInterviewSessionRef: UpdateInterviewSessionRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateInterviewSession(dc: DataConnect): MutationPromise<UpdateInterviewSessionData, undefined>;

interface UpdateInterviewSessionRef {
  ...
  (dc: DataConnect): MutationRef<UpdateInterviewSessionData, undefined>;
}
export const updateInterviewSessionRef: UpdateInterviewSessionRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateInterviewSessionRef:
```typescript
const name = updateInterviewSessionRef.operationName;
console.log(name);
```

### Variables
The `UpdateInterviewSession` mutation has no variables.
### Return Type
Recall that executing the `UpdateInterviewSession` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateInterviewSessionData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateInterviewSessionData {
  interviewSession_update?: InterviewSession_Key | null;
}
```
### Using `UpdateInterviewSession`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateInterviewSession } from '@dataconnect/generated';


// Call the `updateInterviewSession()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateInterviewSession();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateInterviewSession(dataConnect);

console.log(data.interviewSession_update);

// Or, you can use the `Promise` API.
updateInterviewSession().then((response) => {
  const data = response.data;
  console.log(data.interviewSession_update);
});
```

### Using `UpdateInterviewSession`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateInterviewSessionRef } from '@dataconnect/generated';


// Call the `updateInterviewSessionRef()` function to get a reference to the mutation.
const ref = updateInterviewSessionRef();

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateInterviewSessionRef(dataConnect);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.interviewSession_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.interviewSession_update);
});
```

## DeleteInterviewSession
You can execute the `DeleteInterviewSession` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
deleteInterviewSession(): MutationPromise<DeleteInterviewSessionData, undefined>;

interface DeleteInterviewSessionRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<DeleteInterviewSessionData, undefined>;
}
export const deleteInterviewSessionRef: DeleteInterviewSessionRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
deleteInterviewSession(dc: DataConnect): MutationPromise<DeleteInterviewSessionData, undefined>;

interface DeleteInterviewSessionRef {
  ...
  (dc: DataConnect): MutationRef<DeleteInterviewSessionData, undefined>;
}
export const deleteInterviewSessionRef: DeleteInterviewSessionRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the deleteInterviewSessionRef:
```typescript
const name = deleteInterviewSessionRef.operationName;
console.log(name);
```

### Variables
The `DeleteInterviewSession` mutation has no variables.
### Return Type
Recall that executing the `DeleteInterviewSession` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `DeleteInterviewSessionData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface DeleteInterviewSessionData {
  interviewSession_delete?: InterviewSession_Key | null;
}
```
### Using `DeleteInterviewSession`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, deleteInterviewSession } from '@dataconnect/generated';


// Call the `deleteInterviewSession()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await deleteInterviewSession();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await deleteInterviewSession(dataConnect);

console.log(data.interviewSession_delete);

// Or, you can use the `Promise` API.
deleteInterviewSession().then((response) => {
  const data = response.data;
  console.log(data.interviewSession_delete);
});
```

### Using `DeleteInterviewSession`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, deleteInterviewSessionRef } from '@dataconnect/generated';


// Call the `deleteInterviewSessionRef()` function to get a reference to the mutation.
const ref = deleteInterviewSessionRef();

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = deleteInterviewSessionRef(dataConnect);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.interviewSession_delete);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.interviewSession_delete);
});
```

## CreateQuestion
You can execute the `CreateQuestion` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createQuestion(): MutationPromise<CreateQuestionData, undefined>;

interface CreateQuestionRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<CreateQuestionData, undefined>;
}
export const createQuestionRef: CreateQuestionRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createQuestion(dc: DataConnect): MutationPromise<CreateQuestionData, undefined>;

interface CreateQuestionRef {
  ...
  (dc: DataConnect): MutationRef<CreateQuestionData, undefined>;
}
export const createQuestionRef: CreateQuestionRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createQuestionRef:
```typescript
const name = createQuestionRef.operationName;
console.log(name);
```

### Variables
The `CreateQuestion` mutation has no variables.
### Return Type
Recall that executing the `CreateQuestion` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateQuestionData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateQuestionData {
  question_insert: Question_Key;
}
```
### Using `CreateQuestion`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createQuestion } from '@dataconnect/generated';


// Call the `createQuestion()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createQuestion();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createQuestion(dataConnect);

console.log(data.question_insert);

// Or, you can use the `Promise` API.
createQuestion().then((response) => {
  const data = response.data;
  console.log(data.question_insert);
});
```

### Using `CreateQuestion`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createQuestionRef } from '@dataconnect/generated';


// Call the `createQuestionRef()` function to get a reference to the mutation.
const ref = createQuestionRef();

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createQuestionRef(dataConnect);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.question_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.question_insert);
});
```

## UpdateQuestion
You can execute the `UpdateQuestion` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updateQuestion(): MutationPromise<UpdateQuestionData, undefined>;

interface UpdateQuestionRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<UpdateQuestionData, undefined>;
}
export const updateQuestionRef: UpdateQuestionRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateQuestion(dc: DataConnect): MutationPromise<UpdateQuestionData, undefined>;

interface UpdateQuestionRef {
  ...
  (dc: DataConnect): MutationRef<UpdateQuestionData, undefined>;
}
export const updateQuestionRef: UpdateQuestionRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateQuestionRef:
```typescript
const name = updateQuestionRef.operationName;
console.log(name);
```

### Variables
The `UpdateQuestion` mutation has no variables.
### Return Type
Recall that executing the `UpdateQuestion` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateQuestionData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateQuestionData {
  question_update?: Question_Key | null;
}
```
### Using `UpdateQuestion`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateQuestion } from '@dataconnect/generated';


// Call the `updateQuestion()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateQuestion();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateQuestion(dataConnect);

console.log(data.question_update);

// Or, you can use the `Promise` API.
updateQuestion().then((response) => {
  const data = response.data;
  console.log(data.question_update);
});
```

### Using `UpdateQuestion`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateQuestionRef } from '@dataconnect/generated';


// Call the `updateQuestionRef()` function to get a reference to the mutation.
const ref = updateQuestionRef();

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateQuestionRef(dataConnect);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.question_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.question_update);
});
```

## DeleteQuestion
You can execute the `DeleteQuestion` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
deleteQuestion(): MutationPromise<DeleteQuestionData, undefined>;

interface DeleteQuestionRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<DeleteQuestionData, undefined>;
}
export const deleteQuestionRef: DeleteQuestionRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
deleteQuestion(dc: DataConnect): MutationPromise<DeleteQuestionData, undefined>;

interface DeleteQuestionRef {
  ...
  (dc: DataConnect): MutationRef<DeleteQuestionData, undefined>;
}
export const deleteQuestionRef: DeleteQuestionRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the deleteQuestionRef:
```typescript
const name = deleteQuestionRef.operationName;
console.log(name);
```

### Variables
The `DeleteQuestion` mutation has no variables.
### Return Type
Recall that executing the `DeleteQuestion` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `DeleteQuestionData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface DeleteQuestionData {
  question_delete?: Question_Key | null;
}
```
### Using `DeleteQuestion`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, deleteQuestion } from '@dataconnect/generated';


// Call the `deleteQuestion()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await deleteQuestion();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await deleteQuestion(dataConnect);

console.log(data.question_delete);

// Or, you can use the `Promise` API.
deleteQuestion().then((response) => {
  const data = response.data;
  console.log(data.question_delete);
});
```

### Using `DeleteQuestion`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, deleteQuestionRef } from '@dataconnect/generated';


// Call the `deleteQuestionRef()` function to get a reference to the mutation.
const ref = deleteQuestionRef();

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = deleteQuestionRef(dataConnect);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.question_delete);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.question_delete);
});
```

## CreateResponse
You can execute the `CreateResponse` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createResponse(): MutationPromise<CreateResponseData, undefined>;

interface CreateResponseRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<CreateResponseData, undefined>;
}
export const createResponseRef: CreateResponseRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createResponse(dc: DataConnect): MutationPromise<CreateResponseData, undefined>;

interface CreateResponseRef {
  ...
  (dc: DataConnect): MutationRef<CreateResponseData, undefined>;
}
export const createResponseRef: CreateResponseRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createResponseRef:
```typescript
const name = createResponseRef.operationName;
console.log(name);
```

### Variables
The `CreateResponse` mutation has no variables.
### Return Type
Recall that executing the `CreateResponse` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateResponseData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateResponseData {
  response_insert: Response_Key;
}
```
### Using `CreateResponse`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createResponse } from '@dataconnect/generated';


// Call the `createResponse()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createResponse();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createResponse(dataConnect);

console.log(data.response_insert);

// Or, you can use the `Promise` API.
createResponse().then((response) => {
  const data = response.data;
  console.log(data.response_insert);
});
```

### Using `CreateResponse`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createResponseRef } from '@dataconnect/generated';


// Call the `createResponseRef()` function to get a reference to the mutation.
const ref = createResponseRef();

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createResponseRef(dataConnect);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.response_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.response_insert);
});
```

## UpdateResponse
You can execute the `UpdateResponse` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updateResponse(): MutationPromise<UpdateResponseData, undefined>;

interface UpdateResponseRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<UpdateResponseData, undefined>;
}
export const updateResponseRef: UpdateResponseRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateResponse(dc: DataConnect): MutationPromise<UpdateResponseData, undefined>;

interface UpdateResponseRef {
  ...
  (dc: DataConnect): MutationRef<UpdateResponseData, undefined>;
}
export const updateResponseRef: UpdateResponseRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateResponseRef:
```typescript
const name = updateResponseRef.operationName;
console.log(name);
```

### Variables
The `UpdateResponse` mutation has no variables.
### Return Type
Recall that executing the `UpdateResponse` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateResponseData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateResponseData {
  response_update?: Response_Key | null;
}
```
### Using `UpdateResponse`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateResponse } from '@dataconnect/generated';


// Call the `updateResponse()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateResponse();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateResponse(dataConnect);

console.log(data.response_update);

// Or, you can use the `Promise` API.
updateResponse().then((response) => {
  const data = response.data;
  console.log(data.response_update);
});
```

### Using `UpdateResponse`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateResponseRef } from '@dataconnect/generated';


// Call the `updateResponseRef()` function to get a reference to the mutation.
const ref = updateResponseRef();

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateResponseRef(dataConnect);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.response_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.response_update);
});
```

## DeleteResponse
You can execute the `DeleteResponse` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
deleteResponse(): MutationPromise<DeleteResponseData, undefined>;

interface DeleteResponseRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<DeleteResponseData, undefined>;
}
export const deleteResponseRef: DeleteResponseRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
deleteResponse(dc: DataConnect): MutationPromise<DeleteResponseData, undefined>;

interface DeleteResponseRef {
  ...
  (dc: DataConnect): MutationRef<DeleteResponseData, undefined>;
}
export const deleteResponseRef: DeleteResponseRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the deleteResponseRef:
```typescript
const name = deleteResponseRef.operationName;
console.log(name);
```

### Variables
The `DeleteResponse` mutation has no variables.
### Return Type
Recall that executing the `DeleteResponse` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `DeleteResponseData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface DeleteResponseData {
  response_delete?: Response_Key | null;
}
```
### Using `DeleteResponse`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, deleteResponse } from '@dataconnect/generated';


// Call the `deleteResponse()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await deleteResponse();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await deleteResponse(dataConnect);

console.log(data.response_delete);

// Or, you can use the `Promise` API.
deleteResponse().then((response) => {
  const data = response.data;
  console.log(data.response_delete);
});
```

### Using `DeleteResponse`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, deleteResponseRef } from '@dataconnect/generated';


// Call the `deleteResponseRef()` function to get a reference to the mutation.
const ref = deleteResponseRef();

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = deleteResponseRef(dataConnect);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.response_delete);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.response_delete);
});
```

## CreateSkillMetric
You can execute the `CreateSkillMetric` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createSkillMetric(): MutationPromise<CreateSkillMetricData, undefined>;

interface CreateSkillMetricRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<CreateSkillMetricData, undefined>;
}
export const createSkillMetricRef: CreateSkillMetricRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createSkillMetric(dc: DataConnect): MutationPromise<CreateSkillMetricData, undefined>;

interface CreateSkillMetricRef {
  ...
  (dc: DataConnect): MutationRef<CreateSkillMetricData, undefined>;
}
export const createSkillMetricRef: CreateSkillMetricRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createSkillMetricRef:
```typescript
const name = createSkillMetricRef.operationName;
console.log(name);
```

### Variables
The `CreateSkillMetric` mutation has no variables.
### Return Type
Recall that executing the `CreateSkillMetric` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateSkillMetricData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateSkillMetricData {
  skillMetric_insert: SkillMetric_Key;
}
```
### Using `CreateSkillMetric`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createSkillMetric } from '@dataconnect/generated';


// Call the `createSkillMetric()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createSkillMetric();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createSkillMetric(dataConnect);

console.log(data.skillMetric_insert);

// Or, you can use the `Promise` API.
createSkillMetric().then((response) => {
  const data = response.data;
  console.log(data.skillMetric_insert);
});
```

### Using `CreateSkillMetric`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createSkillMetricRef } from '@dataconnect/generated';


// Call the `createSkillMetricRef()` function to get a reference to the mutation.
const ref = createSkillMetricRef();

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createSkillMetricRef(dataConnect);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.skillMetric_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.skillMetric_insert);
});
```

## UpdateSkillMetric
You can execute the `UpdateSkillMetric` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updateSkillMetric(): MutationPromise<UpdateSkillMetricData, undefined>;

interface UpdateSkillMetricRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<UpdateSkillMetricData, undefined>;
}
export const updateSkillMetricRef: UpdateSkillMetricRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateSkillMetric(dc: DataConnect): MutationPromise<UpdateSkillMetricData, undefined>;

interface UpdateSkillMetricRef {
  ...
  (dc: DataConnect): MutationRef<UpdateSkillMetricData, undefined>;
}
export const updateSkillMetricRef: UpdateSkillMetricRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateSkillMetricRef:
```typescript
const name = updateSkillMetricRef.operationName;
console.log(name);
```

### Variables
The `UpdateSkillMetric` mutation has no variables.
### Return Type
Recall that executing the `UpdateSkillMetric` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateSkillMetricData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateSkillMetricData {
  skillMetric_update?: SkillMetric_Key | null;
}
```
### Using `UpdateSkillMetric`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateSkillMetric } from '@dataconnect/generated';


// Call the `updateSkillMetric()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateSkillMetric();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateSkillMetric(dataConnect);

console.log(data.skillMetric_update);

// Or, you can use the `Promise` API.
updateSkillMetric().then((response) => {
  const data = response.data;
  console.log(data.skillMetric_update);
});
```

### Using `UpdateSkillMetric`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateSkillMetricRef } from '@dataconnect/generated';


// Call the `updateSkillMetricRef()` function to get a reference to the mutation.
const ref = updateSkillMetricRef();

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateSkillMetricRef(dataConnect);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.skillMetric_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.skillMetric_update);
});
```

## DeleteSkillMetric
You can execute the `DeleteSkillMetric` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
deleteSkillMetric(): MutationPromise<DeleteSkillMetricData, undefined>;

interface DeleteSkillMetricRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<DeleteSkillMetricData, undefined>;
}
export const deleteSkillMetricRef: DeleteSkillMetricRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
deleteSkillMetric(dc: DataConnect): MutationPromise<DeleteSkillMetricData, undefined>;

interface DeleteSkillMetricRef {
  ...
  (dc: DataConnect): MutationRef<DeleteSkillMetricData, undefined>;
}
export const deleteSkillMetricRef: DeleteSkillMetricRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the deleteSkillMetricRef:
```typescript
const name = deleteSkillMetricRef.operationName;
console.log(name);
```

### Variables
The `DeleteSkillMetric` mutation has no variables.
### Return Type
Recall that executing the `DeleteSkillMetric` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `DeleteSkillMetricData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface DeleteSkillMetricData {
  skillMetric_delete?: SkillMetric_Key | null;
}
```
### Using `DeleteSkillMetric`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, deleteSkillMetric } from '@dataconnect/generated';


// Call the `deleteSkillMetric()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await deleteSkillMetric();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await deleteSkillMetric(dataConnect);

console.log(data.skillMetric_delete);

// Or, you can use the `Promise` API.
deleteSkillMetric().then((response) => {
  const data = response.data;
  console.log(data.skillMetric_delete);
});
```

### Using `DeleteSkillMetric`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, deleteSkillMetricRef } from '@dataconnect/generated';


// Call the `deleteSkillMetricRef()` function to get a reference to the mutation.
const ref = deleteSkillMetricRef();

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = deleteSkillMetricRef(dataConnect);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.skillMetric_delete);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.skillMetric_delete);
});
```

