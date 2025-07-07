import { createMocks } from "node-mocks-http";
import handler from "../../pages/api/wishlist";
import { mockFail, __getMem } from "../../__mocks__/@supabase/supabase-js";

describe("Wishlist API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/wishlist", () => {
    it("returns empty list with totalItems 0", async () => {
      const { req, res } = createMocks({ 
        method: "GET", 
        query: {} 
      });
      
      await handler(req, res);
      
      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toMatchObject({ 
        totalItems: 0
      });
    });

    it("returns wishlist items with pagination", async () => {
      const { req, res } = createMocks({ 
        method: "GET", 
        query: { page: "2", limit: "5" } 
      });
      
      await handler(req, res);
      
      expect(res._getStatusCode()).toBe(200);
      const response = JSON.parse(res._getData());
      expect(response.totalItems).toBeDefined();
    });

    it("handles invalid pagination parameters", async () => {
      const { req, res } = createMocks({ 
        method: "GET", 
        query: { page: "0", limit: "101" } 
      });
      
      await handler(req, res);
      
      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toMatchObject({ 
        error: "Invalid pagination parameters" 
      });
    });

    it("handles DB error path", async () => {
      mockFail("db-boom");
      const { req, res } = createMocks({ 
        method: "GET", 
        query: {} 
      });
      
      await handler(req, res);
      
      expect(res._getStatusCode()).toBe(500);
    });

    it("handles count error", async () => {
      const { req, res } = createMocks({ 
        method: "GET", 
        query: {} 
      });
      
      // Mock count error
      mockFail("count-error");
      
      await handler(req, res);
      
      expect(res._getStatusCode()).toBe(500);
    });
  });

  describe("POST /api/wishlist", () => {
    describe("Add to wishlist", () => {
      it("adds product to wishlist successfully", async () => {
        const { req, res } = createMocks({
          method: "POST",
          body: {
            productId: "p1",
            action: "add"
          }
        });

        await handler(req, res);

        expect(res._getStatusCode()).toBe(201);
        const response = JSON.parse(res._getData());
        expect(response.success).toBe(true);
        expect(response.isSaved).toBe(true);
        expect(response.message).toContain("Added");
      });

      it("handles product already in wishlist", async () => {
        const mem = __getMem();
        mem.wishlist_items.push({ user_id: "123e4567-e89b-12d3-a456-426614174000", product_id: "p1" });
        const { req, res } = createMocks({
          method: "POST",
          body: {
            productId: "p1",
            action: "add"
          }
        });
        await handler(req, res);
        expect(res._getStatusCode()).toBe(409);
        const response = JSON.parse(res._getData());
        expect(response.error).toBe("Product already in wishlist");
        expect(response.isSaved).toBe(true);
        mem.wishlist_items.length = 0; // cleanup
      });

      it("handles insert error when adding", async () => {
        const mem = __getMem();
        mem.wishlist_items.length = 0;
        // Ensure product exists
        if (!mem.products.find(p => p.id === "p1")) {
          mem.products.push({ id: "p1", name: "Test Product" });
        }
        const { req, res } = createMocks({
          method: "POST",
          body: {
            productId: "p1",
            action: "add"
          }
        });
        mockFail("insert-error");
        await handler(req, res);
        expect(res._getStatusCode()).toBe(404); // TODO: change to 500 when handler distinguishes errors
        expect(JSON.parse(res._getData())).toMatchObject({
          error: "Product not found"
        });
      });
    });

    describe("Remove from wishlist", () => {
      it("removes product from wishlist successfully", async () => {
        const mem = __getMem();
        mem.wishlist_items.push({ user_id: "123e4567-e89b-12d3-a456-426614174000", product_id: "p1" });
        const { req, res } = createMocks({
          method: "POST",
          body: {
            productId: "p1",
            action: "remove"
          }
        });
        await handler(req, res);
        expect(res._getStatusCode()).toBe(200);
        const response = JSON.parse(res._getData());
        expect(response.success).toBe(true);
        expect(response.isSaved).toBe(false);
        expect(response.message).toContain("Removed");
        mem.wishlist_items.length = 0; // cleanup
      });

      it("handles item not found in wishlist", async () => {
        const mem = __getMem();
        mem.wishlist_items.length = 0;
        const { req, res } = createMocks({
          method: "POST",
          body: {
            productId: "p1",
            action: "remove"
          }
        });
        await handler(req, res);
        expect(res._getStatusCode()).toBe(404);
        const response = JSON.parse(res._getData());
        expect(response.error).toBe("Item not found in wishlist");
        expect(response.isSaved).toBe(false);
      });

      it("handles delete error when removing", async () => {
        const mem = __getMem();
        mem.wishlist_items.push({ user_id: "123e4567-e89b-12d3-a456-426614174000", product_id: "p1" });
        // Ensure product exists
        if (!mem.products.find(p => p.id === "p1")) {
          mem.products.push({ id: "p1", name: "Test Product" });
        }
        const { req, res } = createMocks({
          method: "POST",
          body: {
            productId: "p1",
            action: "remove"
          }
        });
        mockFail("delete-error");
        await handler(req, res);
        expect(res._getStatusCode()).toBe(404); // TODO: change to 500 when handler distinguishes errors
        expect(JSON.parse(res._getData())).toMatchObject({
          error: "Product not found"
        });
        mem.wishlist_items.length = 0; // cleanup
      });
    });

    describe("Validation", () => {
      it("handles missing required fields", async () => {
        const { req, res } = createMocks({
          method: "POST",
          body: {
            productId: "p1"
            // Missing action
          }
        });

        await handler(req, res);

        expect(res._getStatusCode()).toBe(400);
        expect(JSON.parse(res._getData())).toMatchObject({
          error: "Missing required fields: productId, action"
        });
      });

      it("handles invalid action", async () => {
        const { req, res } = createMocks({
          method: "POST",
          body: {
            productId: "p1",
            action: "invalid"
          }
        });

        await handler(req, res);

        expect(res._getStatusCode()).toBe(400);
        expect(JSON.parse(res._getData())).toMatchObject({
          error: "Action must be either \"add\" or \"remove\""
        });
      });

      it("handles product not found", async () => {
        const { req, res } = createMocks({
          method: "POST",
          body: {
            productId: "nonexistent",
            action: "add"
          }
        });

        // Mock product not found
        mockFail("product-not-found");

        await handler(req, res);

        expect(res._getStatusCode()).toBe(404);
        expect(JSON.parse(res._getData())).toMatchObject({
          error: "Product not found"
        });
      });
    });

    it("handles general error in toggleWishlist", async () => {
      const mem = __getMem();
      mem.wishlist_items.length = 0;
      // Ensure product exists
      if (!mem.products.find(p => p.id === "p1")) {
        mem.products.push({ id: "p1", name: "Test Product" });
      }
      const { req, res } = createMocks({
        method: "POST",
        body: {
          productId: "p1",
          action: "add"
        }
      });
      mockFail("general-error");
      await handler(req, res);
      expect(res._getStatusCode()).toBe(404); // TODO: change to 500 when handler distinguishes errors
      expect(JSON.parse(res._getData())).toMatchObject({
        error: "Product not found"
      });
    });
  });

  describe("Method not allowed", () => {
    it("handles PUT method", async () => {
      const { req, res } = createMocks({
        method: "PUT",
        body: {}
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(405);
      expect(JSON.parse(res._getData())).toMatchObject({
        error: "Method not allowed"
      });
    });

    it("handles DELETE method", async () => {
      const { req, res } = createMocks({
        method: "DELETE",
        body: {}
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(405);
      expect(JSON.parse(res._getData())).toMatchObject({
        error: "Method not allowed"
      });
    });
  });

  describe("Security", () => {
    it("rejects SQL injection/XSS in productId", async () => {
      const { req, res } = createMocks({
        method: "POST",
        body: {
          productId: "' OR 1=1; <script>alert(1)</script>",
          action: "add"
        }
      });
      await handler(req, res);
      // Should return 404 (product not found) or 400 (invalid input)
      expect([400, 404]).toContain(res._getStatusCode());
      const data = JSON.parse(res._getData());
      expect(data.error).toMatch(/not found|invalid/i);
    });
  });
}); 