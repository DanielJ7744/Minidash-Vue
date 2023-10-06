import PrimeVue from 'primevue/config';

import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Carousel from 'primevue/carousel';
import Calendar from 'primevue/calendar';
import Dialog from 'primevue/dialog';
import TreeSelect from 'primevue/treeselect';
import Tree from 'primevue/tree';
import MultiSelect from 'primevue/multiselect';
import PanelMenu from 'primevue/panelmenu';
import DataView from 'primevue/dataview';
import Rating from 'primevue/rating';
import Sidebar from 'primevue/sidebar';
import Chips from 'primevue/chips';
import Accordion from 'primevue/accordion';
import AccordionTab from 'primevue/accordiontab';

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp
    .use(PrimeVue)
    .component('Tree', Tree)
    .component('Column', Column)
    .component('Dialog', Dialog)
    .component('Sidebar', Sidebar)
    .component('Carousel', Carousel)
    .component('Calendar', Calendar)
    .component('DataTable', DataTable)
    .component('TreeSelect', TreeSelect)
    .component('MultiSelect', MultiSelect)
    .component('PanelMenu', PanelMenu)
    .component('DataView', DataView)
    .component('Rating', Rating)
    .component('Accordion', Accordion)
    .component('AccordionTab', AccordionTab)
    .component('Chips', Chips);
});
