import React, { createContext, useState, useEffect } from 'react';

export const CompareContext = createContext();

export const CompareProvider = ({ children }) => {
  const [compareItems, setCompareItems] = useState(() => {
    const savedCompare = localStorage.getItem('compareItems');
    return savedCompare ? JSON.parse(savedCompare) : [];
  });

  useEffect(() => {
    localStorage.setItem('compareItems', JSON.stringify(compareItems));
  }, [compareItems]);

  const addToCompare = (product) => {
    setCompareItems((prevItems) => {
      // Check if already in list
      if (prevItems.find((item) => item._id === product._id)) {
        return prevItems; // already exists
      }
      // Check category compatibility: compare items should be of the same category type to make sense
      if (prevItems.length > 0) {
        const firstCategory = prevItems[0].category?._id || prevItems[0].category;
        const currentCategory = product.category?._id || product.category;
        
        // Extract string values for comparison if it's object or string
        const firstCatId = typeof firstCategory === 'object' ? firstCategory?._id : firstCategory;
        const currentCatId = typeof currentCategory === 'object' ? currentCategory?._id : currentCategory;
        
        if (firstCatId !== currentCatId) {
          alert('Chỉ có thể so sánh các phụ tùng cùng loại/danh mục để đảm bảo tính chính xác!');
          return prevItems;
        }
      }
      // Limit to 4
      if (prevItems.length >= 4) {
        alert('Chỉ có thể so sánh tối đa 4 phụ tùng cùng lúc!');
        return prevItems;
      }
      return [...prevItems, product];
    });
  };

  const removeFromCompare = (productId) => {
    setCompareItems((prevItems) => prevItems.filter((item) => item._id !== productId));
  };

  const clearCompare = () => {
    setCompareItems([]);
    localStorage.removeItem('compareItems');
  };

  const isInCompare = (productId) => {
    return compareItems.some((item) => item._id === productId);
  };

  return (
    <CompareContext.Provider
      value={{
        compareItems,
        addToCompare,
        removeFromCompare,
        clearCompare,
        isInCompare,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
};
