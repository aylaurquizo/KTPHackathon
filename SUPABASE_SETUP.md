# Supabase Integration Setup Guide

## Overview

This guide will help you set up Supabase integration for your NutriCrate project to store and retrieve supplement products and mystery boxes.

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up/Login and create a new project
3. Note down your project URL and anon key from Settings > API

## 2. Database Schema

Run these SQL commands in your Supabase SQL editor:

```sql
-- Products table for individual supplements
CREATE TABLE products (
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

-- Mystery boxes table
CREATE TABLE mystery_boxes (
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

-- Cart items table (optional)
CREATE TABLE cart_items (
    id SERIAL PRIMARY KEY,
    box_id INTEGER REFERENCES mystery_boxes(id),
    user_id TEXT,
    quantity INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_mystery_boxes_category ON mystery_boxes(category);
CREATE INDEX idx_cart_items_user_id ON cart_items(user_id);
```

## 3. Environment Configuration

1. Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

2. Update `.env` with your Supabase credentials:

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your-anon-key-here
```

## 4. Install Dependencies

```bash
pip install -r requirements.txt
```

## 5. Run the Integration

### Save scraped data to Supabase:

```bash
python supabase_integration.py
```

### Test the integration:

```python
from supabase_integration import SupabaseManager

manager = SupabaseManager()
boxes = manager.get_boxes_from_supabase()
print(f"Found {len(boxes)} mystery boxes")
```

## 6. Frontend Integration

1. Update `supabase-client.js` with your credentials:

```javascript
const SUPABASE_URL = "https://your-project-id.supabase.co";
const SUPABASE_ANON_KEY = "your-anon-key-here";
```

2. Include the Supabase client in your HTML:

```html
<script type="module" src="supabase-client.js"></script>
<script src="products.js"></script>
```

## 7. Row Level Security (RLS)

Enable RLS and create policies in Supabase:

```sql
-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE mystery_boxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Allow public read access to products and boxes
CREATE POLICY "Allow public read access to products" ON products
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access to mystery_boxes" ON mystery_boxes
    FOR SELECT USING (true);

-- Allow users to manage their own cart items
CREATE POLICY "Users can manage own cart items" ON cart_items
    FOR ALL USING (auth.uid()::text = user_id);
```

## 8. Data Flow

1. **Scraping**: `supplement_scraper.py` → `supplements.json`
2. **Database**: `supabase_integration.py` → Supabase
3. **Frontend**: `products.js` → Supabase → Display

## 9. Testing

Test the complete flow:

```bash
# 1. Run scraper
python supplement_scraper.py

# 2. Save to Supabase
python supabase_integration.py

# 3. Open products.html in browser
# Should load data from Supabase instead of sample data
```

## 10. Troubleshooting

### Common Issues:

1. **CORS errors**: Make sure your Supabase project allows your domain
2. **Authentication errors**: Check your API keys
3. **Table not found**: Run the SQL schema creation
4. **RLS blocking**: Check your row level security policies

### Debug Steps:

1. Check browser console for errors
2. Verify Supabase credentials
3. Test API calls in Supabase dashboard
4. Check network tab for failed requests

## 11. Next Steps

- Add user authentication
- Implement cart functionality
- Add product search
- Create admin panel for managing boxes
- Add product reviews and ratings
