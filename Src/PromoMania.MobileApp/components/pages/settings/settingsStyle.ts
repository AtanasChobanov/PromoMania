import { hp, wp } from "@/components/utils/dimenstions";
import { StyleSheet } from "react-native";
import { moderateScale } from "react-native-size-matters";

export const settingStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    fontWeight: 'bold',
    marginHorizontal: wp(5),
    marginBottom: hp(2),
    marginTop: hp(1),
  },
  section: {
    marginTop: hp(2),
  },
  sectionTitle: {
    fontWeight: '600',
    marginHorizontal: wp(5),
    marginBottom: hp(1),
    letterSpacing: 0.5,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: wp(5),
    marginBottom: hp(1.5),
    padding: wp(4),
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  settingText: {
    flex: 1,
    marginRight: wp(3),
  },
  settingTitle: {
    fontWeight: '600',
    marginBottom: hp(0.5),
  },
  settingDescription: {
    lineHeight: 20,
  },
   backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
    arrowContainer: {
      marginLeft: moderateScale(8),
    },
    arrow: {
      fontSize: moderateScale(36),
      fontWeight: '200',
    },
   logoutButton: {
  backgroundColor: '#dc3545',
  paddingVertical: hp(1.8),
   borderWidth:1,
    borderColor:'#FFF',
  paddingHorizontal: wp(8),
  borderRadius: 12,
  alignItems: 'center',
  justifyContent: 'center',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.2,
  shadowRadius: 4,
  elevation: 3,
},
logoutText: {
  color: '#fff',
  fontWeight: '600',
},
});