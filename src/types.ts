export type MealType = "breakfast" | "dinner" | "lunch" | "snack";

export type MealItem = {
  type: MealType;
  callories: number;
};
