import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { categoriesArray, Subcategory } from '../(tabs)/categories';

const CategoryPage: React.FC = () => {
  const { subcategoryid, categoryName } = useLocalSearchParams();
  const router = useRouter();
  const [subcategoryList, setSubcategoryList] = useState<Subcategory[]>([]);

  useEffect(() => {
    if (!subcategoryid) return;
    const category = categoriesArray.find(cat => cat.id === subcategoryid);
    if (category) setSubcategoryList(category.subcategories);
  }, [subcategoryid]);

  const handleSubcategoryPress = (subcategory: Subcategory) => {
    router.push({
      pathname: '/productsCategories/[subcategoryProducsId]',
      params: {
          subcategoryProducsId: subcategory.id,
        subcategoryName: subcategory.name,
        categoryId: subcategoryid,
        categoryName: categoryName
      }
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.grid}>
          {subcategoryList.map(subcategory => (
            <View key={subcategory.id} style={styles.gridItem}>
              <TouchableOpacity onPress={() => handleSubcategoryPress(subcategory)}>
                <LinearGradient
                  style={styles.gradientCard}
                  colors={['rgba(240,240,240,1)', 'rgba(220,220,220,1)']}
                  start={{ x: 0, y: 0 }}
                >
                  <Text style={styles.text}>
                    {subcategory.name}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    padding: 16,
    marginTop: 40,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridItem: {
    width: '50%',
    padding: 8,
  },
  gradientCard: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
  },
  text: {
    textAlign: 'center',
    fontWeight: '500',
    color: '#1f2937',
  },
});
export default CategoryPage;
