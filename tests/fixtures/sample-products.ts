export const sampleProducts = [
  {
    name: 'Wireless Earbuds',
    data: {
      productTitle: 'Wireless Bluetooth Earbuds TWS',
      productDescription: 'High quality wireless earbuds with active noise cancellation, 30-hour battery life, IPX7 waterproof. Perfect for sports, commuting, and daily use. Compatible with iOS and Android devices.',
      category: 'Electronics'
    }
  },
  {
    name: 'Fitness Tracker',
    data: {
      productTitle: 'Smart Fitness Tracker Watch',
      productDescription: 'Advanced fitness tracker with heart rate monitor, sleep tracking, step counter, and calorie tracking. Water-resistant design with 7-day battery life. Includes multiple sport modes.',
      category: 'Sports & Outdoors'
    }
  },
  {
    name: 'Coffee Maker',
    data: {
      productTitle: 'Programmable Coffee Maker Machine',
      productDescription: '12-cup programmable coffee maker with auto-shutoff, brew strength control, and reusable filter. Keep your coffee hot for hours with the warming plate. Easy to clean and use.',
      category: 'Home & Kitchen'
    }
  },
  {
    name: 'Yoga Mat',
    data: {
      productTitle: 'Premium Yoga Mat Non-Slip',
      productDescription: 'Extra thick yoga mat with non-slip surface for stability. Eco-friendly TPE material, free from harmful chemicals. Includes carrying strap. Perfect for yoga, pilates, and floor exercises.',
      category: 'Sports & Outdoors'
    }
  },
  {
    name: 'LED Desk Lamp',
    data: {
      productTitle: 'LED Desk Lamp with USB Charging',
      productDescription: 'Adjustable LED desk lamp with 5 brightness levels and 3 color modes. Built-in USB charging port for devices. Touch control, memory function, and eye-caring technology.',
      category: 'Home & Office'
    }
  }
];

export const expectedKeywordCategories = {
  intent: 'Users actively looking for this solution',
  topic: 'Users discussing related niches'
};

export const testCredentials = {
  openaiApiKey: process.env.OPENAI_API_KEY || 'test-key',
  mongodbUri: process.env.TEST_MONGODB_URI || 'mongodb://localhost:27017/facebook-automation-test'
};
