<template>
  <div class="text-gray-900">
    <Breadcrumb id="breadcrumbMain" :current-page="pageTitle" :crumbs="{ Settings: '/settings' }" />
    <div>
      <div class="bg-[url('/images/billing-background.svg')] h-[17rem] md:h-[25rem] mt-5 flex items-center justify-center">
        <h1 class="text-white text-4xl font-medium mb-16 md:mb-28">
          {{ pageTitle }}
        </h1>
      </div>
      <div class="md:w-11/12 -mt-20 md:-mt-32 font-medium relative mx-auto overflow-x-auto md:bg-white rounded bg-clip-border md:shadow-xl">
        <div v-if="isDesktop" class="hidden lg:block min-w-[850px]">
          <div class="content-main-card pb-6">
            <div class="gradient-border mb-6" />
            <div class="flex-even flex text-base 2xl:text-xl">
              <div class="no-bottom">
                <h5>
                  Subscription Tiers
                </h5>
              </div>
              <div class="no-bottom">
                <h3 class="text-orange-400">
                  Sandbox
                </h3>
              </div>
              <div class="no-bottom">
                <h3 class="text-orange-500">
                  Standard
                </h3>
              </div>
              <div class="no-bottom">
                <h3 class="text-orange-600">
                  Professional
                </h3>
              </div>
              <div class="no-bottom">
                <h3 class="text-red-500">
                  Enterprise
                </h3>
              </div>
            </div>
            <div class="flex-even flex">
              <div class="no-bottom" />
              <div class="no-bottom" />
              <div class="text-base 2xl:text-2xl no-bottom">
                <span class="text-gray-500">£</span>
                <span class="text-2xl 2xl:text-3xl">500</span>
              </div>
              <div class="text-base 2xl:text-2xl no-bottom">
                <span class="text-gray-500">£</span>
                <span class="text-2xl 2xl:text-3xl">1200</span>
              </div>
              <div class="text-base 2xl:text-2xl no-bottom">
                <span class="text-2xl 2xl:text-3xl">Enquire</span>
              </div>
            </div>
            <div class="flex-even flex">
              <div />
              <div>
                <button class="button button-primary p-3 text-xs w-full" @click="openContactModal()">
                  Contact Sales
                </button>
              </div>
              <div>
                <button class="button button-primary p-3 text-xs w-full" @click="openContactModal()">
                  Contact Sales
                </button>
              </div>
              <div>
                <button class="button button-primary p-3 text-xs w-full" @click="openContactModal()">
                  Contact Sales
                </button>
              </div>
              <div>
                <button class="button button-primary p-3 text-xs w-full" @click="openContactModal()">
                  Contact Sales
                </button>
              </div>
            </div>
            <div class="flex-even flex">
              <div>
                <h5>Active Services</h5>
              </div>
              <div>
                <p>2</p>
              </div>
              <div>
                <p>20</p>
              </div>
              <div>
                <p>100</p>
              </div>
              <div>
                <p>Over 100</p>
              </div>
            </div>
            <div class="flex-even flex">
              <div>
                <h5>Transactions ( Monthly )</h5>
              </div>
              <div>
                <p>Up to 250</p>
              </div>
              <div>
                <p>Up to 250k</p>
              </div>
              <div>
                <p>Up to 500k</p>
              </div>
              <div>
                <p>Over 500k</p>
              </div>
            </div>
            <div class="flex-even flex">
              <div>
                <h5>Service logs</h5>
              </div>
              <div>
                <p>2 Days</p>
              </div>
              <div>
                <p>2 Days</p>
              </div>
              <div>
                <p>2 Days</p>
              </div>
              <div>
                <p>14 Days</p>
              </div>
            </div>
            <div class="flex-even flex">
              <div>
                <h5>
                  Features
                </h5>
              </div>
              <div class="f--normal">
                <ul class="icon-text-list">
                  <li><span class="icon icon--tick" />Scheduled Services</li>
                  <li><span class="icon icon--alert" />Service Alerting</li>
                </ul>
              </div>
              <div class="f--normal">
                <ul class="icon-text-list">
                  <li><span class="icon icon--tick" />Scheduled Services</li>
                  <li><span class="icon icon--alert" />Service Alerting</li>
                  <li><span class="icon icon--file-text2" />Audit Logging</li>
                  <li><span class="icon icon--chart" />Production & Testing Connectors</li>
                  <li><span class="icon icon--chart" />1-Many System Connections</li>
                  <li><span class="icon icon--enlarge" />"Out of the Box" Full Mapping & Transformations</li>
                </ul>
              </div>
              <div class="f--normal">
                <ul class="icon-text-list">
                  <li><span class="icon icon--apps" />Everything in Standard plus:</li>
                  <li><span class="icon icon--upload3" />Advanced Connectors</li>
                  <li><span class="icon icon--link" />API - 2 requests per second (REST or GraphQL)</li>
                  <li><span class="icon icon--link" />SFTP</li>
                  <li><span class="icon icon--chart" />1-Many System Connections</li>
                  <li><span class="icon icon--pencil2" />Custom Transformations</li>
                  <li><span class="icon icon--pencil2" />Custom Scripting</li>
                </ul>
              </div>
              <div class="f--normal">
                <ul class="icon-text-list">
                  <li><span class="icon icon--apps" />Everything in professional plus:</li>
                  <li><span class="icon icon--link" />Full API access - 5 requests per second (REST or GraphQL)</li>
                  <li><span class="icon icon--link" />SFTP</li>
                  <li><span class="icon icon--pencil2" />Custom Connectors</li>
                  <li><span class="icon icon--pencil2" />Custom Services</li>
                  <li><span class="icon icon--pencil2" />Custom Transformations</li>
                </ul>
              </div>
            </div>
            <div class="flex-even flex">
              <div class="text-center">
                <NuxtLink tag="button" to="/settings/all-features" class="button button-secondary button-sm">
                  View all tier features
                </NuxtLink>
              </div>
            </div>
            <div class="flex-even flex">
              <div class="w-1/5">
                <h5>
                  Support
                </h5>
              </div>
              <div class="w-1/5">
                <h4>
                  Sandbox
                </h4>
              </div>
              <div class="w-2/5 no-even">
                <h4>
                  Standard
                </h4>
              </div>
              <div class="w-1/5">
                <h4>
                  Enterprise
                </h4>
              </div>
            </div>
            <div class="flex-even flex">
              <div class="w-1/5" />
              <div class="f--normal w-1/5 no-bottom">
                <ul class="icon-text-list">
                  <li>No Support</li>
                </ul>
              </div>
              <div class="f--normal w-2/5 no-even no-bottom">
                <ul class="icon-text-list">
                  <li><span class="icon icon--tick-no-circle icon--success" />Integrated Helpdesk Support</li>
                  <li><span class="icon icon--tick-no-circle icon--success" />12 hour SLA</li>
                  <li><span class="icon icon--tick-no-circle icon--success" />24/7 Monitored Support </li>
                  <li><span class="icon icon--tick-no-circle icon--success" />Access to Patchworks Slack</li>
                </ul>
              </div>
              <div class="f--normal w-1/5 no-bottom">
                <ul class="icon-text-list">
                  <li><span class="icon icon--tick-no-circle icon--success" />Integrated Helpdesk Support</li>
                  <li><span class="icon icon--tick-no-circle icon--success" />12 hour SLA</li>
                  <li><span class="icon icon--tick-no-circle icon--success" />24/7 Monitored Support </li>
                  <li><span class="icon icon--tick-no-circle icon--success" />A private high priority Slack Channel</li>
                  <li><span class="icon icon--tick-no-circle icon--success" />A Dedicated Support Technician</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="block lg:hidden pb-8">
          <div class="w-11/12 bg-white m-auto shadow-xl rounded-t">
            <div class="gradient-border rounded-t" />
            <div class="p-4">
              <div class="mb-4 mt-4">
                <div>
                  <h5>
                    Subscription Tiers
                  </h5>
                </div>
                <div>
                  <h3 class="text-orange-400 mt-2 mb-6 f-large">
                    Sandbox
                  </h3>
                </div>
              </div>
              <div class="mb-4">
                <div>
                  <button class="button button-primary p-3 text-xs w-full" @click="openContactModal()">
                    Contact Sales
                  </button>
                </div>
              </div>
              <div class="mb-2 border-b border-gray-300 py-3 text-sm">
                2 Active Services
              </div>
              <div class="mb-2 border-b border-gray-300 py-3 text-sm">
                Up to 250 Transactions ( Monthly )
              </div>
              <div class="mb-2 border-b border-gray-300 py-3 text-sm">
                2 Days Service logs
              </div>
              <div class="mb-2 border-b border-gray-300 py-3">
                <div class="mb-2 text-sm">
                  Features
                </div>
                <div class="f--normal">
                  <ul class="icon-text-list">
                    <li><span class="icon icon--tick" />Scheduled Services</li>
                    <li><span class="icon icon--alert" />Service Alerting</li>
                  </ul>
                </div>
              </div>
              <div>
                <div class="text-center my-3">
                  <NuxtLink tag="button" to="/settings/all-features" class="button button-secondary button-sm">
                    View all tier features
                  </NuxtLink>
                </div>
              </div>
            </div>
          </div>
          <div class="w-11/12 bg-white m-auto shadow-xl rounded-t mt-14">
            <div class="gradient-border rounded-t" />
            <div class="p-4">
              <div class="mb-4 mt-4">
                <div>
                  <h5>
                    Subscription Tiers
                  </h5>
                </div>
                <div class="colour-title--primary mt-2 mb-2">
                  <h3 class="text-orange-500 mt-2 mb-6 f-large">
                    Standard
                  </h3>
                </div>
                <div class="mb-6 text-2xl">
                  £ 500
                </div>
              </div>
              <div class="mb-4">
                <div>
                  <button class="button button-primary p-3 text-xs w-full" @click="openContactModal()">
                    Contact Sales
                  </button>
                </div>
              </div>
              <div class="mb-2 border-b border-gray-300 py-3 text-sm">
                20 Active Services
              </div>
              <div class="mb-2 border-b border-gray-300 py-3 text-sm">
                Up to 250k Transactions ( Monthly )
              </div>
              <div class="mb-2 border-b border-gray-300 py-3 text-sm">
                2 Days Service logs
              </div>
              <div class="mb-2 border-b border-gray-300 py-3">
                <div class="mb-2 text-sm">
                  Features
                </div>
                <div class="f--normal">
                  <ul class="icon-text-list">
                    <li><span class="icon icon--tick" />Scheduled Services</li>
                    <li><span class="icon icon--alert" />Service Alerting</li>
                    <li><span class="icon icon--file-text2" />Audit Logging</li>
                    <li><span class="icon icon--chart" />Production & Testing Connectors</li>
                    <li><span class="icon icon--chart" />1-Many System Connections</li>
                    <li><span class="icon icon--enlarge" />"Out of the Box" Full Mapping & Transformations</li>
                  </ul>
                </div>
              </div>
              <div>
                <div class="text-center my-3">
                  <NuxtLink tag="button" to="/settings/all-features" class="button button-secondary button-sm">
                    View all tier features
                  </NuxtLink>
                </div>
              </div>
              <div>
                <div class="mb-2 text-sm">
                  Support
                </div>
              </div>
              <div>
                <div class="f--normal">
                  <ul class="icon-text-list">
                    <li><span class="icon icon--tick-no-circle icon--success" />Integrated Helpdesk Support</li>
                    <li><span class="icon icon--tick-no-circle icon--success" />12 hour SLA</li>
                    <li><span class="icon icon--tick-no-circle icon--success" />24/7 Monitored Support </li>
                    <li><span class="icon icon--tick-no-circle icon--success" />Access to Patchworks Slack</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div class="w-11/12 bg-white m-auto shadow-xl rounded-t mt-14">
            <div class="gradient-border rounded-t" />
            <div class="p-4">
              <div class="mb-4 mt-4">
                <div>
                  <h5>
                    Subscription Tiers
                  </h5>
                </div>
                <div>
                  <h3 class="text-orange-600 mt-2 mb-6 f-large">
                    Professional
                  </h3>
                </div>
                <div class="mb-6 text-2xl">
                  £ 1200
                </div>
              </div>
              <div class="mb-4">
                <div>
                  <button class="button button-primary p-3 text-xs w-full" @click="openContactModal()">
                    Contact Sales
                  </button>
                </div>
              </div>
              <div class="mb-2 border-b border-gray-300 py-3 text-sm">
                100 Active Services
              </div>
              <div class="mb-2 border-b border-gray-300 py-3 text-sm">
                Up to 500k Transactions ( Monthly )
              </div>
              <div class="mb-2 border-b border-gray-300 py-3 text-sm">
                2 Days Service logs
              </div>
              <div class="mb-2 border-b border-gray-300 py-3 text-sm">
                <div class="mb-2 text-sm">
                  Features
                </div>
                <div class="f--normal">
                  <ul class="icon-text-list">
                    <li><span class="icon icon--apps" />Everything in Standard plus:</li>
                    <li><span class="icon icon--upload3" />Advanced Connectors</li>
                    <li><span class="icon icon--link" />API - 2 requests per second (REST or GraphQL)</li>
                    <li><span class="icon icon--link" />SFTP</li>
                    <li><span class="icon icon--chart" />1-Many System Connections</li>
                    <li><span class="icon icon--pencil2" />Custom Transformations</li>
                  </ul>
                </div>
              </div>
              <div>
                <div class="text-center my-3">
                  <NuxtLink tag="button" to="/settings/all-features" class="button button-secondary button-sm">
                    View all tier features
                  </NuxtLink>
                </div>
              </div>
              <div>
                <div class="mb-2 text-sm">
                  Support
                </div>
              </div>
              <div>
                <div class="f--normal">
                  <ul class="icon-text-list">
                    <li><span class="icon icon--tick-no-circle icon--success" />Integrated Helpdesk Support</li>
                    <li><span class="icon icon--tick-no-circle icon--success" />12 hour SLA</li>
                    <li><span class="icon icon--tick-no-circle icon--success" />24/7 Monitored Support </li>
                    <li><span class="icon icon--tick-no-circle icon--success" />Access to Patchworks Slack</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div class="w-11/12 bg-white m-auto shadow-xl rounded-t mt-14">
            <div class="gradient-border rounded-t" />
            <div class="p-4">
              <div class="mb-4 mt-4">
                <div>
                  <h5>
                    Subscription Tiers
                  </h5>
                </div>
                <div>
                  <h3 class="text-red-500 mt-2 mb-6 f-large">
                    Enterprise
                  </h3>
                </div>
                <div class="mb-6 text-2xl">
                  Enquire
                </div>
              </div>
              <div class="mb-4">
                <div>
                  <button class="button button-primary p-3 text-xs w-full" @click="openContactModal()">
                    Contact Sales
                  </button>
                </div>
              </div>
              <div class="mb-2 border-b border-gray-300 py-3 text-sm">
                100+ Active Services
              </div>
              <div class="mb-2 border-b border-gray-300 py-3 text-sm">
                1Mil+ Transactions ( Monthly )
              </div>
              <div class="mb-2 border-b border-gray-300 py-3 text-sm">
                14 Days+ Service logs
              </div>
              <div class="mb-2 border-b border-gray-300 py-3">
                <div class="mb-2 text-sm">
                  Features
                </div>
                <div class="f--normal">
                  <ul class="icon-text-list">
                    <li><span class="icon icon--apps" />Everything in professional plus:</li>
                    <li><span class="icon icon--link" />Full API access - 5 requests per second (REST or GraphQL)</li>
                    <li><span class="icon icon--link" />SFTP</li>
                    <li><span class="icon icon--pencil2" />Custom Connectors</li>
                    <li><span class="icon icon--pencil2" />Custom Services</li>
                    <li><span class="icon icon--pencil2" />Custom Transformations</li>
                  </ul>
                </div>
              </div>
              <div>
                <div class="text-center my-3">
                  <NuxtLink tag="button" to="/settings/all-features" class="button button-secondary button-sm">
                    View all tier features
                  </NuxtLink>
                </div>
              </div>
              <div>
                <div class="mb-2 text-sm">
                  Support
                </div>
              </div>
              <div>
                <div class="f--normal">
                  <ul class="icon-text-list">
                    <li><span class="icon icon--tick-no-circle icon--success" />Integrated Helpdesk Support</li>
                    <li><span class="icon icon--tick-no-circle icon--success" />12 hour SLA</li>
                    <li><span class="icon icon--tick-no-circle icon--success" />24/7 Monitored Support </li>
                    <li><span class="icon icon--tick-no-circle icon--success" />A private high priority Slack Channel</li>
                    <li><span class="icon icon--tick-no-circle icon--success" />A Dedicated Support Technician</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="flex items-center my-16">
        <h2 class="text-center w-full">
          Patchworks BI
        </h2>
      </div>
      <div class="md:w-11/12 font-medium relative mx-auto overflow-x-auto md:bg-white rounded bg-clip-border md:shadow-xl">
        <div v-if="isDesktop" class="hidden lg:block">
          <div class="pb-6 content-main-card">
            <div class="gradient-border mb-6" />
            <div class="flex-even flex text-base 2xl:text-xl">
              <div class="no-bottom">
                <h5>
                  Subscription Tiers
                </h5>
              </div>
              <div class="no-bottom">
                <h3 class="text-orange-400">
                  Standard
                </h3>
              </div>
              <div class="no-bottom">
                <h3 class="text-orange-600">
                  Professional
                </h3>
              </div>
              <div class="no-bottom">
                <h3 class="text-red-500">
                  Enterprise
                </h3>
              </div>
            </div>
            <div class="flex-even flex">
              <div class="no-bottom" />
              <div class="no-bottom text-base 2xl:text-2xl">
                <span class="text-gray-500">£</span>
                <span class="text-2xl 2xl:text-3xl">695</span>
              </div>
              <div class="no-bottom text-base 2xl:text-2xl">
                <span class="text-gray-500">£</span>
                <span class="text-2xl 2xl:text-3xl">1,295</span>
              </div>
              <div class="no-bottom text-base 2xl:text-2xl">
                <span class="text-2xl 2xl:text-3xl">Enquire</span>
              </div>
            </div>
            <div class="flex-even flex">
              <div />
              <div>
                <button class="button button-primary p-3 text-xs w-full" @click="openContactModal()">
                  Contact Sales
                </button>
              </div>
              <div>
                <button class="button button-primary p-3 text-xs w-full" @click="openContactModal()">
                  Contact Sales
                </button>
              </div>
              <div>
                <button class="button button-primary p-3 text-xs w-full" @click="openContactModal()">
                  Contact Sales
                </button>
              </div>
            </div>
            <div class="flex-even flex">
              <div>
                <h5>
                  Functionality: (PowerBI Reporting)
                </h5>
              </div>
              <div class="f--normal">
                <ul class="list-disc pl-5">
                  <li>Standard Reports</li>
                  <li>3 User Accounts</li>
                  <li>1x per day Data Refresh</li>
                  <li>*Historic Data - 2 years</li>
                  <li>Support - Basic</li>
                </ul>
              </div>
              <div class="f--normal">
                <ul class="list-disc pl-5">
                  <li>Standard Reports</li>
                  <li>Pro Reports</li>
                  <li>7 User Accounts</li>
                  <li>4x per day Data Refresh</li>
                  <li>*Historic Data - 3 years</li>
                  <li>Support - Standard</li>
                </ul>
              </div>
              <div class="f--normal">
                <ul class="list-disc pl-5">
                  <li>Standard Reports</li>
                  <li>Pro Reports</li>
                  <li>Custom Reports</li>
                  <li class="mt-4">Talk to Sales for a Quote</li>
                </ul>
              </div>
            </div>
            <div class="flex-even flex">
              <div>
                <h5>
                  Setup
                </h5>
              </div>
              <div class="f--normal">
                <ul class="list-disc pl-5">
                  <li>72 business hours</li>
                </ul>
              </div>
              <div class="f--normal">
                <ul class="list-disc pl-5">
                  <li>72 business hours</li>
                </ul>
              </div>
              <div class="f--normal"></div>
            </div>
            <div class="flex-even flex">
              <div>
                <h5>
                  Implementation fee
                </h5>
              </div>
              <div class="f--normal">
                <ul class="list-disc pl-5">
                  <li>£695</li>
                </ul>
              </div>
              <div class="f--normal">
                <ul class="list-disc pl-5">
                  <li>£1,295</li>
                </ul>
              </div>
              <div class="f--normal">
                <ul class="list-disc pl-5">
                  <li>Talk to Sales for a Quote</li>
                </ul>
              </div>
            </div>
            <div class="flex-even flex">
              <div class="no-bottom">
                <h5>
                  *Historic Data
                </h5>
              </div>
              <div class="w-3/4 no-even f--normal no-bottom">
                <p>Patchworks will provide CSV data templates for all import services.</p>
                <p>It will include sample data and descriptions for the fields required.</p>
                <p>Once completed these templates can be uploaded securely and imported into your new BI dashboard ready to use within 72 hours.</p>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="block lg:hidden pb-8">
          <div class="w-11/12 bg-white m-auto shadow-xl rounded-t">
            <div class="gradient-border rounded-t" />
            <div class="p-4">
              <div class="mb-4 mt-4">
                <div>
                  <h5>
                    Subscription Tiers
                  </h5>
                </div>
                <div>
                  <h3 class="text-orange-400 mt-2 mb-6 f-large">
                    Standard
                  </h3>
                </div>
                <div class="text-base 2xl:text-2xl">
                  <span class="text-gray-500">£</span>
                  <span class="text-2xl 2xl:text-3xl">695</span>
                </div>
              </div>
              <div class="mb-4">
                <div>
                  <button class="button button-primary p-3 text-xs w-full" @click="openContactModal()">
                    Contact Sales
                  </button>
                </div>
              </div>
              <div class="mb-2 border-b border-gray-300 py-3 text-sm">
                <div class="mb-2">
                  Functionality: (PowerBI Reporting)
                </div>
                <div class="f--normal">
                  <ul class="list-disc pl-5">
                    <li>Standard Reports</li>
                    <li>3 User Accounts</li>
                    <li>1x per day Data Refresh</li>
                    <li>Historic Data - 2 years</li>
                    <li>Support - Basic</li>
                  </ul>
                </div>
              </div>
              <div class="mb-2 border-b border-gray-300 py-3 text-sm">
                <div class="mb-2">
                  Setup
                </div>
                <div class="f--normal">
                  <ul class="list-disc pl-5">
                    <li>72 business hours</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div class="w-11/12 bg-white m-auto shadow-xl rounded-t mt-14">
            <div class="gradient-border rounded-t" />
            <div class="p-4">
              <div class="mb-4 mt-4">
                <div>
                  <h5>
                    Subscription Tiers
                  </h5>
                </div>
                <div>
                  <h3 class="text-orange-600 mt-2 mb-6 f-large">
                    Professional
                  </h3>
                </div>
                <div class="text-base 2xl:text-2xl">
                  <span class="text-gray-500">£</span>
                  <span class="text-2xl 2xl:text-3xl">1295</span>
                </div>
              </div>
              <div class="mb-4">
                <div>
                  <button class="button button-primary p-3 text-xs w-full" @click="openContactModal()">
                    Contact Sales
                  </button>
                </div>
              </div>
              <div class="mb-2 border-b border-gray-300 py-3 text-sm">
                <div class="mb-2">
                  Functionality: (PowerBI Reporting)
                </div>
                <div class="f--normal">
                  <ul class="list-disc pl-5">
                    <li>Standard Reports</li>
                    <li>Pro Reports</li>
                    <li>7 User Accounts</li>
                    <li>4 x per day Data Refresh</li>
                    <li>*Historic Data - 3 years</li>
                    <li>Support - Standard</li>
                  </ul>
                </div>
              </div>
              <div class="mb-2 border-b border-gray-300 py-3 text-sm">
                <div class="mb-2">
                  Setup
                </div>
                <div class="f--normal">
                  <ul class="list-disc pl-5">
                    <li>72 business hours</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div class="w-11/12 bg-white m-auto shadow-xl rounded-t mt-14">
            <div class="gradient-border rounded-t" />
            <div class="p-4">
              <div class="mb-4 mt-4">
                <div>
                  <h5>
                    Subscription Tiers
                  </h5>
                </div>
                <div>
                  <h3 class="text-red-500 mt-2 mb-6 f-large">
                    Enterprise
                  </h3>
                </div>
                <div class="text-base 2xl:text-2xl">
                  <span class="text-2xl 2xl:text-3xl">Enquire</span>
                </div>
              </div>
              <div class="mb-4">
                <div>
                  <button class="button button-primary p-3 text-xs w-full" @click="openContactModal()">
                    Contact Sales
                  </button>
                </div>
              </div>
              <div class="mb-2 border-b border-gray-300 py-3 text-sm">
                <div class="mb-2">
                  Functionality: (PowerBI Reporting)
                </div>
                <div class="f--normal">
                  <ul class="list-disc pl-5">
                    <li>Standard Reports</li>
                    <li>Pro Reports</li>
                    <li>Custom Reports</li>
                    <li class="mt-4">Talk to Sales for a Quote</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="flex items-center my-16">
        <h2 class="text-center w-full">
          iPaaS Bolt-Ons
        </h2>
      </div>
      <div class="card--small">
        <div class="icon-wrapper">
          <span class="icon icon--podcast" />
        </div>
        <div class="flex-1">
          <h4>Live Services Access</h4>
          <p>
            Add access to live services.
          </p>
          <ul>
            <li>Web-hooks</li>
            <li>Stockr 0.06p per order</li>
          </ul>
        </div>
        <div class="button--card">
          <button class="button button-primary button-md" @click="openContactModal()">
            <span class="icon icon--phone mr-2" />
            Contact sales
          </button>
        </div>
      </div>
      <div class="card--small">
        <div class="icon-wrapper">
          <span class="icon icon--stack" />
        </div>
        <div class="flex-1">
          <h4>Transaction Volume</h4>
          <p>
            Add an additional:
          </p>
          <ul>
            <li>100k Transactions</li>
          </ul>
        </div>
        <div class="button--card">
          <button class="button button-primary button-md" @click="openContactModal()">
            <span class="icon icon--phone mr-2" />
            Contact sales
          </button>
        </div>
      </div>
      <div class="card--small">
        <div class="icon-wrapper">
          <span class="icon icon--airplane" />
        </div>
        <div class="flex-1">
          <h4>Higher Support Tier</h4>
          <p>
            Upgrade to the next level support tier
          </p>
        </div>
        <div class="button--card">
          <button class="button button-primary button-md" @click="openContactModal()">
            <span class="icon icon--phone mr-2" />
            Contact sales
          </button>
        </div>
      </div>
      <div class="card--small">
        <div class="icon-wrapper">
          <span class="icon icon--circle-down" />
        </div>
        <div class="flex-1">
          <h4>Professional Services Hours</h4>
          <p>
            Request assistance from the Project Development Team to set up your connections & services.
          </p>
        </div>
        <div class="button--card">
          <button class="button button-primary button-md" @click="openContactModal()">
            <span class="icon icon--phone mr-2" />
            Contact sales
          </button>
        </div>
      </div>
      <div class="flex items-center my-16">
        <h2 class="text-center w-full">
          BI Bolt-Ons
        </h2>
      </div>
      <div class="card--small">
        <div class="icon-wrapper">
          <span class="icon icon--user" />
        </div>
        <div class="flex-1">
          <h4>Additional User Account</h4>
          <p>
            £30
          </p>
        </div>
        <div class="button--card">
          <button class="button button-primary button-md" @click="openContactModal()">
            <span class="icon icon--phone mr-2" />
            Contact sales
          </button>
        </div>
      </div>
      <div class="card--small">
        <div class="icon-wrapper">
          <span class="icon icon--podcast" />
        </div>
        <div class="flex-1">
          <h4>Standard Support</h4>
          <p>Price on enquiry</p>
        </div>
        <div class="button--card">
          <button class="button button-primary button-md" @click="openContactModal()">
            <span class="icon icon--phone mr-2" />
            Contact sales
          </button>
        </div>
      </div>
      <div class="card--small">
        <div class="icon-wrapper">
          <span class="icon icon--circle-down" />
        </div>
        <div class="flex-1">
          <h4>Professional Services</h4>
          <p>Price on enquiry</p>
        </div>
        <div class="button--card">
          <button class="button button-primary button-md" @click="openContactModal()">
            <span class="icon icon--phone mr-2" />
            Contact sales
          </button>
        </div>
      </div>
      <div class="card--small">
        <div class="icon-wrapper">
          <span class="icon icon--stack" />
        </div>
        <div class="flex-1">
          <h4>Historic Data</h4>
          <p>1 Year</p>
        </div>
        <div class="button--card">
          <button class="button button-primary button-md" @click="openContactModal()">
            <span class="icon icon--phone mr-2" />
            Contact sales
          </button>
        </div>
      </div>
    </div>
    <Dialog
      header="Contact Sales"
      v-model:visible="displayModal"
      :breakpoints="{'960px': '75vw', '640px': '95vw'}"
      :style="{width: '800px'}"
      modal
      dismissableMask
      class="bg-white shadow-2xl p-5 rounded"
      contentClass="mt-4"
    >
      <div id="contactSalesForm" />
    </Dialog>
  </div>
