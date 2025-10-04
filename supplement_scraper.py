import requests
from bs4 import BeautifulSoup
import time
import json
import csv
from urllib.parse import urlencode, quote_plus
import random

class SupplementScraper:
    def __init__(self):
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
        }
        self.session = requests.Session()
        self.session.headers.update(self.headers)
        
    def search_amazon(self, query, max_pages=3):
        """Search Amazon for supplement products"""
        products = []
        
        for page in range(1, max_pages + 1):
            try:
                # Amazon search URL
                search_url = f"https://www.amazon.com/s?k={quote_plus(query)}&page={page}"
                
                response = self.session.get(search_url)
                response.raise_for_status()
                
                soup = BeautifulSoup(response.content, 'html.parser')
                
                # Find product containers
                product_containers = soup.find_all('div', {'data-component-type': 's-search-result'})
                
                for container in product_containers:
                    try:
                        # Extract product information
                        title_elem = container.find('h2', {'class': 'a-size-mini'})
                        price_elem = container.find('span', {'class': 'a-price-whole'})
                        rating_elem = container.find('span', {'class': 'a-icon-alt'})
                        link_elem = container.find('h2').find('a')
                        
                        if title_elem and link_elem:
                            product = {
                                'title': title_elem.get_text().strip(),
                                'price': price_elem.get_text().strip() if price_elem else 'N/A',
                                'rating': rating_elem.get_text().strip() if rating_elem else 'N/A',
                                'url': 'https://www.amazon.com' + link_elem.get('href'),
                                'source': 'Amazon'
                            }
                            products.append(product)
                            
                    except Exception as e:
                        print(f"Error parsing product: {e}")
                        continue
                
                # Rate limiting
                time.sleep(random.uniform(2, 4))
                
            except Exception as e:
                print(f"Error searching Amazon page {page}: {e}")
                continue
                
        return products
    
    def search_target(self, query, max_pages=2):
        """Search Target for supplement products"""
        products = []
        
        for page in range(1, max_pages + 1):
            try:
                # Target search URL
                search_url = f"https://www.target.com/s?searchTerm={quote_plus(query)}&Nao={24 * (page - 1)}"
                
                response = self.session.get(search_url)
                response.raise_for_status()
                
                soup = BeautifulSoup(response.content, 'html.parser')
                
                # Find product containers
                product_containers = soup.find_all('div', {'data-test': 'product-details'})
                
                for container in product_containers:
                    try:
                        # Extract product information
                        title_elem = container.find('a', {'data-test': 'product-title'})
                        price_elem = container.find('span', {'data-test': 'product-price'})
                        rating_elem = container.find('div', {'data-test': 'rating-stars'})
                        
                        if title_elem:
                            product = {
                                'title': title_elem.get_text().strip(),
                                'price': price_elem.get_text().strip() if price_elem else 'N/A',
                                'rating': rating_elem.get('aria-label', 'N/A') if rating_elem else 'N/A',
                                'url': 'https://www.target.com' + title_elem.get('href'),
                                'source': 'Target'
                            }
                            products.append(product)
                            
                    except Exception as e:
                        print(f"Error parsing Target product: {e}")
                        continue
                
                # Rate limiting
                time.sleep(random.uniform(2, 4))
                
            except Exception as e:
                print(f"Error searching Target page {page}: {e}")
                continue
                
        return products
    
    def search_iherb(self, query, max_pages=2):
        """Search iHerb for supplement products"""
        products = []
        
        for page in range(1, max_pages + 1):
            try:
                # iHerb search URL
                search_url = f"https://www.iherb.com/search?kw={quote_plus(query)}&p={page}"
                
                response = self.session.get(search_url)
                response.raise_for_status()
                
                soup = BeautifulSoup(response.content, 'html.parser')
                
                # Find product containers
                product_containers = soup.find_all('div', {'class': 'product-inner'})
                
                for container in product_containers:
                    try:
                        # Extract product information
                        title_elem = container.find('a', {'class': 'product-link'})
                        price_elem = container.find('span', {'class': 'price'})
                        rating_elem = container.find('div', {'class': 'rating'})
                        
                        if title_elem:
                            product = {
                                'title': title_elem.get_text().strip(),
                                'price': price_elem.get_text().strip() if price_elem else 'N/A',
                                'rating': rating_elem.get_text().strip() if rating_elem else 'N/A',
                                'url': 'https://www.iherb.com' + title_elem.get('href'),
                                'source': 'iHerb'
                            }
                            products.append(product)
                            
                    except Exception as e:
                        print(f"Error parsing iHerb product: {e}")
                        continue
                
                # Rate limiting
                time.sleep(random.uniform(2, 4))
                
            except Exception as e:
                print(f"Error searching iHerb page {page}: {e}")
                continue
                
        return products
    
    def scrape_supplements(self, categories):
        """Main method to scrape supplements from multiple sources"""
        all_products = []
        
        for category, queries in categories.items():
            print(f"\nScraping {category}...")
            
            for query in queries:
                print(f"Searching for: {query}")
                
                # Search Amazon
                amazon_products = self.search_amazon(query, max_pages=2)
                all_products.extend(amazon_products)
                print(f"Found {len(amazon_products)} Amazon products")
                
                # Search Target
                target_products = self.search_target(query, max_pages=1)
                all_products.extend(target_products)
                print(f"Found {len(target_products)} Target products")
                
                # Search iHerb
                iherb_products = self.search_iherb(query, max_pages=1)
                all_products.extend(iherb_products)
                print(f"Found {len(iherb_products)} iHerb products")
                
                # Rate limiting between queries
                time.sleep(random.uniform(3, 6))
        
        return all_products
    
    def save_to_json(self, products, filename='supplements.json'):
        """Save products to JSON file"""
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(products, f, indent=2, ensure_ascii=False)
        print(f"Saved {len(products)} products to {filename}")
    
    def save_to_csv(self, products, filename='supplements.csv'):
        """Save products to CSV file"""
        if not products:
            return
            
        with open(filename, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=products[0].keys())
            writer.writeheader()
            writer.writerows(products)
        print(f"Saved {len(products)} products to {filename}")

def main():
    # Define supplement categories and search queries
    categories = {
        'energy_drinks': [
            'celsius energy drink',
            'alani nu energy drink',
            'ghost energy drink',
            'bang energy drink',
            'red bull',
            'monster energy'
        ],
        'protein_bars': [
            'barbell protein bar',
            'puff protein bar',
            'rx bar protein',
            'quest protein bar',
            'clif protein bar',
            'one protein bar'
        ],
        'protein_powders': [
            'optimum nutrition protein',
            'dymatize protein powder',
            'ghost protein powder',
            'muscle tech protein',
            'bpi protein powder'
        ]
    }
    
    # Initialize scraper
    scraper = SupplementScraper()
    
    # Scrape products
    print("Starting supplement scraping...")
    products = scraper.scrape_supplements(categories)
    
    # Save results
    if products:
        scraper.save_to_json(products)
        scraper.save_to_csv(products)
        print(f"\nTotal products found: {len(products)}")
        
        # Show sample results
        print("\nSample products:")
        for i, product in enumerate(products[:5]):
            print(f"{i+1}. {product['title']} - {product['price']} ({product['source']})")
    else:
        print("No products found!")

if __name__ == "__main__":
    main()
