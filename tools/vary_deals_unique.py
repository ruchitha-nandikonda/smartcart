#!/usr/bin/env python3
import json
import sys
from datetime import datetime, timedelta
import copy
import random

def create_unique_product_deals(base_file, date, date_index):
    """Create deals with COMPLETELY DIFFERENT products for each date"""
    with open(base_file, 'r') as f:
        data = json.load(f)
    
    all_deals = data.get('deals', [])
    total_deals = len(all_deals)
    
    if total_deals == 0:
        data['date'] = date
        return json.dumps(data, indent=2)
    
    # Define product categories for each date to ensure uniqueness
    # Date 0: Meat & Produce focus
    # Date 1: Dairy & Bakery focus  
    # Date 2: Pantry & Beverages focus
    # Date 3: Specialty & Frozen focus
    
    meat_keywords = ['chicken', 'beef', 'pork', 'turkey', 'bacon', 'sausage', 'salmon', 'tilapia', 'shrimp', 'drumsticks', 'thighs', 'cutlets']
    produce_keywords = ['cabbage', 'carrots', 'celery', 'cilantro', 'onions', 'garlic', 'tomatoes', 'lettuce', 'peppers', 'broccoli', 'asparagus', 'zucchini', 'mushrooms', 'corn', 'cucumber', 'green beans']
    
    dairy_keywords = ['milk', 'cheese', 'butter', 'yogurt', 'sour cream', 'cream cheese', 'cottage cheese', 'mozzarella', 'cheddar', 'provolone']
    bakery_keywords = ['bread', 'baguette', 'bagels', 'muffins', 'rolls', 'buns', 'tortillas']
    
    pantry_keywords = ['rice', 'pasta', 'flour', 'cornmeal', 'beans', 'chickpeas', 'kidney', 'black beans', 'canned', 'mayonnaise', 'panko', 'salsa']
    beverage_keywords = ['juice', 'coffee', 'tea', 'cranberry', 'orange', 'apple']
    
    frozen_keywords = ['frozen', 'berries', 'vegetables']
    specialty_keywords = ['organic', 'greek', 'hummus', 'quinoa', 'granola', 'almond', 'coconut', 'avocado', 'strawberries', 'blueberries']
    
    # Categorize products
    def categorize_deal(deal):
        name_lower = deal.get('productName', '').lower()
        
        if any(kw in name_lower for kw in meat_keywords):
            return 'meat'
        elif any(kw in name_lower for kw in produce_keywords):
            return 'produce'
        elif any(kw in name_lower for kw in dairy_keywords):
            return 'dairy'
        elif any(kw in name_lower for kw in bakery_keywords):
            return 'bakery'
        elif any(kw in name_lower for kw in pantry_keywords):
            return 'pantry'
        elif any(kw in name_lower for kw in beverage_keywords):
            return 'beverage'
        elif any(kw in name_lower for kw in frozen_keywords):
            return 'frozen'
        elif any(kw in name_lower for kw in specialty_keywords):
            return 'specialty'
        else:
            return 'other'
    
    # Divide products into 4 non-overlapping groups for each date
    # Use modulo to assign each product to exactly one date
    deals_by_date = [[] for _ in range(4)]
    
    for idx, deal in enumerate(all_deals):
        # Assign each deal to exactly one date using modulo
        assigned_date = idx % 4
        deals_by_date[assigned_date].append(copy.deepcopy(deal))
    
    # Select deals for this specific date
    deals = deals_by_date[date_index]
    
    # Apply date-specific pricing and ensure good mix
    if date_index == 0:  # Date 1: Meat & Produce focus
        # Prioritize meat & produce, adjust pricing
        meat_produce = [d for d in deals if categorize_deal(d) in ['meat', 'produce']]
        others = [d for d in deals if categorize_deal(d) not in ['meat', 'produce']]
        deals = meat_produce + others[:max(1, len(others)//2)]
        
        # Weekend pricing (+5%)
        for deal in deals:
            if deal.get('unitPrice'):
                deal['unitPrice'] = round(deal['unitPrice'] * 1.05, 2)
            if deal.get('promoPrice'):
                deal['promoPrice'] = round(deal['promoPrice'] * 1.05, 2)
    
    elif date_index == 1:  # Date 2: Dairy & Bakery focus
        # Prioritize dairy & bakery
        dairy_bakery = [d for d in deals if categorize_deal(d) in ['dairy', 'bakery']]
        others = [d for d in deals if categorize_deal(d) not in ['dairy', 'bakery']]
        deals = dairy_bakery + others[:max(1, len(others)//2)]
        
        # Regular pricing - no change
    
    elif date_index == 2:  # Date 3: Pantry & Beverages focus
        # Prioritize pantry & beverages
        pantry_beverage = [d for d in deals if categorize_deal(d) in ['pantry', 'beverage']]
        others = [d for d in deals if categorize_deal(d) not in ['pantry', 'beverage']]
        deals = pantry_beverage + others[:max(1, len(others)//3)]
        
        # Mid-week discount (-5%)
        for deal in deals:
            if deal.get('promoPrice'):
                deal['promoPrice'] = round(deal['promoPrice'] * 0.95, 2)
    
    else:  # Date 4: Specialty & Frozen focus
        # Prioritize specialty & frozen
        specialty_frozen = [d for d in deals if categorize_deal(d) in ['specialty', 'frozen']]
        others = [d for d in deals if categorize_deal(d) not in ['specialty', 'frozen']]
        deals = specialty_frozen + others[:max(1, len(others)//2)]
        
        # Premium pricing (+10% base, +8% promo)
        for deal in deals:
            if deal.get('unitPrice'):
                deal['unitPrice'] = round(deal['unitPrice'] * 1.1, 2)
            if deal.get('promoPrice'):
                deal['promoPrice'] = round(deal['promoPrice'] * 1.08, 2)
    
    # Update date and promoEnds
    data['date'] = date
    try:
        date_obj = datetime.strptime(date, '%Y%m%d')
        promo_end_date = date_obj + timedelta(days=5)
        promo_end_str = promo_end_date.strftime('%Y-%m-%d')
        
        for deal in deals:
            deal['promoEnds'] = promo_end_str
    except Exception as e:
        for deal in deals:
            if 'promoEnds' not in deal or not deal.get('promoEnds'):
                deal['promoEnds'] = '2024-11-10'
    
    # Shuffle to mix up order
    random.Random(date_index).shuffle(deals)
    
    data['deals'] = deals
    return json.dumps(data, indent=2)

if __name__ == '__main__':
    base_file = sys.argv[1]
    date = sys.argv[2]
    date_index = int(sys.argv[3])
    output_file = sys.argv[4]
    
    result = create_unique_product_deals(base_file, date, date_index)
    with open(output_file, 'w') as f:
        f.write(result)

