# Basic Usage

Always prioritize using a supported framework over using the generated SDK
directly. Supported frameworks simplify the developer experience and help ensure
best practices are followed.




### React
For each operation, there is a wrapper hook that can be used to call the operation.

Here are all of the hooks that get generated:
```ts
import { useInsertUser, useUpdateUser, useDeleteUser, useGetCurrentUser, useListUsers, useCreateInterviewSession, useUpdateInterviewSession, useDeleteInterviewSession, useGetInterviewSession, useListMyInterviewSessions } from '@dataconnect/generated/react';
// The types of these hooks are available in react/index.d.ts

const { data, isPending, isSuccess, isError, error } = useInsertUser();

const { data, isPending, isSuccess, isError, error } = useUpdateUser();

const { data, isPending, isSuccess, isError, error } = useDeleteUser();

const { data, isPending, isSuccess, isError, error } = useGetCurrentUser();

const { data, isPending, isSuccess, isError, error } = useListUsers();

const { data, isPending, isSuccess, isError, error } = useCreateInterviewSession();

const { data, isPending, isSuccess, isError, error } = useUpdateInterviewSession();

const { data, isPending, isSuccess, isError, error } = useDeleteInterviewSession();

const { data, isPending, isSuccess, isError, error } = useGetInterviewSession();

const { data, isPending, isSuccess, isError, error } = useListMyInterviewSessions();

```

Here's an example from a different generated SDK:

```ts
import { useListAllMovies } from '@dataconnect/generated/react';

function MyComponent() {
  const { isLoading, data, error } = useListAllMovies();
  if(isLoading) {
    return <div>Loading...</div>
  }
  if(error) {
    return <div> An Error Occurred: {error} </div>
  }
}

// App.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MyComponent from './my-component';

function App() {
  const queryClient = new QueryClient();
  return <QueryClientProvider client={queryClient}>
    <MyComponent />
  </QueryClientProvider>
}
```



## Advanced Usage
If a user is not using a supported framework, they can use the generated SDK directly.

Here's an example of how to use it with the first 5 operations:

```js
import { insertUser, updateUser, deleteUser, getCurrentUser, listUsers, createInterviewSession, updateInterviewSession, deleteInterviewSession, getInterviewSession, listMyInterviewSessions } from '@dataconnect/generated';


// Operation InsertUser: 
const { data } = await InsertUser(dataConnect);

// Operation UpdateUser: 
const { data } = await UpdateUser(dataConnect);

// Operation DeleteUser: 
const { data } = await DeleteUser(dataConnect);

// Operation GetCurrentUser: 
const { data } = await GetCurrentUser(dataConnect);

// Operation ListUsers: 
const { data } = await ListUsers(dataConnect);

// Operation CreateInterviewSession: 
const { data } = await CreateInterviewSession(dataConnect);

// Operation UpdateInterviewSession: 
const { data } = await UpdateInterviewSession(dataConnect);

// Operation DeleteInterviewSession: 
const { data } = await DeleteInterviewSession(dataConnect);

// Operation GetInterviewSession: 
const { data } = await GetInterviewSession(dataConnect);

// Operation ListMyInterviewSessions: 
const { data } = await ListMyInterviewSessions(dataConnect);


```