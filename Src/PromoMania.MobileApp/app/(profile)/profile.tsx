import { ProductBox } from '@/components/boxes/ProductBox';
import { BlurView } from 'expo-blur';
import React from 'react';
import { FlatList, Image, ImageBackground, ListRenderItem, StyleSheet, Text, TextInput, View } from 'react-native';

interface Product {
  id: number;
  name: string;
  chain: string;
  priceBgn: number;
  priceEur: number;
  unit: string;
  imageUrl: string;
}

const products: Product[] = [
  {
    id: 1,
    name: "Банани",
    chain: "Kaufland",
    priceBgn: 2.39,
    priceEur: 1.22,
    unit: "кг",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/8/8a/Banana-Single.jpg",
  },
  {
    id: 2,
    name: "Домати",
    chain: "Billa",
    priceBgn: 3.49,
    priceEur: 1.78,
    unit: "кг",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/8/89/Tomato_je.jpg",
  },
  {
    id: 3,
    name: "Кисело мляко 3.6%",
    chain: "Lidl",
    priceBgn: 1.29,
    priceEur: 0.66,
    unit: "400 г",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/3/3a/Yogurt.jpg",
  },
  {
    id: 4,
    name: "Хляб типов",
    chain: "Fantastico",
    priceBgn: 2.10,
    priceEur: 1.07,
    unit: "700 г",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/6/6f/Whole_wheat_bread.jpg",
  },
  {
    id: 5,
    name: "Яйца (10 бр.)",
    chain: "T-Market",
    priceBgn: 4.59,
    priceEur: 2.35,
    unit: "10 бр.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Eggs_in_carton.jpg",
  },
];

// Define gradient colors array
const gradientColorsArray: string[][] = [
  ['#FF6B6B', '#FF8E53'],
  ['#4ECDC4', '#44A08D'],
  ['#A8E6CF', '#56CCF2'],
  ['#F093FB', '#F5576C'],
  ['#FFC371', '#FF5F6D'],
];

const Profile: React.FC = () => {
  const renderProductItem: ListRenderItem<Product> = ({ item, index }) => {
    const gradientColors = gradientColorsArray[index % gradientColorsArray.length];
    
    return (
      <ProductBox
  productName={item.name}
  brand={item.chain}
  priceBgn={item.priceBgn.toFixed(2)} // converts to string with 2 decimals
  priceEur={item.priceEur.toFixed(2)}
  unit={item.unit}
  photo={item.imageUrl}
  colors={gradientColors as [string, string, ...string[]]}
  index={index}
   
/>
    );
  };

  return (
    <ImageBackground
      source={require("../../assets/images/background2.webp")}
      style={styles.backgroundImage}>
      <View style={styles.container}>
        {/* Header Section */}
        <View className='items-center'>
          <View>
            <Image 
              className='w-[65px] h-[65px]' 
              source={require("../../assets/icons/profile-pic.png")} 
            />
          </View>
          <View>
            <Text className='font-bold text-3xl py-5'>Калоян Николов</Text>
          </View>
        </View>

        {/* Search Bar */}
        <View className='flex-row justify-between mx-3 items-center gap-2 mb-4'>
          <BlurView
            intensity={50}
            tint="light"
            experimentalBlurMethod="dimezisBlurView"
            className="items-center flex-row justify-start px-3 bg-gray-200 rounded-[10px] overflow-hidden border border-white">
            <Image 
              className='w-5 h-5 mr-2' 
              source={require('../../assets/icons/search.png')} 
            />
            <TextInput
              placeholder="Какво Търсиш"
              placeholderTextColor="#000000"
              className='w-3/4'
            />
          </BlurView>
          <Text className='underline'>Откажи</Text>
        </View>

        {/* FlatList for Products */}
     <FlatList
  data={products}
  renderItem={({ item, index }) => (
    <View style={{ flex: 1, marginHorizontal: 5, marginBottom: 10 }}>
      <ProductBox
        productName={item.name}
        brand={item.chain}
        priceBgn={item.priceBgn.toFixed(2)}
        priceEur={item.priceEur.toFixed(2)}
        unit={item.unit}
        photo={item.imageUrl}
        colors={gradientColorsArray[index % gradientColorsArray.length] as [string, string, ...string[]]}
        index={index}
      />
    </View>
  )}
  keyExtractor={(item) => item.id.toString()}
  numColumns={2} // <- 2 items per row
  columnWrapperStyle={{ justifyContent: 'space-between' }} // optional spacing between columns

  showsVerticalScrollIndicator={false}
  showsHorizontalScrollIndicator={false}
  removeClippedSubviews={true}
  maxToRenderPerBatch={3}
  windowSize={5}
  initialNumToRender={3}
/>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    marginTop: 70,
  },
  listContent: {
    paddingHorizontal: 2,
    paddingBottom: 20,
  },
  categories: {
    padding: 15,
    alignItems: 'center',
    borderRadius: 20,
  },
  button: {
    alignItems: 'center',
  },
  products: {
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
});

export default Profile;