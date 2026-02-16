import {
  FileText,
  Image,
  Video,
  Music,
  FileArchive,
  File,
  MoreVertical,
  Download,
  Pencil,
  Share2,
  Trash2,
  Star,
  Folder,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export interface FileItem {
  id: string;
  name: string;
  type: "folder" | "image" | "video" | "audio" | "document" | "archive" | "other";
  size?: string;
  modified: string;
  isStarred?: boolean;
  thumbnail?: string;
}

interface FileCardProps {
  file: FileItem;
  view: "grid" | "list";
  onOpen?: () => void;
  onStar?: () => void;
}

const typeIcons = {
  folder: Folder,
  image: Image,
  video: Video,
  audio: Music,
  document: FileText,
  archive: FileArchive,
  other: File,
};

const typeColors = {
  folder: "text-primary",
  image: "text-success",
  video: "text-destructive",
  audio: "text-warning",
  document: "text-primary",
  archive: "text-muted-foreground",
  other: "text-muted-foreground",
};

export function FileCard({ file, view, onOpen, onStar }: FileCardProps) {
  const Icon = typeIcons[file.type];

  if (view === "list") {
    return (
      <div
        className="group flex items-center gap-4 px-4 py-3 hover:bg-secondary/50 rounded-lg cursor-pointer transition-colors"
        onClick={onOpen}
      >
        <div className={cn("flex-shrink-0", typeColors[file.type])}>
          <Icon className="h-5 w-5" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{file.name}</p>
        </div>

        <div className="hidden sm:block text-xs text-muted-foreground w-24">
          {file.size || "—"}
        </div>

        <div className="hidden md:block text-xs text-muted-foreground w-32">
          {file.modified}
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={(e) => {
              e.stopPropagation();
              onStar?.();
            }}
          >
            <Star
              className={cn(
                "h-4 w-4",
                file.isStarred ? "fill-warning text-warning" : ""
              )}
            />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Download className="h-4 w-4 mr-2" />
                Download
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Pencil className="h-4 w-4 mr-2" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  }

  return (
    <div
      className="group relative bg-card border border-border rounded-xl p-4 hover:border-primary/50 hover:scale-[1.02] cursor-pointer transition-all duration-200 animate-fade-in"
      onClick={onOpen}
    >
      {/* Thumbnail / Icon */}
      <div className="aspect-square rounded-lg bg-secondary/50 flex items-center justify-center mb-3 overflow-hidden">
        {file.thumbnail ? (
          <img
            src={file.thumbnail}
            alt={file.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <Icon className={cn("h-12 w-12", typeColors[file.type])} />
        )}
      </div>

      {/* File info */}
      <div className="space-y-1">
        <p className="text-sm font-medium truncate" title={file.name}>
          {file.name}
        </p>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{file.size || "—"}</span>
          <span>{file.modified}</span>
        </div>
      </div>

      {/* Actions overlay */}
      <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="secondary"
          size="icon-sm"
          className="h-7 w-7"
          onClick={(e) => {
            e.stopPropagation();
            onStar?.();
          }}
        >
          <Star
            className={cn(
              "h-3.5 w-3.5",
              file.isStarred ? "fill-warning text-warning" : ""
            )}
          />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="secondary"
              size="icon-sm"
              className="h-7 w-7"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Download className="h-4 w-4 mr-2" />
              Download
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Pencil className="h-4 w-4 mr-2" />
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
