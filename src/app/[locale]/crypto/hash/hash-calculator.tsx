"use client";

import { AlertTriangle, Copy, Hash, RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { HASH_LENGTHS, type HashAlgorithm } from "@/lib/converters/crypto/hash";
import { useHashCalculatorStore } from "@/stores/hash-calculator-store";

const ALGORITHMS: HashAlgorithm[] = ["MD5", "SHA-1", "SHA-256", "SHA-512"];

export function HashCalculator() {
  const t = useTranslations("calculator.crypto.hash");
  const commonT = useTranslations("common");
  const { text, algorithm, result, isCalculating, error, setText, setAlgorithm, reset } =
    useHashCalculatorStore();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (result?.hash) {
      try {
        await navigator.clipboard.writeText(result.hash);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success("Copied to clipboard");
      } catch (error) {
        console.error("Failed to copy to clipboard:", error);
        toast.error("Failed to copy to clipboard");
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* MD5 Security Warning */}
      {algorithm === "MD5" && (
        <Card className="border-destructive bg-destructive/5">
          <CardContent className="pt-6 flex gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-destructive mb-1">{t("warnings.md5Title")}</p>
              <p className="text-sm text-muted-foreground">{t("warnings.md5Description")}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hash className="h-5 w-5" />
            {t("input")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="algorithm">{t("algorithm")}</Label>
            <Select value={algorithm} onValueChange={(v) => setAlgorithm(v as HashAlgorithm)}>
              <SelectTrigger id="algorithm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ALGORITHMS.map((algo) => (
                  <SelectItem key={algo} value={algo}>
                    {algo} ({HASH_LENGTHS[algo]} bits)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="text">{t("textToHash")}</Label>
            <Textarea
              id="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t("placeholder")}
              rows={4}
              className="font-mono"
            />
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Results Section */}
      {result?.hash && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{t("result")}</span>
              <Button variant="outline" size="sm" onClick={handleCopy}>
                <Copy className="h-4 w-4 mr-2" />
                {copied ? commonT("copied") : commonT("copy")}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>{t("hashOutput")}</Label>
              <div className="p-4 bg-muted rounded-md font-mono text-sm break-all">
                {isCalculating ? t("calculating") : result.hash}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">{t("inputLength")}:</span>{" "}
                <span className="font-medium">
                  {result.inputLength} {t("characters")}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">{t("hashLength")}:</span>{" "}
                <span className="font-medium">
                  {result.hashLength} {t("hexChars")}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reset Button */}
      <div className="flex justify-end">
        <Button variant="outline" onClick={reset}>
          <RotateCcw className="h-4 w-4 mr-2" />
          {commonT("reset")}
        </Button>
      </div>
    </div>
  );
}
