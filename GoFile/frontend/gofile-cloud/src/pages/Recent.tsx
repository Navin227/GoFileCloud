import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TopNav } from "../components/layout/TopNav";
import { Sidebar } from "../components/layout/Sidebar";
import { Clock, Upload, FileType, Download, MoreVertical } from "lucide-react";
import { Button } from "../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";

interface RecentFile {
  id: string;
  name: string;
  type: "uploaded" | "processed";
  action?: string;
  size: string;
  timestamp: string;
  icon: "upload" | "convert" | "compress" | "split" | "summarize";
}

const recentFiles: RecentFile[] = [
  { id: "1", name: "presentation.pdf", type: "uploaded", size: "2.4 MB", timestamp: "2 minutes ago", icon: "upload" },
  { id: "2", name: "presentation_compressed.pdf", type: "processed", action: "Compressed", size: "1.2 MB", timestamp: "1 minute ago", icon: "compress" },
  { id: "3", name: "report.docx", type: "uploaded", size: "856 KB", timestamp: "15 minutes ago", icon: "upload" },
  { id: "4", name: "report.pdf", type: "processed", action: "Converted to PDF", size: "920 KB", timestamp: "12 minutes ago", icon: "convert" },
  { id: "5", name: "video-recording.mp4", type: "uploaded", size: "245 MB", timestamp: "1 hour ago", icon: "upload" },
  { id: "6", name: "video-recording_part1.mp4", type: "processed", action: "Split (Part 1)", size: "82 MB", timestamp: "45 minutes ago", icon: "split" },
  { id: "7", name: "contract.pdf", type: "uploaded", size: "1.1 MB", timestamp: "2 hours ago", icon: "upload" },
  { id: "8", name: "contract_summary.txt", type: "processed", action: "AI Summary", size: "4 KB", timestamp: "1 hour 50 minutes ago", icon: "summarize" },
  { id: "9", name: "banner-design.png", type: "uploaded", size: "3.8 MB", timestamp: "3 hours ago", icon: "upload" },
  { id: "10", name: "banner-design.webp", type: "processed", action: "Converted to WebP", size: "980 KB", timestamp: "2 hours 45 minutes ago", icon: "convert" },
];

const getIconColor = (icon: string) => {
  switch (icon) {
    case "upload": return "text-blue-400 bg-blue-500/10";
    case "convert": return "text-purple-400 bg-purple-500/10";
    case "compress": return "text-green-400 bg-green-500/10";
    case "split": return "text-orange-400 bg-orange-500/10";
    case "summarize": return "text-pink-400 bg-pink-500/10";
    default: return "text-muted-foreground bg-secondary";
  }
};

export default function Recent() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeItem, setActiveItem] = useState("recent");

  const uploadedFiles = recentFiles.filter(f => f.type === "uploaded");
  const processedFiles = recentFiles.filter(f => f.type === "processed");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopNav
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        breadcrumbs={["Home", "Recent"]}
        onUploadClick={() => {}}
      />

      <div className="flex-1 flex">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          activeItem={activeItem}
          onItemClick={(item) => {
            setActiveItem(item);
            if (item === "home") navigate("/");
          }}
        />

        <main className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-page-title font-bold text-foreground">Recent Activity</h1>
                <p className="text-muted-foreground">Track your uploads and processed files</p>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Recently Uploaded */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Upload className="h-5 w-5 text-blue-400" />
                  <h2 className="text-section-title font-semibold text-foreground">Recently Uploaded</h2>
                </div>
                <div className="space-y-2">
                  {uploadedFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border hover:border-primary/30 transition-colors"
                    >
                      <div className={`h-10 w-10 rounded-lg ${getIconColor(file.icon)} flex items-center justify-center`}>
                        <Upload className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {file.size} • {file.timestamp}
                        </p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <FileType className="h-4 w-4 mr-2" />
                            Process
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recently Processed */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <FileType className="h-5 w-5 text-green-400" />
                  <h2 className="text-section-title font-semibold text-foreground">Recently Processed</h2>
                </div>
                <div className="space-y-2">
                  {processedFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border hover:border-primary/30 transition-colors"
                    >
                      <div className={`h-10 w-10 rounded-lg ${getIconColor(file.icon)} flex items-center justify-center`}>
                        <FileType className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {file.action} • {file.size} • {file.timestamp}
                        </p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