</template>

<script>
export default {
  name: 'Billing',
  data () {
    return {
      pageTitle: 'Plans & Pricing',
      screenWidth: window.innerWidth,
      displayModal: false,
      formScript: null,
      legacyScript: null
    }
  },
  computed: {
    isDesktop () {
      return this.screenWidth > 1023
    }
  },
  mounted () {
    this.loadOnTop()
    this.preLoadContactForm()
    window.addEventListener('resize', this.onResize)
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.onResize)
    document.body.removeChild(this.formScript);
    document.body.removeChild(this.legacyScript);
  },
  methods: {
    loadOnTop () {
      document.getElementById('breadcrumbMain').scrollIntoView()
    },
    openContactModal () {
      this.loadContactForm()
      this.displayModal = true
    },
    preLoadContactForm () {
      const scriptForm = document.createElement('script')
      const scriptLegacy = document.createElement('script')
      scriptForm.src = 'https://js.hsforms.net/forms/v2.js'
      scriptLegacy.src = 'https://js.hsforms.net/forms/v2-legacy.js'
      this.formScript = document.body.appendChild(scriptForm)
      this.legacyScript = document.body.appendChild(scriptLegacy)
    },
    loadContactForm () {
      if (window.hbspt) {
        window.hbspt.forms.create({
          region: 'na1',
          portalId: '4454525',
          formId: '162ecb2f-15f2-4be4-b531-d8e418107ef5',
          target: '#contactSalesForm'
        })
      }
    },
    onResize () {
      this.screenWidth = window.innerWidth
    }
  }
}
</script>

