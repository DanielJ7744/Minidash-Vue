# 🚀 Patchworks Dashboard 👾

The dashboard is a server side rendered Nuxt 3 application hosted on Vercel.

## Tech Stack

- [Nuxt 3](https://v3.nuxtjs.org/)
- [Vue 3](https://v3.vuejs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [TypeScript](https://www.typescriptlang.org/)
- [PrimeVue](https://primevue.org/)
- [VueUse](https://vueuse.org)
- [Vite](https://vitejs.dev/)

### Setup

```bash
npm i
```

### Development Server

Start the development server on http://localhost:3000

```bash
npm run dev
```

### Production

Build and preview the application for production:

```bash
npm run start
```

## Core API

The Core API can be accessed using the `useCore` composable. Destructuring the return will provide an object to fetch data from each domain of the API.

```typescript
const { core, secrets, initialise } = useCore();
```

Landlord endpoints can be accessed using the `.landlord()` method.

```typescript
const { core } = useCore();

await core<{ data: System[] }>('systems').landlord(); // api/v1/patchworks/systems
```

URLs can be composed using an array.

```typescript
const { core } = useCore();

const {
  params: { systemId },
} = useRoute('systems-systemId');

await core<{ data: System }>(['systems', systemId]).landlord(); // api/v1/patchworks/systems/1
```

The user's current company's endpoints can be accessed using the `.tenant()` method.

```typescript
const { core } = useCore();

await core<{ data: Flow[] }>('flows').tenant(); // api/v1/flows
```

Accessing another company's endpoints (when permitted) can be accessed using the `.tenant()` method and providing a company id.

```typescript
const { core } = useCore();

await core<{ data: Flow[] }>('flows').tenant(17); // api/v1/flows with `patchworks-tenant=17` header
```

Query parameters and headers can be passed as `options` within an object as the second parameter of the initial method.

```typescript
const { core } = useCore();

await core<{ data: Flow[] }>('flows', {
  params: { include: 'steps' },
}).tenant(); // api/v1/flows?include=steps
```

Access another domain by destructing the domain from `useCore`.

```typescript
const { secrets } = useCore();

await secrets<{ data: Credential }>('credentials', {
  method: 'POST',
  body: { api_key: 'secret' },
}).tenant();
```

Change the api version using the `.version()` method.

```typescript
const { core } = useCore();

await core<{ data: Flow[] }>('flows').version(2).tenant(); // api/v2/flows
```

See [all available parameters](https://nuxt.com/docs/api/utils/dollarfetch#fetch) for the underlying `$fetch` requests

## Fabric API

The Fabric API can be accessed using the `useFabric` composable.

```typescript
await useFabric<{ data: System[] }>('/api/v1/systems', options); // api/v1/systems
```

## Gates

We can utilise a number of helpful gates throughout the app to determine if content should be rendered or pages restricted.

```typescript
$patchworks(); // is a Patchworks user
$patchworksAdmin(); // is a Patchworks Admin
$developer(); // is a developer

$can('permission'); // has the permission
$can(['permission', 'permission']); // has all of the the permissions
$canAny(['permission', 'permission']); // has any of the permissions
$cannot('permission'); // does not have the permission

$role('role'); // is the role
$role(['role', 'role']); // is all of the roles
$roleAny(['role', 'role']); // is any of the roles

$subscribed('subscription'); // company has the subscription
$subscribed(['subscription', 'subscription']); // company has all of the subscriptions
$subscribedAny(['subscription', 'subscription']); // company has any of the subscriptions
```
