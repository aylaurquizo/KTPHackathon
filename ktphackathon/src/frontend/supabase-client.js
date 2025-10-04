// Supabase client for frontend
import { createClient } from "https://cdn.skypack.dev/@supabase/supabase-js@2";

// Supabase configuration
const SUPABASE_URL = "your-supabase-url-here";
const SUPABASE_ANON_KEY = "your-supabase-anon-key-here";

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

class SupabaseProductsManager {
  constructor() {
    this.supabase = supabase;
  }

  async getMysteryBoxes(category = null) {
    try {
      let query = this.supabase
        .from("mystery_boxes")
        .select("*")
        .order("created_at", { ascending: false });

      if (category && category !== "all") {
        query = query.eq("category", category);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching mystery boxes:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Error in getMysteryBoxes:", error);
      return [];
    }
  }

  async getProducts(category = null) {
    try {
      let query = this.supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (category && category !== "all") {
        query = query.eq("category", category);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching products:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Error in getProducts:", error);
      return [];
    }
  }

  async addToCart(boxId, userId = null) {
    try {
      const cartItem = {
        box_id: boxId,
        user_id: userId,
        quantity: 1,
        created_at: new Date().toISOString(),
      };

      const { data, error } = await this.supabase
        .from("cart_items")
        .insert([cartItem]);

      if (error) {
        console.error("Error adding to cart:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error in addToCart:", error);
      return false;
    }
  }

  async getUserCart(userId) {
    try {
      const { data, error } = await this.supabase
        .from("cart_items")
        .select(
          `
          *,
          mystery_boxes (
            title,
            price,
            image_url
          )
        `
        )
        .eq("user_id", userId);

      if (error) {
        console.error("Error fetching cart:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Error in getUserCart:", error);
      return [];
    }
  }
}

// Export for use in other files
window.SupabaseProductsManager = SupabaseProductsManager;
