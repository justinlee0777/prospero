import ContainerStyle from '../../container-style.interface';
import FlexibleBookContainerStyle from './flexible-book-container-style.interface';

export default function normalizeContainerStyle(
  containerStyle: FlexibleBookContainerStyle
): Omit<ContainerStyle, 'width' | 'height'> {
  const defaultContainerStyle: Pick<
    ContainerStyle,
    'border' | 'margin' | 'padding'
  > = {
    border: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    },
    margin: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    },
    padding: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    },
  };

  return {
    ...defaultContainerStyle,
    ...containerStyle,
  };
}
