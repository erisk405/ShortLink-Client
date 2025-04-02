import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { useDebounce } from "use-debounce";
import axios from "axios";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import { Download, BarChart2, History } from "lucide-react"; // Add History icon
import LoadingEffect from "./components/loading";
import GeoTrackingStats from "./components/geo-tracking-stats";
import type { PreviewData, StatsData, UrlHistory } from "~/interface/type";
import SimpleMap from "./components/simple-map";
import { HistoryPage } from "./components/history";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";
import { Label } from "~/components/ui/label";

// Schema สำหรับ URL
const urlSchema = z.object({
  url: z.string().min(1, "กรุณาใส่ URL").url("URL ไม่ถูกต้อง"),
});

// Schema สำหรับการติดตาม (ใช้ short URL)
const trackingShortUrlSchema = z.object({
  url: z.string().min(1, "กรุณาใส่ Short URL"),
});

// Schema สำหรับการติดตาม (ใช้ original URL)
const trackingOriginalUrlSchema = z.object({
  url: z.string().min(1, "กรุณาใส่ Original URL").url("URL ไม่ถูกต้อง"),
});

type UrlFormData = z.infer<typeof urlSchema>;

// กำหนดประเภทของโหมดการติดตาม
type TrackingType = "short" | "original";

const fetchPreview = async (url: string): Promise<PreviewData> => {
  try {
    const response = await axios.get(`https://api.microlink.io`, {
      params: { url },
    });
    const data = response.data;
    if (data.status === "success") {
      return {
        title: data.data.title || "No title available",
        description: data.data.description || "No description available",
        image: data.data.image?.url || null,
      };
    }
    throw new Error("Failed to fetch preview");
  } catch (error) {
    return {
      title: "Unable to load preview",
      description: "Could not fetch metadata for this URL.",
      image: null,
    };
  }
};
const locations = [
  {
    city: "Bangkok",
    country: "Thailand",
    latitude: 13.7563,
    longitude: 100.5018,
    count: 15,
  },
  {
    city: "New York",
    country: "USA",
    latitude: 40.7128,
    longitude: -74.006,
    count: 8,
  },
  {
    city: "London",
    country: "UK",
    latitude: 51.5074,
    longitude: -0.1278,
    count: 4,
  },
];
const fetchStatsByShortUrl = async (shortUrl: string): Promise<StatsData> => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/location-stats?shortCode=${shortUrl}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching stats:", error);
    return { totalClicks: 0, latestGeoLocation: null, locations: [] };
  }
};

const fetchStatsByOriginalUrl = async (
  originalUrl: string
): Promise<StatsData> => {
  try {
    const response = await axios.get(
      `${
        import.meta.env.VITE_API_URL
      }/location-stats?originalUrl=${originalUrl}`
    );
    console.log("response", response.data);

    return response.data;
  } catch (error) {
    console.error("Error fetching stats:", error);
    return { totalClicks: 0, latestGeoLocation: null, locations: [] };
  }
};

