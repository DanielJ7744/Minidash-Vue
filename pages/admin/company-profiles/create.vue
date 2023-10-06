<template>
  <div>
    <Breadcrumb
      :current-page="'Manage Profile'"
      :crumbs="{ 'Company Profiles': '/admin/company-profiles' }"
    />

    <PageHeader>
      <template #title>Create company</template>
    </PageHeader>

    <hr />

    <LegacyPageSettingsCompanyProfileForm />
  </div>
</template>
