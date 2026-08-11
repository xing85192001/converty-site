"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { InputField, ResultGrid } from "@/components/converter";
import { COMMON_SCREENS, calculateAspectFit } from "@/lib/converters/photo/aspect-fit";

export function AspectFitCalculator() {
  const tMath = useTranslations("calculator.math");
  const [imageWidth, setImageWidth] = useState("1920");
  const [imageHeight, setImageHeight] = useState("1080");
  const [screenWidth, setScreenWidth] = useState("2560");
  const [screenHeight, setScreenHeight] = useState("1440");

  const calcResult = calculateAspectFit(
    parseInt(imageWidth) || 0,
    parseInt(imageHeight) || 0,
    parseInt(screenWidth) || 0,
    parseInt(screenHeight) || 0
  );
  const result = calcResult.ok ? calcResult.value : null;

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <h3 className="font-medium">Image Dimensions</h3>
          <InputField
            id="imageWidth"
            label={tMath("width")}
            value={imageWidth}
            onChange={setImageWidth}
            unit="px"
            min={1}
          />
          <InputField
            id="imageHeight"
            label={tMath("height")}
            value={imageHeight}
            onChange={setImageHeight}
            unit="px"
            min={1}
          />
        </div>
        <div className="space-y-4">
          <h3 className="font-medium">Screen Dimensions</h3>
          <InputField
            id="screenWidth"
            label={tMath("width")}
            value={screenWidth}
            onChange={setScreenWidth}
            unit="px"
            min={1}
          />
          <InputField
            id="screenHeight"
            label={tMath("height")}
            value={screenHeight}
            onChange={setScreenHeight}
            unit="px"
            min={1}
          />
          <div className="flex flex-wrap gap-2">
            {COMMON_SCREENS.map((screen) => (
              <button
                key={screen.name}
                onClick={() => {
                  setScreenWidth(screen.width.toString());
                  setScreenHeight(screen.height.toString());
                }}
                className="text-xs px-2 py-1 rounded border hover:bg-muted/50"
              >
                {screen.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {result && (
        <div className="space-y-6">
          <ResultGrid
            results={[
              { label: "Fitted Width", value: result.fittedWidth, unit: "px" },
              { label: "Fitted Height", value: result.fittedHeight, unit: "px" },
              { label: "Scale Factor", value: result.scale },
              { label: "Fill", value: result.fillPercentage, unit: "%" },
            ]}
            columns={2}
          />

          <div className="p-4 rounded-lg border bg-muted/50">
            <p className="text-sm text-muted-foreground mb-1">Letterboxing</p>
            <p className="font-medium">
              {result.letterboxing === "none"
                ? "Perfect fit - no letterboxing"
                : result.letterboxing === "horizontal"
                  ? `${result.letterboxSize}px bars top & bottom`
                  : `${result.letterboxSize}px bars left & right`}
            </p>
          </div>

          <div className="flex justify-center p-4 border rounded-lg bg-muted/20">
            <div
              className="relative bg-muted border-2"
              style={{ width: 200, height: 200 * (parseInt(screenHeight) / parseInt(screenWidth)) }}
            >
              <div
                className="absolute bg-primary/30 border border-primary"
                style={{
                  width: `${result.fillPercentage}%`,
                  height:
                    result.letterboxing === "horizontal"
                      ? `${(result.fittedHeight / parseInt(screenHeight)) * 100}%`
                      : "100%",
                  left:
                    result.letterboxing === "vertical"
                      ? `${(result.letterboxSize / parseInt(screenWidth)) * 100}%`
                      : 0,
                  top:
                    result.letterboxing === "horizontal"
                      ? `${(result.letterboxSize / parseInt(screenHeight)) * 100}%`
                      : 0,
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
