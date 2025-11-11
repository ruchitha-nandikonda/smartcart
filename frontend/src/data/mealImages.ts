// Curated meal image mapping - more American meals, fewer others
// Includes meals with custom-provided images (marked with ✅)

/**
 * List of meals to exclude from display (none - all meals are valid)
 */
export const MEALS_WITH_BAD_IMAGES: string[] = []

/**
 * Check if a meal has a bad/mismatched image
 */
export function hasBadImage(mealName: string): boolean {
  return MEALS_WITH_BAD_IMAGES.includes(mealName)
}

// Comprehensive curated mapping for accuracy
// ✅ = Custom-provided image (DO NOT CHANGE)
const MEAL_IMAGE_MAP: Record<string, string> = {
  // Italian - Pasta & Pizza (2 meals) - only custom image meals
  'Lasagna': 'https://assets.epicurious.com/photos/6508a14155b19af4200459c7/1:1/w_2900,h_2900,c_limit/Sausage-Cheese-Basil-Lasanga_RECIPE.jpg', // ✅
  'Pepperoni Pizza': 'https://www.eatingonadime.com/wp-content/uploads/2024/08/200KB-Hot-Honey-Pepperoni-Pizza-12.jpg', // ✅
  
  // Asian - American-Chinese/Japanese (8 meals) - only custom image meals
  'Pad Thai': 'https://inquiringchef.com/wp-content/uploads/2023/02/Authentic-Pad-Thai_square-1908.jpg', // ✅
  'Orange Chicken': 'https://tipbuzz.com/wp-content/uploads/Chinese-Orange-Chicken-thumbnail-500x375.jpg', // ✅
  "General Tso's": 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjuihTZfel7dS9_njXvnv527Gpd3zcOus24-gCE2VVxbbbakMPDrkVwQ_m-8NJC-vTr8wh_QQXdmDVZApXLD3dWaGVbuGeQyfCCMpo-2ZZ_i9FG2-Ainuz7uwEDptwLJ-OdhghSgOzx1hgI/s1600/General_Tsos_Chicken.jpg', // ✅
  'Chicken Curry': 'https://www.foodandwine.com/thmb/8YAIANQTZnGpVWj2XgY0dYH1V4I=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/spicy-chicken-curry-FT-RECIPE0321-58f84fdf7b484e7f86894203eb7834e7.jpg', // ✅
  'Ramen': 'https://hips.hearstapps.com/hmg-prod/images/190208-delish-ramen-horizontal-093-1550096715.jpg?crop=0.668xw:1.00xh;0.184xw,0&resize=1200:*', // ✅
  'Chicken Lo Mein': 'https://thecozycook.com/wp-content/uploads/2022/11/Chicken-Lo-Mein-f.jpg', // ✅
  'Shrimp Fried Rice': 'https://www.dinneratthezoo.com/wp-content/uploads/2019/05/shrimp-fried-rice-5-500x500.jpg', // ✅
  'Mongolian Beef': 'https://www.spendwithpennies.com/wp-content/uploads/2023/06/1200-Easy-Mongolian-Beef-2-SpendWithPennies.jpg', // ✅
  
  // Mexican - Tex-Mex (3 meals) - only custom image meals
  'Chicken Tacos': 'https://hips.hearstapps.com/hmg-prod/images/chicken-tacos-index-659443ccdaac5.jpg?crop=0.502xw:1.00xh;0.441xw,0&resize=1200:*', // ✅
  'Fish Tacos': 'https://bellyfull.net/wp-content/uploads/2024/07/Grilled-Fish-Tacos-blog-1.jpg', // ✅
  'Chicken Fajitas': 'https://easyweeknightrecipes.com/wp-content/uploads/2021/07/grilled-chicken-fajitas-6.jpg', // ✅
  
  // American (32 meals) - many famous American dishes
  'Hamburgers': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop&q=80',
  'Buffalo Wings': 'https://carlsbadcravings.com/wp-content/uploads/2014/12/Buffalo-Honey-Hot-Wings10.jpg', // ✅
  'Mac and Cheese': 'https://imagesvc.meredithcorp.io/v3/mm/image?url=https%3A%2F%2Fstatic.onecms.io%2Fwp-content%2Fuploads%2Fsites%2F43%2F2022%2F03%2F19%2F238691-Simple-Macaroni-And-Cheese-mfs_006.jpg&w=160&q=60&c=sc&poi=auto&orient=true&h=90', // ✅
  'BBQ Chicken': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRFhjKuEegXK1Gak6vdOZO3yGRFRy_Ig3mmTg&s', // ✅
  'Fried Chicken': 'https://thegirlinspired.com/wp-content/uploads/2024/11/southern-fried-chicken-recipe-card.jpg', // ✅
  'Beef Stew': 'https://www.daringgourmet.com/wp-content/uploads/2016/01/French-Ancient-Stew-3-cropped-3.jpg', // ✅
  'Hot Dogs': 'https://assets-us-01.kc-usercontent.com/7a9cec6a-38b8-00ad-2f1c-269f0461d7dc/efab6475-91ba-4d8c-b294-2016cf04cc5d/classic-dog.jpg?w=1280&auto=format', // ✅
  'Pulled Pork': 'https://www.seriouseats.com/thmb/o2jnHlyv2Ic5vUvG1EytR-nncQQ=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/__opt__aboutcom__coeus__resources__content_migration__serious_eats__seriouseats.com__recipes__images__2016__06__20160701-sous-vide-pulled-pork-16-fb5d6117f14044e6ac3c0ea70a7f3bcb.jpg', // ✅
  'Meatloaf': 'https://www.allrecipes.com/thmb/rUQPPVedW2rFX99iFpZj4Gj8DkI=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/5302390-grilled-bbq-meatloaf-Spunky-Buddy-4x3-1-c8a2e89e58d54c3a8540897062429a44.jpg', // ✅
  'Chili': 'https://images.unsplash.com/photo-1574943320219-67b4b6c34d4a?w=400&h=300&fit=crop&q=80',
  'Grilled Cheese': 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&h=300&fit=crop&q=80',
  'Chicken Noodle Soup': 'https://hips.hearstapps.com/hmg-prod/images/chicken-noodle-soup-index-644c2bec1ce0c.jpg?crop=0.6666666666666666xw:1xh;center,top&resize=1200:*', // ✅
  'French Onion Soup': 'https://www.familyfoodonthetable.com/wp-content/uploads/2025/01/French-Onion-Soup-13-1024x1536.jpg', // ✅
  'Tomato Soup': 'https://cdn.loveandlemons.com/wp-content/uploads/2023/01/tomato-soup.jpg', // ✅
  'BLT': 'https://thefoodcharlatan.com/wp-content/uploads/2012/05/How-to-Make-the-Best-BLT-14.jpg', // ✅
  'Reuben Sandwich': 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&h=300&fit=crop&q=80',
  'Philly Cheese Steak': 'https://images.unsplash.com/photo-1553909489-cd47ac38b67a?w=400&h=300&fit=crop&q=80',
  // 17 new famous American meals
  'Apple Pie': 'https://www.inspiredtaste.net/wp-content/uploads/2019/11/Homemade-Apple-Pie-From-Scratch-1200.jpg', // ✅
  'BBQ Ribs': 'https://grillinwithdad.com/wp-content/uploads/2024/04/ribs-featured.jpg', // ✅
  'Clam Chowder': 'https://assets.epicurious.com/photos/6487316ef0a537ecfb046b4c/1:1/w_4020,h_4020,c_limit/ClamChowder_RECIPE_060523_54702.jpg', // ✅
  'Cornbread': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQuaFMBdBoXsr8PnP7NEa8tA8FPrxLnFyamEw&s', // ✅
  'Deep-Dish Pizza': 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop&q=80',
  'Jambalaya': 'https://www.cookingclassy.com/wp-content/uploads/2019/10/jambalaya-23.jpg', // ✅
  'Pot Roast': 'https://www.sipandfeast.com/wp-content/uploads/2023/10/pot-roast-recipe-2.jpg', // ✅
  "Shepherd's Pie": 'https://www.onceuponachef.com/images/2019/02/Shepherds-Pie-1200x1500.jpg', // ✅
  'Corn Dogs': 'https://hips.hearstapps.com/hmg-prod/images/corn-dogs-recipe-2-1653593545.jpg?crop=0.6666666666666667xw:1xh;center,top&resize=1200:*', // ✅
  'Biscuits and Gravy': 'https://carlsbadcravings.com/wp-content/uploads/2022/06/homemade-biscuits-and-gravy-recipe-11.jpg', // ✅
  'Chicken Pot Pie': 'https://eatdessertsnack.com/wp-content/uploads/2024/05/Chicken-Pot-Pie-with-frozen-veggies-1200-2-500x500.jpg', // ✅
  'Tuna Casserole': 'https://www.thisgalcooks.com/wp-content/uploads/2025/07/tuna_casserole_2-2-735x735.png', // ✅
  'Caesar Salad': 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&h=300&fit=crop&q=80',
  'Cobb Salad': 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&h=300&fit=crop&q=80',
  'Lobster Roll': 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop&q=80',
  'Fish and Chips': 'https://withinthewild.com/wp-content/uploads/2019/03/4.7_Fish-and-chips.jpg', // ✅
  'Corn on the Cob': 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=800&h=600&fit=crop&q=90', // Using Unsplash until direct image URL found
  'Gumbo': 'https://simpleseafoodrecipes.com/wp-content/uploads/2023/08/Cajun-seafood-gumbo-with-shrimp-and-crab-recipe-2-1.jpg', // ✅
  'Tater Tots': 'https://platform.eater.com/wp-content/uploads/sites/2/chorus/uploads/chorus_asset/file/9064347/tater_tots_closeup.jpg?quality=90&strip=all&crop=0%2C5.5555555555556%2C100%2C88.888888888889&w=2400', // ✅
  
  // Seafood (2 meals) - custom image meals
  'Grilled Salmon': 'https://www.thecookierookie.com/wp-content/uploads/2023/05/featured-grilled-salmon-recipe.jpg', // ✅
  'Shrimp Scampi': 'https://littlespicejar.com/wp-content/uploads/2019/01/Garlicky-Hawaiian-Shrimp-Scampi-14-735x1102.jpg', // ✅
  
  // Breakfast (3 meals) - includes custom image meals
  'Pancakes': 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop&q=80',
  'French Toast': 'https://cdn.loveandlemons.com/wp-content/uploads/2024/08/french-toast-recipe.jpg', // ✅
  'Waffles': 'https://cravinghomecooked.com/wp-content/uploads/2019/02/easy-waffle-recipe-1-16.jpg', // ✅
  'Autumn Harvest Bowl': 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&h=600&fit=crop&q=80',
  'Winter Citrus Roast Chicken': 'https://images.unsplash.com/photo-1511690078903-71dc5a49f8e4?w=800&h=600&fit=crop&q=80',
  'Spring Herb Pasta': 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=800&h=600&fit=crop&q=80',
  'Summer Berry Grain Salad': 'https://images.unsplash.com/photo-1524594154908-eddff9a95686?w=800&h=600&fit=crop&q=80',
}

