import { getFontSize, hp } from "@/components/utils/dimenstions";
import { StyleSheet } from "react-native";
import { scale } from "react-native-size-matters";

export const productLayoutStyles = StyleSheet.create({
  topbar: {
    position: 'absolute',
    top: 0,
    width: '100%',
    height: 100,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1000,
    paddingTop: hp(2.2),
  },
  backButton: {
    width: 40,
    height: 40,
        top:scale(6),
    
    borderColor:'white',
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: getFontSize(18),
    fontWeight: 'bold',
    marginRight: 40, // keep space for back button
  },
    tabBarBlur: {
    ...StyleSheet.absoluteFillObject,
  },
});
