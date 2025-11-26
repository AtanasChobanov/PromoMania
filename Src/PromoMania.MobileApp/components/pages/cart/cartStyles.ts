import { StyleSheet } from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

export const cartStyles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  flatListContent: {
    paddingTop: moderateScale(20),
    paddingBottom: moderateScale(20),
    alignItems: 'center',
  },
  titleContainer: {
    alignItems: 'center',
    marginTop: moderateScale(40),
    marginBottom: moderateScale(10),
  },
  mainTitle: {
    fontWeight: 'bold',
    textAlign: 'center',
    paddingBottom: moderateScale(10),
  },
  itemCount: {
    fontSize: moderateScale(16),
    opacity: 0.7,
  },
  products: {
    width: scale(325),
    borderRadius: 15,
    marginBottom: 16,
    position: 'relative',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  productContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    height: "100%",
    borderRadius: 15,
    position: 'relative',
    overflow: 'hidden',
  },
  menuButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
  },
  menuDots: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  productImage: {
    backgroundColor: 'white',
    height: "100%",
    borderRadius: 15,
  },
  productDetails: {
    marginLeft: 16,
    marginRight: scale(30),
    flex: 1,
    justifyContent: "space-between",
    height: "100%",
    paddingVertical: 8,
  },
  brand: {
    fontSize: moderateScale(15),
    fontWeight: "600",
  },
  name: {
    fontSize: moderateScale(17),
    fontWeight: "500",
  },
  unit: {
    opacity: 0.7,
  },
  price: {
    fontSize: moderateScale(17),
    fontWeight: "bold",
  },
  discount: {
    fontSize: moderateScale(14),
    fontWeight: "600",
    position: 'absolute',
    zIndex: 500,
    transform: [{ rotateZ: '-0.785398rad' }],
    top: 15,
    left: -50,
    minWidth: 150,
    paddingHorizontal: 10,
    paddingVertical: 3,
    alignItems: 'center',
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: "center",
    marginTop: 8,
  },

  quantityText: {
    fontSize: moderateScale(16),
    marginHorizontal: 16,
    fontWeight: "600",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    maxHeight: verticalScale(500),
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    overflow: 'hidden',
  },
  blurContainer: {
    padding: 20,
    paddingTop: 10,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  optionsTitle: {
    fontSize: moderateScale(20),
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(185, 185, 185, 1)',
  },
  optionText: {
    fontSize: moderateScale(18),
    color: '#333',
    marginLeft: moderateScale(5),
    fontWeight: '500',
  },
  deleteText: {
    color: '#FF3B30',
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    paddingVertical: 15,
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 10,
    borderColor: 'gray',
    borderWidth: 1,
  },
  cancelText: {
    fontSize: moderateScale(20),
    color: '#333',
    textAlign: 'center',
    fontWeight: '600',
  },
  totalPriceContainer: {
    position: 'absolute',
    width: scale(325),
    alignSelf: 'center',
    padding: 20,
    borderRadius: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 10,
  },
  totalPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalPriceLabel: {
    fontSize: moderateScale(18),
    fontWeight: 'bold',
  },
  totalPriceValue: {
    fontSize: moderateScale(18),
    fontWeight: '600',
  },
  continueButtonContainer: {
    height: 50,
    borderRadius: 10,
    margin: 20,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 10,
  },
  continueButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  continueButtonText: {
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  emptyText: {
    fontSize: moderateScale(20),
    fontWeight: '600',
    marginBottom: moderateScale(20),
  },
  shopButton: {
    paddingHorizontal: moderateScale(30),
    paddingVertical: moderateScale(15),
    borderRadius: 12,
    elevation: 10,

  },
  shopButtonText: {
    color: 'white',
    fontSize: moderateScale(18),
    fontWeight: 'bold',
  },
  errorText: {
    fontSize: moderateScale(18),
    fontWeight: '600',
    marginBottom: moderateScale(20),
  },
  retryButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: moderateScale(30),
    paddingVertical: moderateScale(15),
    borderRadius: 12,
  },
  retryButtonText: {
    color: 'white',
    fontSize: moderateScale(18),
    fontWeight: 'bold',
  },
  blurButton: {
    borderRadius: 9999,
    width: moderateScale(30),
    height: moderateScale(30),
    overflow: "hidden",
  },
  buttonTouchable: {
 
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: moderateScale(18),
    fontWeight: "bold",
  },
  pricesConclusion: {
    flexDirection: 'row',
    gap: moderateScale(10),
  },
  expandedContent: {
    overflow: 'hidden',
  },
  expandedInner: {
    paddingTop: moderateScale(12),
  },
  divider: {
    height: 1,
    backgroundColor: 'gray',
    marginBottom: moderateScale(12),
  },
  bestOfferText: {
    fontSize: moderateScale(15),
    marginBottom: moderateScale(8),
    opacity: 0.8,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: moderateScale(6),
  },
  priceLabel: {
    fontSize: moderateScale(18),
  },
  priceValue: {
    fontSize: moderateScale(18),
    fontWeight: '600',
  },
  savingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: moderateScale(8),
    paddingTop: moderateScale(8),
    borderTopWidth: 1,
    borderTopColor: 'rgba(220, 38, 38, 0.3)',
  },
  savingsLabel: {
    fontSize: moderateScale(18),
    fontWeight: '600',
  },
  savingsValue: {
    fontSize: moderateScale(18),
    fontWeight: 'bold',
  },

});