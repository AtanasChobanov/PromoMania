import { router } from "expo-router";
import { TouchableOpacity, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { registerStyles } from "../pages/register/registerStyles";

  export const BackButton = () => (
     <TouchableOpacity
               onPress={() => router.back()}
               style={registerStyles.backButton}>
              <View 
                style={[registerStyles.tabBarBlur,{backgroundColor:'rgba(46,170,134,1)'}]} />
               <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                 <Path
                   d="M15 18l-6-6 6-6"
                   stroke={'white'}
                   strokeWidth={2}
                   strokeLinecap="round"
                   strokeLinejoin="round"
                 />
               </Svg>
             </TouchableOpacity>
  );
