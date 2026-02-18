import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { StoryChapter } from "@/types/story";
import { BookOpen, RotateCcw, Download } from "lucide-react";
import { useState } from "react";
import jsPDF from "jspdf";

interface StoryEndProps {
  chapters: StoryChapter[];
  onRestart: () => void;
}

export function StoryEnd({ chapters, onRestart }: StoryEndProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const loadImageAsDataUrl = (url: string): Promise<string | null> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.onerror = () => resolve(null);
      img.src = url;
    });
  };

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const maxWidth = pageWidth - margin * 2;
      let y = 30;

      // Title
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.text("Your Story", pageWidth / 2, y, { align: "center" });
      y += 15;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(120, 120, 120);
      doc.text(`${chapters.length} chapters`, pageWidth / 2, y, { align: "center" });
      y += 20;
      doc.setTextColor(0, 0, 0);

      for (let i = 0; i < chapters.length; i++) {
        const ch = chapters[i];

        // Chapter title
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        const titleLines = doc.splitTextToSize(`Chapter ${i + 1}: ${ch.title}`, maxWidth);
        if (y + titleLines.length * 7 > pageHeight - 20) {
          doc.addPage();
          y = 20;
        }
        doc.text(titleLines, margin, y);
        y += titleLines.length * 7 + 5;

        // Chapter image
        if (ch.imageUrl) {
          const dataUrl = await loadImageAsDataUrl(ch.imageUrl);
          if (dataUrl) {
            const imgWidth = maxWidth;
            const imgHeight = imgWidth * 0.5625; // 16:9 aspect
            if (y + imgHeight > pageHeight - 20) {
              doc.addPage();
              y = 20;
            }
            doc.addImage(dataUrl, "JPEG", margin, y, imgWidth, imgHeight);
            y += imgHeight + 8;
          }
        }

        // Chapter content
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        const contentLines = doc.splitTextToSize(ch.content, maxWidth);
        for (const line of contentLines) {
          if (y > pageHeight - 20) {
            doc.addPage();
            y = 20;
          }
          doc.text(line, margin, y);
          y += 6;
        }

        // Chosen option
        if (ch.chosenOption) {
          y += 4;
          doc.setFont("helvetica", "italic");
          doc.setFontSize(10);
          doc.setTextColor(100, 100, 100);
          const choiceText = `You chose: ${ch.chosenOption}`;
          if (y > pageHeight - 20) {
            doc.addPage();
            y = 20;
          }
          doc.text(choiceText, margin, y);
          doc.setTextColor(0, 0, 0);
          y += 8;
        }

        y += 10;
      }

      // End marker
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      if (y > pageHeight - 30) {
        doc.addPage();
        y = 40;
      }
      doc.text("— The End —", pageWidth / 2, y, { align: "center" });

      doc.save("my-story.pdf");
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.6 }}
      className="text-center space-y-6 py-8"
    >
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10">
        <BookOpen className="w-8 h-8 text-primary" />
      </div>
      <div>
        <h3 className="text-2xl font-bold text-foreground mb-2" style={{ fontFamily: "var(--font-display)" }}>
          The End
        </h3>
        <p className="text-muted-foreground italic">
          Your story concluded in {chapters.length} chapters
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button onClick={handleDownloadPDF} variant="outline" className="gap-2" disabled={isDownloading}>
          <Download className="w-4 h-4" />
          {isDownloading ? "Generating PDF..." : "Download as PDF"}
        </Button>
        <Button onClick={onRestart} className="gap-2">
          <RotateCcw className="w-4 h-4" />
          Weave Another Tale
        </Button>
      </div>
    </motion.div>
  );
}