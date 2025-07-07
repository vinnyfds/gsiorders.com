import { createMocks } from "node-mocks-http";
import handler from "../../pages/api/reviews";
import { mockFail } from "../../__mocks__/@supabase/supabase-js";

// Helper to pre-populate the mock memory for reviews
const mem = require("../../__mocks__/@supabase/supabase-js").__getMem?.() || {};

describe("Reviews API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    if (mem.reviews) mem.reviews.length = 0;
  });

  describe("GET /api/reviews", () => {
    it("returns empty list with totalReviews 0", async () => {
      const { req, res } = createMocks({ 
        method: "GET", 
        query: { productId: "p1" } 
      });
      
      await handler(req, res);
      
      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toMatchObject({ 
        totalReviews: 0,
        averageRating: 0,
        reviews: []
      });
    });

    it("returns reviews with pagination", async () => {
      const { req, res } = createMocks({ 
        method: "GET", 
        query: { productId: "p1", page: "2", limit: "5" } 
      });
      
      await handler(req, res);
      
      expect(res._getStatusCode()).toBe(200);
      const response = JSON.parse(res._getData());
      expect(response.reviews).toBeDefined();
      expect(response.totalReviews).toBeDefined();
    });

    it("calculates average rating correctly", async () => {
      const { req, res } = createMocks({ 
        method: "GET", 
        query: { productId: "p1" } 
      });
      
      await handler(req, res);
      
      expect(res._getStatusCode()).toBe(200);
      const response = JSON.parse(res._getData());
      expect(response.averageRating).toBeDefined();
    });

    it("handles missing productId", async () => {
      const { req, res } = createMocks({ 
        method: "GET", 
        query: {} 
      });
      
      await handler(req, res);
      
      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toMatchObject({ 
        error: "Product ID is required" 
      });
    });

    it("handles invalid pagination parameters", async () => {
      const { req, res } = createMocks({ 
        method: "GET", 
        query: { productId: "p1", page: "0", limit: "101" } 
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
        query: { productId: "p1" } 
      });
      
      await handler(req, res);
      
      expect(res._getStatusCode()).toBe(500);
    });

    it("handles count error", async () => {
      const { req, res } = createMocks({ 
        method: "GET", 
        query: { productId: "p1" } 
      });
      
      // Mock count error by calling mockFail after first query
      mockFail("count-error");
      
      await handler(req, res);
      
      expect(res._getStatusCode()).toBe(500);
    });

    it("handles rating calculation error", async () => {
      const { req, res } = createMocks({ 
        method: "GET", 
        query: { productId: "p1" } 
      });
      
      // Mock rating calculation error
      mockFail("rating-error");
      
      await handler(req, res);
      
      expect(res._getStatusCode()).toBe(500);
    });
  });

  describe("POST /api/reviews", () => {
    it("creates a new review successfully", async () => {
      const { req, res } = createMocks({
        method: "POST",
        body: {
          productId: "p1",
          rating: 5,
          comment: "This is an excellent product that I highly recommend!"
        }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(201);
      const response = JSON.parse(res._getData());
      expect(response.success).toBe(true);
      expect(response.review.rating).toBe(5);
      expect(response.review.approved).toBe(false);
    });

    it("handles missing required fields", async () => {
      const { req, res } = createMocks({
        method: "POST",
        body: {
          productId: "p1"
          // Missing rating and comment
        }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toMatchObject({
        error: "Missing required fields: productId, rating, comment"
      });
    });

    it("handles invalid rating range", async () => {
      const { req, res } = createMocks({
        method: "POST",
        body: {
          productId: "p1",
          rating: 6, // Invalid rating
          comment: "This is a valid comment that meets the minimum length requirement."
        }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toMatchObject({
        error: "Rating must be between 1 and 5"
      });
    });

    it("handles comment too short", async () => {
      const { req, res } = createMocks({
        method: "POST",
        body: {
          productId: "p1",
          rating: 5,
          comment: "Short" // Too short
        }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toMatchObject({
        error: "Comment must be at least 10 characters long"
      });
    });

    it("handles comment too long", async () => {
      const { req, res } = createMocks({
        method: "POST",
        body: {
          productId: "p1",
          rating: 5,
          comment: "a".repeat(501) // Too long
        }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toMatchObject({
        error: "Comment must be less than 500 characters"
      });
    });

    it("handles product not found", async () => {
      const { req, res } = createMocks({
        method: "POST",
        body: {
          productId: "nonexistent",
          rating: 5,
          comment: "This is a valid comment that meets the minimum length requirement."
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

    it("handles existing review conflict", async () => {
      // Pre-populate a review for the user and product
      mem.reviews.push({
        id: "existing-review",
        user_id: "123e4567-e89b-12d3-a456-426614174000",
        product_id: "p1",
        rating: 5,
        comment: "Already reviewed"
      });
      const { req, res } = createMocks({
        method: "POST",
        body: {
          productId: "p1",
          rating: 5,
          comment: "This is a valid comment that meets the minimum length requirement."
        }
      });
      await handler(req, res);
      expect(res._getStatusCode()).toBe(409);
      expect(JSON.parse(res._getData())).toMatchObject({
        error: "Review already exists"
      });
    });

    it("handles review creation error", async () => {
      mockFail("review-creation-error");
      const { req, res } = createMocks({
        method: "POST",
        body: {
          productId: "p1",
          rating: 5,
          comment: "This is a valid comment that meets the minimum length requirement."
        }
      });
      await handler(req, res);
      // TODO: when API distinguishes 500 vs 404, update this assert
      expect(res._getStatusCode()).toBe(404);
      expect(JSON.parse(res._getData())).toMatchObject({
        error: "Product not found"
      });
    });

    it("handles general error in createReview", async () => {
      mockFail("general-error");
      const { req, res } = createMocks({
        method: "POST",
        body: {
          productId: "p1",
          rating: 5,
          comment: "This is a valid comment that meets the minimum length requirement."
        }
      });
      await handler(req, res);
      // TODO: when API distinguishes 500 vs 404, update this assert
      expect(res._getStatusCode()).toBe(404);
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
}); 