const fetchUrlHistory = async (): Promise<UrlHistory[]> => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/history`);
    return response.data;
  } catch (error) {
    console.error("Error fetching URL history:", error);
    return [];
  }
};

export function Welcome() {
  const [isTrackingMode, setIsTrackingMode] = useState(false);
  const [trackingType, setTrackingType] = useState<TrackingType>("short");
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<UrlHistory[]>([]);
  const [shortenedUrl, setShortenedUrl] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false); // เพิ่ม state ใหม่สำหรับสถานะปุ่ม
  const qrCodeRef = useRef<SVGSVGElement>(null);

  // เลือก Schema ตามโหมดการทำงาน
  const getFormSchema = () => {
    if (!isTrackingMode) return urlSchema;
    return trackingType === "short"
      ? trackingShortUrlSchema
      : trackingOriginalUrlSchema;
  };

  const form = useForm<UrlFormData>({
    resolver: zodResolver(getFormSchema()),
    defaultValues: { url: "" },
    mode: "onChange",
  });

  const [debouncedUrl] = useDebounce(form.watch("url"), 500);

  const copyUrl = (url: string) => {
    try {
      navigator.clipboard.writeText(url);
      setIsCopied(true); // เปลี่ยนสถานะเมื่อคัดลอกสำเร็จ
      toast("URL คัดลอกแล้ว", { description: "คัดลอกไปยังคลิปบอร์ดแล้ว" });
    } catch (error) {
      console.error({ message: error });
    }
  };
  const onSubmit = async (data: UrlFormData) => {
    setIsLoading(true);
    try {
      if (isTrackingMode) {
        let statsData;
        if (trackingType === "short") {
          statsData = await fetchStatsByShortUrl(data.url);
        } else {
          statsData = await fetchStatsByOriginalUrl(data.url);
        }
        setStats(statsData);
      } else {
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/shorten`,
          {
            originalUrl: data.url,
          }
        );
        const newUrl = response.data.shortUrl;
        setShortenedUrl(newUrl);
        form.setValue("url", newUrl);
        copyUrl(newUrl);
      }
    } catch (error) {
      toast("เกิดข้อผิดพลาด", { description: "กรุณาลองใหม่" });
    } finally {
      setIsLoading(false);
    }
  };
  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!isTrackingMode && isCopied && shortenedUrl) {
      e.preventDefault(); // ป้องกันการ submit form
      copyUrl(shortenedUrl); // เรียกแค่ copy function
    }
    // ถ้าไม่เข้าเงื่อนไขด้านบน จะปล่อยให้ form submit ตามปกติ
  };
  const resetForm = () => {
    form.reset();
    setShortenedUrl(null);
    setPreview(null);
    setStats(null);
  };

  // Reset validator เมื่อเปลี่ยนโหมด
  useEffect(() => {
    form.reset({ url: "" });
    form.clearErrors();
    setShortenedUrl(null);
    setPreview(null);
    setStats(null);
  }, [isTrackingMode, trackingType, form]);

  useEffect(() => {
    const getPreviewOrStats = async () => {
      if (debouncedUrl && form.formState.isValid) {
        if (isTrackingMode) {
          setIsLoading(true);
          try {
            let data;
            if (trackingType === "short") {
              data = await fetchStatsByShortUrl(debouncedUrl);
            } else {
              data = await fetchStatsByOriginalUrl(debouncedUrl);
            }
            setStats(data);
            setPreview(null);
          } catch (error) {
            setStats(null);
          } finally {
            setIsLoading(false);
          }
        } else {
          const data = await fetchPreview(debouncedUrl);
          setPreview(data);
          setStats(null);
        }
      } else {
        setPreview(null);
        setStats(null);
      }
    };
    getPreviewOrStats();
  }, [debouncedUrl, form.formState.isValid, isTrackingMode, trackingType]);
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "url" && isCopied && value.url !== shortenedUrl) {
        setIsCopied(false); // เปลี่ยนกลับเมื่อผู้ใช้พิมพ์ค่าใหม่
      }
    });
    return () => subscription.unsubscribe();
  }, [form, isCopied, shortenedUrl]);
  useEffect(() => {
    const loadHistory = async () => {
      const historyData = await fetchUrlHistory();
      setHistory(historyData);
    };
    loadHistory();
  }, []);
  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <div className="w-full max-w-lg">
        <Card className="bg-white shadow-lg rounded-3xl border border-gray-100">
          <CardHeader className="space-y-2">
            <CardTitle className="text-3xl font-semibold text-center text-gray-800">
              {isTrackingMode ? "Track Your URL" : "Shorten Your URL"}
            </CardTitle>
            <p className="text-center text-gray-500 text-sm">
              {isTrackingMode
                ? "Check how many clicks your URL has."
                : "Turn long links into short, clean ones."}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center gap-2 mb-4">
              <Button
                variant={isTrackingMode ? "outline" : "default"}
                onClick={() => setIsTrackingMode(false)}
                className="flex-1"
              >
                Shorten Mode
              </Button>
              <Button
                variant={isTrackingMode ? "default" : "outline"}
                onClick={() => setIsTrackingMode(true)}
                className="flex-1"
              >
                Track Mode
              </Button>
              <div className="flex justify-center mb-4">
                <Button
                  variant="outline"
                  onClick={() => setShowHistory(!showHistory)}
                  className="flex items-center gap-2"
                >
                  <History size={16} />
                  {/* {showHistory ? "Hide History" : "Show History"} */}
                </Button>
              </div>
            </div>

            {/* เพิ่มตัวเลือกประเภทการติดตาม เมื่ออยู่ในโหมดติดตาม */}
            {isTrackingMode && (
              <div className="mb-4">
                <div className="text-sm font-medium text-gray-600 mb-1">
                  Tracking Mode
                </div>
                <Select
                  value={trackingType}
                  onValueChange={(value: TrackingType) =>
                    setTrackingType(value)
                  }
                >
                  <SelectTrigger className="w-full h-11 rounded-lg border border-gray-200">
                    <SelectValue placeholder="Select tracking mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">Track by Short URL</SelectItem>
                    <SelectItem value="original">
                      Track by Original URL
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-600">
                        {isTrackingMode
                          ? trackingType === "short"
                            ? "Short URL"
                            : "Original URL"
                          : "URL"}
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder={
                            isTrackingMode
                              ? trackingType === "short"
                                ? "Paste your short URL here"
                                : "Paste your original URL here"
                              : "Paste your URL here"
                          }
                          className="w-full h-11 px-4 rounded-lg border border-gray-200 transition-all"
                        />
                      </FormControl>
                      <FormMessage className="text-red-500 text-sm" />
                    </FormItem>
                  )}
                />

                {isLoading && <LoadingEffect />}
                {/* Preview หรือ Stats */}
                {preview && !isTrackingMode && (
                  <div className="p-4 bg-gray-50 rounded-lg border">
                    <div className="flex gap-4">
                      {preview.image && (
                        <img
                          src={preview.image}
                          alt="Preview"
                          className="w-20 h-20 object-cover rounded-md"
                        />
                      )}
                      <div>
                        <p className="text-gray-800 font-medium">
                          {preview.title}
                        </p>
                        <p className="text-gray-500 text-sm">
                          {preview.description}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                {/* Stats และ Map */}
                {stats && isTrackingMode && (
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg border flex items-center gap-2">
                      <BarChart2 size={24} />
                      <div>
                        <p className="text-gray-800 font-medium">
                          Clicks: {stats.totalClicks}
                        </p>
                        <p className="text-gray-500 text-sm">
                          Last clicked: {stats.latestGeoLocation?.city || "N/A"}
                        </p>
                        {trackingType === "original" &&
                          stats.totalClicks > 0 && (
                            <p className="text-gray-500 text-sm mt-1">
                              Short URL: {shortenedUrl || "N/A"}
                            </p>
                          )}
                      </div>
                    </div>
                    {stats.locations.length > 0 && (
                      <SimpleMap locations={stats.locations} /> // Use SimpleMap here
                    )}
                  </div>
                )}

                {/* QR Code */}
                {shortenedUrl && !isTrackingMode && (
                  <div className="p-4 bg-gray-50 rounded-lg border flex flex-col items-center">
                    <QRCodeSVG
                      ref={qrCodeRef}
                      value={shortenedUrl}
                      size={200}
                    />
                    <Button
                      type="button"
                      className="mt-3 flex items-center gap-2"
                      onClick={() => {
                        /* ดาวน์โหลด QR Code */
                        if (qrCodeRef.current) {
                          const svgData = new XMLSerializer().serializeToString(
                            qrCodeRef.current
                          );
                          const canvas = document.createElement("canvas");
                          const ctx = canvas.getContext("2d");
                          const img = new Image();
                          img.onload = () => {
                            canvas.width = img.width;
                            canvas.height = img.height;
                            ctx?.drawImage(img, 0, 0);
                            const pngFile = canvas.toDataURL("image/png");
                            const downloadLink = document.createElement("a");
                            downloadLink.download = "qrcode.png";
                            downloadLink.href = pngFile;
                            downloadLink.click();
                          };
                          img.src =
                            "data:image/svg+xml;base64," +
                            btoa(unescape(encodeURIComponent(svgData)));
                        }
                      }}
                    >
                      <Download size={16} /> ดาวน์โหลด QR Code
                    </Button>
                  </div>
                )}
                <Sheet open={showHistory} onOpenChange={setShowHistory}>
                  {/* <SheetTrigger></SheetTrigger>
                  <SheetDescription></SheetDescription> */}
                  <SheetContent
                    side="right"
                    className="overflow-y-scroll w-full sm:max-w-5xl lg:max-w-2xl scrollbar-gemini pb-10"
                  >
                    <HistoryPage history={history} />
                    <SheetFooter>
                      <SheetClose asChild>
                        <Button type="submit">Close</Button>
                      </SheetClose>
                    </SheetFooter>
                  </SheetContent>
                </Sheet>
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    className="flex-1 h-11 text-white rounded-lg hover:bg-gray-900"
                    disabled={
                      form.formState.isSubmitting ||
                      (!isCopied && !form.formState.isValid) // ปิดการ disable เมื่อ isCopied เป็น true
                    }
                    onClick={handleButtonClick}
                  >
                    {isTrackingMode
                      ? "Check Stats"
                      : isCopied
                      ? "คัดลอกแล้ว"
                      : "Shorten"}
                  </Button>
                  <Button
                    type="button"
                    className="h-11 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                    onClick={resetForm}
                  >
                    Reset
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
