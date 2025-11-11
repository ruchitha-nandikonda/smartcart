/**
 * Helper file for updating meal images from recipe sites
 * 
 * To find images for meals:
 * 1. Search Google: "[meal name] recipe site:tipbuzz.com OR site:bellyfull.net"
 * 2. Open the recipe page
 * 3. Right-click the main recipe image → Copy Image URL
 * 4. Add the URL to MEAL_IMAGE_UPDATES below
 * 5. Run this to update mealImages.ts
 */

// Meal image updates from recipe sites
// Format: { mealName: 'imageUrl' }
export const MEAL_IMAGE_UPDATES: Record<string, string> = {
  'Orange Chicken': 'https://tipbuzz.com/wp-content/uploads/Chinese-Orange-Chicken-thumbnail-500x375.jpg',
  'Fish Tacos': 'https://bellyfull.net/wp-content/uploads/2024/07/Grilled-Fish-Tacos-blog-1.jpg',
  // Add more meals here as you find them
}

/**
 * Recipe sites to search for meal images:
 * - tipbuzz.com
 * - bellyfull.net  
 * - thefoodcharlatan.com
 * - cafe-delites.com
 * - damn-delicious.net
 * - tastesbetterfromscratch.com
 */

