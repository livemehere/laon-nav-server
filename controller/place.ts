import express from "express";
import { Like, Place, Review, User } from "../model";
import * as SQ from "sequelize";
import { ResponseData } from "../custom";
const Op = SQ.Op;

// sort = reivew, reivew_asc (default : rating)
export const getPlaceByArea = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  let { areaName, sort } = req.query;

  if (!sort) {
    sort = "default";
  }
  const orderOption: any = {
    default: [["rating", "DESC"]],
    reivew: [[SQ.Sequelize.literal("reivewCnt"), "DESC"]],
    reivew_asc: [[SQ.Sequelize.literal("reivewCnt"), "ASC"]],
  };

  const result = await Place.findAll({
    where: {
      address: {
        [Op.like]: `${areaName}%`,
      },
    },
    attributes: [
      "id",
      "name",
      "summary",
      "description",
      "heartCount",
      "rating",
      "lat",
      "long",
      "imgURL",
      "type",
      "address",
      [SQ.Sequelize.fn("COUNT", SQ.Sequelize.col("reviews.id")), "reivewCnt"],
    ],
    include: {
      model: Review,
      attributes: [],
    },
    group: ["id"],
    order: orderOption[sort as string],
    // ["rating", "DESC"]
  });
  let responseData: ResponseData = {
    isSuccess: true,
    message: `${areaName} 지역의 장소리스트입니다`,
    data: result,
  };
  res.status(200).json(responseData);
};

export const getLikedPlaceByUserId = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const { userid } = req.params;
  const result = await Like.findAll({
    where: {
      userId: Number(userid),
    },
    attributes: [],
    include: { model: Place },
  });
  let responseData: ResponseData = {
    isSuccess: true,
    message: `${userid}유저의 찜한 장소리스트입니다`,
    data: result,
  };
  res.status(200).json(responseData);
};

export const getPlaceById = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const { id } = req.params;
  const result = await Place.findByPk(Number(id));
  console.log(result);
  let responseData: ResponseData = {
    isSuccess: result ? true : false,
    message: ``,
    data: result ? result.toJSON() : {},
  };
  res.status(200).json(responseData);
};

export const createReview = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const { placeId, userId, content, rate } = req.body;
  const result = await Review.create({
    rate,
    content,
    userId,
    placeId,
  });

  let responseData: ResponseData = {
    isSuccess: result ? true : false,
    message: `리뷰가 성공적으로 작성되었습니다`,
    data: result ? result.toJSON() : {},
  };
  res.status(201).json(responseData);
};

export const getReviewByPlaceId = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const { placeId } = req.query;
  const result = await Review.findAll({
    where: {
      placeId: Number(placeId),
    },
    include: [{ model: User, as: "user", attributes: ["nickname"] }],
  });

  let responseData: ResponseData = {
    isSuccess: result ? true : false,
    message: `${placeId} 의 리뷰목록입니다.`,
    data: result ? result : {},
  };
  res.status(201).json(responseData);
};

export const removeReviewById = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const { id } = req.params;
  const result = await Review.destroy({
    where: {
      id,
    },
  });

  let responseData: ResponseData = {
    isSuccess: result ? true : false,
    message: ``,
    data: {},
  };
  res.status(200).json(responseData);
};

export const toggleLike = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const { userId, placeId } = req.body;
  let result;
  const isExist = await Like.findOne({
    where: {
      userId: Number(userId),
      placeId: Number(placeId),
    },
  });
  if (isExist) {
    await Like.destroy({
      where: {
        userId: Number(userId),
        placeId: Number(placeId),
      },
    });

    await Place.increment("hearCount", { by: 1 });
  } else {
    result = await Like.create({
      userId: Number(userId),
      placeId: Number(placeId),
    });

    await Place.decrement("hearCount", { by: 1 });
  }

  let responseData: ResponseData = {
    isSuccess: true,
    message: isExist ? "찜(좋아요) 취소되었습니다." : "찜(좋아요) 하였습니다",
    data: result ? { ...result.toJSON } : {},
  };
  res.status(200).json(responseData);
};
