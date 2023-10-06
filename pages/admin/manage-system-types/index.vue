<template>
  <div>
    <Breadcrumb
      current-page="Manage System Types"
      :crumbs="{ Settings: '/settings' }"
    />
    <div>
      <h1 class="page-title">Manage System Types</h1>

      <div>
        <p>
          System types denote the type that a system is. This could be ERP, 3PL,
          WMS, eCommerce for example.
        </p>
        <br />
        <p>
          The system type is used in conjunction with the system, to organise
          systems into their respective type.
        </p>
      </div>
    </div>
    <hr />
    <SystemTypesTable />
  </div>
</template>

<script>
definePageMeta({ middleware: 'patchworks' });

export default {
  name: 'Index',
};
</script>
