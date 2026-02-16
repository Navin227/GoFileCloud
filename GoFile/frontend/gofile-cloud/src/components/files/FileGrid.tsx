import { FileCard, FileItem } from "./FileCard";
import { LayoutGrid, List, FolderPlus, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FileGridProps {
  files: FileItem[];
  view: "grid" | "list";
  onViewChange: (view: "grid" | "list") => void;
  onUploadClick: () => void;
}

export function FileGrid({ files, view, onViewChange, onUploadClick }: FileGridProps) {
  const folders = files.filter((f) => f.type === "folder");
  const otherFiles = files.filter((f) => f.type !== "folder");

  if (files.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
        <div className="w-24 h-24 rounded-2xl bg-secondary flex items-center justify-center mb-6">
          <Upload className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No files yet</h3>
        <p className="text-muted-foreground text-sm mb-6 max-w-sm">
          Upload your first file to get started. Drag and drop or click the button below.
        </p>
        <Button variant="upload" onClick={onUploadClick}>
          <Upload className="h-4 w-4" />
          Upload your first file
        </Button>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6">
      {/* Header with view toggle */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-page-title text-foreground">My Files</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <FolderPlus className="h-4 w-4 mr-2" />
            New folder
          </Button>
          <div className="flex items-center border border-border rounded-lg p-0.5">
            <Button
              variant={view === "grid" ? "secondary" : "ghost"}
              size="icon-sm"
              onClick={() => onViewChange("grid")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={view === "list" ? "secondary" : "ghost"}
              size="icon-sm"
              onClick={() => onViewChange("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Folders section */}
      {folders.length > 0 && (
        <section className="mb-8">
          <h3 className="text-section-title text-foreground mb-4">Folders</h3>
          <div
            className={cn(
              view === "grid"
                ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
                : "space-y-1"
            )}
          >
            {folders.map((file) => (
              <FileCard key={file.id} file={file} view={view} />
            ))}
          </div>
        </section>
      )}

      {/* Files section */}
      {otherFiles.length > 0 && (
        <section>
          <h3 className="text-section-title text-foreground mb-4">Files</h3>

          {view === "list" && (
            <div className="hidden sm:flex items-center gap-4 px-4 py-2 text-xs font-medium text-muted-foreground border-b border-border mb-2">
              <div className="w-5" />
              <div className="flex-1">Name</div>
              <div className="w-24">Size</div>
              <div className="hidden md:block w-32">Modified</div>
              <div className="w-20" />
            </div>
          )}

          <div
            className={cn(
              view === "grid"
                ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
                : "space-y-1"
            )}
          >
            {otherFiles.map((file) => (
              <FileCard key={file.id} file={file} view={view} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
