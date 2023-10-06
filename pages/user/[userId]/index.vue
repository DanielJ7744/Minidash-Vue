<template>
  <div>
    <PageHeader>
      <template #title>Manage User</template>
      <template #description>Use this page to manage a user.</template>
    </PageHeader>

    <hr />

    <UsersForm :user-id="userId" />
  </div>
</template>

<script>
export default {
  name: 'Index',
  setup() {
    return {
      route: useRoute(),
    };
  },
  computed: {
    userId() {
      return parseInt(this.route.params.userId);
    },
  },
};
</script>
