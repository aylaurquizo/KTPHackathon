// Products page JavaScript
class ProductsManager {
  constructor() {
    this.products = [];
    this.filteredProducts = [];
    this.currentCategory = "all";
    this.init();
  }

  async init() {
    await this.loadProducts();
    this.setupEventListeners();
    this.renderProducts();
  }

  async loadProducts() {
    try {
      // Try to load from Supabase first (if available)
      if (window.SupabaseProductsManager) {
        const supabaseManager = new window.SupabaseProductsManager();
        const supabaseBoxes = await supabaseManager.getMysteryBoxes();

        if (supabaseBoxes && supabaseBoxes.length > 0) {
          this.products = supabaseBoxes.map((box) => ({
            title: box.title,
            rating: box.rating,
            description: box.description,
            category: box.category,
            image: box.image_url,
          }));
          this.filteredProducts = [...this.products];
          this.hideLoading();
          console.log(`Loaded ${this.products.length} boxes from Supabase`);
          return;
        }
      }
    } catch (error) {
      console.log("Supabase not available, trying local JSON file");
    }

    try {
      // Try to load from local JSON file
      const response = await fetch("../../supplements.json");
      if (response.ok) {
        this.products = await response.json();
        this.filteredProducts = [...this.products];
        this.hideLoading();
        console.log(`Loaded ${this.products.length} products from local JSON`);
        return;
      }
    } catch (error) {
      console.log("Local JSON file not found, using sample data");
    }

    // Fallback to sample data
    this.products = this.getSampleBoxes();
    this.filteredProducts = [...this.products];
    this.hideLoading();
    console.log(`Loaded ${this.products.length} sample boxes`);
  }

  getSampleBoxes() {
    return [
      {
        title: "Energy Boost Box",
        rating: "4.6 out of 5 stars",
        description: "Premium energy drinks to fuel your day",
        category: "energy_drinks",
        image: "images/ProteinSupplements.avif",
      },
      {
        title: "Protein Power Box",
        rating: "4.4 out of 5 stars",
        description: "High-quality protein bars for muscle recovery",
        category: "protein_bars",
        image: "images/ProteinSupplements.avif",
      },
      {
        title: "Whey Protein Box",
        rating: "4.7 out of 5 stars",
        description: "Premium whey protein powders for serious gains",
        category: "protein_powders",
        image: "images/ProteinSupplements.avif",
      },
      {
        title: "Creatine Performance Box",
        rating: "4.5 out of 5 stars",
        description: "Pure creatine monohydrate for enhanced performance",
        category: "creatine",
        image: "images/ProteinSupplements.avif",
      },
      {
        title: "Pre-Workout Power Box",
        rating: "4.8 out of 5 stars",
        description: "Explosive pre-workout formulas to maximize your training",
        category: "pre_workout",
        image: "images/ProteinSupplements.avif",
      },
      {
        title: "Protein Sweets Box",
        rating: "4.3 out of 5 stars",
        description: "Delicious protein treats that satisfy your sweet tooth",
        category: "protein_sweets",
        image: "images/ProteinSupplements.avif",
      },
      {
        title: "Ultimate Combo Box",
        rating: "4.9 out of 5 stars",
        description: "Complete fitness package: energy + protein + recovery",
        category: "combo_boxes",
        image: "images/ProteinSupplements.avif",
      },
      {
        title: "Muscle Building Box",
        rating: "4.7 out of 5 stars",
        description:
          "Protein powder + creatine + BCAAs for serious muscle growth",
        category: "combo_boxes",
        image: "images/ProteinSupplements.avif",
      },
      {
        title: "Recovery & Hydration Box",
        rating: "4.6 out of 5 stars",
        description: "Post-workout recovery essentials for optimal hydration",
        category: "combo_boxes",
        image: "images/ProteinSupplements.avif",
      },
      {
        title: "Beginner's Starter Box",
        rating: "4.4 out of 5 stars",
        description:
          "Perfect introduction to supplements for fitness newcomers",
        category: "starter_boxes",
        image: "images/ProteinSupplements.avif",
      },
      {
        title: "Keto-Friendly Box",
        rating: "4.5 out of 5 stars",
        description: "Low-carb, high-protein options for ketogenic diets",
        category: "specialty_boxes",
        image: "images/ProteinSupplements.avif",
      },
      {
        title: "Vegan Protein Box",
        rating: "4.6 out of 5 stars",
        description: "Plant-based protein options for vegan athletes",
        category: "specialty_boxes",
        image: "images/ProteinSupplements.avif",
      },
    ];
  }

  setupEventListeners() {
    const filterButtons = document.querySelectorAll(".filter-btn");
    filterButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        this.handleFilter(e.target.dataset.category);
        this.updateActiveButton(e.target);
      });
    });
  }

  handleFilter(category) {
    this.currentCategory = category;

    if (category === "all") {
      this.filteredProducts = [...this.products];
    } else {
      this.filteredProducts = this.products.filter(
        (product) => product.category === category
      );
    }

    this.renderProducts();
  }

  updateActiveButton(activeButton) {
    document.querySelectorAll(".filter-btn").forEach((btn) => {
      btn.classList.remove("active");
    });
    activeButton.classList.add("active");
  }

  renderProducts() {
    const grid = document.getElementById("products-grid");

    if (this.filteredProducts.length === 0) {
      grid.innerHTML =
        '<div class="no-products">No products found in this category.</div>';
      return;
    }

    grid.innerHTML = this.filteredProducts
      .map(
        (box) => `
             <div class="product-card">
                 <img src="${box.image}" alt="${
          box.title
        }" class="box-image" onerror="this.style.display='none'">
                 <h3 class="product-title">${box.title}</h3>
                 <p class="box-description">${box.description}</p>
                 <div class="star-rating">
                     ${this.generateStars(box.rating)}
                 </div>
                 <button class="product-link">Add to Cart</button>
             </div>
         `
      )
      .join("");
  }

  hideLoading() {
    document.getElementById("loading").style.display = "none";
  }

  showError() {
    document.getElementById("loading").style.display = "none";
    document.getElementById("error-message").style.display = "block";
  }

  generateStars(ratingText) {
    // Extract numeric rating from text like "4.6 out of 5 stars"
    const ratingMatch = ratingText.match(/(\d+\.?\d*)/);
    const rating = ratingMatch ? parseFloat(ratingMatch[1]) : 0;

    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    let stars = "";

    // Full stars
    for (let i = 0; i < fullStars; i++) {
      stars += '<span class="star full">★</span>';
    }

    // Half star using CSS clip-path
    if (hasHalfStar) {
      stars +=
        '<span class="star half"><span class="star-half-filled">★</span><span class="star-half-empty">☆</span></span>';
    }

    // Empty stars
    for (let i = 0; i < emptyStars; i++) {
      stars += '<span class="star empty">☆</span>';
    }

    return stars;
  }
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new ProductsManager();
});
