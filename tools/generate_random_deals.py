#!/usr/bin/env python3
import json
import sys
from datetime import datetime, timedelta
import copy
import random

def generate_random_deals(base_file, date, date_index, discount_min, discount_max):
    """Generate deals with RANDOM products and RANDOM discount percentages"""
    with open(base_file, 'r') as f:
        data = json.load(f)
    
    all_deals = data.get('deals', [])
    total_deals = len(all_deals)
    
    if total_deals == 0:
        data['date'] = date
        return json.dumps(data, indent=2)
    
    # Ensure each date gets DIFFERENT products by dividing them into 5 non-overlapping groups
    # Use modulo to assign each product to exactly one date
    deals_by_date = [[] for _ in range(5)]
    
    for idx, deal in enumerate(all_deals):
        # Assign each deal to exactly one date using modulo
        assigned_date = idx % 5
        deals_by_date[assigned_date].append(copy.deepcopy(deal))
    
    # Get deals assigned to this date
    date_deals = deals_by_date[date_index]
    
    # Then randomly select 80-100% from this date's assigned deals (to get more deals)
    random.seed(date_index * 1000 + hash(date))
    select_percentage = random.uniform(0.8, 1.0)  # Select most/all of this date's products
    num_to_select = max(1, int(len(date_deals) * select_percentage))
    
    # If still not enough, take all deals for this date
    if num_to_select < len(date_deals) * 0.7:
        num_to_select = len(date_deals)
    
    # Shuffle and select from this date's deals
    shuffled_deals = copy.deepcopy(date_deals)
    random.shuffle(shuffled_deals)
    selected_deals = shuffled_deals[:num_to_select]
    
    # Apply random discounts to each product
    deals = []
    for deal in selected_deals:
        new_deal = copy.deepcopy(deal)
        
        # Generate random discount percentage between discount_min and discount_max
        discount_pct = random.uniform(discount_min, discount_max)
        
        # Apply discount to promo price
        if new_deal.get('unitPrice'):
            unit_price = float(new_deal['unitPrice'])
            # Calculate promo price based on discount percentage
            promo_price = unit_price * (1 - discount_pct / 100)
            
            # Ensure promo price is never higher than unit price (at least 1% discount)
            promo_price = min(promo_price, unit_price * 0.99)
            
            # Round to 2 decimal places
            promo_price = round(promo_price, 2)
            
            # Ensure promo price is at least $0.01
            promo_price = max(promo_price, 0.01)
            
            new_deal['promoPrice'] = promo_price
        
        deals.append(new_deal)
    
    # Update date and promoEnds
    data['date'] = date
    try:
        date_obj = datetime.strptime(date, '%Y%m%d')
        promo_end_date = date_obj + timedelta(days=7)  # Deals last 7 days
        promo_end_str = promo_end_date.strftime('%Y-%m-%d')
        
        for deal in deals:
            deal['promoEnds'] = promo_end_str
    except Exception as e:
        for deal in deals:
            if 'promoEnds' not in deal or not deal.get('promoEnds'):
                deal['promoEnds'] = '2024-11-15'
    
    # Shuffle final order
    random.shuffle(deals)
    
    data['deals'] = deals
    return json.dumps(data, indent=2)

if __name__ == '__main__':
    base_file = sys.argv[1]
    date = sys.argv[2]
    date_index = int(sys.argv[3])
    discount_min = float(sys.argv[4])
    discount_max = float(sys.argv[5])
    output_file = sys.argv[6]
    
    result = generate_random_deals(base_file, date, date_index, discount_min, discount_max)
    with open(output_file, 'w') as f:
        f.write(result)

