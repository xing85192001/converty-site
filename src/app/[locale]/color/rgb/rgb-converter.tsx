"use client";

import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";
import { ResultGrid } from "@/components/converter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  type ColorConversion,
  cmykToRgb,
  convertFromHex,
  convertFromRgb,
  hslToRgb,
} from "@/lib/converters/color/rgb";

export function RgbConverter() {
  const t = useTranslations("calculator.labels");
  const tResults = useTranslations("calculator.results");
  const tColor = useTranslations("calculator.color");

  const [inputMode, setInputMode] = useState<"rgb" | "hex" | "hsl" | "cmyk">("rgb");
  const [rgb, setRgb] = useState({ r: 66, g: 133, b: 244 }); // Google blue
  const [hex, setHex] = useState("#4285F4");
  const [hsl, setHsl] = useState({ h: 217, s: 89, l: 61 });
  const [cmyk, setCmyk] = useState({ c: 73, m: 45, y: 0, k: 4 });
  const [result, setResult] = useState<ColorConversion | null>(null);

  const convert = useCallback(() => {
    let conversion: ColorConversion | null = null;

    switch (inputMode) {
      case "rgb":
        conversion = convertFromRgb(rgb.r, rgb.g, rgb.b);
        break;
      case "hex": {
        const hexResult = convertFromHex(hex);
        conversion = hexResult.ok ? hexResult.value : null;
        break;
      }
      case "hsl": {
        const rgbFromHsl = hslToRgb(hsl.h, hsl.s, hsl.l);
        conversion = convertFromRgb(rgbFromHsl.r, rgbFromHsl.g, rgbFromHsl.b);
        break;
      }
      case "cmyk": {
        const rgbFromCmyk = cmykToRgb(cmyk.c, cmyk.m, cmyk.y, cmyk.k);
        conversion = convertFromRgb(rgbFromCmyk.r, rgbFromCmyk.g, rgbFromCmyk.b);
        break;
      }
    }

    setResult(conversion);

    // Sync all values
    if (conversion) {
      setRgb(conversion.rgb);
      setHex(conversion.hex);
      setHsl(conversion.hsl);
      setCmyk(conversion.cmyk);
    }
  }, [inputMode, rgb, hex, hsl, cmyk]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{tColor("colorConverter") || "Color Converter"}</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={inputMode} onValueChange={(v) => setInputMode(v as typeof inputMode)}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="rgb">RGB</TabsTrigger>
              <TabsTrigger value="hex">HEX</TabsTrigger>
              <TabsTrigger value="hsl">HSL</TabsTrigger>
              <TabsTrigger value="cmyk">CMYK</TabsTrigger>
            </TabsList>

            <TabsContent value="rgb" className="space-y-4 mt-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>R (0-255)</Label>
                  <Input
                    type="number"
                    min={0}
                    max={255}
                    value={rgb.r}
                    onChange={(e) => setRgb({ ...rgb, r: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>G (0-255)</Label>
                  <Input
                    type="number"
                    min={0}
                    max={255}
                    value={rgb.g}
                    onChange={(e) => setRgb({ ...rgb, g: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>B (0-255)</Label>
                  <Input
                    type="number"
                    min={0}
                    max={255}
                    value={rgb.b}
                    onChange={(e) => setRgb({ ...rgb, b: Number(e.target.value) })}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="hex" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>HEX Color</Label>
                <Input
                  type="text"
                  value={hex}
                  onChange={(e) => setHex(e.target.value)}
                  placeholder="#4285F4"
                />
              </div>
            </TabsContent>

            <TabsContent value="hsl" className="space-y-4 mt-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>H (0-360)</Label>
                  <Input
                    type="number"
                    min={0}
                    max={360}
                    value={hsl.h}
                    onChange={(e) => setHsl({ ...hsl, h: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>S (0-100%)</Label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={hsl.s}
                    onChange={(e) => setHsl({ ...hsl, s: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>L (0-100%)</Label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={hsl.l}
                    onChange={(e) => setHsl({ ...hsl, l: Number(e.target.value) })}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="cmyk" className="space-y-4 mt-4">
              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>C (%)</Label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={cmyk.c}
                    onChange={(e) => setCmyk({ ...cmyk, c: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>M (%)</Label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={cmyk.m}
                    onChange={(e) => setCmyk({ ...cmyk, m: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Y (%)</Label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={cmyk.y}
                    onChange={(e) => setCmyk({ ...cmyk, y: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>K (%)</Label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={cmyk.k}
                    onChange={(e) => setCmyk({ ...cmyk, k: Number(e.target.value) })}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <button
            type="button"
            onClick={convert}
            className="w-full mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            {t("convert") || "Convert"}
          </button>
        </CardContent>
      </Card>

      {result && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>{tColor("colorPreview") || "Color Preview"}</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="w-full h-32 rounded-lg border"
                style={{ backgroundColor: result.hex }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{tResults("result") || "Conversion Results"}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResultGrid
                results={[
                  {
                    label: "RGB",
                    value: `rgb(${result.rgb.r}, ${result.rgb.g}, ${result.rgb.b})`,
                  },
                  { label: "HEX", value: result.hex },
                  {
                    label: "HSL",
                    value: `hsl(${result.hsl.h}, ${result.hsl.s}%, ${result.hsl.l}%)`,
                  },
                  {
                    label: "CMYK",
                    value: `cmyk(${result.cmyk.c}%, ${result.cmyk.m}%, ${result.cmyk.y}%, ${result.cmyk.k}%)`,
                  },
                ]}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{tColor("cssValues") || "CSS Values"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="p-2 bg-muted rounded font-mono text-sm">
                {`color: ${result.hex};`}
              </div>
              <div className="p-2 bg-muted rounded font-mono text-sm">
                {`color: rgb(${result.rgb.r}, ${result.rgb.g}, ${result.rgb.b});`}
              </div>
              <div className="p-2 bg-muted rounded font-mono text-sm">
                {`color: hsl(${result.hsl.h}, ${result.hsl.s}%, ${result.hsl.l}%);`}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
