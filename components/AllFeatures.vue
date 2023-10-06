<template>
  <div>
    <Breadcrumb id="breadcrumbMain" :current-page="pageTitle" :crumbs="{ 'Plans & Pricing': '/settings/billing' }" />
    <div class="text-gray-900 text-[13px]">
      <div class="flex items-center justify-center my-16">
        <h1 class="text-4xl font-medium">
          {{ pageTitle }}
        </h1>
      </div>
      <div class="relative mx-auto overflow-x-auto md:bg-white rounded bg-clip-border md:shadow-xl">
        <div class="min-w-[850px]">
          <div class="pb-6 content-child--table-item">
            <div class="gradient-border mb-4" />
            <div class="flex flex-even text-sm font-medium">
              <div class="border-bold">
                Whats included
              </div>
              <div class="border-bold">
                Feature
              </div>
              <div class="border-bold">
                Description
              </div>
              <div class="border-bold text-orange-500">
                Standard
              </div>
              <div class="border-bold text-orange-600">
                Professional
              </div>
              <div class="border-bold text-red-500">
                Enterprise
              </div>
            </div>
            <div class="flex flex-even">
              <div class="no-border">
                Processing & Reliability
              </div>
              <div>Job Queuing</div>
              <div>
                Automatically queues all Services to ensure integrity
              </div>
              <div><span class="icon icon--tick-no-circle" /></div>
              <div><span class="icon icon--tick-no-circle" /></div>
              <div><span class="icon icon--tick-no-circle" /></div>
            </div>
            <div class="flex flex-even">
              <div class="no-border" />
              <div>Safe Retry</div>
              <div>
                Automatically increase the time between API retries after each retry failure
              </div>
              <div><span class="icon icon--tick-no-circle" /></div>
              <div><span class="icon icon--tick-no-circle" /></div>
              <div><span class="icon icon--tick-no-circle" /></div>
            </div>
            <div class="flex flex-even">
              <div class="no-border" />
              <div>Scalability</div>
              <div>
                A Microservice Architecture of containerised applications to handle spike process
              </div>
              <div><span class="icon icon--tick-no-circle" /></div>
              <div><span class="icon icon--tick-no-circle" /></div>
              <div><span class="icon icon--tick-no-circle" /></div>
            </div>
            <div class="flex flex-even">
              <div class="no-border" />
              <div>Big Data</div>
              <div>Bulk Processing</div>
              <div><span class="icon icon--tick-no-circle" /></div>
              <div><span class="icon icon--tick-no-circle" /></div>
              <div><span class="icon icon--tick-no-circle" /></div>
            </div>
            <div class="flex flex-even">
              <div class="border-bold" />
              <div class="border-bold">
                Rate Limiting Configuration
              </div>
              <div class="border-bold">
                Set Speed of API calls
              </div>
              <div class="border-bold">
                <span class="icon icon--tick-no-circle" />
              </div>
              <div class="border-bold">
                <span class="icon icon--tick-no-circle" />
              </div>
              <div class="border-bold">
                <span class="icon icon--tick-no-circle" />
              </div>
            </div>
            <div class="flex flex-even">
              <div class="no-border">
                API
              </div>
              <div>Multiple Authentication Routes</div>
              <div>
                Create multiple APIs with separate authentication
              </div>
              <div />
              <div><span class="icon icon--tick-no-circle" /></div>
              <div><span class="icon icon--tick-no-circle" /></div>
            </div>
            <div class="flex flex-even">
              <div class="no-border" />
              <div>
                Custom Profile Builder ( JSON Payload )
              </div>
              <div>
                Create a JSON profile that represents the structure being received by the connector.
              </div>
              <div />
              <div><span class="icon icon--tick-no-circle" /></div>
              <div><span class="icon icon--tick-no-circle" /></div>
            </div>
            <div class="flex flex-even">
              <div class="no-border" />
              <div class="not-available">
                SDK
                <br>
                (Coming soon)
              </div>
              <div class="not-available">
                The Connector SDK artifacts contain a connector-sdk-samples-sources installable library, containing source code for some connector samples you can reference when building a custom connector. There are sample JSON Operation classes, Listener classes, and more.
              </div>
              <div />
              <div><span class="icon icon--tick-no-circle not-available" /></div>
              <div><span class="icon icon--tick-no-circle not-available" /></div>
            </div>
            <div class="flex flex-even">
              <div class="no-border" />
              <div>Pre-defined Profiles</div>
              <div>
                Select from JSON profiles from pre-set structures for multiple entites being received by the connector.
              </div>
              <div />
              <div><span class="icon icon--tick-no-circle" /></div>
              <div><span class="icon icon--tick-no-circle" /></div>
            </div>
            <div class="flex flex-even">
              <div class="border-bold" />
              <div class="border-bold">
                Custom Rate Limiting
              </div>
              <div class="border-bold">
                Ability to send above the standard amount of calls to the Patchworks Platform per sec
              </div>
              <div class="border-bold" />
              <div class="border-bold">
                <span class="icon icon--tick-no-circle" />
              </div>
              <div class="border-bold">
                <span class="icon icon--tick-no-circle" />
              </div>
            </div>
            <div class="flex flex-even">
              <div class="no-border">
                Event Driven
              </div>
              <div class="not-available">
                Live Services ( Webhooks )
                <br>
                (Coming soon)
              </div>
              <div class="not-available">
                triggered by an event in a source system. Automatically sent out when their event is fired in the source system
              </div>
              <div />
              <div><span class="icon icon--tick-no-circle not-available" /></div>
              <div><span class="icon icon--tick-no-circle not-available" /></div>
            </div>
            <div class="flex flex-even">
              <div class="border-bold" />
              <div class="border-bold">
                Scheduled Services
              </div>
              <div class="border-bold">
                Trigger a data capture from a service at a specified time
              </div>
              <div class="border-bold">
                <span class="icon icon--tick-no-circle" />
              </div>
              <div class="border-bold">
                <span class="icon icon--tick-no-circle" />
              </div>
              <div class="border-bold">
                <span class="icon icon--tick-no-circle" />
              </div>
            </div>
            <div class="flex flex-even">
              <div class="no-border">
                System Monitoring / Reporting
              </div>
              <div>Real-time Sync Reports</div>
              <div>
                Detail on each transaction that flows through the system, recording both Success & Failures
              </div>
              <div><span class="icon icon--tick-no-circle" /></div>
              <div><span class="icon icon--tick-no-circle" /></div>
              <div><span class="icon icon--tick-no-circle" /></div>
            </div>
            <div class="flex flex-even">
              <div class="no-border" />
              <div>Audits Logs</div>
              <div>
                Audit Logs dialog shows the history of changes or actions to your Integrations and setup
              </div>
              <div><span class="icon icon--tick-no-circle" /></div>
              <div><span class="icon icon--tick-no-circle" /></div>
              <div><span class="icon icon--tick-no-circle" /></div>
            </div>
            <div class="flex flex-even">
              <div class="no-border" />
              <div>Service Logs</div>
              <div>
                In depth Detail of the events within a Integration Service
              </div>
              <div><span class="icon icon--tick-no-circle" /></div>
              <div><span class="icon icon--tick-no-circle" /></div>
              <div><span class="icon icon--tick-no-circle" /></div>
            </div>
            <div class="flex flex-even">
              <div class="no-border" />
              <div>downloadable Logs into CSV format</div>
              <div>Downloading Capabilities of logs</div>
              <div><span class="icon icon--tick-no-circle" /></div>
              <div><span class="icon icon--tick-no-circle" /></div>
              <div><span class="icon icon--tick-no-circle" /></div>
            </div>
            <div class="flex flex-even">
              <div class="no-border" />
              <div>
                Alerting - Email Triggers on Error, Warnings, Usage
              </div>
              <div>
                Set up Triggers to receive emails reporting status of Service Executions within the system
              </div>
              <div><span class="icon icon--tick-no-circle" /></div>
              <div><span class="icon icon--tick-no-circle" /></div>
              <div><span class="icon icon--tick-no-circle" /></div>
            </div>
            <div class="flex flex-even">
              <div class="border-bold" />
              <div class="border-bold">
                Notification Group management
              </div>
              <div class="border-bold">
                Distributions lists for email alerts.
              </div>
              <div class="border-bold">
                <span class="icon icon--tick-no-circle" />
              </div>
              <div class="border-bold">
                <span class="icon icon--tick-no-circle" />
              </div>
              <div class="border-bold">
                <span class="icon icon--tick-no-circle" />
              </div>
            </div>
            <div class="flex flex-even">
              <div class="no-border">
                Self-Serve Enablement
              </div>
              <div>Service Resync Transactions</div>
              <div>
                Ability to resync an individual failure via the Dashboard
              </div>
              <div><span class="icon icon--tick-no-circle" /></div>
              <div><span class="icon icon--tick-no-circle" /></div>
              <div><span class="icon icon--tick-no-circle" /></div>
            </div>
            <div class="flex flex-even">
              <div class="no-border" />
              <div>Manual Service Runs</div>
              <div>
                Run Services manually from the Dashboard
              </div>
              <div><span class="icon icon--tick-no-circle" /></div>
              <div><span class="icon icon--tick-no-circle" /></div>
              <div><span class="icon icon--tick-no-circle" /></div>
            </div>
            <div class="flex flex-even">
              <div class="no-border" />
              <div>
                Zero-Code Integration Canvas Builder ( Connectors, Services, Field Mapping & Transformations)
              </div>
              <div>
                Drag and Drop Workflow builder. Use a 100% workflow builder to build an integration
              </div>
              <div><span class="icon icon--tick-no-circle" /></div>
              <div><span class="icon icon--tick-no-circle" /></div>
              <div><span class="icon icon--tick-no-circle" /></div>
            </div>
            <div class="flex flex-even">
              <div class="no-border" />
              <div>
                SFTP Connectors
                <br>
                (Coming soon)
              </div>
              <div>
                Setup connectors for SFTP/FTP
              </div>
              <div><span class="icon icon--tick-no-circle" /></div>
              <div><span class="icon icon--tick-no-circle" /></div>
              <div><span class="icon icon--tick-no-circle" /></div>
            </div>
            <div class="flex flex-even">
              <div class="no-border" />
              <div>
                API Connectors
              </div>
              <div>
                WebService Listener Connectors , allowing bespoke inbound profiles
              </div>
              <div />
              <div><span class="icon icon--tick-no-circle" /></div>
              <div><span class="icon icon--tick-no-circle" /></div>
            </div>
            <div class="flex flex-even">
              <div class="no-border" />
              <div>BI Connectors</div>
              <div />
              <div />
              <div />
              <div><span class="icon icon--tick-no-circle" /></div>
            </div>
            <div class="flex flex-even">
              <div class="no-border" />
              <div>Standard Connectors</div>
              <div>
                Patchworks list of Connectors
              </div>
              <div><span class="icon icon--tick-no-circle" /></div>
              <div><span class="icon icon--tick-no-circle" /></div>
              <div><span class="icon icon--tick-no-circle" /></div>
            </div>
            <div class="flex flex-even">
              <div class="no-border" />
              <div>Custom Connectors</div>
              <div>
                Not available within our Library of Connectors
              </div>
              <div><span class="icon icon--tick-no-circle" /></div>
              <div><span class="icon icon--tick-no-circle" /></div>
              <div><span class="icon icon--tick-no-circle" /></div>
            </div>
            <div class="flex flex-even">
              <div class="no-border" />
              <div>Cross Reference Tables</div>
              <div>
                Common Data translations between System A and System B, such as item codes, units of measure, status codes,etc
              </div>
              <div><span class="icon icon--tick-no-circle" /></div>
              <div><span class="icon icon--tick-no-circle" /></div>
              <div><span class="icon icon--tick-no-circle" /></div>
            </div>
            <div class="flex flex-even">
              <div class="no-border" />
              <div>1:1 Field Mapping</div>
              <div>
                Map a source field to a destination Field
              </div>
              <div><span class="icon icon--tick-no-circle" /></div>
              <div><span class="icon icon--tick-no-circle" /></div>
              <div><span class="icon icon--tick-no-circle" /></div>
            </div>
            <div class="flex flex-even">
              <div class="no-border" />
              <div>1:Many Field Mapping</div>
              <div>
                Map a source field to multiple destination Field
              </div>
              <div />
              <div><span class="icon icon--tick-no-circle" /></div>
              <div><span class="icon icon--tick-no-circle" /></div>
            </div>
            <div class="flex flex-even">
              <div class="no-border" />
              <div>
                Pre-defined No Code Transformations ( Date, Numeric, String, Functions )
              </div>
              <div>
                Allow transformation logic to be applied to individual field values as they are being mapped
              </div>
              <div><span class="icon icon--tick-no-circle" /></div>
              <div><span class="icon icon--tick-no-circle" /></div>
              <div><span class="icon icon--tick-no-circle" /></div>
            </div>
            <div class="flex flex-even">
              <div class="border-bold" />
              <div class="border-bold">
                Custom Transformations and Manipulations
              </div>
              <div class="border-bold">
                Logic not available within our Pre-defined Function set
              </div>
              <div class="border-bold" />
              <div class="border-bold" />
              <div class="border-bold">
                <span class="icon icon--tick-no-circle" />
              </div>
            </div>
            <div class="flex flex-even">
              <div class="no-border">
                Automation
              </div>
              <div>Smart Field Mapping</div>
              <div>
                Auto Map fields from Source to Destination
              </div>
              <div><span class="icon icon--tick-no-circle" /></div>
              <div><span class="icon icon--tick-no-circle" /></div>
              <div><span class="icon icon--tick-no-circle" /></div>
            </div>
            <div class="flex flex-even">
              <div class="no-border" />
              <div>
                Pre-built Integration Packages Wizard
              </div>
              <div>
                Automatic creation of Each Entity available for selected connector to allow quick and easy Integration setup
              </div>
              <div><span class="icon icon--tick-no-circle" /></div>
              <div><span class="icon icon--tick-no-circle" /></div>
              <div><span class="icon icon--tick-no-circle" /></div>
            </div>
            <div class="flex flex-even">
              <div class="border-bold" />
              <div class="border-bold">
                Setup Wizard
              </div>
              <div class="border-bold">
                Series of Steps to achieve an integration
              </div>
              <div class="border-bold">
                <span class="icon icon--tick-no-circle" />
              </div>
              <div class="border-bold">
                <span class="icon icon--tick-no-circle" />
              </div>
              <div class="border-bold">
                <span class="icon icon--tick-no-circle" />
              </div>
            </div>
            <div class="flex flex-even">
              <div class="no-border">
                Advanced Self-Serve Dev Tools
              </div>
              <div>
                Script Injection
              </div>
              <div>
                Incorporate custom code and execute a block of Code within a workflow Canvas or field mapping step
              </div>
              <div class="no-border" />
              <div><span class="icon icon--tick-no-circle" /></div>
              <div><span class="icon icon--tick-no-circle" /></div>
            </div>
            <div class="flex flex-even">
              <div class="border-bold" />
              <div class="border-bold">
                Process Canvas
              </div>
              <div class="border-bold">
                A series of sequences, represented by components, that determine how data is executed within the system. It allows Connections and Logic through an array of components and configuration shapes.
              </div>
              <div class="border-bold">
                <span class="icon icon--tick-no-circle" />
              </div>
              <div class="border-bold">
                <span class="icon icon--tick-no-circle" />
              </div>
              <div class="border-bold">
                <span class="icon icon--tick-no-circle" />
              </div>
            </div>
            <div class="flex flex-even">
              <div class="no-border">
                Business Canvas WorkFlows
              </div>
              <div class="not-available">
                Logic gates
                <br>
                (Coming soon)
              </div>
              <div class="not-available">
                Routes documents based on a true/false or If/Else comparison of two values
              </div>
              <div><span class="icon icon--tick-no-circle not-available" /></div>
              <div><span class="icon icon--tick-no-circle not-available" /></div>
              <div><span class="icon icon--tick-no-circle not-available" /></div>
            </div>
            <div class="flex flex-even">
              <div class="no-border" />
              <div class="not-available">
                Branches
                <br>
                (Coming soon)
              </div>
              <div class="not-available">
                Creates a copy of a document and passes it down each branch in sequential order.
              </div>
              <div><span class="icon icon--tick-no-circle not-available" /></div>
              <div><span class="icon icon--tick-no-circle not-available" /></div>
              <div><span class="icon icon--tick-no-circle not-available" /></div>
            </div>
            <div class="flex flex-even">
              <div class="no-border" />
              <div class="not-available">
                Loops / Flow Control
                <br>
                (Coming soon)
              </div>
              <div class="not-available">
                Controls Payload data flow
              </div>
              <div><span class="icon icon--tick-no-circle not-available" /></div>
              <div><span class="icon icon--tick-no-circle not-available" /></div>
              <div><span class="icon icon--tick-no-circle not-available" /></div>
            </div>
            <div class="flex flex-even">
              <div class="no-border" />
              <div class="not-available">
                Caching
                <br>
                (Coming soon)
              </div>
              <div class="not-available">
                Data cache so that they can be referenced later in the currently executing process
              </div>
              <div><span class="icon icon--tick-no-circle not-available" /></div>
              <div><span class="icon icon--tick-no-circle not-available" /></div>
              <div><span class="icon icon--tick-no-circle not-available" /></div>
            </div>
            <div class="flex flex-even">
              <div class="no-border" />
              <div class="not-available">
                Logging
                <br>
                (Coming soon)
              </div>
              <div class="not-available">
                Build custom execution logs and/or send customized notification messages to your subscribed email alerts
              </div>
              <div><span class="icon icon--tick-no-circle not-available" /></div>
              <div><span class="icon icon--tick-no-circle not-available" /></div>
              <div><span class="icon icon--tick-no-circle not-available" /></div>
            </div>
            <div class="flex flex-even">
              <div class="border-bold" />
              <div class="border-bold not-available">
                Debugging/Run in Test Mode
                <br>
                (Coming soon)
              </div>
              <div class="border-bold not-available">
                Re-run Service with visual representation of point of failure
              </div>
              <div class="border-bold">
                <span class="icon icon--tick-no-circle not-available" />
              </div>
              <div class="border-bold">
                <span class="icon icon--tick-no-circle not-available" />
              </div>
              <div class="border-bold">
                <span class="icon icon--tick-no-circle not-available" />
              </div>
            </div>
            <div class="flex flex-even">
              <div class="no-border">
                Roles/Permissions
              </div>
              <div>Cross-Region Reporting</div>
              <div>
                Lock role visibility down to particular country regions of Service and the reporting for that Service
              </div>
              <div><span class="icon icon--tick-no-circle" /></div>
              <div><span class="icon icon--tick-no-circle" /></div>
              <div><span class="icon icon--tick-no-circle" /></div>
            </div>
            <div class="flex flex-even">
              <div class="no-border" />
              <div>Level of Control</div>
              <div>Limit Self-serve functionality of Users</div>
              <div><span class="icon icon--tick-no-circle" /></div>
              <div><span class="icon icon--tick-no-circle" /></div>
              <div><span class="icon icon--tick-no-circle" /></div>
            </div>
            <div class="flex flex-even">
              <div class="border-bold" />
              <div class="border-bold">
                Groups
              </div>
              <div class="border-bold">
                Group Users for Email Triggers and collective permission responsibilities
              </div>
              <div class="border-bold">
                <span class="icon icon--tick-no-circle" />
              </div>
              <div class="border-bold">
                <span class="icon icon--tick-no-circle" />
              </div>
              <div class="border-bold">
                <span class="icon icon--tick-no-circle" />
              </div>
            </div>
            <div class="flex flex-even">
              <div class="no-border">
                Security
              </div>
              <div>Database Encryption</div>
              <div />
              <div><span class="icon icon--tick-no-circle" /></div>
              <div><span class="icon icon--tick-no-circle" /></div>
              <div><span class="icon icon--tick-no-circle" /></div>
            </div>
            <div class="flex flex-even">
              <div class="no-border" />
              <div>GDPR Compliant</div>
              <div />
              <div><span class="icon icon--tick-no-circle" /></div>
              <div><span class="icon icon--tick-no-circle" /></div>
              <div><span class="icon icon--tick-no-circle" /></div>
            </div>
            <div class="flex flex-even">
              <div class="no-border" />
              <div>Penetration Tested</div>
              <div />
              <div><span class="icon icon--tick-no-circle" /></div>
              <div><span class="icon icon--tick-no-circle" /></div>
              <div><span class="icon icon--tick-no-circle" /></div>
            </div>
            <div class="flex flex-even">
              <div class="no-border" />
              <div>Automated Release Testing</div>
              <div />
              <div><span class="icon icon--tick-no-circle" /></div>
              <div><span class="icon icon--tick-no-circle" /></div>
              <div><span class="icon icon--tick-no-circle" /></div>
            </div>
            <div class="flex flex-even">
              <div class="no-border" />
              <div>Disaster Recovery</div>
              <div />
              <div><span class="icon icon--tick-no-circle" /></div>
              <div><span class="icon icon--tick-no-circle" /></div>
              <div><span class="icon icon--tick-no-circle" /></div>
            </div>
          </div>
        </div>
      </div>
      <div class="text-center mt-20 mb-12">
        <NuxtLink tag="button" to="/settings/billing" class="button button-primary button-md">
          Go back to Plans & Pricing
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AllFeatures',
  middleware: ['auth'],
  data () {
    return {
      pageTitle: 'All tier features'
    }
  },
  computed: {
  },
  mounted () {
    this.loadOnTop()
  },
  methods: {
    loadOnTop () {
      document.getElementById('breadcrumbMain').scrollIntoView()
    }
  }
}
</script>

<style scoped>
.gradient-border {
  @apply bg-gradient-to-r from-orange-300 to-red-500 h-[6px];
}
.icon:before {
    @apply text-2xl;
}
.not-available {
    @apply text-gray-300;
}
.content-child--table-item > div > div {
  @apply relative py-4 px-6 border-solid border-gray-200 border-r;
}
.content-child--table-item > div > div:last-child {
    @apply border-transparent
}
.content-child--table-item > div > div:not(.no-border):after {
  @apply content-[''] absolute bottom-0 h-[1px] bg-gray-200 left-6 w-[calc(100%-48px)];
}
.content-child--table-item > div > div.border-bold:not(.no-bottom):after {
  @apply bg-gray-400;
}
.flex-even > div {
  @apply flex-1;
}
.flex-even > div:first-child {
    @apply font-medium;
}
.flex-even > div:nth-child(4) {
    @apply text-orange-500;
}
.flex-even > div:nth-child(5) {
    @apply text-orange-600;
}
.flex-even > div:nth-child(6) {
    @apply text-red-500;
}
</style>
