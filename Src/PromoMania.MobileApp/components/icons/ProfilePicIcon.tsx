import Svg, { Circle, Path } from "react-native-svg";

export const ProfilePicIcon = ({ color = '#000', size = 40 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="8" r="4" fill={color} />
        <Path
      d="M 4 20 Q 4 14 12 14 Q 20 14 20 20"
      fill={color}
    />
  </Svg>
);