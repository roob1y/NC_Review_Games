const db = require("../db/connection");
const { checkExists } = require("../db/seeds/utils");

function fetchReview(reviewId) {
  return db
    .query(
      `
      SELECT reviews.*, COUNT(comments.review_id) ::INT AS comment_count FROM reviews
      LEFT JOIN comments ON comments.review_id = reviews.review_id
      WHERE reviews.review_id = $1
      GROUP BY reviews.review_id;
      `,
      [reviewId]
    )
    .then(({ rows: review }) => {
      if (review.length === 0) {
        return Promise.reject({ status: 404, msg: "review id not found" });
      } else {
        return review[0];
      }
    });
}

function patchReview(reviewId, incVotes) {
  return db
    .query(
      `
        UPDATE reviews
        SET votes = votes + $1
        WHERE review_id = $2
        RETURNING *
      `,
      [incVotes, reviewId]
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "review id not found" });
      } else {
        return rows;
      }
    });
}

function fetchAllReviews(
  sortBy = "created_at",
  order = "desc",
  limit = 10,
  p = 1
) {
  const validSortByValues = [
    "created_at",
    "category",
    "title",
    "designer",
    "owner",
    "review_img_url",
    "review_body",
    "votes",
  ];
  const validOrderValues = ["asc", "desc"];

  if (!validSortByValues.includes(sortBy)) {
    return Promise.reject({ status: 400, msg: "invalid sort by value" });
  }
  if (!validOrderValues.includes(order)) {
    return Promise.reject({ status: 400, msg: "invalid order value" });
  }
  return db
    .query(
      `
      SELECT reviews.*, COUNT(comments.review_id) ::INT AS comment_count FROM reviews
      LEFT JOIN comments ON comments.review_id = reviews.review_id
      GROUP BY reviews.review_id
      ORDER BY ${sortBy} ${order}
      LIMIT ${limit} OFFSET ${p - 1}
    `
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        Promise.reject({ status: 400, msg: "invalid sort by value" });
      } else {
        return rows;
      }
    });
}

function addReview({ owner, title, review_body, designer, category }) {
  return db
    .query(
      `
    INSERT INTO reviews (owner, title, review_body, designer, category)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
    `,
      [owner, title, review_body, designer, category]
    )
    .then(({ rows }) => {
      return rows[0];
    });
}

function removeReviewById(reviewId) {
  return checkExists("reviews", "review_id", reviewId).then(() => {
    return db
      .query(`DELETE FROM reviews WHERE review_id = $1`, [reviewId])
      .then(({ rows }) => {
        return rows;
      });
  });
}

module.exports = {
  fetchReview,
  patchReview,
  fetchAllReviews,
  addReview,
  removeReviewById,
};
