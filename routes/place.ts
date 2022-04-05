import express from "express";
import {
  createReview,
  getPlaceByArea,
  getPlaceById,
  getReviewByPlaceId,
  removeReviewById,
  toggleLike,
} from "../controller/place";

const placeRouter = express.Router();

// place by 지역
placeRouter.get("/", getPlaceByArea);

// review 삭제
placeRouter.delete("/review/:id", removeReviewById);

// place id를 받아서 reivew 가져오기
placeRouter.get("/review", getReviewByPlaceId);

// review 작성
placeRouter.post("/review", createReview);

// TODO: toggle 로 동작하도록 해야됨
placeRouter.post("/like", toggleLike);

// place by ID
placeRouter.get("/:id", getPlaceById);

export default placeRouter;
