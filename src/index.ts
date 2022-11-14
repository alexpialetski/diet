import path from "path";
import fs from "fs/promises";
import * as R from "ramda";
import { joinImages } from "join-images";
import { fileURLToPath } from "url";

import { MealItem, MealType } from "./types";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const ASSETS_PATH = path.join(__dirname, "assets");

const getRandomCombination = (items: MealItem[][]): MealItem[] =>
  items[Math.floor(Math.random() * items.length)];

const appendWithString = (appendedString: string) =>
  String.prototype.concat.bind(appendedString);

const appendAssetsPath = appendWithString(`${ASSETS_PATH}\\`);

const readFromFolder = R.pipe(appendAssetsPath, (path) => fs.readdir(path));

const getCalloriesForMeal = (mealType: MealType) =>
  R.pipe(
    readFromFolder,
    R.andThen(
      R.map<string, MealItem>((callories) => ({
        type: mealType,
        callories: parseInt(callories),
      }))
    )
  )(mealType);

const getAllPossibleCombinations = (meals: MealItem[][]) =>
  R.liftN<number, (...args: MealItem[]) => MealItem[]>(
    4,
    (...args) => args
    // @ts-expect-error types for liftN are not the best
  )(...meals);

const isCalInsideOfRange = R.pipe(
  R.map<MealItem, number>((item) => item.callories),
  R.sum,
  R.both(R.gt(R.__, 2500), R.lt(R.__, 2650))
);

const prepareFileName = R.pipe(
  (meal: MealItem) => `${meal.type}\\${meal.callories}`,
  appendAssetsPath,
  R.concat(R.__, ".png")
);

const getTheResultDiet = R.pipe(
  R.addIndex<MealItem>(R.map)(prepareFileName),
  joinImages,
  R.andThen((img) => img.toFile("result.png"))
);

const getCombinationsWithinRange = R.pipe(
  R.pipe(R.map(getCalloriesForMeal), (arr) => Promise.all(arr)),
  R.andThen(getAllPossibleCombinations),
  R.andThen(R.filter(isCalInsideOfRange))
);

const getMeals = (): Promise<MealType[]> =>
  Promise.resolve(["breakfast", "lunch", "dinner", "snack"]);

getMeals()
  .then(getCombinationsWithinRange)
  .then(getRandomCombination)
  .then(getTheResultDiet)
  .catch(console.log);
