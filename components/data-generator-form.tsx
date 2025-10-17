"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Download, Loader2, Eye } from "lucide-react"
import { DataPreview } from "@/components/data-preview"

type DataType = "mock" | "real"
type Format = "csv" | "json" | "excel"

export function DataGeneratorForm() {
  const [dataType, setDataType] = useState<DataType>("mock")
  const [format, setFormat] = useState<Format>("json")
  const [prompt, setPrompt] = useState("")
  const [rows, setRows] = useState("10")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedData, setGeneratedData] = useState<any[] | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      alert("Please describe the data you want to generate")
      return
    }

    setIsGenerating(true)
    setShowPreview(false)

    try {
      const response = await fetch("/api/generate-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataType, format, prompt, rows: Number.parseInt(rows) }),
      })

      const data = await response.json()

      if (data.error) {
        alert(data.error)
        return
      }

      setGeneratedData(data.data)
      setShowPreview(true)
    } catch (error) {
      console.error("[v0] Error generating data:", error)
      alert("Failed to generate data. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = async () => {
    if (!generatedData) return

    try {
      const response = await fetch("/api/download-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: generatedData, format, prompt }),
      })

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      const filename =
        prompt
          .slice(0, 30)
          .replace(/[^a-z0-9]/gi, "-")
          .toLowerCase() || "data"
      a.download = `${filename}.${format === "excel" ? "xlsx" : format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("[v0] Error downloading data:", error)
      alert("Failed to download data. Please try again.")
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-card-foreground">Configure Data Generation</CardTitle>
          <CardDescription className="text-muted-foreground">
            Describe the data you want to generate using natural language
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Data Type */}
          <div className="space-y-3">
            <Label className="text-card-foreground">Data Type</Label>
            <RadioGroup value={dataType} onValueChange={(v) => setDataType(v as DataType)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="mock" id="mock" />
                <Label htmlFor="mock" className="font-normal text-card-foreground cursor-pointer">
                  Mock Data (AI-Generated)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="real" id="real" />
                <Label htmlFor="real" className="font-normal text-card-foreground cursor-pointer">
                  Real Data (AI-Powered)
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-3">
            <Label htmlFor="prompt" className="text-card-foreground">
              Data Description
            </Label>
            <Textarea
              id="prompt"
              placeholder={
                dataType === "mock"
                  ? "Example: Generate customer data with name, email, age, purchase history, and loyalty status"
                  : "Example: Generate real-time stock market data for tech companies with prices, volume, and market cap"
              }
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="bg-background text-foreground min-h-[100px] resize-none"
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              Describe the type of data, fields, and any specific requirements you need
            </p>
          </div>

          {/* Format */}
          <div className="space-y-3">
            <Label htmlFor="format" className="text-card-foreground">
              Output Format
            </Label>
            <Select value={format} onValueChange={(v) => setFormat(v as Format)}>
              <SelectTrigger id="format" className="bg-background text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
                <SelectItem value="excel">Excel (XLSX)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Number of Rows */}
          <div className="space-y-3">
            <Label htmlFor="rows" className="text-card-foreground">
              Number of Rows
            </Label>
            <Input
              id="rows"
              type="number"
              min="1"
              max="100"
              value={rows}
              onChange={(e) => setRows(e.target.value)}
              className="bg-background text-foreground"
            />
            <p className="text-xs text-muted-foreground">Maximum 100 rows for optimal performance</p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Eye className="mr-2 h-4 w-4" />
                  Generate & Preview
                </>
              )}
            </Button>
            {generatedData && (
              <Button
                onClick={handleDownload}
                variant="outline"
                className="border-border text-foreground hover:bg-accent hover:text-accent-foreground bg-transparent"
              >
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      {showPreview && generatedData && <DataPreview data={generatedData} format={format} domain={prompt} />}
    </div>
  )
}
