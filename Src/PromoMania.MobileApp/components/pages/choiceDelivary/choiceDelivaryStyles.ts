import { StyleSheet } from "react-native";
import { moderateScale } from "react-native-size-matters";

export const choiceDelivaryStyles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    paddingHorizontal: moderateScale(10),
  },
  titleContainer: {
    alignItems: 'center',
    marginTop: moderateScale(70),
    marginBottom: moderateScale(50),
  },
  mainTitle: {
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 0.3,
    marginBottom: moderateScale(12),
  },
  subtitle: {
    textAlign: 'center',
    fontWeight: '400',
    letterSpacing: 0.2,
  },
  optionsWrapper: {
    gap: moderateScale(20),
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: moderateScale(20),
    paddingHorizontal: moderateScale(20),
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
    minHeight: moderateScale(100),
  },
  iconContainer: {
    width: moderateScale(70),
    height: moderateScale(70),
    borderRadius: 16,
    borderWidth:1,
    borderColor:'gray',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: moderateScale(16),
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  optionTitle: {
    fontWeight: '700',
    marginBottom: moderateScale(4),
    letterSpacing: 0.2,
  },
  optionDescription: {
    fontWeight: '400',
    lineHeight: moderateScale(18),
  },
  arrowContainer: {
    marginLeft: moderateScale(8),
  },
  arrow: {
    fontSize: moderateScale(32),
    fontWeight: '300',
  },
});