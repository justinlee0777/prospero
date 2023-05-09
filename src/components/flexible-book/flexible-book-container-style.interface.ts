import ContainerStyle from '../../container-style.interface';
import Optional from '../../utils/optional.type';

type FlexibleBookContainerStyle = Optional<
  Omit<ContainerStyle, 'width' | 'height'>,
  'border' | 'margin' | 'padding'
>;

export default FlexibleBookContainerStyle;
