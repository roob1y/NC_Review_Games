const seed = require("../db/seeds/seed");
const app = require("../app.js");
const request = require("supertest");
const db = require("../db/connection");
const {
  categoryData,
  commentData,
  reviewData,
  userData,
} = require("../db/data/test-data/index");

beforeEach(() => seed({ categoryData, commentData, reviewData, userData }));

afterAll(() => db.end());

describe("GET /api/categories", () => {
  test("200: should return a list of categories ", () => {
    return request(app)
      .get("/api/categories")
      .expect(200)
      .then(({ body }) => {
        const { categories } = body;
        categories.forEach((category) => {
          expect(category).toMatchObject({
            slug: expect.any(String),
            description: expect.any(String),
          });
        });
      });
  });
  test("404: responds with a not found message ", () => {
    return request(app)
      .get("/api/catgorties")
      .expect(404)
      .then((res) => {
        expect(res.body.msg).toBe("path not found");
      });
  });
});
describe("GET /api/reviews/:review_id", () => {
  test("200: should return an object of a review ", () => {
    return request(app)
      .get("/api/reviews/1")
      .expect(200)
      .then(({ body }) => {
        const { review } = body;
        expect(review).toMatchObject({
          review_id: expect.any(Number),
          title: expect.any(String),
          review_body: expect.any(String),
          designer: expect.any(String),
          review_img_url: expect.any(String),
          votes: expect.any(Number),
          category: expect.any(String),
          owner: expect.any(String),
          created_at: expect.any(String),
        });
      });
  });
  test("404: responds with a not found message ", () => {
    return request(app)
      .get("/api/reviews/99999999")
      .expect(404)
      .then((res) => {
        expect(res.body.msg).toBe("review id not found");
      });
  });
  test("400: responds with a 'invalid data type in query'", () => {
    return request(app)
      .get("/api/reviews/blue")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("invalid data type in query");
      });
  });
});
describe("PATCH /api/reviews/:review_id", () => {
  test("200: should return an object of an updated review ", () => {
    return request(app)
      .patch("/api/reviews/2").send()
      .expect(200)
      .then(({ body }) => {
        const { review } = body;
        expect(review.votes).toMatchObject({
            votes: 5
        });
      });
  });
});