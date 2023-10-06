<template>
  <div>
    <Breadcrumb
      current-page="Create User"
      :crumbs="{ Users: '/user/create' }"
    />

    <PageHeader>
      <template #title>Create User</template>
      <template #description>Use this page to create a user.</template>
    </PageHeader>

    <hr />

    <UsersForm />
  </div>
</template>

<script>
export default {
  name: 'Create',
};
</script>
