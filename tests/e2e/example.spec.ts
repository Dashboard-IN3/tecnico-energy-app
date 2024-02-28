import { test, expect } from "@playwright/test"

test("test", async ({ page }) => {
  await page.goto("http://localhost:3000/")
  await page.getByRole("link", { name: "Card Image Lisbon Building" }).click()
  await expect(page.getByText("Urban Data Visualizer")).toBeVisible()
})
