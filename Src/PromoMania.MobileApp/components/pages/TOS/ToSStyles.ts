import { StyleSheet } from "react-native";
import { moderateScale } from "react-native-size-matters";

export const ToSStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    marginTop: moderateScale(25),
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'rgba(103, 218, 191, 1)',
    marginTop: 16,
    marginBottom: 6,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 10,
  },
  link: {
    textDecorationLine: 'underline',
  },
    backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
});