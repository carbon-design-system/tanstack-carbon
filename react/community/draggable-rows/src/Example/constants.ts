import { durationModerate01, motion } from '@carbon/motion';

export const TOTAL_ITEMS = 25;
export const PAGE_SIZE = 10;

// Carbon motion tokens; dnd-kit expects the duration in milliseconds.
export const MOTION_DURATION = parseInt(durationModerate01, 10);
export const MOTION_EASING = motion('standard', 'productive');
