<template>
  <div>
    <div v-if="displayBackLink" class="back-bar">
      <div @click="goBack">
        <span class="icon clickable-icon icon--arrow-left" />
        <span class="icon clickable-text">{{ backText }}</span>
      </div>
    </div>

    <PageHeader>
      <template #title>{{ title }}</template>
      <template #description>
        <p>Add, remove or edit these fields to adjust your mapping fields.</p>
      </template>
    </PageHeader>

    <div class="space-y-3">
      <div class="space-y-4">
        <div class="mx-auto px-4 sm:px-8">
          <div class="pt-4 pb-2">
            <div class="-mx-4 overflow-x-auto py-2 sm:-mx-8">
              <!-- Scrollable content -->
              <div class="inline-block min-w-full overflow-hidden">
                <div class="divide-y border-b">
                  <div class="flex space-x-3">
                    <div class="w-8">
                      <h6>#</h6>
                    </div>
                    <div class="w-44 lg:w-auto lg:flex-1">
                      <h6>Field Name</h6>
                    </div>
                    <div class="w-44 lg:w-auto lg:flex-1">
                      <h6>Match Value</h6>
                    </div>
                    <div class="w-44 lg:w-auto lg:flex-1">
                      <h6>Match Type</h6>
                    </div>
                    <div class="w-44 lg:w-auto lg:flex-1">
                      <h6>Output Value</h6>
                    </div>
                    <div class="w-8">
                      <!--  -->
                    </div>
                  </div>

                  <div
                    v-for="(method, methodIndex) in methods"
                    :key="method.index"
                  >
                    <div class="my-3 flex items-center space-x-3">
                      <div class="flex w-8 items-center">
                        <p class="text-md text-gray-700">
                          #{{ method.priority }}
                        </p>
                      </div>
                      <div class="w-44 lg:w-auto lg:flex-1">
                        <input
                          v-model="method.field_name"
                          type="text"
                          class="form-control w-full"
                        />
                      </div>
                      <div class="w-44 lg:w-auto lg:flex-1">
                        <select
                          v-model="method.match_value"
                          class="form-control w-full"
                        >
                          <option value="contains">Contains</option>
                          <option value="starts_with">Starts With</option>
                          <option value="ends_with">Ends With</option>
                          <option value="exact">Exact</option>
                        </select>
                      </div>
                      <div class="w-44 lg:w-auto lg:flex-1">
                        <input
                          v-model="method.match_type"
                          type="text"
                          class="form-control w-full"
                        />
                      </div>
                      <div class="w-44 lg:w-auto lg:flex-1">
                        <input
                          v-model="method.output_value"
                          type="text"
                          class="form-control w-full"
                        />
                      </div>
                      <div class="w-8">
                        <ButtonBase @click.native="remove(methodIndex)">
                          <img
                            class="h-4 w-4"
                            alt="Remove field"
                            src="/images/minus-button.png"
                          />
                        </ButtonBase>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <!-- END Scrollable content -->
            </div>
          </div>
        </div>

        <!-- Add -->
        <div class="flex justify-end">
          <ButtonBase class="button" @click.native="add">
            <p class="text-md text-primary m-0 font-medium">Add field</p>
            <img class="h-6 w-6" alt="Add field" src="/images/add-button.png" />
          </ButtonBase>
        </div>

        <!-- Fallback -->
        <div class="flex justify-end">
          <div class="w-full md:w-1/2">
            <h4 class="main-heading--normal">Fallback / Catchall Value</h4>
            <input
              v-model="fallback"
              type="text"
              class="form-control full-width"
            />
          </div>
        </div>

        <!-- Update -->
        <div class="flex justify-between">
          <div />
          <div>
            <UiLoading v-if="makingRequest" class="relative h-10" />
          </div>
          <div>
            <button
              class="button button-primary w-full md:w-auto"
              :disabled="makingRequest"
              @click="update"
            >
              Update
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MapEditor',
  props: {
    modelValue: {
      type: Object,
      required: true,
    },
    backText: {
      type: String,
      required: false,
      default: String,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    displayBackLink: {
      type: Boolean,
      required: false,
      default: false,
    },
    makingRequest: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  data() {
    return {
      methods: [],
      fallback: null,
    };
  },
  mounted() {
    this.fallback =
      this.modelValue.fallback !== undefined ? this.modelValue.fallback : null;
    if (this.modelValue.methods !== undefined) {
      Object.keys(this.modelValue.methods).forEach((key, index) => {
        const method = this.modelValue.methods[key];
        this.methods.push({
          priority: index + 1,
          field_name: method.input_key,
          match_value: method.match,
          match_type: key,
          output_value: method.output,
        });
      });
    } else {
      this.methods.push({
        priority: 1,
        field_name: '',
        match_value: 'contains',
        match_type: '',
        output_value: '',
      });
    }
  },
  methods: {
    goBack() {
      this.$emit('go-back');
    },
    add() {
      this.methods.push({
        priority: this.methods.length + 1,
        field_name: '',
        match_value: 'contains',
        match_type: '',
        output_value: '',
      });
    },
    remove(index) {
      this.methods.splice(index, 1);
    },
    update() {
      const data = {
        methods: {},
      };
      this.methods.forEach((method) => {
        data.methods[method.match_type] = {
          input_key: method.field_name,
          match: method.match_value,
          output: method.output_value,
        };
      });
      data.fallback = this.fallback;
      this.$emit('update:modelValue', data);
      this.$emit('update');
    },
  },
};
</script>
