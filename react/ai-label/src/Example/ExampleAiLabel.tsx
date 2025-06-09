import {
  AILabel,
  AILabelActions,
  AILabelContent,
  Button,
  IconButton,
  AILabelProps,
} from '@carbon/react';
import { FolderOpen, Folders, View } from '@carbon/react/icons';
import cx from 'classnames';

interface CustomAILabelProps extends AILabelProps {
  isRowAILabel?: boolean;
}
export const ExampleAiLabel = ({
  className,
  isRowAILabel = false,
  size = 'mini',
}: CustomAILabelProps): JSX.Element => (
  <AILabel
    className={cx(className, { ['ai-label-container']: !isRowAILabel })}
    autoAlign
    align="bottom-right"
    size={size}>
    <AILabelContent>
      <div>
        <p className="secondary">AI Explained</p>
        <h1>84%</h1>
        <p className="secondary bold">Confidence score</p>
        <p className="secondary">
          Lorem ipsum dolor sit amet, di os consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut fsil labore et dolore magna aliqua.
        </p>
        <hr />
        <p className="secondary">Model type</p>
        <p className="bold">Foundation model</p>
      </div>
      <AILabelActions>
        <IconButton kind="ghost" label="View">
          <View />
        </IconButton>
        <IconButton kind="ghost" label="Open Folder">
          <FolderOpen />
        </IconButton>
        <IconButton kind="ghost" label="Folders">
          <Folders />
        </IconButton>
        <Button>View details</Button>
      </AILabelActions>
    </AILabelContent>
  </AILabel>
);
