import { Text, View } from "react-native";
import { indexStyles } from "./welcomeStyles";

export const FeatureItem = ({ text }: { text: string }) => (
  <View style={indexStyles.featureItem}>
    <View style={indexStyles.featureDot} />
    <Text style={indexStyles.featureText}>{text}</Text>
  </View>
);