<style scoped>
h2 {
  @apply text-4xl font-medium;
}
h3 {
  @apply text-xl;
}
h3.f-large {
  @apply text-3xl;
}
h4 {
  @apply text-base font-medium;
}
h5 {
  @apply text-sm;
}
p {
  @apply text-sm;
}
ul {
  @apply text-sm;
}
.f--normal {
  @apply font-normal;
}
.icon-text-list .icon {
  @apply pr-2
}
.icon-text-list li {
  @apply mb-2
}
.content-main-card > div > div {
  @apply relative py-4 px-6 border-solid border-gray-200 border-r;
}
.content-main-card > div > div:last-child {
    @apply border-transparent
}
.content-main-card > div > div:not(.no-bottom):after {
  @apply content-[''] absolute bottom-0 h-[1px] bg-gray-200 left-6 w-[calc(100%-48px)];
}
.gradient-border {
  @apply bg-gradient-to-r from-orange-300 to-red-500 h-[6px];
}
.flex-even > div:not(.no-even) {
  @apply flex-1;
}
.card--small {
  @apply flex w-11/12 gap-4 mb-4 mx-auto p-4 shadow-lg flex-wrap md:flex-nowrap rounded bg-clip-border items-center flex-wrap md:flex-nowrap;
}
.card--small p {
  @apply text-xs text-gray-500;
}
.card--small ul {
  @apply text-xs list-disc pl-5;
}
.button--card {
  @apply w-full md:w-auto text-right ml-auto;
}
.icon-wrapper {
  @apply w-12 h-12 rounded bg-clip-border border-solid border-gray-200 border flex items-center justify-center text-gray-800 mb-auto;
}
.icon-text-list .icon--success {
  @apply text-[#2bc443];
}
</style>
