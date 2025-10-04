import os
import json
from supabase import create_client, Client
from datetime import datetime
import time

class SupabaseManager:
    def __init__(self):
        # Initialize Supabase client
        # You'll need to set these environment variables or replace with your actual values
        self.url = os.getenv('SUPABASE_URL', 'your-supabase-url-here')
        self.key = os.getenv('SUPABASE_KEY', 'your-supabase-anon-key-here')
        self.supabase: Client = create_client(self.url, self.key)
        
    def create_tables(self):
        """Create necessary tables in Supabase (run this once)"""
        # This would typically be done through the Supabase dashboard
        # or using SQL migrations, but here's the structure:
        
        products_table_sql = """
        CREATE TABLE IF NOT EXISTS products (
            id SERIAL PRIMARY KEY,
            title TEXT NOT NULL,
            price TEXT,
            rating TEXT,
            source TEXT,
            url TEXT,
            category TEXT,
            description TEXT,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
        );
        """
        
        boxes_table_sql = """
        CREATE TABLE IF NOT EXISTS mystery_boxes (
            id SERIAL PRIMARY KEY,
            title TEXT NOT NULL,
            price TEXT NOT NULL,
            rating TEXT,
            description TEXT,
            contents JSONB,
            category TEXT,
            image_url TEXT,
            value TEXT,
            savings TEXT,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
        );
        """
        
        print("Tables should be created through Supabase dashboard or SQL editor")
        print("Products table structure:", products_table_sql)
        print("Mystery boxes table structure:", boxes_table_sql)
    
    def save_products_to_supabase(self, products_data):
        """Save scraped products to Supabase"""
        try:
            # Prepare data for insertion
            products_to_insert = []
            for product in products_data:
                product_data = {
                    'title': product.get('title', ''),
                    'price': product.get('price', ''),
                    'rating': product.get('rating', ''),
                    'source': product.get('source', ''),
                    'url': product.get('url', ''),
                    'category': self._categorize_product(product.get('title', '')),
                    'description': product.get('title', '')  # Use title as description for now
                }
                products_to_insert.append(product_data)
            
            # Insert into Supabase
            result = self.supabase.table('products').insert(products_to_insert).execute()
            print(f"Successfully saved {len(products_to_insert)} products to Supabase")
            return result
            
        except Exception as e:
            print(f"Error saving products to Supabase: {e}")
            return None
    
    def save_boxes_to_supabase(self, boxes_data):
        """Save mystery boxes to Supabase"""
        try:
            # Prepare data for insertion
            boxes_to_insert = []
            for box in boxes_data:
                box_data = {
                    'title': box.get('title', ''),
                    'price': box.get('price', ''),
                    'rating': box.get('rating', ''),
                    'description': box.get('description', ''),
                    'contents': json.dumps(box.get('contents', [])),
                    'category': box.get('category', ''),
                    'image_url': box.get('image', ''),
                    'value': box.get('value', ''),
                    'savings': box.get('savings', '')
                }
                boxes_to_insert.append(box_data)
            
            # Insert into Supabase
            result = self.supabase.table('mystery_boxes').insert(boxes_to_insert).execute()
            print(f"Successfully saved {len(boxes_to_insert)} mystery boxes to Supabase")
            return result
            
        except Exception as e:
            print(f"Error saving boxes to Supabase: {e}")
            return None
    
    def get_products_from_supabase(self, category=None):
        """Retrieve products from Supabase"""
        try:
            query = self.supabase.table('products').select('*')
            if category:
                query = query.eq('category', category)
            
            result = query.execute()
            return result.data
            
        except Exception as e:
            print(f"Error retrieving products from Supabase: {e}")
            return []
    
    def get_boxes_from_supabase(self, category=None):
        """Retrieve mystery boxes from Supabase"""
        try:
            query = self.supabase.table('mystery_boxes').select('*')
            if category:
                query = query.eq('category', category)
            
            result = query.execute()
            return result.data
            
        except Exception as e:
            print(f"Error retrieving boxes from Supabase: {e}")
            return []
    
    def _categorize_product(self, title):
        """Categorize products based on title keywords"""
        title_lower = title.lower()
        
        if any(keyword in title_lower for keyword in ['energy', 'celsius', 'alani', 'ghost', 'bang', 'red bull', 'monster']):
            return 'energy_drinks'
        elif any(keyword in title_lower for keyword in ['protein bar', 'rxbar', 'quest', 'barbell', 'clif']):
            return 'protein_bars'
        elif any(keyword in title_lower for keyword in ['protein powder', 'whey', 'dymatize', 'optimum nutrition']):
            return 'protein_powders'
        elif any(keyword in title_lower for keyword in ['creatine']):
            return 'creatine'
        elif any(keyword in title_lower for keyword in ['pre-workout', 'pre workout', 'c4', 'legend']):
            return 'pre_workout'
        else:
            return 'other'

def main():
    # Initialize Supabase manager
    supabase_manager = SupabaseManager()
    
    # Load scraped data
    try:
        with open('supplements.json', 'r') as f:
            products_data = json.load(f)
        
        print(f"Loaded {len(products_data)} products from supplements.json")
        
        # Save to Supabase
        result = supabase_manager.save_products_to_supabase(products_data)
        
        if result:
            print("Products successfully saved to Supabase!")
        else:
            print("Failed to save products to Supabase")
            
    except FileNotFoundError:
        print("supplements.json not found. Run the scraper first.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
