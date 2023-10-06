<template>
  <div class="space-y-6 antialiased">
    <h2 class="h3 tracking-normal">
      {{ heading }}
    </h2>

    <p v-for="(text, idx) in paragraphs" :key="idx" class="text-base">
      {{ text }}
    </p>
  </div>
</template>

<script>
export default {
  name: 'FormInformation',
  props: {
    currentStep: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      information: {
        1: {
          heading: "Let's set up your connector!",
          text: [
            "We're going to step through some setup pages to configure a connector for your chosen system - starting with basic details.",
          ],
        },
        2: {
          heading: 'Confirm timezone and date format',
          text: [
            'Patchworks needs to know the timezone and date format used by your selected system, to ensure that data is filtered correctly.',
          ],
        },
        3: {
          heading: 'How should this connector authenticate?',
          text: [
            'To grant permissions for a Patchworks connector to access data within a system, we need authentication details for that system. Select an authentication type below.',
          ],
        },
        4: {
          heading: 'Provide the credentials for this connector',
          text: [
            'Each connector needs a set of credentials to authenticate with the system.',
          ],
        },
      },
    };
  },
  computed: {
    heading() {
      return this.information[this.currentStep]?.heading;
    },
    paragraphs() {
      return this.information[this.currentStep]?.text;
    },
  },
};
</script>
