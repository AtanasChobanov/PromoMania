import { hp, wp } from "@/components/utils/dimenstions";
import { StyleSheet } from "react-native";
import { moderateScale } from "react-native-size-matters";

export const optionRegisterStyles  = StyleSheet.create({
  container: {
    flex: 1,
  },
  buttonText: {
    color: '#ffffff',

   
    fontSize: 16,
    fontWeight: '600',
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
  button: {
    backgroundColor: 'rgba(103, 218, 191, 1)',
    paddingVertical: 16,
     borderWidth:1,
    borderColor:'#FFF',
    marginTop: hp(3),
    borderRadius: 12,
    marginHorizontal: wp(5),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
});