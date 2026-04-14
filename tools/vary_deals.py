#!/usr/bin/env python3
import json
import sys
from datetime import datetime, timedelta
import copy

def create_date_specific_deals(base_file, date, date_index):
    """Create deals specific to a date with rotated products"""
    with open(base_file, 'r') as f:
        data = json.load(f)
    
    all_deals = data.get('deals', [])
    total_deals = len(all_deals)
    
    if total_deals == 0:
        data['date'] = date
        return json.dumps(data, indent=2)
    
    deals = []
    
    # Different rotation strategies for different dates
    if date_index == 0:  # Date 1: First 70% - Meat & Produce focus
        end_idx = max(1, int(total_deals * 0.7))
        deals = [copy.deepcopy(d) for d in all_deals[:end_idx]]
        # Boost prices slightly (weekend pricing)
        for deal in deals:
            if deal.get('unitPrice'):
                deal['unitPrice'] = round(deal['unitPrice'] * 1.05, 2)
            if deal.get('promoPrice'):
                deal['promoPrice'] = round(deal['promoPrice'] * 1.05, 2)
    
    elif date_index == 1:  # Date 2: Middle 70% - Dairy & Bakery focus
        start = max(0, int(total_deals * 0.15))
        end = min(total_deals, start + int(total_deals * 0.7))
        deals = [copy.deepcopy(d) for d in all_deals[start:end]]
        # Regular pricing - no change
    
    elif date_index == 2:  # Date 3: Last 70% - Pantry focus
        start = max(0, int(total_deals * 0.3))
        deals = [copy.deepcopy(d) for d in all_deals[start:]]
        # Discount pricing (mid-week)
        for deal in deals:
            if deal.get('promoPrice'):
                deal['promoPrice'] = round(deal['promoPrice'] * 0.95, 2)
    
    else:  # Date 4: Every other product - Specialty focus
        deals = [copy.deepcopy(all_deals[i]) for i in range(0, len(all_deals), 2)]
        # Premium pricing
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
        # Fallback to default promoEnds
        for deal in deals:
            if 'promoEnds' not in deal or not deal.get('promoEnds'):
                deal['promoEnds'] = '2024-11-10'
    
    data['deals'] = deals
    return json.dumps(data, indent=2)

if __name__ == '__main__':
    base_file = sys.argv[1]
    date = sys.argv[2]
    date_index = int(sys.argv[3])
    output_file = sys.argv[4]
    
    result = create_date_specific_deals(base_file, date, date_index)
    with open(output_file, 'w') as f:
        f.write(result)









