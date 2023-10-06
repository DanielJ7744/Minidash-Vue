<script lang="ts">
import { v4 as uuid } from 'uuid';
import LeaderLine from 'leader-line-new';

export default {
  props: {
    id: {
      type: String,
      required: false,
      default: () => uuid(),
    },
    startElementSelector: {
      type: String,
      required: false,
      default: undefined,
    },
    endElementSelector: {
      type: String,
      required: false,
      default: undefined,
    },
  },
  setup(props) {
    const { width, height } = useWindowSize();

    const line = ref<LeaderLine>();
    const element = ref<HTMLElement | null>();

    const remove = () => {
      try {
        if (element.value) {
          document?.querySelector('body')!.appendChild(element.value);
        }

        line.value?.remove();
      } catch (e) {
        console.log(e);
      } finally {
        element.value?.remove();
        line.value = undefined;
      }
    };

    const draw = () => {
      remove();

      if (!props.startElementSelector || !props.endElementSelector) {
        return;
      }

      const startSocket = document?.querySelector(props.startElementSelector);
      const endSocket = document?.querySelector(props.endElementSelector);

      if (!startSocket || !endSocket) {
        return;
      }

      line.value = new LeaderLine(startSocket, endSocket, {
        color: 'darkgray',
        path: 'grid',
        startSocketGravity: 1,
        endSocketGravity: 1,
        startSocket: 'bottom',
        endSocket: 'top',
        dash: { animation: true, gap: 4, len: 2 },
        size: 2,
        startPlug: 'behind',
        endPlug: 'behind',
      });

      if (!line.value) {
        return;
      }

      const target = document?.getElementById('flow-canvas');
      element.value = document?.querySelector(
        'body > .leader-line:last-child'
      ) as HTMLElement;

      const newValues = document
        ?.getElementById('flow-canvas')!
        .getBoundingClientRect();

      const elementBounding = useElementBounding(element.value);

      element.value.id = props.id!;

      element.value.style.top = [
        elementBounding.top.value - newValues.y,
        'px',
      ].join('');

      element.value.style.left = [
        elementBounding.left.value - newValues.x,
        'px',
      ].join('');

      target?.appendChild(element.value);
    };

    watch(
      () => [width.value, height.value],
      () => {
        console.log('resize');
        draw();
      }
    );

    onMounted(() => nextTick(() => draw()));
    onUpdated(() => nextTick(() => draw()));
    onBeforeUnmount(() => remove());

    return () => undefined;
  },
};
</script>
