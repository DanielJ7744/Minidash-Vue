import type { FlowStep } from '@/types/core/v1';

const nestFlowSteps = (
  steps: FlowStep[],
  id: FlowStep['id'] | null = null
): FlowStep[] =>
  steps
    .filter((step) => step['parent_id'] === id)
    .map((step) => ({ ...step, children: nestFlowSteps(steps, step.id) }));

export { nestFlowSteps };
