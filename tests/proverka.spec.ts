import { test, expect } from "@playwright/test";
import { join } from "path";
import { existsSync, mkdirSync } from "fs";

const SCREENSHOTS_DIR = join(__dirname, "../screenshots");
const GOLDEN_DIR = join(__dirname, "../golden");

test.describe("Google Visual Tests", () => {
  test.beforeAll(() => {
    // Создаём директории для скриншотов, если их нет
    [SCREENSHOTS_DIR, GOLDEN_DIR].forEach((dir) => {
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }
    });
  });

  test("visual comparison of Google homepage", async ({ page }) => {
    // Устанавливаем размер viewport
    await page.setViewportSize({ width: 1920, height: 1080 });

    // Переходим на страницу
    await page.goto("https://www.google.com");

    // Ждём, пока логотип станет видимым
    const logo = page.locator('img[alt="Google"]');
    await expect(logo).toBeVisible();

    // Делаем скриншот всей страницы
    const screenshot = await page.screenshot({
      path: join(SCREENSHOTS_DIR, "current-homepage.png"),
      fullPage: true,
    });

    // Сравниваем с golden image, если он существует
    const goldenPath = join(GOLDEN_DIR, "homepage.png");
    if (existsSync(goldenPath)) {
      // Сравниваем скриншоты с допустимым отклонением в 0.1%
      expect(screenshot).toMatchSnapshot(goldenPath, {
        threshold: 0.001,
        maxDiffPixels: 100,
      });
    }

    // Делаем скриншот только логотипа
    const logoScreenshot = await logo.screenshot({
      path: join(SCREENSHOTS_DIR, "current-logo.png"),
    });

    // Сравниваем логотип с golden image
    const goldenLogoPath = join(GOLDEN_DIR, "logo.png");
    if (existsSync(goldenLogoPath)) {
      expect(logoScreenshot).toMatchSnapshot(goldenLogoPath, {
        threshold: 0.001,
      });
    }

    // Дополнительные проверки
    await test.step("verify logo properties", async () => {
      const logoBox = await logo.boundingBox();
      expect(logoBox?.width).toBeGreaterThan(0);
      expect(logoBox?.height).toBeGreaterThan(0);

      const isLogoVisible = await logo.isVisible();
      expect(isLogoVisible).toBeTruthy();

      const logoSrc = await logo.getAttribute("src");
      expect(logoSrc).toBeTruthy();
    });
  });
});
