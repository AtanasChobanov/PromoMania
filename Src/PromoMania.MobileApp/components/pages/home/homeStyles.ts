import { getFontSize, hp, wp } from '@/components/utils/dimenstions';
import { StyleSheet } from "react-native";
import { moderateScale } from "react-native-size-matters";

export const styles = StyleSheet.create({
  //Layout & Containers
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  titleContainer: {
    alignItems: "center",
    paddingHorizontal: wp(4),
    marginBottom: hp(2),
  },
  sectionHeader: {
    alignItems: "center",
    paddingVertical: hp(2),
  },

  //Text Styles
  mainTitle: {
    fontWeight: "bold",
    textAlign: "center",
    color: "#1F2937",
    paddingVertical: hp(1),
  },
  subtitle: {
    fontWeight: "600",
    textAlign: "center",
    color: "#1F2937",
    paddingVertical: hp(1),
  },
  sectionTitle: {
    fontWeight: "600",
    color: "#1F2937",
  },
  categoryText: {
    fontWeight: "500",
    textAlign: "center",
    color: "#1F2937",
  },
  productName: {
    fontWeight: "500",
    textAlign: "left",
  },
  priceLabel: {
    color: "#1F2937",
  },
  price: {
    fontWeight: "bold",
    color: "#1F2937",
  },
  unitTextAccent: {
    fontSize: getFontSize(10),
    fontWeight: "600",
    textAlign: "center",
    color: "#1F2937",
  },
  errorText: {
    fontWeight: "bold",
    textAlign: "center",
    color: "red",
    marginBottom: hp(1),
  },
  errorDetails: {
    textAlign: "center",
    color: "gray",
  },

  // Categories
  categories: {
    height:moderateScale(47),
    borderRadius: 15,
    elevation: 5,
    alignItems: "center",
    justifyContent: "center",
    color: "#1F2937",
  },

  //Product Card
  imageContainer: {
    position: "relative",
    
  },
  productImage: {
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    borderColor:'black',
    borderWidth:20
  },
  heartOverlay: {
    position: "absolute",
    top: hp(1),
    right: wp(2),
    zIndex: 10,
  },
  products: {
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    paddingHorizontal: wp(3),
    paddingBottom: hp(1),
    elevation: 5,
      minHeight: moderateScale(145), 
   
    
  },
 productContent: {
  width: "100%",
  flex: 1,
  justifyContent: "space-between",  
},
  productNameContainer: {
    alignItems: "flex-start",
    justifyContent: "flex-start",
  },
  priceContainer: {
    alignItems: "flex-start",
  },
  priceCartContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  unitContainerAccent: {
    marginTop: moderateScale(4),
    alignSelf: "flex-start",
    paddingHorizontal: wp(2),
    paddingVertical: wp(0.5),
        height: moderateScale(22),
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(31, 41, 55, 0.2)",
    backgroundColor: "rgba(31, 41, 55, 0.1)",
  },
   unitPlaceholder: {
    marginTop: moderateScale(4),
    height: moderateScale(22),
  },

  //Buttons
  favoriteButton: {
    position: "absolute",
    top: 0,
    right: 0,
    padding: 6,
    borderRadius: 20,
    backgroundColor: "white",
    elevation: 10,
  },
  addToCartButton: {
    padding: wp(2),
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    elevation: 3,
  },
  addToCartButtonPressed: {
    backgroundColor: "rgba(76, 175, 80, 0.2)",
  },

  // Loading & Error States
  loadingContainer: {
    flex: 1,
    marginTop: hp(7),
    alignItems: "center",
    justifyContent: "center",
  },
  errorContainer: {
    flex: 1,
    paddingHorizontal: wp(4),
    alignItems: "center",
    justifyContent: "center",
  },
  backgroundRefresh: {
    position: "absolute",
    top: hp(2),
    right: wp(4),
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
  },
});
