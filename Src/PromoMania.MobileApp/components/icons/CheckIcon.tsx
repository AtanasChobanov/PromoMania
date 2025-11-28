import { Text, View } from "react-native";
import { registerStyles } from "../pages/register/registerStyles";

export  const CheckIcon = ({ isValid }: { isValid: boolean }) => (
    <View style={[registerStyles.checkIcon, isValid && registerStyles.checkIconValid]}>
      {isValid && (
        <Text style={registerStyles.checkIconText}>✓</Text>
      )}
    </View>
  );
