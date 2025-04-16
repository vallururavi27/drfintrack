/**
 * Transaction categories for the finance app
 */

export const expenseCategories = [
  {
    id: 'food',
    name: 'Food',
    icon: 'food',
    color: '#FF5733',
    subcategories: [
      'Groceries',
      'Restaurants',
      'Fast Food',
      'Coffee Shops',
      'Food Delivery'
    ]
  },
  {
    id: 'transportation',
    name: 'Transportation',
    icon: 'car',
    color: '#33FF57',
    subcategories: [
      'Fuel',
      'Public Transport',
      'Cab/Taxi',
      'Vehicle Maintenance',
      'Parking'
    ]
  },
  {
    id: 'housing',
    name: 'Housing',
    icon: 'home',
    color: '#3357FF',
    subcategories: [
      'Rent',
      'Mortgage',
      'Property Tax',
      'Home Maintenance',
      'Home Insurance'
    ]
  },
  {
    id: 'entertainment',
    name: 'Entertainment',
    icon: 'entertainment',
    color: '#F033FF',
    subcategories: [
      'Movies',
      'Concerts',
      'Streaming Services',
      'Games',
      'Hobbies'
    ]
  },
  {
    id: 'healthcare',
    name: 'Healthcare',
    icon: 'health',
    color: '#FF3333',
    subcategories: [
      'Doctor Visits',
      'Medicines',
      'Health Insurance',
      'Fitness',
      'Medical Tests'
    ]
  },
  {
    id: 'education',
    name: 'Education',
    icon: 'education',
    color: '#33FFF3',
    subcategories: [
      'Tuition',
      'Books',
      'Courses',
      'School Supplies',
      'Student Loans'
    ]
  },
  {
    id: 'shopping',
    name: 'Shopping',
    icon: 'shopping',
    color: '#FFC733',
    subcategories: [
      'Clothing',
      'Electronics',
      'Home Goods',
      'Personal Care',
      'Gifts'
    ]
  },
  {
    id: 'utilities',
    name: 'Utilities',
    icon: 'utilities',
    color: '#33FFBD',
    subcategories: [
      'Electricity',
      'Water',
      'Gas',
      'Internet',
      'Mobile Phone'
    ]
  },
  {
    id: 'travel',
    name: 'Travel',
    icon: 'travel',
    color: '#FF9933',
    subcategories: [
      'Flights',
      'Hotels',
      'Transportation',
      'Activities',
      'Travel Insurance'
    ]
  },
  {
    id: 'personal',
    name: 'Personal',
    icon: 'personal',
    color: '#9933FF',
    subcategories: [
      'Grooming',
      'Clothing',
      'Accessories',
      'Gym',
      'Spa & Wellness'
    ]
  },
  {
    id: 'other',
    name: 'Other',
    icon: 'other',
    color: '#808080',
    subcategories: [
      'Miscellaneous',
      'Uncategorized'
    ]
  }
];

export const incomeCategories = [
  {
    id: 'salary',
    name: 'Salary',
    icon: 'salary',
    color: '#33FF57',
    subcategories: [
      'Regular Salary',
      'Bonus',
      'Overtime',
      'Commission',
      'Allowances'
    ]
  },
  {
    id: 'investments',
    name: 'Investments',
    icon: 'investments',
    color: '#3357FF',
    subcategories: [
      'Dividends',
      'Interest',
      'Capital Gains',
      'Rental Income',
      'Stock Sales'
    ]
  },
  {
    id: 'gifts',
    name: 'Gifts',
    icon: 'gift',
    color: '#F033FF',
    subcategories: [
      'Cash Gifts',
      'Gift Cards',
      'Rewards'
    ]
  },
  {
    id: 'business',
    name: 'Business',
    icon: 'business',
    color: '#FF5733',
    subcategories: [
      'Business Income',
      'Freelance',
      'Consulting',
      'Side Hustle',
      'Sales'
    ]
  },
  {
    id: 'other_income',
    name: 'Other Income',
    icon: 'other',
    color: '#808080',
    subcategories: [
      'Refunds',
      'Tax Returns',
      'Miscellaneous',
      'Uncategorized'
    ]
  }
];

/**
 * Get all categories (both income and expense)
 * @returns {Array} Combined array of income and expense categories
 */
export const getAllCategories = () => {
  return [...incomeCategories, ...expenseCategories];
};

/**
 * Get categories by type
 * @param {string} type - 'income' or 'expense'
 * @returns {Array} Categories of the specified type
 */
export const getCategoriesByType = (type) => {
  return type === 'income' ? incomeCategories : expenseCategories;
};

/**
 * Find a category by its ID
 * @param {string} categoryId - The ID of the category to find
 * @returns {Object|null} The category object or null if not found
 */
export const findCategoryById = (categoryId) => {
  const allCategories = getAllCategories();
  return allCategories.find(category => category.id === categoryId) || null;
};

/**
 * Get a flat list of all category names
 * @returns {Array} Array of category names
 */
export const getCategoryNames = () => {
  const allCategories = getAllCategories();
  return ['All Categories', ...allCategories.map(category => category.name)];
};
