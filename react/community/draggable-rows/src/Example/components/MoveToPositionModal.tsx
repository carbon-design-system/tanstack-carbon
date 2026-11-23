import { Modal, NumberInput } from '@carbon/react';

// `position` is 1-based and is NaN while the input is empty.
export const MoveToPositionModal = ({
  open,
  resourceName,
  total,
  position,
  isValid,
  onPositionChange,
  onClose,
  onSubmit,
}: {
  open: boolean;
  resourceName?: string;
  total: number;
  position: number;
  isValid: boolean;
  onPositionChange: (position: number) => void;
  onClose: () => void;
  onSubmit: () => void;
}) => (
  <Modal
    open={open}
    size="xs"
    modalHeading="Move to custom position"
    primaryButtonText="Move"
    secondaryButtonText="Cancel"
    primaryButtonDisabled={!isValid}
    onRequestClose={onClose}
    onRequestSubmit={onSubmit}>
    <NumberInput
      id="move-to-position"
      label={`Position of ${resourceName ?? 'row'}`}
      helperText={`Enter a position from 1 to ${total}.`}
      invalidText={`Enter a whole number from 1 to ${total}.`}
      min={1}
      max={total}
      step={1}
      value={position}
      invalid={!isValid}
      allowEmpty
      onChange={(_event, { value }) =>
        onPositionChange(value === '' ? NaN : Number(value))
      }
    />
  </Modal>
);
