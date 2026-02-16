import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { TopNav } from "../components/layout/TopNav";
import { Sidebar } from "../components/layout/Sidebar";
import { FileGrid } from "../components/files/FileGrid";
import { UploadModal } from "../components/files/UploadModal";
import { FileItem } from "../components/files/FileCard";
import { FolderOpen, Upload, FileOutput } from "lucide-react";

const uploadedFiles: FileItem[] = [
  { id: "u1", name: "presentation.pdf", type: "document", size: "2.4 MB", modified: "Dec 20, 2025" },
  { id: "u2", name: "report.docx", type: "document", size: "856 KB", modified: "Dec 19, 2025" },
  { id: "u3", name: "banner-design.png", type: "image", size: "3.8 MB", modified: "Dec 18, 2025" },
  { id: "u4", name: "video-recording.mp4", type: "video", size: "245 MB", modified: "Dec 17, 2025" },
  { id: "u5", name: "contract.pdf", type: "document", size: "1.1 MB", modified: "Dec 16, 2025" },
  { id: "u6", name: "podcast-episode.mp3", type: "audio", size: "18.5 MB", modified: "Dec 15, 2025" },
];

const processedFiles: FileItem[] = [
  { id: "p1", name: "presentation_compressed.pdf", type: "document", size: "1.2 MB", modified: "Dec 20, 2025" },
  { id: "p2", name: "report.pdf", type: "document", size: "920 KB", modified: "Dec 19, 2025" },
  { id: "p3", name: "banner-design.webp", type: "image", size: "980 KB", modified: "Dec 18, 2025" },
  { id: "p4", name: "video-recording_part1.mp4", type: "video", size: "82 MB", modified: "Dec 17, 2025" },
  { id: "p5", name: "video-recording_part2.mp4", type: "video", size: "82 MB", modified: "Dec 17, 2025" },
  { id: "p6", name: "video-recording_part3.mp4", type: "video", size: "81 MB", modified: "Dec 17, 2025" },
  { id: "p7", name: "contract_summary.txt", type: "other", size: "4 KB", modified: "Dec 16, 2025" },
];

const folders = [
  { id: "uploaded", name: "Uploaded Files", icon: Upload, files: uploadedFiles },
  { id: "processed", name: "Processed Files", icon: FileOutput, files: processedFiles },
];

export default function Folders() {
  const navigate = useNavigate();
  const { folderId } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeItem, setActiveItem] = useState("files");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  const currentFolder = folders.find(f => f.id === folderId);
  const currentFiles = currentFolder?.files || [];

  // Show folder list if no folder is selected
  if (!folderId) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <TopNav
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          breadcrumbs={["Home", "Folders"]}
          onUploadClick={() => setUploadModalOpen(true)}
        />

        <div className="flex-1 flex">
          <Sidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            activeItem={activeItem}
            onItemClick={(item) => {
              setActiveItem(item);
              if (item === "home") navigate("/");
              if (item === "recent") navigate("/recent");
            }}
          />

          <main className="flex-1 p-6">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-3 mb-8">
                <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center">
                  <FolderOpen className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-page-title font-bold text-foreground">My Folders</h1>
                  <p className="text-muted-foreground">Organized storage for your files</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {folders.map((folder) => {
                  const Icon = folder.icon;
                  return (
                    <button
                      key={folder.id}
                      onClick={() => navigate(`/folders/${folder.id}`)}
                      className="group p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-all text-left hover:shadow-lg hover:shadow-primary/5"
                    >
                      <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                        <Icon className="h-6 w-6" />
                      </div>
                      <h2 className="text-lg font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                        {folder.name}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {folder.files.length} files
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          </main>
        </div>

        <UploadModal open={uploadModalOpen} onOpenChange={setUploadModalOpen} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopNav
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        breadcrumbs={["Home", "Folders", currentFolder?.name || ""]}
        onUploadClick={() => setUploadModalOpen(true)}
      />

      <div className="flex-1 flex">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          activeItem={activeItem}
          onItemClick={(item) => {
            setActiveItem(item);
            if (item === "home") navigate("/");
            if (item === "recent") navigate("/recent");
            if (item === "files") navigate("/folders");
          }}
        />

        <main className="flex-1 flex flex-col min-w-0">
          <FileGrid
            files={currentFiles}
            view={view}
            onViewChange={setView}
            onUploadClick={() => setUploadModalOpen(true)}
          />
        </main>
      </div>

      <UploadModal open={uploadModalOpen} onOpenChange={setUploadModalOpen} />
    </div>
  );
}
