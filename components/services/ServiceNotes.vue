<template>
  <div class="py-5 lg:space-y-0 lg:space-x-3">
    <div class="mb-3 lg:w-1/3">
      <h6 class="">Service notes</h6>
    </div>
    <div v-for="note in notes" :key="note.id">
      <UiCard v-if="notes.length > 0" class="mb-2 flex-1 px-6 py-0" wide>
        <div class="flex justify-between space-x-3 py-4">
          <div class="w-full">
            <label>
              {{ getNoteLabel(note) }}
            </label>
            <input
              v-model="note.note"
              class="w-full"
              type="text"
              :disabled="true"
              maxlength="500"
            />
          </div>

          <button
            v-if="$patchworks()"
            type="button"
            class="button button-danger w-1/12"
            :disabled="submitting"
            @click="deleteNote(note.id)"
          >
            Delete
          </button>
        </div>
      </UiCard>
    </div>
    <UiCard class="py-4">
      <input
        v-model="newNote.note"
        class="w-full"
        type="text"
        maxlength="500"
        placeholder="Add a new note"
        @keyup.enter="addNewNote(newNote)"
      />
      <div>
        <div
          v-if="$patchworks()"
          class="flex w-full items-center justify-between gap-2 py-4 sm:w-auto"
        >
          <div class="flex space-x-3">
            <h6 class="m-0 text-sm">Public note</h6>
            <FormToggle v-model="newNote.public" />
          </div>
        </div>
        <div
          class="flex w-full items-center justify-between gap-2 py-4 sm:w-auto"
        >
          <button
            type="button"
            class="button button-primary w-2/12"
            :disabled="submitting"
            @click="addNewNote(newNote)"
          >
            Add Note
          </button>
        </div>
      </div>
    </UiCard>
  </div>
</template>

<script>
export default {
  name: 'ServiceNotes',
  props: {
    initialNotes: {
      type: Array,
      default: () => [],
    },
    serviceId: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      newNote: {
        public: true,
        note: '',
      },
      notes: this.initialNotes,
      submitting: false,
    };
  },
  methods: {
    resetNewNote() {
      this.newNote = {
        public: true,
        note: '',
      };
    },
    async deleteNote(noteId) {
      try {
        this.submitting = true;
        await this.$axios.$delete(
          `/api/api/v2/admin/services/${this.serviceId}/service-notes/${noteId}`
        );
        this.$notify(
          {
            group: 'notifications',
            type: 'success',
            text: 'Note deleted successfully',
          },
          4000
        );
        this.notes = this.notes.filter((note) => note.id !== noteId);
      } catch (error) {
        this.$notify(
          {
            group: 'notifications',
            type: 'error',
            text: 'An error occurred while deleting the note.',
          },
          4000
        );
      }
      this.submitting = false;
    },
    async addNewNote(note) {
      try {
        this.submitting = true;
        if (!this.$patchworks()) {
          delete note.public;
        }
        const newNote = await this.$axios
          .$post(`/api/api/v2/services/${this.serviceId}/service-notes`, note)
          .then((r) => r.data);
        this.$notify(
          {
            group: 'notifications',
            type: 'success',
            text: 'Service note added successfully',
          },
          4000
        );
        this.notes.push(newNote);
        this.resetNewNote();
      } catch (error) {
        this.$notify(
          {
            group: 'notifications',
            type: 'error',
            text: 'An error occurred while adding the note.',
          },
          4000
        );
      }
      this.submitting = false;
    },
    getNoteLabel(note) {
      return `Author: ${note.author}, Visibility: ${
        note.public ? 'Public' : 'Private'
      }, Created at: ${note.created_at}`;
    },
  },
};
</script>
