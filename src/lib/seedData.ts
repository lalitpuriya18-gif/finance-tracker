import { FinanceData } from '../types/finance';

export function getSeedData(): FinanceData {
  return {
    settings: {
      currency: 'INR',
      theme: 'light',
      monthStartDay: 1,
      userName: 'Arjun Mehta',
      userEmail: 'arjun@fintrack.io',
    },

    accounts: [
      {
        id: 'acc-icici-sal',
        name: 'ICICI Salary A/c',
        type: 'bank',
        openingBalance: 24500000, // ₹2,45,000.00
        accountNumber: '..9902',
        color: '#047857',
      },
      {
        id: 'acc-icici-deb',
        name: 'ICICI Debit ..8921',
        type: 'bank',
        openingBalance: 11245000, // ₹1,12,450.00
        accountNumber: '..8921',
        color: '#065f46',
      },
      {
        id: 'acc-hdfc-card',
        name: 'HDFC Card ..4092',
        type: 'card',
        openingBalance: -4520000, // -₹45,200.00
        accountNumber: '..4092',
        color: '#6366f1',
      },
      {
        id: 'acc-axis-bank',
        name: 'Axis Bank ..5510',
        type: 'bank',
        openingBalance: 12500000, // ₹1,25,000.00
        accountNumber: '..5510',
        color: '#8b5cf6',
      },
      {
        id: 'acc-paytm-upi',
        name: 'Paytm UPI ..4410',
        type: 'wallet',
        openingBalance: 4520000, // ₹45,200.00
        accountNumber: '..4410',
        color: '#0284c7',
      },
      {
        id: 'acc-autopay',
        name: 'UPI AutoPay (Paytm)',
        type: 'wallet',
        openingBalance: 0,
        accountNumber: 'Paytm Mandate',
        color: '#0ea5e9',
      },
    ],

    categories: [
      { id: 'cat-income', name: 'Income', icon: 'Briefcase', color: '#10b981', type: 'income' },
      { id: 'cat-food', name: 'Food & Dining', icon: 'Utensils', color: '#10b981', type: 'expense' },
      { id: 'cat-shopping', name: 'Shopping & Lifestyle', icon: 'ShoppingBag', color: '#f43f5e', type: 'expense' },
      { id: 'cat-transport', name: 'Transport & Commute', icon: 'Car', color: '#06b6d4', type: 'expense' },
      { id: 'cat-bills', name: 'Bills & Utilities', icon: 'Zap', color: '#3b82f6', type: 'expense' },
      { id: 'cat-rent', name: 'Rent & Living', icon: 'Home', color: '#1e293b', type: 'expense' },
      { id: 'cat-entertainment', name: 'Entertainment', icon: 'Tv', color: '#8b5cf6', type: 'expense' },
      { id: 'cat-health', name: 'Health & Wellness', icon: 'HeartPulse', color: '#14b8a6', type: 'expense' },
      { id: 'cat-investment', name: 'Investment', icon: 'TrendingUp', color: '#6366f1', type: 'expense' },
    ],

    budgets: [
      {
        id: 'b-food',
        categoryId: 'cat-food',
        monthlyLimit: 3000000, // ₹30,000.00
        statusLabel: 'On Track',
        subtitle: '14 logged transactions',
        dailyAllowance: 135600, // ₹1,356/day
      },
      {
        id: 'b-transport',
        categoryId: 'cat-transport',
        monthlyLimit: 1500000, // ₹15,000.00
        statusLabel: 'On Track',
        subtitle: 'Fuel, Metro & Cabs',
        dailyAllowance: 113300, // ₹1,133/day
      },
      {
        id: 'b-shopping',
        categoryId: 'cat-shopping',
        monthlyLimit: 1500000, // ₹15,000.00
        statusLabel: 'Near Limit',
        subtitle: 'Apparel & Gadgets',
      },
      {
        id: 'b-bills',
        categoryId: 'cat-bills',
        monthlyLimit: 800000, // ₹8,000.00
        statusLabel: 'On Track',
        subtitle: 'Electricity, WiFi, Water',
      },
      {
        id: 'b-entertainment',
        categoryId: 'cat-entertainment',
        monthlyLimit: 500000, // ₹5,000.00
        statusLabel: 'Caution',
        subtitle: 'Cinema, OTT & Events',
      },
      {
        id: 'b-health',
        categoryId: 'cat-health',
        monthlyLimit: 1200000, // ₹12,000.00
        statusLabel: 'Well Managed',
        subtitle: 'Pharmacy & Routine Care',
        dailyAllowance: 149000, // ₹1,490/day
      },
    ],

    goals: [
      {
        id: 'g-emergency',
        name: 'Emergency Fund',
        subtitle: '6 Months Living Expenses',
        targetAmount: 30000000, // ₹3,00,000.00
        savedAmount: 24000000, // ₹2,40,000.00
        targetDate: 'Dec 2023',
        priority: 'HIGH',
        color: '#047857',
        fundingMethod: '₹30,000/mo via ICICI AutoPay',
      },
      {
        id: 'g-macbook',
        name: 'MacBook Pro M3',
        subtitle: 'Workstation Upgrade',
        targetAmount: 18000000, // ₹1,80,000.00
        savedAmount: 12500000, // ₹1,25,000.00
        targetDate: 'Jan 2024',
        priority: 'MEDIUM',
        color: '#64748b',
        fundingMethod: 'Recommended SIP: ₹18,350/mo',
      },
      {
        id: 'g-japan',
        name: 'Japan Autumn Trip',
        subtitle: 'Kyoto & Tokyo Itinerary',
        targetAmount: 25000000, // ₹2,50,000.00
        savedAmount: 11000000, // ₹1,10,000.00
        targetDate: 'Sep 2024',
        priority: 'HIGH',
        color: '#0284c7',
        paceStatusText: 'On Pace (+₹12,700/mo)',
      },
      {
        id: 'g-car',
        name: 'Car Insurance & Svc',
        subtitle: 'Annual Vehicle Maintenance',
        targetAmount: 4500000, // ₹45,000.00
        savedAmount: 3800000, // ₹38,000.00
        targetDate: 'Nov 2023',
        priority: 'RECURRING',
        color: '#8b5cf6',
      },
      {
        id: 'g-home',
        name: 'Home Renovation',
        subtitle: 'Living Room & Balcony',
        targetAmount: 50000000, // ₹5,00,000.00
        savedAmount: 15000000, // ₹1,50,000.00
        targetDate: 'Dec 2024',
        priority: 'LONG TERM',
        color: '#10b981',
      },
    ],

    mandates: [
      {
        id: 'm-1',
        goalName: 'Emergency Fund',
        mandateType: 'Standing Instruction (e-NACH)',
        cycleDate: '01st of month',
        monthlyAllocation: 3000000, // ₹30,000
        estCompletion: 'Dec 2023',
        status: 'Active',
      },
      {
        id: 'm-2',
        goalName: 'MacBook Pro M3',
        mandateType: 'Manual Sweep Transfer',
        cycleDate: '10th of month',
        monthlyAllocation: 500000, // ₹5,000
        estCompletion: 'Jan 2024',
        status: 'Manual',
      },
      {
        id: 'm-3',
        goalName: 'Car Insurance & Svc',
        mandateType: 'Micro-Deposit Roundups',
        cycleDate: 'Daily Trigger',
        monthlyAllocation: 240000, // ~₹2,400
        estCompletion: 'Nov 2023',
        status: 'Active',
      },
    ],

    recurringRules: [
      {
        id: 'rec-salary',
        name: 'Tech Mahindra Salary',
        amount: 14500000, // ₹1,45,000
        type: 'income',
        categoryId: 'cat-income',
        accountId: 'acc-icici-sal',
        frequency: 'monthly',
        nextDate: '2023-11-23',
      },
      {
        id: 'rec-rent',
        name: 'Apartment Rent',
        amount: 1913000, // ₹19,130
        type: 'expense',
        categoryId: 'cat-rent',
        accountId: 'acc-icici-deb',
        frequency: 'monthly',
        nextDate: '2023-11-01',
      },
      {
        id: 'rec-cultfit',
        name: 'Cult.fit Pass Annual',
        amount: 1499000, // ₹14,990
        type: 'expense',
        categoryId: 'cat-health',
        accountId: 'acc-hdfc-card',
        frequency: 'yearly',
        nextDate: '2023-11-12',
      },
      {
        id: 'rec-netflix',
        name: 'Netflix Premium Monthly',
        amount: 64900, // ₹649
        type: 'expense',
        categoryId: 'cat-entertainment',
        accountId: 'acc-hdfc-card',
        frequency: 'monthly',
        nextDate: '2023-11-24',
      },
    ],

    transactions: [
      {
        id: 'tx-01',
        type: 'expense',
        amount: 89000, // ₹890.00
        categoryId: 'cat-food',
        accountId: 'acc-icici-deb',
        date: '2023-10-24',
        time: '08:14 PM',
        note: 'Zepto Quick Groceries',
        descriptionDetail: 'Evening dairy, veggies & essentials',
        merchant: 'Zepto',
        tags: ['groceries', 'quick-commerce'],
        status: 'Completed',
      },
      {
        id: 'tx-02',
        type: 'expense',
        amount: 64900, // ₹649.00
        categoryId: 'cat-entertainment',
        accountId: 'acc-hdfc-card',
        date: '2023-10-24',
        time: '05:20 AM',
        note: 'Netflix Premium Monthly',
        descriptionDetail: '4K UHD Recurring plan renewal',
        merchant: 'Netflix',
        tags: ['ott', 'subscription'],
        status: 'Completed',
      },
      {
        id: 'tx-03',
        type: 'income',
        amount: 14500000, // ₹1,45,000.00
        categoryId: 'cat-income',
        accountId: 'acc-icici-sal',
        date: '2023-10-23',
        time: '11:00 AM',
        note: 'Monthly Salary (Tech Mahindra)',
        descriptionDetail: 'Payroll Credit Ref: CMS/399021/OCT',
        merchant: 'Tech Mahindra Ltd',
        tags: ['salary', 'direct-deposit'],
        status: 'Completed',
      },
      {
        id: 'tx-04',
        type: 'expense',
        amount: 250000, // ₹2,500.00
        categoryId: 'cat-transport',
        accountId: 'acc-hdfc-card',
        date: '2023-10-22',
        time: '03:45 PM',
        note: 'Shell Petrol Pump BKC',
        descriptionDetail: 'V-Power High Octane Fuel',
        merchant: 'Shell India',
        tags: ['fuel', 'car'],
        status: 'Completed',
      },
      {
        id: 'tx-05',
        type: 'expense',
        amount: 499000, // ₹4,990.00
        categoryId: 'cat-shopping',
        accountId: 'acc-axis-bank',
        date: '2023-10-21',
        time: '07:30 PM',
        note: 'Uniqlo Mall of India',
        descriptionDetail: 'Autumn outerwear apparel',
        merchant: 'Uniqlo India',
        tags: ['clothing', 'shopping'],
        status: 'Completed',
      },
      {
        id: 'tx-06',
        type: 'expense',
        amount: 2500000, // ₹25,000.00
        categoryId: 'cat-investment',
        accountId: 'acc-icici-deb',
        date: '2023-10-20',
        time: '09:00 AM',
        note: 'Mutual Fund SIP (Groww)',
        descriptionDetail: 'Parag Parikh Flexi Cap Fund',
        merchant: 'Groww Investments',
        tags: ['sip', 'equity', 'mutual-funds'],
        status: 'Completed',
      },
      {
        id: 'tx-07',
        type: 'income',
        amount: 3200000, // ₹32,000.00
        categoryId: 'cat-income',
        accountId: 'acc-icici-deb',
        date: '2023-10-19',
        time: '02:15 PM',
        note: 'Freelance UI Advisory',
        descriptionDetail: 'Invoice #INV-2023-09 Milestone 2',
        merchant: 'Venture Studio',
        tags: ['freelance', 'consulting'],
        status: 'Completed',
      },
      {
        id: 'tx-08',
        type: 'expense',
        amount: 185000, // ₹1,850.00
        categoryId: 'cat-bills',
        accountId: 'acc-autopay',
        date: '2023-10-18',
        time: '10:40 AM',
        note: 'Tata Power Electricity',
        descriptionDetail: 'Mumbai Suburban CA #900112',
        merchant: 'Tata Power',
        tags: ['utilities', 'bills'],
        status: 'Completed',
      },
      {
        id: 'tx-09',
        type: 'expense',
        amount: 38000, // ₹380.00
        categoryId: 'cat-food',
        accountId: 'acc-paytm-upi',
        date: '2023-10-17',
        time: '04:10 PM',
        note: 'Blue Tokai Coffee Roasters',
        descriptionDetail: 'Bandstand Bandra Espresso',
        merchant: 'Blue Tokai',
        tags: ['coffee', 'cafe'],
        status: 'Completed',
      },
      // Additional transactions matching dashboard & reports
      {
        id: 'tx-10',
        type: 'expense',
        amount: 142000, // ₹1,420.00
        categoryId: 'cat-food',
        accountId: 'acc-icici-deb',
        date: '2023-10-24',
        time: '08:15 PM',
        note: 'Swiggy Gourmet',
        descriptionDetail: 'Dinner delivery from Trattoria',
        merchant: 'Swiggy Gourmet',
        tags: ['dining', 'food-delivery'],
        status: 'Completed',
      },
      {
        id: 'tx-11',
        type: 'expense',
        amount: 349900, // ₹3,499.00
        categoryId: 'cat-shopping',
        accountId: 'acc-hdfc-card',
        date: '2023-10-22',
        time: '04:30 PM',
        note: 'Amazon India',
        descriptionDetail: 'Ergonomic keyboard wrist rest',
        merchant: 'Amazon India',
        tags: ['shopping', 'electronics'],
        status: 'Completed',
      },
      {
        id: 'tx-12',
        type: 'expense',
        amount: 210000, // ₹2,100.00
        categoryId: 'cat-health',
        accountId: 'acc-paytm-upi',
        date: '2023-10-20',
        time: '07:00 PM',
        note: 'Cult.fit Pass',
        descriptionDetail: 'Gym & Boxing workout session',
        merchant: 'Cult.fit',
        tags: ['health', 'fitness'],
        status: 'Completed',
      },
      {
        id: 'tx-13',
        type: 'expense',
        amount: 1913000, // ₹19,130.00
        categoryId: 'cat-rent',
        accountId: 'acc-icici-sal',
        date: '2023-10-02',
        time: '09:00 AM',
        note: 'Apartment Rent',
        descriptionDetail: 'Fixed contractual residential lease',
        merchant: 'Lodha Parklands',
        tags: ['rent', 'fixed'],
        status: 'Completed',
      },
      {
        id: 'tx-14',
        type: 'expense',
        amount: 430000, // ₹4,300.00
        categoryId: 'cat-bills',
        accountId: 'acc-autopay',
        date: '2023-10-05',
        time: '12:00 PM',
        note: 'Airtel Xstream Fiber & DTH',
        descriptionDetail: 'Gigabit Broadband Subscription',
        merchant: 'Airtel',
        tags: ['utilities', 'internet'],
        status: 'Completed',
      },
      {
        id: 'tx-15',
        type: 'expense',
        amount: 415100, // ₹4,151.00
        categoryId: 'cat-entertainment',
        accountId: 'acc-hdfc-card',
        date: '2023-10-12',
        time: '09:30 PM',
        note: 'PVR INOX IMAX Tickets',
        descriptionDetail: 'Weekend movie with family',
        merchant: 'PVR INOX',
        tags: ['entertainment', 'movies'],
        status: 'Completed',
      },
    ],
  };
}
