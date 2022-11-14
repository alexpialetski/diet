const path = require("path");
const fs = require("fs/promises");
const R = require("ramda");
const { joinImages } = require("join-images");

const ASSETS_PATH = path.join(__dirname, "assets");

const MEAL_ARRAY = ["breakfast", "dinner", "lunch", "snack"];

const getRandomCombination = (items) =>
  items[Math.floor(Math.random() * items.length)];

const appendWithString = (appendedString) =>
  String.prototype.concat.bind(appendedString);

const appendAssetsPath = appendWithString(`${ASSETS_PATH}\\`);

const readFromFolder = R.pipe(appendAssetsPath, fs.readdir);

const getCalloriesForMeal = R.pipe(
  readFromFolder,
  R.andThen(R.map(Number.parseInt))
);

const getAllPossibleCombinations = (meals) =>
  R.liftN(4, (...meals) => meals)(...meals);

const isCalInsideOfRange = R.pipe(
  R.sum,
  R.both(R.gt(R.__, 2500), R.lt(R.__, 2650))
);

const prepareFileName = R.pipe(
  (callories, index) =>
    appendWithString(`${MEAL_ARRAY[index]}\\`, callories)(callories),
  appendAssetsPath,
  R.concat(R.__, ".png")
);

const getTheResultDiet = R.pipe(
  R.addIndex(R.map)(prepareFileName),
  joinImages,
  R.andThen((img) => img.toFile("result.png"))
);

const getCombinationsWithinRange = R.pipe(
  R.pipe(R.map(getCalloriesForMeal), (arr) => Promise.all(arr)),
  R.andThen(getAllPossibleCombinations),
  R.andThen(R.filter(isCalInsideOfRange))
);

const getMeals = () => fs.readdir(ASSETS_PATH);

getMeals()
  .then(getCombinationsWithinRange)
  .then(getRandomCombination)
  .then(getTheResultDiet)
  .catch(console.log);
