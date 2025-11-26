import { getFontSize, hp } from "@/components/utils/dimenstions";
import { StyleSheet } from "react-native";

export const categoriesStyles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  titleContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingTop: 75,
  },
  title: {
    fontSize: getFontSize(32),
    fontWeight: 'bold',
    textAlign: 'center',
    paddingTop: 12,
    paddingBottom: 2,
  },
  flatListContainer: {
    paddingHorizontal: 2,
    paddingBottom: hp(14),
  },
  row: {
    flexWrap: 'wrap',
  },
  itemContainer: {
    margin: 8,
  },
  categories: {
    padding: 15,
    alignItems: 'center',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    borderColor:'white',
    borderWidth:1,
  },
  categoryText: {
    fontSize: getFontSize(16),
    fontWeight: '600',
  },
  button: {
    alignItems: 'center',
  },
});