// Fallback image
export const DEFAULT_MEAL_IMAGE = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop&q=80'

/**
 * Get accurate image for a meal
 * Uses curated mapping - all meals have matching images
 */
export function getMealImage(mealName: string): string {
  if (mealName === 'default') {
    return DEFAULT_MEAL_IMAGE
  }
  
  // Check curated mapping first for accuracy
  if (MEAL_IMAGE_MAP[mealName]) {
    let imageUrl = MEAL_IMAGE_MAP[mealName]
    // Add cache busting for Apple Pie, Corn Dogs, Fried Chicken, and Hot Dogs to force refresh
    if (mealName === 'Apple Pie') {
      imageUrl += (imageUrl.includes('?') ? '&' : '?') + 'v=3'
    }
    if (mealName === 'Corn Dogs') {
      imageUrl += (imageUrl.includes('?') ? '&' : '?') + 'v=5'
    }
    if (mealName === 'Fried Chicken') {
      imageUrl += (imageUrl.includes('?') ? '&' : '?') + 'v=6'
    }
    if (mealName === 'Hot Dogs') {
      imageUrl += (imageUrl.includes('?') ? '&' : '?') + 'v=7'
    }
    return imageUrl
  }
  
  // Fallback: use default image (should not happen for curated meals)
  return DEFAULT_MEAL_IMAGE
}
